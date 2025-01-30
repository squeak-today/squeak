#!/bin/bash

# Colors and formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RED='\033[0;31m'
NC='\033[0m' # no color

echo -e "${RED}${BOLD}⚠️  WARNING: PRODUCTION DEPLOYMENT ⚠️${NC}"
echo -e "${RED}${BOLD}══════════════════════════════════${NC}"
echo -e "${BOLD}Have you verified ALL variables in environments/prod.tfvars are correct for PRODUCTION?${NC}"
echo -e "${BOLD}Type 'yes' to confirm:${NC}"
read confirmation1

if [ "$confirmation1" != "yes" ]; then
    echo -e "${RED}${BOLD}❌ Deployment cancelled.${NC}"
    exit 1
fi

echo -e "\n${RED}${BOLD}⚠️  FINAL WARNING ⚠️${NC}"
echo -e "${BOLD}Are you absolutely sure you want to deploy to PRODUCTION?${NC}"
echo -e "${BOLD}Type 'yes' to confirm:${NC}"
read confirmation2

if [ "$confirmation2" != "yes" ]; then
    echo -e "${RED}${BOLD}❌ Deployment cancelled.${NC}"
    exit 1
fi

echo -e "${BLUE}${BOLD}🚀 Starting production deployment...${NC}"

cd infrastructure
echo -e "${BLUE}${BOLD}📍 Switching to production workspace...${NC}"
terraform workspace select prod

echo -e "${BLUE}${BOLD}🔄 Initializing Terraform...${NC}"
terraform init

echo -e "${BLUE}${BOLD}⚡ Applying changes...${NC}"
terraform apply -var-file="environments/prod.tfvars"

echo -e "${GREEN}${BOLD}✅ Deployment complete!${NC}"
cd ..