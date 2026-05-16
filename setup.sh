#!/bin/bash

# CozyReads Setup Script
# This script automates the initial setup of CozyReads for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  CozyReads Development Setup${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check for Node.js
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check for Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git $(git -v | awk '{print $3}')${NC}"

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo -e "${BLUE}⚠️  Please edit .env.local and add your configuration:${NC}"
    echo "   - DATABASE_URL (PostgreSQL connection)"
    echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (from Clerk Dashboard)"
    echo "   - CLERK_SECRET_KEY (from Clerk Dashboard)"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Generating Prisma Client...${NC}"
npm run prisma:generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Setup Complete! 🎉${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit .env.local with your configuration"
echo "2. Run: npx prisma migrate dev"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:3000"
echo ""
echo -e "${YELLOW}For more help:${NC}"
echo "- Quick Start: https://github.com/aeldarian1/CozyReads/blob/main/QUICKSTART.md"
echo "- Architecture: https://github.com/aeldarian1/CozyReads/blob/main/ARCHITECTURE.md"
echo "- Contributing: https://github.com/aeldarian1/CozyReads/blob/main/CONTRIBUTING.md"
