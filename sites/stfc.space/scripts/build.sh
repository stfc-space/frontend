#!/bin/bash

branch=$VERCEL_GIT_COMMIT_REF
if [ -z "$branch" ]; then
  branch=$GITHUB_REF_NAME
fi
if [ -z "$branch" ]; then
  branch=$GITHUB_REF_NAME
fi

if [ -z "$branch" ]; then
  branch=$(git rev-parse --abbrev-ref HEAD)
fi

tag=$(git tag --points-at HEAD)

mode=$1

if [ -z "$mode" ]; then
  mode="production"

  case "$branch" in
  "main")
    mode="production"
    ;;
  "dev")
    mode="staging"
    ;;
  "staging")
    mode="staging"
    ;;
  "svelte")
    mode="next"
    ;;
  "next")
    mode="next"
    ;;
  esac

  if [ -z "$tag" ]; then
    mode=$mode
  else
    mode="production"
  fi
fi

echo "Building $mode"

env GIT_BRANCH=$branch MODE=$mode npm run build-kit
