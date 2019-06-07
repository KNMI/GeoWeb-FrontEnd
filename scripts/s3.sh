#!/bin/bash

# Creates a bucket in S3
# $1: Name of application the bucket is for
create_bucket() {
  BUCKET_NAME=$1
  echo "Creating bucket: $1"

  if ! aws s3api head-bucket --bucket $BUCKET_NAME --region $REGION; then
    echo -e "Bucket does not exist, creating ..."
    aws s3api create-bucket --bucket $BUCKET_NAME --create-bucket-configuration LocationConstraint=$REGION --region $REGION
    aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy {\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"AllowGetObject\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"arn:aws:iam::$DTA_ACCOUNT_ID:root\",\"arn:aws:iam::$PRD_ACCOUNT_ID:root\"]},\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::$BUCKET_NAME\/*\"}]}
  else
    echo -e "Bucket $BUCKET_NAME exists"
  fi
}

usage() {
  echo ""
  echo "Usage: `basename $0` -b <bucket_name> "
  echo -e "\n-b <name>: create an S3 bucket with this name"
  echo ""
  exit 1
}

while getopts b: opt; do
  case $opt in
    b) BUCKET_NAME=${OPTARG};;
    \?) usage;;
  esac
done

shift $((OPTIND-1))

if [ -z ${BUCKET_NAME} ]; then
  usage
else
  create_bucket ${BUCKET_NAME}
fi
