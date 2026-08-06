#!/bin/bash

set -e

. ./vm.config
host="begoodit.cs.colman.ac.il"
app_dir="/home/cs147/begoodit-application"

echo "🚀 Deploying to $username@$host..."

echo "=== Cleaning up old deployment (if exists)... ==="
sshpass -p $password ssh $username@$host "pm2 delete begoodit-application" || echo "PM2 process 'begoodit-application' not running, skipping..."
echo "=== Removing old app files (if exists)... ==="
sshpass -p $password ssh $username@$host "rm -rf $app_dir/core $app_dir/client" || echo "App directories do not exist, skipping..."

sshpass -p $password ssh $username@$host "mkdir -p $app_dir" \
  && sshpass -p $password scp -r ../server/core $username@$host:$app_dir \
  && sshpass -p $password scp -r ../client $username@$host:$app_dir \
  \
  && echo "=== [1/8] Installing server dependencies ==" \
  && sshpass -p $password ssh $username@$host "cd $app_dir/core && npm install" \
  \
  && echo "=== [2/8] Installing client dependencies ==" \
  && sshpass -p $password ssh $username@$host "cd $app_dir/client && npm install" \
  \
  && echo "=== [3/8] Building client ==" \
  && sshpass -p $password ssh $username@$host "cd $app_dir/client && npm run build" \
  \
  && echo "=== [4/8] Copying client build into /core/client ==" \
  && sshpass -p $password ssh $username@$host "mkdir -p $app_dir/core/client && cp -r $app_dir/client/dist/. $app_dir/core/client/" \
  \
  && echo "=== [5/8] Removing client folder ==" \
  && sshpass -p $password ssh $username@$host "rm -rf $app_dir/client" \
  \
  && echo "=== [6/8] Compiling server & pruning dev dependencies ==" \
  && sshpass -p $password ssh $username@$host "cd $app_dir/core && npm run build:prod" \
  \
  && echo "=== [7/7] Running database migrations ==" \
  && sshpass -p $password ssh $username@$host "cd $app_dir/core && npm run migration:run:prod" \
  \
  && echo "=== [8/8] Starting server with PM2 ==" \
  && sshpass -p $password ssh $username@$host "cd $app_dir/core && pm2 start ecosystem.config.js" \
  \
  && echo "✅ Deployment complete!"
