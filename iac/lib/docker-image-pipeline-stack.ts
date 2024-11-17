import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as dotenv from 'dotenv';

dotenv.config();

export class DockerImagePipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ecrRepository = new ecr.Repository(this, 'ECRRepository', {
      repositoryName: 'images-repo',
    });

    const buildProject = new codebuild.PipelineProject(
      this,
      'DockerBuildProject',
      {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
          privileged: true, // Required for Docker builds
        },
        environmentVariables: {
          REPOSITORY_URI: { value: ecrRepository.repositoryUri },
          AWS_ACCOUNT_ID: { value: cdk.Aws.ACCOUNT_ID },
          AWS_DEFAULT_REGION: { value: cdk.Aws.REGION },
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              commands: [
                'echo Installing dependencies...',
                'yum install -y amazon-linux-extras',
                'amazon-linux-extras enable docker',
                'yum install -y docker',
                'service docker start',
                'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $REPOSITORY_URI',
              ],
            },
            pre_build: {
              commands: ['echo Preparing to build the Docker image...'],
            },
            build: {
              commands: [
                'echo Building the Docker image...',
                'docker build -t my-docker-image .',
                'docker tag my-docker-image:latest $REPOSITORY_URI:latest',
              ],
            },
            post_build: {
              commands: [
                'echo Pushing the Docker image to ECR...',
                'docker push $REPOSITORY_URI:latest',
                'echo Build complete.',
              ],
            },
          },
        }),
      },
    );

    ecrRepository.grantPullPush(buildProject);

    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: process.env.GITHUB_USERNAME,
      repo: process.env.GITHUB_REPO,
      branch: 'main',
      // Before execution store your GitHub token in AWS Secrets Manager
      oauthToken: cdk.SecretValue.secretsManager('github-token'),
      output: sourceOutput,
    });

    const buildOutput = new codepipeline.Artifact();
    const buildAction = new codepipelineActions.CodeBuildAction({
      actionName: 'Docker_Build',
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    new codepipeline.Pipeline(this, 'DockerPipeline', {
      pipelineName: 'DockerImagePipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
      ],
    });
  }
}
