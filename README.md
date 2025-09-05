# 🐦 xterm

Tweet from your terminal! A simple, fast CLI for posting to X (Twitter) with support for text, images, and videos.

## ✨ Features

- 🔐 OAuth 2.0 authentication with X/Twitter
- 📝 Post text tweets
- 🖼️ Upload and post images (PNG, JPEG, GIF, WebP)
- 🎥 Upload and post videos (MP4, MOV)
- 💬 Interactive shell mode
- 🚀 Global CLI command after installation

## 🚀 Quick Installation

### Automatic Installation (Recommended)

**macOS/Linux:**

```bash
# Clone the repository
git clone https://github.com/transmental/xterm.git
cd xterm

# Run the installer
./install.sh
```

**Windows:**

```cmd
# Clone the repository
git clone https://github.com/transmental/xterm.git
cd xterm

# Run the installer
install.bat
```

### Manual Installation

1. Make sure you have Node.js installed
2. Clone this repository
3. Run these commands:

```bash
npm install
npm run install-global
```

## 🔧 Setup

1. **Get X/Twitter API credentials (Optional):**

   - **For most users**: No setup needed! xterm includes default credentials to get you started quickly
   - **For advanced users**: Get your own credentials at [developer.twitter.com](https://developer.twitter.com)
   - Create a new app and copy your Client ID and Client Secret

2. **Set environment variables (Optional):**
   If you want to use your own credentials, create a `.env` file or set these environment variables:

   ```bash
   X_CLIENT_ID=your_client_id_here          # Optional - uses default if not set
   X_CLIENT_SECRET=your_client_secret_here  # Optional for PKCE
   X_REDIRECT_URI=http://127.0.0.1:8787/callback  # Default, can be customized
   ```

3. **Start using xterm:**
   ```bash
   xterm login
   ```

## 📖 Usage

### Interactive Mode

```bash
xterm
```

This opens an interactive shell where you can run commands:

- `login` - Authenticate with X/Twitter
- `whoami` - Show your account info
- `post <text>` - Post a text tweet
- `post-media <file-path> <text>` - Post with image/video
- `help` - Show available commands
- `exit` - Quit

### Direct Commands

```bash
# Post text
xterm post "Hello from the terminal! 🚀"

# Post with image
xterm post-media ./image.jpg "Check out this photo!"

# Post with video
xterm post-media ./video.mp4 "Amazing video content!"
```

### Supported File Types

- **Images:** PNG, JPEG, GIF, WebP
- **Videos:** MP4, MOV

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Type checking
npm run typecheck

# Install globally for testing
npm run install-global

# Uninstall global version
npm run uninstall-global
```

## 🗑️ Uninstallation

**macOS/Linux:**

```bash
./uninstall.sh
```

**Windows:**

```cmd
uninstall.bat
```

**Or manually:**

```bash
npm run uninstall-global
```

## 📝 Environment Variables

| Variable         | Description              | Default                          |
| ---------------- | ------------------------ | -------------------------------- |
| `X_CLIENT_ID`    | Your X/Twitter Client ID | Uses built-in default (optional) |
| `X_REDIRECT_URI` | OAuth redirect URI       | `http://127.0.0.1:8787/callback` |

## 📁 Data Storage

Tokens and OAuth state are stored in `~/.xterm/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC License

## 🙏 Acknowledgments

Built with:

- [twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2) - Twitter API client
- [yargs](https://github.com/yargs/yargs) - CLI framework
- TypeScript for type safety
