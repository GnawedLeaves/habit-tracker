# Habit Tracker PWA

A Progressive Web App for tracking daily habits with Firebase backend, built with React, TypeScript, Ant Design, and Chart.js.

## Features

- ✅ Create, read, update, and delete habits
- 📅 Set how many days per week to complete each habit
- ⏰ Optional time reminders for habits
- ✔️ Check-in functionality to mark habits as complete
- 📊 Statistics dashboard with completion rates and trends
- 🔔 Push notifications for habit reminders (PWA)
- 📱 Mobile-friendly responsive design
- 🎨 Beautiful UI with Ant Design and styled-components

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (for development)
4. Enable Firebase Cloud Messaging:
   - Go to Project Settings > Cloud Messaging
   - Generate a new Web Push certificate (VAPID key)
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the configuration values

### 2. Environment Variables

1. Copy the values from Firebase to `.env` file
2. Update the following variables in `.env`
3. Also update the Firebase config in `public/firebase-messaging-sw.js` with the same values

### 3. Run Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### 4. Enable Notifications

1. Click "Enable Notifications" button in the app header
2. Allow notifications when prompted by your browser
3. The app will request permission and set up push notifications

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── HabitCard.tsx          # Individual habit card with check-in
│   ├── HabitFormModal.tsx     # Form to create/edit habits
│   ├── HabitList.tsx          # List of all habits
│   └── Statistics.tsx         # Stats dashboard with charts
├── firebase/
│   └── config.ts              # Firebase initialization
├── services/
│   ├── habitService.ts        # CRUD operations for habits
│   └── notificationService.ts # Push notification handlers
├── types/
│   └── Habit.ts               # TypeScript interfaces
├── App.tsx                     # Main app component with routing
└── index.tsx                   # App entry point
```

## Technologies Used

- React with TypeScript
- Firebase (Firestore, Cloud Messaging)
- Ant Design for UI components
- styled-components for custom styling
- Chart.js with react-chartjs-2 for data visualization
- dayjs for date handling

## License

MIT
