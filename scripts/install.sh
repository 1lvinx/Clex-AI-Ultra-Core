#!/bin/bash

# Clex-AI-UltraSkill Installation Script
# Install skills to user's OpenClaw workspace

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Clex-AI-Ultra Skill Installer${NC}"
echo -e "${GREEN}================================${NC}"

# Determine OpenClaw workspace path
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    OPENCLAW_DIR="$HOME/.openclaw/workspace/skills"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash/Cygwin)
    OPENCLAW_DIR="$HOME/.openclaw/workspace/skills"
else
    # Linux and others
    OPENCLAW_DIR="$HOME/.openclaw/workspace/skills"
fi

echo -e "${YELLOW}Installing skills to: $OPENCLAW_DIR${NC}"

# Check if directory exists
if [ ! -d "$OPENCLAW_DIR" ]; then
    echo -e "${RED}Error: OpenClaw skills directory not found at $OPENCLAW_DIR${NC}"
    echo -e "${YELLOW}Please ensure OpenClaw is installed and the workspace exists.${NC}"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check if skills directory exists
if [ ! -d "$SCRIPT_DIR/skills" ]; then
    echo -e "${RED}Error: skills directory not found in $SCRIPT_DIR${NC}"
    exit 1
fi

# Copy skills
echo -e "${YELLOW}Copying skills...${NC}"
cp -r "$SCRIPT_DIR/skills"/* "$OPENCLAW_DIR/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Installation successful!${NC}"
    echo -e "${GREEN}Skills installed to: $OPENCLAW_DIR${NC}"
    echo -e "${YELLOW}Please restart OpenClaw to load the new skills.${NC}"
else
    echo -e "${RED}❌ Installation failed. Please check permissions.${NC}"
    exit 1
fi

# Count installed skills
SKILL_COUNT=$(ls -1 "$OPENCLAW_DIR" | wc -l)
echo -e "${GREEN}Installed $SKILL_COUNT skills.${NC}"
