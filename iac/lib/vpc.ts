import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export function createVpc(scope: Construct, id: string): Vpc {
  return new Vpc(scope, id, {
    maxAzs: 3,
    natGateways: 1,
    subnetConfiguration: [
      {
        name: 'PublicSubnet',
        subnetType: SubnetType.PUBLIC,
        cidrMask: 24,
      },
      {
        name: 'PrivateSubnet',
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        cidrMask: 24,
      },
    ],
  });
}
