import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import { Credentials } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export function createRdsInstance(
  scope: Construct,
  id: string,
  vpc: ec2.Vpc,
): rds.DatabaseInstance {
  return new rds.DatabaseInstance(scope, `${id}DbInstance`, {
    engine: rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_16_4,
    }),
    vpc,
    credentials: Credentials.fromPassword(
      process.env.DATABASE_USERNAME,
      cdk.SecretValue.unsafePlainText(process.env.DATABASE_PASSWORD),
    ),
    multiAz: true,
    allocatedStorage: 100,
    storageType: rds.StorageType.GP2,
    backupRetention: cdk.Duration.days(7),
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    deletionProtection: false,
    publiclyAccessible: false,
  });
}
