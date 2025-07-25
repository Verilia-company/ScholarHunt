# ScholarHunt Uganda - Codebase Index

## Project Overview

ScholarHunt Uganda is a Next.js-based scholarship discovery platform that helps Ugandan students find and apply for educational opportunities. The platform features a modern, responsive design with comprehensive scholarship listings, blog content, user authentication, and admin functionality.

## Technology Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Auth with Google Sign-in
- **Database**: Firebase Firestore
- **Analytics**: Google Analytics 4
- **UI Components**: Framer Motion, Lucide React, Radix UI
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: TipTap Editor
- **Deployment**: Vercel-ready

## Project Structure

```
scholarhunt-main/
├── app/                          # Next.js App Router pages
│   ├── globals.css              # Global styles and CSS variables
│   ├── layout.tsx               # Root layout with metadata and providers
│   ├── page.tsx                 # Homepage with featured content
│   ├── about/                   # About page
│   ├── admin/                   # Admin dashboard
│   ├── blog/                    # Blog listing and individual posts
│   ├── opportunities/           # Scholarship search and listing
│   ├── scholarships/            # Individual scholarship pages
│   ├── submit/                  # Scholarship submission form
│   ├── privacy-policy/          # Legal pages
│   └── terms-of-service/
├── components/                   # Reusable React components
│   ├── Layout.tsx              # Main layout with navigation
│   ├── ScholarshipCard.tsx     # Scholarship display component
│   ├── BlogCard.tsx            # Blog post display component
│   ├── WhatsAppWidget.tsx      # Customer support widget
│   ├── Toast.tsx               # Notification system
│   ├── LoadingSpinner.tsx      # Loading states
│   ├── NewsletterSubscription.tsx
│   ├── ShareButtons.tsx
│   ├── AdSense.tsx             # Google AdSense integration
│   ├── ErrorBoundary.tsx       # Error handling
│   └── admin/                  # Admin-specific components
│       ├── ScholarshipManagement.tsx
│       ├── BlogManagement.tsx
│       ├── UserManagement.tsx
│       ├── AdminSettings.tsx
│       ├── AnalyticsDashboard.tsx
│       └── RichTextEditor.tsx
├── contexts/                    # React Context providers
│   └── AuthContext.tsx         # Authentication state management
├── lib/                        # Utility libraries and services
│   ├── firebase.ts             # Firebase configuration
│   ├── analytics.ts            # Google Analytics tracking
│   ├── performance.ts          # Performance monitoring
│   ├── userTracking.ts         # User behavior tracking
│   ├── search.ts               # Search functionality
│   ├── seo.ts                  # SEO utilities
│   └── firebase/               # Firebase services
│       ├── services.ts         # Main Firebase service layer
│       ├── services_new.ts     # Updated services
│       ├── presence.ts         # User presence tracking
│       └── temp-blog-service.ts
├── data/                       # Static data files
│   ├── scholarships.json       # Sample scholarship data
│   └── blog.json              # Sample blog data
├── utils/                      # Utility functions
│   └── adminUtils.ts          # Admin helper functions
├── public/                     # Static assets
└── Configuration Files
    ├── package.json            # Dependencies and scripts
    ├── next.config.ts          # Next.js configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── tsconfig.json           # TypeScript configuration
    ├── firebase.json           # Firebase configuration
    ├── firestore.rules         # Firestore security rules
    └── firestore.indexes.json  # Firestore indexes
```

## Core Features

### 1. Scholarship Management
- **Data Structure**: Comprehensive scholarship schema with fields for title, description, amount, deadline, eligibility, requirements, etc.
- **Search & Filter**: Advanced search functionality with filters by level, country, field of study
- **Status Management**: Active, draft, and expired scholarship states
- **View Tracking**: Analytics for scholarship page views
- **Submission System**: User-submitted scholarship review process

### 2. Blog System
- **Content Management**: Rich text editor with TipTap
- **SEO Optimization**: Meta titles, descriptions, focus keywords
- **Categories & Tags**: Organized content structure
- **Featured Posts**: Highlighted content on homepage
- **Read Time**: Estimated reading time calculation

### 3. User Authentication
- **Google Sign-in**: Seamless authentication with Google Identity Services
- **One Tap Sign-in**: Automatic sign-in prompts
- **Role-based Access**: Admin and user roles
- **Profile Management**: User profiles with avatars and bios
- **Session Management**: Persistent authentication state

### 4. Admin Dashboard
- **Scholarship Management**: CRUD operations for scholarships
- **Blog Management**: Content creation and editing
- **User Management**: User administration
- **Analytics Dashboard**: Performance metrics and insights
- **Settings Management**: Site configuration
- **Data Import/Export**: Bulk data operations

### 5. Analytics & Tracking
- **Google Analytics 4**: Comprehensive event tracking
- **User Behavior**: Page views, scroll tracking, time on site
- **Custom Events**: Scholarship views, searches, form submissions
- **Performance Monitoring**: Core Web Vitals tracking
- **Conversion Tracking**: Newsletter signups, contact form submissions

### 6. SEO & Performance
- **Structured Data**: JSON-LD schema markup
- **Meta Tags**: Dynamic meta titles and descriptions
- **Sitemap Generation**: Automatic XML sitemap
- **Image Optimization**: Next.js Image component
- **Performance Optimization**: Code splitting, lazy loading

