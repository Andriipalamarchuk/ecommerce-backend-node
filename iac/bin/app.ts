#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ScalableArchitectureStack } from '../lib/scalable-architecture-stack';

const app = new cdk.App();
new ScalableArchitectureStack(app, 'ScalableArchitectureStack', {
  env: { region: 'eu-west-1' }, // AWS region for deployment
});
