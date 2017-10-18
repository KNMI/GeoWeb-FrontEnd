#!/bin/bash
set -eu
set -o pipefail
CLONE_FOLDER="latest"

if [ "$#" -eq  2 ] ; then
  CONFIG_FILE=$1;
  CLONE_FOLDER=$2;
elif [ "$#" -eq 1 ] ; then
  CONFIG_FILE=$1;
else
  echo "Usage: ./deploy_geoweb CONFIG_FILE [clone_folder]"
  exit -1
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
cp -- "node_modules/react-switch-button/lib/react-switch-button.js" "node_modules/react-switch-button/dist/react-switch-button.min.js" &&
npm run clean &&
npm run deploy:prod &&
rsync -av --exclude 'node_modules' dist/. geoweb@birdexp07:/ssd1/geoweb/htdocs/demos/$CLONE_FOLDER/ &&
echo "Copying $CONFIG_FILE to the server as config.js" &&
rsync -av $CONFIG_FILE geoweb@birdexp07:/ssd1/geoweb/htdocs/demos/$CLONE_FOLDER/config.js &&
echo "Succes! GeoWeb is now deployed on the birdexp07 in folder $CLONE_FOLDER"
