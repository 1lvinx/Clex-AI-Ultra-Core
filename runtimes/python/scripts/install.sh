#!/bin/bash

# Install Clex Core Python runtime
# Usage: ./install.sh

cd "$(dirname "$0")/.."

echo "Installing Clex Core Python runtime..."

# Create virtual environment if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -e .

# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
echo "Running tests..."
pytest

echo "Installation complete!"
