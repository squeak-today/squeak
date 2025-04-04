#!/bin/bash

# Colors and formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RED='\033[0;31m'
NC='\033[0m' # no color

echo -e "${BLUE}${BOLD}Have you run terraform login or are already logged in? DOUBLE CHECK YOUR MAIN.TF, PLEASE (yes/no):${NC}"
read login_confirmation

if [ "$login_confirmation" != "yes" ]; then
    echo -e "${RED}${BOLD}❌ Deployment cancelled.${NC}"
    exit 1
fi

echo -e "${BLUE}${BOLD}Enter workspace name (e.g., prod, dev, connor):${NC}"
read workspace_name

echo -e "${BLUE}${BOLD}Enter tfvars prefix (e.g., prod, dev, branch):${NC}"
read tfvars_prefix

if [ "$workspace_name" = "prod" ]; then
    echo -e "${RED}${BOLD}⚠️  WARNING: PRODUCTION DEPLOYMENT ⚠️${NC}"
    echo -e "${RED}${BOLD}══════════════════════════════════${NC}"
    echo -e "${BOLD}Have you:${NC}"
    echo -e "${BOLD}1. Compiled all Lambda functions?${NC}"
    echo -e "${BOLD}2. Verified ALL variables in environments/${tfvars_prefix}.tfvars are correct for PRODUCTION?${NC}"
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
fi

echo -e "${BLUE}${BOLD}🚀 Starting deployment to ${workspace_name}...${NC}"
cd infrastructure
echo -e "${BLUE}${BOLD}🔄 Initializing Terraform...${NC}"
terraform init

echo -e "${BLUE}${BOLD}📍 Switching to ${workspace_name} workspace...${NC}"
terraform workspace select "$workspace_name"

echo -e "${BLUE}${BOLD}⚡ Applying changes...${NC}"
if terraform apply -var-file="environments/${tfvars_prefix}.tfvars"; then
    echo -e "${GREEN}${BOLD}✅ Deployment complete!${NC}"
else
    echo -e "${RED}${BOLD}❌ Deployment failed or cancelled!${NC}"
    exit 1
fi
cd .. 