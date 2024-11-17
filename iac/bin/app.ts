#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ScalableArchitectureStack } from '../lib/scalable-architecture-stack';
import { DockerImagePipelineStack } from '../lib/docker-image-pipeline-stack';

const app = new cdk.App();

// Deploy the main scalable architecture
new ScalableArchitectureStack(app, 'ScalableArchitectureStack');

// Deploy the Docker image pipeline
new DockerImagePipelineStack(app, 'DockerImagePipelineStack');
