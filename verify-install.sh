#!/bin/bash

# xterm Installation Verification Script

echo "🔍 Verifying xterm installation..."
echo

# Check if xterm command is available
if command -v xterm &> /dev/null; then
    echo "✅ xterm command is available globally"
    
    # Get the installation path
    xterm_PATH=$(which xterm)
    echo "   Installed at: $xterm_PATH"
    
    # Test the command
    echo "   Testing command..."
    xterm --help > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ xterm command is working correctly"
    else
        echo "⚠️  xterm command found but may have issues"
    fi
else
    echo "❌ xterm command not found"
    echo "   Please run the installation script first:"
    echo "   ./install.sh"
    exit 1
fi

echo
echo "🎉 Installation verified successfully!"
echo
echo "Next steps:"
echo "1. Run: xterm login (no setup required - uses default credentials)"
echo "2. Start tweeting: xterm post 'Hello World!'"
echo "3. (Optional) Set your own X_CLIENT_ID for custom app credentials"
echo
