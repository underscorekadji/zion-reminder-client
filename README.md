# Zion Reminder Client

A React + TypeScript application for sending automated notifications to talent mentors for performance reviews.

## Overview

This application provides a user interface for sending notifications to talent managers about performance reviews. It includes features like a form-based editor and JSON editor interface for creating notification payloads, authentication system to secure API endpoints, and email override capability for testing.

## Features

- Send notifications to talent managers about performance reviews
- Form-based UI with person selection dropdowns
- JSON editor for advanced payload customization
- Authentication system to secure API endpoints
- Email override capability for testing

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

This will run the application on [http://localhost:5173](http://localhost:5173) (default Vite port).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

- `src/components` - Reusable UI components
  - `JsonEditor.tsx` - Editor for JSON payloads
  - `PersonSelector.tsx` - Person selection dropdown
- `src/context` - React context providers
  - `AuthContext.tsx` - Authentication state management
- `src/features` - Main application features
  - `Features.tsx` - Feature tab container
  - `notifications/TmNotification.tsx` - Talent manager notification form
  - `auth/AuthButton.tsx` - Authentication controls
- `src/services` - API and utility services
  - `apiService.ts` - API communication
  - `tokenService.ts` - Authentication token management
- `src/config` - Configuration files
  - `api.config.ts` - API endpoint configuration

## Technology Stack

- [React 19](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool and development server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework