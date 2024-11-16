import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  ContainerImage,
  FargateTaskDefinition,
  FargateService,
  LogDrivers,
} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export function createEcsService(
  scope: Construct,
  id: string,
  vpc: Vpc,
): ecs.FargateService {
  const cluster = new ecs.Cluster(scope, `${id}Cluster`, {
    vpc,
  });

  const taskDef = new FargateTaskDefinition(scope, `${id}TaskDef`, {
    memoryLimitMiB: 512,
    cpu: 256,
  });

  const container = taskDef.addContainer(`${id}Container`, {
    image: ContainerImage.fromRegistry('node:14'), // Replace with your Docker image if needed
    logging: LogDrivers.awsLogs({ streamPrefix: 'app' }),
  });

  // Add port mapping to the container
  container.addPortMappings({
    containerPort: 3000, // The port the app inside the container will listen on
  });

  const service = new FargateService(scope, `${id}Service`, {
    cluster,
    taskDefinition: taskDef,
    desiredCount: 2, // Number of instances of the task to run
  });

  // Load balancer setup (optional)
  const lb = new ApplicationLoadBalancer(scope, `${id}LoadBalancer`, {
    vpc,
    internetFacing: true,
  });

  const listener = lb.addListener('PublicListener', {
    port: 80,
  });

  listener.addTargets(`${id}Targets`, {
    port: 80,
    targets: [service],
  });

  return service;
}
