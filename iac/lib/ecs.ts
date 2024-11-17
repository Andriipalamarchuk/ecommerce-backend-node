import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { LogDrivers } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Duration } from 'aws-cdk-lib';

export function createEcsService(
  scope: Construct,
  id: string,
  vpc: ec2.Vpc,
): ecs.FargateService {
  const cluster = new ecs.Cluster(scope, `${id}Cluster`, {
    vpc,
  });

  const repository = ecr.Repository.fromRepositoryName(
    scope,
    `${id}EcrRepository`,
    'images-repo',
  );

  const taskDef = new ecs.FargateTaskDefinition(scope, `${id}TaskDef`, {
    memoryLimitMiB: 1024,
    cpu: 512,
  });

  const container = taskDef.addContainer(`${id}Container`, {
    image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
    logging: LogDrivers.awsLogs({ streamPrefix: 'app' }),
  });

  container.addPortMappings({
    containerPort: 3000,
  });

  const service = new ecs.FargateService(scope, `${id}Service`, {
    cluster,
    taskDefinition: taskDef,
    desiredCount: 2,
  });

  const lb = new ApplicationLoadBalancer(scope, `${id}LoadBalancer`, {
    vpc,
    internetFacing: true,
  });

  const listener = lb.addListener('PublicListener', {
    port: 80,
    open: true,
  });

  listener.addTargets(`${id}Targets`, {
    port: 80,
    targets: [service],
    healthCheck: {
      path: '/',
      interval: Duration.seconds(30),
    },
  });

  return service;
}
