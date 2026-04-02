# Clex-AI-Ultra Skill Installation Script for Windows
# Install skills to user's OpenClaw workspace

# Colors for output
$RED = "`e[0;31m"
$GREEN = "`e[0;32m"
$YELLOW = "`e[1;33m"
$NC = "`e[0m" # No Color

Write-Host "================================" -ForegroundColor Green
Write-Host "Clex-AI-Ultra Skill Installer" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Determine OpenClaw workspace path
$OPENCLAW_DIR = "$env:USERPROFILE\.openclaw\workspace\skills"
Write-Host "Installing skills to: $OPENCLAW_DIR" -ForegroundColor Yellow

# Check if directory exists
if (!(Test-Path $OPENCLAW_DIR)) {
    Write-Host "Error: OpenClaw skills directory not found at $OPENCLAW_DIR" -ForegroundColor Red
    Write-Host "Please ensure OpenClaw is installed and the workspace exists." -ForegroundColor Yellow
    exit 1
}

# Get the script directory
$SCRIPT_DIR = Split-Path -Parent $PSScriptRoot

# Check if skills directory exists
if (!(Test-Path "$SCRIPT_DIR\skills")) {
    Write-Host "Error: skills directory not found in $SCRIPT_DIR" -ForegroundColor Red
    exit 1
}

# Copy skills
Write-Host "Copying skills..." -ForegroundColor Yellow
Copy-Item -Path "$SCRIPT_DIR\skills\*" -Destination $OPENCLAW_DIR -Recurse -Force

if ($LASTEXITCODE -eq 0) {
    Write-Host "Installation successful!" -ForegroundColor Green
    Write-Host "Skills installed to: $OPENCLAW_DIR" -ForegroundColor Green
    Write-Host "Please restart OpenClaw to load the new skills." -ForegroundColor Yellow
} else {
    Write-Host "Installation failed. Please check permissions." -ForegroundColor Red
    exit 1
}

# Count installed skills
$SKILL_COUNT = (Get-ChildItem -Path $OPENCLAW_DIR -Directory).Count
Write-Host "Installed $SKILL_COUNT skills." -ForegroundColor Green
