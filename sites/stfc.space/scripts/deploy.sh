#!/bin/bash

# App
for bucket in $buckets; do
    aws s3 sync .svelte-kit/cloudfront/static/_app s3://$bucket/next/_app --exclude "*.js.map" --exclude "*.html" --expires 2034-01-01T00:00:00Z --cache-control public,max-age=31536000,immutable --size-only
done

# All
for bucket in $buckets; do
    aws s3 sync .svelte-kit/cloudfront/static/ s3://$bucket/next/ --exclude "*.js.map" --exclude "_app/*"
done

# Lamda
node scripts/update-aws-lambda.js $cloudfront_distribution stfc-svelte-ssr-next .svelte-kit/cloudfront/lambda/handler.js
node scripts/update-aws-lambda.js $cloudfront_distribution stfc-svelte-ssr-next-viewer .svelte-kit/cloudfront/lambda/viewer-request.js viewer-request

aws cloudfront create-invalidation --distribution-id $cloudfront_distribution --paths "/*"
