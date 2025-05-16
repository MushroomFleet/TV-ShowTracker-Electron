# 📺 TV Show Tracker - Electron App

A desktop application for tracking your TV show watching progress, built with Electron for Windows.

> [!NOTE]
> This is an Electron port of the [original Gradio-based TV Show Tracker](https://github.com/MushroomFleet/TV-Show-Tracker-WebUI).

## 📋 Overview

The TV Show Tracker helps you keep track of which episode and season you're on for all your favorite shows. With an intuitive interface, you can quickly update your progress, add notes with clickable links to streaming services, and manage your entire watch list in one place.

## ✨ Features

### 📝 Track Progress
- Keep track of which episode and season you're on for multiple TV shows
- Add optional notes for each show (supports clickable URLs to streaming services)
- Auto-saving functionality ensures your progress is never lost
- Visual progress indicators show whether you've moved forward (⏩) or backward (⏪) in a series

### 👀 Watch List Management
- View all your currently watching shows in one place
- Easy-to-read format with emoji indicators:
  - 🆕 New shows (Season 1, Episodes 1-3)
  - 🌟 Long-running shows (Season 3+)
  - 🎬 Regular shows
- Quick edit controls to update episode and season directly from the watch list
- Delete shows you've finished or no longer want to track
- One-click list refresh
- Notes preview with clickable URLs that open in your default browser

### 💾 Backup Management
- Create timestamped backups of your watch list
- Import backups with automatic safety features:
  - Validates backup file format
  - Creates an automatic backup of current data before import

## 🚀 Installation

### For Users

#### Prerequisites
- Windows 10 or higher
- 100MB of available disk space

#### Installation Steps
1. Download the latest release from the Releases page
2. Run the installer (.exe file)
3. Follow the on-screen instructions
4. Launch the application from your Start menu or desktop shortcut

### For Developers

#### Prerequisites
- Node.js 14 or higher
- npm 6 or higher
- Git

#### Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/MushroomFleet/TV-ShowTracker-Electron
   cd tv-show-tracker-electron
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
   Or use the included batch file:
   ```bash
   install.bat
   ```

3. Run the application in development mode:
   ```bash
   npm run dev
   ```
   
   Or use the included batch file:
   ```bash
   start-dev.bat
   ```

4. Run the application in standard mode:
   ```bash
   npm start
   ```
   
   Or use the included batch file:
   ```bash
   start.bat
   ```

## 📖 User Guide

### Getting Started
1. Launch the TV Show Tracker application
2. Navigate to the "Track Progress" tab
3. Enter a TV show name, season number, and episode number
   - Use the number input field or up/down buttons to set season and episode
4. Add optional notes (you can include URLs to streaming services)
5. Click "Track Progress" to save your progress

### Managing Your Watch List
1. Click the "Currently Watching" tab to view all your tracked shows
2. Shows are sorted alphabetically and display current season and episode
3. To remove a show:
   - Option 1: Click the trash icon next to the show
   - Option 2: Enter the show name in the removal field at the bottom and click "Remove Show"
4. Click "Refresh" to update the list if needed

### Using Quick Edit Controls
Each show in your watch list has quick edit controls:
1. **Previous Episode (-)**: Decreases the episode number by 1
2. **Next Episode (+)**: Increases the episode number by 1
3. **Next Season**: Moves to the next season and resets episode to 1

These controls allow you to update your progress without having to use the main tracking form.

### Using Notes with URLs
1. When adding a show or updating progress, you can include URLs in the notes field
2. These URLs will appear as clickable links in the "Currently Watching" tab
3. Clicking on a link will open the URL in your default web browser
4. This is useful for adding links to streaming services where you watch the show

### Backup and Restore
1. Navigate to the "Backup Management" tab
2. To create a backup:
   - Click "Create Backup"
   - A timestamped backup file will be created in your application data folder
3. To restore from a backup:
   - Click "Select Backup File"
   - Choose a previously created backup file
   - The application will automatically create a backup of your current data before importing

## 💻 Developer Guide

### Project Structure
```
tv-show-tracker-electron/
├── main.js                 # Electron main process
├── preload.js              # Preload script for secure IPC
├── index.html              # Main application UI
├── package.json            # Project configuration
├── package-lock.json       # Dependency lock file
├── install.bat             # Batch file to install dependencies
├── start.bat               # Batch file to run the app
├── start-dev.bat           # Batch file to run with DevTools
└── assets/                 # Application assets
    ├── create-icon.html    # Tool to create app icon
    └── icon.png            # Application icon
```

### Key Components
- **main.js**: Contains the Electron main process code, manages windows, and handles file system operations
- **preload.js**: Provides a secure bridge between renderer process and main process
- **index.html**: Contains the UI using Alpine.js and Tailwind CSS
- **Batch Files**: Helper scripts for common operations

### Building for Production
To build the application for distribution:

1. Install electron-builder:
   ```bash
   npm install --save-dev electron-builder
   ```

2. Add build configuration to package.json:
   ```json
   "build": {
     "appId": "com.yourname.tvshowtracker",
     "productName": "TV Show Tracker",
     "directories": {
       "output": "dist"
     },
     "win": {
       "target": "nsis",
       "icon": "assets/icon.png"
     }
   }
   ```

3. Add build script to package.json:
   ```json
   "scripts": {
     "build": "electron-builder"
   }
   ```

4. Run the build:
   ```bash
   npm run build
   ```

5. Distribute the installer from the `dist` folder

## 🛠️ Technical Stack
- **Electron**: Desktop application framework
- **Alpine.js**: Lightweight JavaScript framework for UI interactivity
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Font Awesome**: Icon library
- **Chart.js**: For potential data visualization

## 💾 Data Storage
- Progress is stored in JSON format in the user's application data directory
- File path: `%APPDATA%\tv-show-tracker-electron\tv_show_progress.json`
- Backups are saved with timestamps and stored in the same location
- All data is stored locally on your machine for privacy

## 🔄 Updating
When new versions are available:
1. Download the latest release
2. Install over the previous version
3. Your data will be preserved as it's stored in the user's application data directory

## 🤝 Contributing
Contributions are welcome! Here's how you can contribute:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add my new feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
