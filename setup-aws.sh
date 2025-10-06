#!/bin/bash

# このプロジェクト専用のAWS認証情報設定スクリプト

echo "🔧 このプロジェクト専用のAWS認証情報を設定します"
echo ""

# .envファイルが存在しない場合は.env.exampleからコピー
if [ ! -f ".env" ]; then
    echo "📋 .env.exampleから.envファイルを作成しています..."
    cp .env.example .env
fi

echo "📝 AWS認証情報を入力してください:"
echo ""

# AWS Access Key IDの入力
read -p "AWS Access Key ID: " aws_access_key_id
if [ ! -z "$aws_access_key_id" ]; then
    sed -i '' "s/your-access-key-id/$aws_access_key_id/" .env
fi

# AWS Secret Access Keyの入力
read -s -p "AWS Secret Access Key: " aws_secret_access_key
echo ""
if [ ! -z "$aws_secret_access_key" ]; then
    sed -i '' "s/your-secret-access-key/$aws_secret_access_key/" .env
fi

# AWSアカウントIDの入力
read -p "AWS Account ID: " aws_account_id
if [ ! -z "$aws_account_id" ]; then
    sed -i '' "s/your-account-id/$aws_account_id/" .env
fi

# リージョンの確認
echo ""
read -p "AWS Region [ap-northeast-1]: " aws_region
aws_region=${aws_region:-ap-northeast-1}
sed -i '' "s/ap-northeast-1/$aws_region/g" .env

echo ""
echo "✅ 設定が完了しました！"
echo "🚀 以下のコマンドでデプロイできます:"
echo ""
echo "  cd cdk"
echo "  npm run bootstrap"
echo "  npm run deploy"
echo ""
echo "⚠️  .envファイルは機密情報を含んでいるため、Gitにコミットされません"
