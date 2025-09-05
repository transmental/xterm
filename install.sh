#!/bin/bash

# xterm Global Installation Script
# This script builds the project and installs it globally so you can use 'xpost' from anywhere

set -e  # Exit on any error

echo "🐦 Installing xterm CLI..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Install globally
echo "🌍 Installing globally..."
npm install -g .

echo
echo "🎉 Installation complete!"
echo
echo "You can now use 'xterm' from anywhere in your terminal:"
echo "  xterm login          # Authenticate with X/Twitter (no setup required!)"
echo "  xterm                # Start interactive mode"
echo "  xterm post 'Hello!'  # Post a tweet directly"
echo
echo "To get started, run: xterm login"
echo "No API credentials needed - xterm includes defaults to get you started!"
echo
