#!/bin/bash

# Colors and formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # no color

echo -e "${BLUE}${BOLD}🚀 Starting development deployment...${NC}"

cd infrastructure
echo -e "${BLUE}${BOLD}📍 Switching to development workspace...${NC}"
terraform workspace select dev

echo -e "${BLUE}${BOLD}🔄 Initializing Terraform...${NC}"
terraform init

echo -e "${BLUE}${BOLD}⚡ Applying changes...${NC}"
terraform apply -var-file="environments/dev.tfvars"

echo -e "${GREEN}${BOLD}✅ Deployment complete!${NC}"
cd .. 