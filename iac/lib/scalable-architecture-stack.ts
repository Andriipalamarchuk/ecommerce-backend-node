import * as cdk from 'aws-cdk-lib';
import { createVpc } from './vpc';
import { createEcsService } from './ecs';
import { createRdsInstance } from './rds';
import { createRedisCluster } from './redis';
import * as dotenv from 'dotenv';

dotenv.config();

export class ScalableArchitectureStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the VPC
    const vpc = createVpc(this, 'AppVpc');

    createEcsService(this, 'AppEcsService', vpc);
    createRdsInstance(this, 'PostgresDb', vpc);
    createRedisCluster(this, 'AppRedis', vpc);
  }
}
