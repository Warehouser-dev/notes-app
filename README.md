# Notes App

A production-ready desktop notes application for macOS built with Electron and React.

## Features

- ✨ Create, edit, and delete notes
- 🔍 Real-time search across all notes
- 💾 Auto-save functionality with visual indicator
- ⌨️ Keyboard shortcuts for power users
- 🎨 Clean, native macOS dark mode interface
- 📱 Responsive and accessible UI
- 🔒 Secure local storage
- ⚡ Fast and lightweight

## Keyboard Shortcuts

- `⌘N` - Create new note
- `⌘F` - Focus search
- `⌘⌫` - Delete current note

## Installation

```bash
npm install
```

## Development

```bash
# Run in development mode
npm run dev

# Run linter
npm run lint
```

## Running the App

```bash
npm start
```

## Building for macOS

```bash
npm run build
```

This will create a DMG installer in the `release` folder.

## Tech Stack

- Electron - Desktop framework
- React - UI library
- Lucide React - Icon library
- Webpack - Module bundler
- Babel - JavaScript compiler

## Project Structure

```
notes-app/
├── src/
│   └── App.jsx          # Main React component
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── index.html           # HTML entry point
├── styles.css           # Application styles
├── webpack.config.js    # Webpack configuration
└── package.json         # Project dependencies
```

## Data Storage

Notes are stored locally in JSON format at:
- macOS: `~/Library/Application Support/notes-app/notes.json`

## License

MIT
# notes-app
