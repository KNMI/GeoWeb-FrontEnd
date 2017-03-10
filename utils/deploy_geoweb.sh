#!/bin/bash
set -eu
set -o pipefail
CLONE_FOLDER="latest"

 if [ "$#" -eq  "1" ]
  then
  	CLONE_FOLDER=$1
fi
echo "Deploying to $CLONE_FOLDER"

if ! type "git" > /dev/null; then
	echo "Git command not available. Is it installed and in your path?"
	exit 1
fi
if ! type "npm" > /dev/null; then
	echo "NPM command not available. Is it installed and in your path?"
	exit 1
fi

REPO="git@github.com:KNMI/GeoWeb-FrontEnd.git"
if [ -d $CLONE_FOLDER ]; then
	echo "Warning: Directory exists, will try to pull and deploy that..."
	cd $CLONE_FOLDER
	git pull
else
	git clone $REPO $CLONE_FOLDER
	cd $CLONE_FOLDER
fi
npm install --silent &&
npm run clean &&
npm run deploy:prod &&
rsync -av --exclude 'node_modules' dist/. geoweb@birdexp07:/ssd1/geoweb/htdocs/demos/$CLONE_FOLDER/ &&
echo "Succes! GeoWeb is now deployed on the birdexp07 in folder $CLONE_FOLDER"
