#!/bin/bash

# Check whether this is a pre-release version
# If so, we ALWAYS want that to go to next
if [[ -f .changeset/pre.json ]]; then
    echo "next"
    exit 0
fi

branch=$VERCEL_GIT_COMMIT_REF
if [ -z "$branch" ]; then
    branch=$GITHUB_REF_NAME
fi
if [ -z "$branch" ]; then
    branch=$(git rev-parse --abbrev-ref HEAD)
fi

tag=$(git tag --points-at HEAD)
tags=($tag)

# If the branch is part of the tags, that means we are running in CI where the GITHUB_REF_NAME is that tag
# running in this build
if echo ${tags[@]} | grep -q -w "$branch"; then
    echo "prod"
    exit 0
else
    echo "dev"
    exit 0
fi
