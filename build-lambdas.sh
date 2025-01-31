#!/bin/bash

# Colors and formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # no color

echo -e "${BLUE}${BOLD}🚀 Building all Lambda functions...${NC}"

# Build API Lambda
echo -e "${BLUE}${BOLD}📦 Building API Lambda...${NC}"
cd api
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip function.zip bootstrap
mv function.zip ../infrastructure/front-function.zip
cd ..

# Build Queue Lambda
echo -e "${BLUE}${BOLD}📦 Building Queue Lambda...${NC}"
cd lambda
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip function.zip bootstrap
mv function.zip ../infrastructure/function.zip
cd ..

# Build Queue Filler Lambda
echo -e "${BLUE}${BOLD}📦 Building Queue Filler Lambda...${NC}"
cd queue_filler
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip function.zip bootstrap
mv function.zip ../infrastructure/filler-function.zip
cd ..

echo -e "${GREEN}${BOLD}✅ All Lambda functions built successfully!${NC}" 