### 7. User Experience
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: CSS variable-based theming
- **Loading States**: Skeleton loaders and spinners
- **Toast Notifications**: User feedback system
- **WhatsApp Integration**: Customer support widget
- **Newsletter Subscription**: Email marketing integration

## Key Components

### Layout Component (`components/Layout.tsx`)
- **Navigation**: Responsive header with mobile menu
- **Authentication**: Sign-in/sign-out functionality
- **User Profile**: Dropdown with user options
- **Analytics**: Page tracking integration
- **Toast System**: Global notification management

### ScholarshipCard Component (`components/ScholarshipCard.tsx`)
- **Display**: Scholarship information with visual hierarchy
- **Actions**: Apply button, share functionality
- **Status**: Visual indicators for deadline status
- **Responsive**: Mobile-optimized layout

### WhatsAppWidget Component (`components/WhatsAppWidget.tsx`)
- **Customer Support**: Direct WhatsApp integration
- **Quick Topics**: Pre-defined conversation starters
- **Custom Messages**: User-defined message content
- **Analytics**: Message tracking and engagement metrics

### AuthContext (`contexts/AuthContext.tsx`)
- **State Management**: User authentication state
- **Google Integration**: One Tap and manual sign-in
- **Role Management**: Admin/user role checking
- **Session Persistence**: Automatic sign-in restoration

## Firebase Services (`lib/firebase/services.ts`)

### Data Models
- **User**: Authentication and profile data
- **Scholarship**: Complete scholarship information
- **BlogPost**: Blog content with SEO metadata
- **NewsletterSubscription**: Email subscription management
- **ScholarshipSubmission**: User-submitted scholarships
- **Activity**: User activity logging
- **SiteSettings**: Global site configuration

### Service Methods
- **CRUD Operations**: Create, read, update, delete for all entities
- **Search & Filter**: Advanced querying capabilities
- **Analytics**: View tracking and activity logging
- **Bulk Operations**: Import/export functionality
- **Admin Functions**: User management and content moderation

## Analytics Implementation (`lib/analytics.ts`)

### Tracking Features
- **Page Views**: Automatic route change tracking
- **Custom Events**: Scholarship views, searches, form submissions
- **User Context**: Device type, session ID, referrer tracking
- **Scroll Tracking**: User engagement metrics
- **Time Tracking**: Session duration and page time

### Event Categories
- **Scholarship Interactions**: Views, applications, shares
- **Search Behavior**: Search terms, filters used
- **User Engagement**: Newsletter signups, contact form submissions
- **Admin Actions**: Content creation, user management

## Configuration & Environment

### Environment Variables
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

# AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID
```

### Build Scripts
```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Access admin panel at `/admin`

### Deployment
- **Platform**: Vercel (recommended)
- **Environment**: Production environment variables
- **Build**: Automatic deployment on push to main branch
- **Domain**: Custom domain configuration

## Security Features

### Firebase Security Rules
- **User Authentication**: Required for admin functions
- **Data Validation**: Input sanitization and validation
- **Role-based Access**: Admin-only content management
- **Rate Limiting**: API call restrictions

### Content Security
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Form submission security
- **Data Validation**: Zod schema validation
- **Error Boundaries**: Graceful error handling

## Performance Optimizations

### Next.js Features
- **App Router**: Modern routing with server components
- **Image Optimization**: Automatic image compression
- **Code Splitting**: Automatic bundle optimization
- **Static Generation**: Pre-rendered pages for SEO

### Frontend Optimizations
- **Lazy Loading**: Component and image lazy loading
- **Virtual Scrolling**: Large list performance
- **Debounced Search**: Optimized search input
- **Caching**: Browser and CDN caching strategies

## Monitoring & Analytics

### Google Analytics 4
- **Event Tracking**: Custom event implementation
- **User Properties**: Device, location, behavior tracking
- **Conversion Goals**: Newsletter signups, contact form submissions
- **Real-time Reports**: Live user activity monitoring

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Custom Metrics**: Scholarship view time, search performance
- **Error Tracking**: JavaScript error monitoring
- **User Experience**: Page load times, interaction metrics

## Future Enhancements

### Planned Features
- **Advanced Search**: Elasticsearch integration
- **Email Notifications**: Scholarship deadline reminders
- **Mobile App**: React Native companion app
- **AI Recommendations**: Personalized scholarship suggestions
- **Multi-language**: Localization support
- **API Development**: Public API for third-party integrations

### Technical Improvements
- **Database Optimization**: Advanced indexing strategies
- **Caching Layer**: Redis implementation
- **CDN Integration**: Global content delivery
- **Testing Suite**: Unit and integration tests
- **CI/CD Pipeline**: Automated testing and deployment

## Support & Documentation

### Key Files for Reference
- `ADMIN_SETUP.md`: Admin panel configuration guide
- `ANALYTICS_SETUP.md`: Analytics implementation details
- `FIRESTORE_INDEXES_GUIDE.md`: Database optimization guide
- `debug-admin.js`: Admin debugging utilities

### Development Resources
- **Firebase Console**: Database and authentication management
- **Google Analytics**: User behavior and performance insights
- **Vercel Dashboard**: Deployment and performance monitoring
- **GitHub Repository**: Version control and issue tracking

---

*This index provides a comprehensive overview of the ScholarHunt Uganda codebase. For specific implementation details, refer to the individual component files and documentation.* 