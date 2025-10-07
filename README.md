# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### AWS ECS with ECR Deployment

このプロジェクトは AWS ECS と ECR を使用して自動的にデプロイできます。

#### 前提条件

- Node.js 20 以上
- AWS アカウント
- Docker がインストールされていること
- AWS CLI が設定されていること

#### 手動での.env設定

自動スクリプトを使わない場合は、手動で以下の手順で設定できます：

1. `.env.example`を`.env`にコピー
2. `.env`ファイルで実際のAWS認証情報に置き換え

#### デプロイ手順

1. **CDK環境のセットアップ**

   ```bash
   cd cdk
   npm install
   npm run cdk:bootstrap
   ```

2. **デプロイ実行**

   ```bash
   npm run cdk:deploy
   ```

#### デプロイ後の確認

デプロイが完了すると、以下の情報が出力されます：

- **ECRリポジトリURI**: Dockerイメージが保存される場所
- **ロードバランサーDNS**: アプリケーションのURL
- **アプリケーションURL**: 直接アクセス可能なURL

#### 環境変数の設定

デプロイ時に以下の環境変数を設定できます：

```bash
# AWSリージョンを指定（デフォルト: ap-northeast-1）
export CDK_DEFAULT_REGION=us-west-2

# デプロイ実行
npm run deploy
```

#### トラブルシューティング

- **ECRログインエラー**: AWS認証情報を確認してください
- **Dockerビルドエラー**: Dockerが起動していることを確認してください
- **CDKデプロイエラー**: CDKのbootstrapが実行されていることを確認してください

#### モニタリング
```
# ログ確認
aws logs tail /aws/ecs/rr-ssr --follow --region ap-northeast-1
```

```
# サービス状態確認
aws ecs describe-services \
  --cluster rr-ssr-cluster \
  --services rr-ssr-service \
  --region ap-northeast-1 \
  --query 'services[0].{RunningCount:runningCount,DesiredCount:desiredCount}'
```

#### クリーンアップ

リソースを削除する場合：

```bash
cd cdk
npm run cdk:destroy
```

### Docker Deployment

To build and run using Docker:

```bash
docker compose up -d

# Access with Hot Reload 
# http://localhost:15173/
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
