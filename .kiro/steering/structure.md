# Project Structure

## Root Directory
```
├── app/                    # Next.js App Router pages and layouts
├── components/             # Reusable React components
├── contexts/              # React context providers
├── data/                  # Static JSON data files
├── lib/                   # Utility libraries and configurations
├── public/                # Static assets
├── utils/                 # Utility functions
└── .kiro/                 # Kiro AI assistant configuration
```

## App Directory (Next.js App Router)
- **`app/layout.tsx`** - Root layout with metadata, analytics, and providers
- **`app/page.tsx`** - Homepage with hero section, featured content
- **`app/globals.css`** - Global CSS styles and Tailwind imports
- **Route-based folders**:
  - `about/` - About page
  - `admin/` - Admin dashboard pages
  - `blog/` - Blog listing and individual posts
  - `opportunities/` - Scholarship listings and details
  - `scholarships/` - Scholarship-related pages
  - `submit/` - User submission forms
  - `privacy-policy/` & `terms-of-service/` - Legal pages

## Components Directory
- **Layout Components**: `Layout.tsx` - Main site layout wrapper
- **Content Components**: 
  - `ScholarshipCard.tsx` - Scholarship display card
  - `BlogCard.tsx` - Blog post preview card
- **Functional Components**:
  - `NewsletterSubscription.tsx` - Email signup form
  - `ShareButtons.tsx` - Social sharing buttons
  - `AdSense.tsx` - Google AdSense integration
  - `ErrorBoundary.tsx` - Error handling wrapper
- **Admin Components**: `admin/` subfolder for admin-specific UI

## Library Directory (`lib/`)
- **`firebase.ts`** - Firebase configuration and initialization
- **`firebase/`** - Firebase service modules and utilities
- **`analytics.ts`** - Google Analytics tracking functions
- **`performance.ts/.tsx`** - Performance monitoring utilities
- **`search.ts`** - Search functionality
- **`seo.ts`** - SEO utilities and structured data

## Data Directory
- **`scholarships.json`** - Static scholarship data
- **`blog.json`** - Static blog post data
- Used for initial data seeding and fallback content

## Configuration Files
- **`next.config.ts`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration with path aliases
- **`firebase.json`** - Firebase project configuration
- **`firestore.rules`** - Firestore security rules
- **`firestore.indexes.json`** - Database index definitions
- **`.eslintrc.json`** - ESLint configuration
- **`postcss.config.mjs`** - PostCSS configuration for Tailwind

## Naming Conventions
- **Files**: PascalCase for components (`ScholarshipCard.tsx`)
- **Directories**: kebab-case for routes (`privacy-policy/`)
- **Components**: PascalCase exports with descriptive names
- **Utilities**: camelCase functions with clear purpose

## Import Patterns
- Use `@/` path alias for root-level imports
- Relative imports for same-directory files
- Group imports: external libraries, internal modules, relative imports

## File Organization Principles
- Components are organized by functionality, not by type
- Each major feature has its own directory under `app/`
- Shared utilities and configurations in dedicated directories
- Static assets in `public/` with descriptive names
- Environment-specific configurations in root directory