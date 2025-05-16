# 📺 TV Show Tracker - Electron App

An Electron desktop application for tracking your TV show watching progress. This is the Windows version of the TV Show Tracker that was originally implemented as a Gradio web application.

## Features

### 📝 Track Progress
- Keep track of which episode and season you're on for multiple TV shows
- Add optional notes for each show (supports URLs)
- Auto-saving functionality ensures your progress is never lost
- Visual progress indicators show whether you've moved forward (⏩) or backward (⏪) in a series

### 👀 Watch List Management
- View all your currently watching shows in one place
- Easy-to-read format with emoji indicators:
  - 🆕 New shows (Season 1, Episodes 1-3)
  - 🌟 Long-running shows (Season 3+)
  - 🎬 Regular shows
- Delete shows you've finished or no longer want to track
- One-click list refresh
- Notes preview with clickable URLs

### 💾 Backup Management
- Create timestamped backups of your watch list
- Import backups with automatic safety features:
  - Validates backup file format
  - Creates an automatic backup of current data before import

## Development

### Prerequisites
- Node.js and npm installed on your system

### Setup
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

4. For development with DevTools:
```bash
npm run dev
```

## Technical Stack
- **Electron**: Desktop application framework
- **Alpine.js**: Lightweight JavaScript framework for UI interactivity
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Font Awesome**: Icon library
- **Chart.js**: For potential data visualization

## Data Storage
- Progress is stored in JSON format in the user data directory
- Backups are saved with timestamps and stored in the same location
- All data is stored locally on your machine
