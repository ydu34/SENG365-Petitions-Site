#!/usr/bin/env sh

# abort on errors
set -e

cd client

# build
npm run build

# navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:ydu34/SENG365-Petitions-Site.git master:gh-pages

cd -
cd -