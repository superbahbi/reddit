#!/bin/bash

echo What should the version be?
read VERSION

docker build -t superbahbi/reddit:$VERSION .
docker push superbahbi/reddit:$VERSION 

ssh root@api.bahbi.net "docker pull superbahbi/reddit:$VERSION && docker tag superbahbi/reddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"