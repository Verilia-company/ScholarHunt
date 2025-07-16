# Technology Stack

## Framework & Runtime
- **Next.js 15.3.3** - React-based full-stack framework with App Router
- **React 19** - Frontend UI library
- **TypeScript 5** - Type-safe JavaScript development
- **Node.js** - JavaScript runtime environment

## Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Tailwind Forms** - Form styling plugin
- **Tailwind Typography** - Typography plugin
- **Tailwind Animate** - Animation utilities
- **Lucide React** - Icon library
- **clsx** - Conditional className utility

## Backend & Database
- **Firebase** - Backend-as-a-Service platform
  - **Firestore** - NoSQL document database
  - **Firebase Auth** - Authentication service
  - **Firebase Storage** - File storage
  - **Firebase Analytics** - Analytics service
  - **Firebase Hosting** - Static site hosting
- **Firebase Admin SDK** - Server-side Firebase operations

## Content Management
- **Editor.js** - Block-style rich text editor
- **TipTap** - Headless rich text editor with extensions
- **Gray Matter** - Front matter parser for markdown
- **Remark/Rehype** - Markdown processing pipeline

## Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Hookform Resolvers** - Form validation integration

## SEO & Analytics
- **Next SEO** - SEO optimization utilities
- **Next Sitemap** - Automatic sitemap generation
- **Google Analytics** - Web analytics
- **Google AdSense** - Advertising platform

## Development Tools
- **ESLint** - Code linting with Next.js configuration
- **Firebase Tools** - Firebase CLI and development tools
- **Turbopack** - Fast bundler for development

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production application
npm run start        # Start production server
npm run lint         # Run ESLint code analysis
```

### Firebase
```bash
firebase deploy      # Deploy to Firebase hosting
firebase emulators:start  # Start local Firebase emulators
firebase firestore:indexes  # Manage Firestore indexes
```

### Package Management
```bash
npm install          # Install dependencies
npm update           # Update dependencies
npm audit            # Security audit
```

## Environment Configuration
- Uses `.env.local` for environment variables
- Firebase configuration through environment variables
- Google Analytics and AdSense IDs configurable via environment