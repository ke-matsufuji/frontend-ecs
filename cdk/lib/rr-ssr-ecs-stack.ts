import { RemovalPolicy, ScopedAws, Stack, StackProps, CfnOutput, Duration } from "aws-cdk-lib";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import { DockerImageAsset, Platform } from "aws-cdk-lib/aws-ecr-assets";
import * as ecrdeploy from "cdk-ecr-deployment";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from "path";
import { fileURLToPath } from "url";

// ES モジュールで __dirname の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RrSsrEcsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Get AWS Account ID and Region
    const { accountId, region } = new ScopedAws(this);

    // Set Resource Name
    const resourceName = "rr-ssr";

    // Create ECR Repository
    const ecrRepository = new ecr.Repository(this, 'RrSsrEcrRepository', {
      repositoryName: 'rr-ssr-frontend',
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 10,
          description: 'Keep only 10 images',
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY, // 開発環境用
      // スタック削除時に残存イメージがあると Repository の削除が失敗し DELETE_FAILED になるため
      // 開発用途では emptyOnDelete を有効にして自動で空にする
      emptyOnDelete: true,
    });

    // Create Docker Image Asset
    const dockerImageAsset = new DockerImageAsset(this, "RrSsrDockerImageAsset", {
      directory: path.join(__dirname, "..", ".."),
      platform: Platform.LINUX_AMD64,
    });

    // Deploy Docker Image to ECR Repository
    new ecrdeploy.ECRDeployment(this, "RrSsrDeployDockerImage", {
      src: new ecrdeploy.DockerImageName(dockerImageAsset.imageUri),
      dest: new ecrdeploy.DockerImageName(
        `${accountId}.dkr.ecr.${region}.amazonaws.com/${ecrRepository.repositoryName}:latest`
      ),
    });

    // Create VPC and Subnet
    const vpc = new ec2.Vpc(this, "RrSsrVpc", {
      vpcName: `${resourceName}-vpc`,
      maxAzs: 2,
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/20"),
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `${resourceName}-public`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, "RrSsrCluster", {
      clusterName: `${resourceName}-cluster`,
      vpc: vpc,
    });

    // Create CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, "RrSsrLogGroup", {
      logGroupName: `/aws/ecs/${resourceName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create ALB and ECS Fargate Service
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "RrSsrService",
      {
        loadBalancerName: `${resourceName}-lb`,
        publicLoadBalancer: true,
        cluster: cluster,
        serviceName: `${resourceName}-service`,
        cpu: 256,
        desiredCount: 2,
        memoryLimitMiB: 512,
        assignPublicIp: true,
        taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        taskImageOptions: {
          family: `${resourceName}-taskdef`,
          containerName: `${resourceName}-container`,
          containerPort: 3000,
          image: ecs.ContainerImage.fromEcrRepository(ecrRepository, "latest"),
          logDriver: new ecs.AwsLogDriver({
            streamPrefix: `container`,
            logGroup: logGroup,
          }),
        },
      }
    );

    // ヘルスチェックの設定
    fargateService.targetGroup.configureHealthCheck({
      path: '/health',
      healthyHttpCodes: '200',
      interval: Duration.seconds(30),
      timeout: Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    // オートスケーリングの設定
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    // 出力
    new CfnOutput(this, 'EcrRepositoryUri', {
      value: ecrRepository.repositoryUri,
      description: 'ECR Repository URI',
    });

    new CfnOutput(this, 'EcrRepositoryName', {
      value: ecrRepository.repositoryName,
      description: 'ECR Repository Name',
    });

    new CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'DNS name of the load balancer',
    });

    new CfnOutput(this, 'ServiceURL', {
      value: `http://${fargateService.loadBalancer.loadBalancerDnsName}`,
      description: 'URL of the React Router SSR application',
    });
  }
}
