import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export function createRedisCluster(
  scope: Construct,
  id: string,
  vpc: ec2.Vpc,
): elasticache.CfnCacheCluster {
  return new elasticache.CfnCacheCluster(scope, `${id}RedisCluster`, {
    cacheNodeType: 'cache.t3.micro',
    engine: 'redis',
    numCacheNodes: 1,
    clusterName: `${id}-redis-cluster`,
    vpcSecurityGroupIds: [vpc.vpcDefaultSecurityGroup],
    cacheSubnetGroupName: new elasticache.CfnSubnetGroup(
      scope,
      `${id}RedisSubnetGroup`,
      {
        description: 'Redis subnet group',
        subnetIds: vpc.privateSubnets.map((subnet) => subnet.subnetId),
      },
    ).ref,
  });
}
