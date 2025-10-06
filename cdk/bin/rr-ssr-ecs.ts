#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { config } from "dotenv";
import { RrSsrEcsStack } from "../lib/rr-ssr-ecs-stack";
import * as path from "path";
import { fileURLToPath } from "url";

// ESモジュールでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルートの.envファイルから環境変数を読み込み
config({ path: path.join(__dirname, "../../.env") });

const app = new cdk.App();
new RrSsrEcsStack(app, "RrSsrEcsStack", {
  env: {
    // 例: 東京リージョン
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
    account: process.env.CDK_DEFAULT_ACCOUNT
  }
});
