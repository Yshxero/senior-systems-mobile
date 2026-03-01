# Senior Records (Mobile)

**Senior Records** is a robust, offline-first React Native (Expo) Android application designed to efficiently encode, manage, and track senior citizen records. Built with data privacy and accessibility in mind, the application functions entirely without an internet connection by leveraging local SQLite storage.

---

## 🚀 Key Features

- **100% Offline Capability**: All data is stored locally on the device using SQLite, ensuring accessibility even in remote areas without network coverage.
- **Comprehensive Record Management**: Easily add, edit, view, and delete detailed senior citizen profiles.
- **Advanced Search incorporated**: Quickly locate specific individuals within your database.
- **Data Portability (CSV Integration)**:
  - **Export**: Generate CSV files of all records for reporting, backup, or integration with desktop systems.
  - **Import**: Bulk load existing records into the app via CSV files seamlessly, with built-in duplicate detection.
- **Modern & Intuitive UI**: A clean, beginner-friendly interface utilizing Expo Router for smooth navigation and a refined user experience.

---

## 🛠️ Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Local Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **File System & Sharing**: `expo-file-system`, `expo-sharing`, `expo-document-picker`
- **Language**: TypeScript

---

## ⚙️ Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm` (comes with Node.js)
- [Expo Go app](https://expo.dev/client) installed on your iOS or Android device, OR a locally configured Android Emulator/iOS Simulator.

### Installation

1. **Clone or Navigate to the Directory**:
   Ensure you are in the `mobile` project folder:
   ```bash
   cd senior-systems/mobile
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npx expo start
   ```

4. **Run the App**:
   - Press **`a`** in the terminal to open the app on a connected Android device or emulator.
   - Scan the QR code displayed in the terminal using the **Expo Go** app on your physical device.

---

## 📦 Building for Production (Android/APK)

To build a standalone APK for Android devices without using Expo Go, you can utilize Expo Application Services (EAS):

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to your Expo account**:
   ```bash
   eas login
   ```

3. **Configure the Project** (if not already configured):
   ```bash
   eas build:configure
   ```

4. **Build the Android APK/AAB**:
   ```bash
   eas build -p android --profile preview
   ```
   *(Wait for the build process to complete on Expo servers, then download the resulting `.apk` file to install directly onto Android devices).*

---

## 📂 Project Structure

- `app/`: Contains all the screens and Expo Router file-based routing logic (e.g., `(tabs)`, `_layout.tsx`).
- `components/`: Reusable UI components used across different screens.
- `lib/`: Core utilities and database setup logic (e.g., `database.ts`, `importCsv.ts`).
- `constants/`: Global constants like Colors, spacing, and typography.
- `assets/`: App icons, splash screens, and static media files.

---

## 🔒 Data Privacy Statement

Because this app operates entirely offline by design, **no personal or user data is transmitted to external servers**. All encoded records stay strictly on the physical device it was entered on unless explicitly exported and shared by the user via the export functionality. 
