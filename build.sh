#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Create keys directory if it doesn't exist
mkdir -p keys
mkdir -p CareerEasy/prompts

# Download encryption keys from S3
aws s3 cp s3://careereasy-private-assets/keys/ ./keys/ --recursive

# Download prompts from S3
aws s3 cp s3://careereasy-private-assets/prompts/ ./CareerEasy/prompts/ --recursive

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput