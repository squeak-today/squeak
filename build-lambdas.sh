#!/bin/bash

# Build all Lambda functions from project root
echo "Building Lambda functions..."

# Build API Lambda
echo "Building API Lambda..."
cd api
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip function.zip bootstrap
mv function.zip ../infrastructure/front-function.zip
cd ..

# Build Queue Lambda
echo "Building Queue Lambda..."
cd lambda
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip function.zip bootstrap
mv function.zip ../infrastructure/function.zip
cd ..

# Build Queue Filler Lambda
echo "Building Queue Filler Lambda..."
cd queue_filler
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip function.zip bootstrap
mv function.zip ../infrastructure/filler-function.zip
cd ..

echo "All Lambda functions built successfully!" 