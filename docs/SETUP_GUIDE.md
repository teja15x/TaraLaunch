# Career Agent - Setup & Features Guide

Career Agent is an AI-powered career discovery platform designed for Indian students aged 13-21. This guide covers everything you need to get started with development and deployment.

---

## 1. Quick Start

### Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js 18+** - [Download and install](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Supabase Account** - [Sign up at supabase.com](https://supabase.com)
- **OpenAI API Key** - [Get it from platform.openai.com](https://platform.openai.com/api-keys)
- **Razorpay Account** (optional) - [Sign up at razorpay.com](https://razorpay.com) for payment processing
- **Git** - For version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd career-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual credentials (see Environment Variables section below).

4. **Run database migrations**
   ```bash
   npx supabase migration up
   ```
   This will execute all SQL migration files in the correct order.

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

---

## 2. Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Optional Variables

```env
# Razorpay Configuration (for payment processing)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Getting Your Credentials

#### Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy the Project URL and Anon Key

#### OpenAI
1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste it into `OPENAI_API_KEY`

#### Razorpay (Optional)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings > API Keys
3. Copy the Key ID and Key Secret

---

## 3. Database Setup

The application uses Supabase PostgreSQL for data storage. Run migrations in the following order:

### Step-by-Step Migration

1. **Authentication & User Profiles**
   ```bash
   npx supabase migration run 001_auth_and_profiles.sql
   ```

2. **Career Database & Assessments**
   ```bash
   npx supabase migration run 002_careers_and_assessments.sql
   ```

3. **Subscriptions & Payments**
   ```bash
   npx supabase migration run 003_subscriptions_and_payments.sql
   ```

### Verify Migrations

To verify all tables were created:
```bash
npx supabase db remote set
```

Then check the Supabase dashboard under the Table Editor to confirm tables exist.

---

## 4. Architecture Overview

### Tech Stack

- **Frontend Framework:** Next.js 14 with App Router
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI/LLM:** OpenAI GPT-4o-mini for chat and career analysis
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Payments:** Razorpay (optional)
- **Deployment:** Vercel

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client (Next.js)                   │
│  ┌────────────────┐         ┌──────────────────┐   │
│  │  Pages/Routes  │         │  Components      │   │
│  │  (App Router)  │         │  (React)         │   │
│  └────────────────┘         └──────────────────┘   │
│         │                           │               │
│  ┌─────────────────────────────────────────────┐   │
│  │     Zustand State Management                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
           │                    │
           ▼                    ▼
    ┌────────────────┐   ┌──────────────┐
    │ OpenAI API     │   │ Supabase     │
    │ (GPT-4o-mini)  │   │ (Auth + DB)  │
    └────────────────┘   └──────────────┘
           │                    │
           └────────┬───────────┘
                    ▼
         ┌──────────────────────┐
         │  Backend Logic       │
         │  (API Routes)        │
         └──────────────────────┘
```

---

## 5. Feature Summary

### Phase 1: Core Foundations
**Status:** Complete

- **Authentication System**
  - Email/password sign-up and login
  - Email verification
  - Password reset functionality
  - Session management

- **Landing Page**
  - Hero section with value proposition
  - Feature highlights
  - Call-to-action buttons
  - Mobile responsive design

- **User Dashboard**
  - Profile management
  - Career history tracking
  - Assessment progress visualization
  - Quick access to games and chat

- **AI Chat Interface**
  - Real-time conversational AI using GPT-4o-mini
  - Career guidance and Q&A
  - Chat history storage
  - Context-aware responses

- **3 Core Games**
  - **Career Explorer:** Interactive career discovery
  - **Skill Matcher:** Match skills to careers
  - **Path Builder:** Visualize career pathways

### Phase 2: Advanced Assessment & Matching
**Status:** Complete

- **Psychometric Assessments**
  - **RIASEC Test:** Realistic, Investigative, Artistic, Social, Enterprising, Conventional personality typing
  - **Multiple Intelligence (Gardner's):** Linguistic, Logical-Mathematical, Spatial, Bodily-Kinesthetic, Musical, Interpersonal, Intrapersonal, Naturalistic
  - **Big Five Personality Test:** Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism

- **Career Database**
  - 30+ Indian careers with detailed information
  - Skill requirements and educational paths
  - Salary ranges and job market trends
  - Industry classification

- **Advanced Matching Engine**
  - Algorithm-based career matching using assessment results
  - Weighted scoring system
  - Personalized recommendations
  - Top 5 career suggestions

### Phase 3: Monetization & Parent Features
**Status:** Complete

- **Payment Integration**
  - Razorpay payment gateway integration
  - Secure transaction handling
  - Payment status tracking

- **Subscription Tiers**
  - **Free Plan:** Basic access to games and chat
  - **Pro Plan:** All assessments, advanced matching, priority support
  - **Premium Plan:** Parent dashboard access, detailed reports, 1-on-1 guidance

- **Parent Dashboard**
  - View child's assessment results
  - Track career exploration progress
  - Access detailed career reports
  - Receive recommendations for guidance

- **4 Advanced Games**
  - **Industry Simulator:** Simulate day-in-life scenarios
  - **Education Planner:** Plan academic path to careers
  - **Interview Preparation:** Mock interview with AI
  - **Budget Calculator:** Understand career earnings potential

### Phase 4: Performance & Advanced Features
**Status:** Complete

- **Error Handling & Recovery**
  - Error boundary components
  - Graceful error messages
  - Retry mechanisms

- **Performance Optimization**
  - Code splitting with Next.js dynamic imports
  - Lazy loading for components and routes
  - Image optimization with Next.js Image component
  - Bundle size optimization

- **SEO & Discoverability**
  - Meta tags and Open Graph
  - Structured data (schema.org)
  - XML sitemap generation
  - Robots.txt configuration

- **Progressive Web App (PWA)**
  - Service worker implementation
  - Offline functionality
  - Install prompt
  - Push notifications (optional)

- **Assessment Extraction from Chat**
  - NLP-based skill extraction from chat history
  - Automatic assessment suggestions
  - Continuous learning from conversations

---

## 6. Project Structure

```
career-agent/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/               # User dashboard
│   │   ├── page.tsx
│   │   ├── profile/page.tsx
│   │   └── chat/page.tsx
│   ├── assessments/             # Assessment pages
│   │   ├── riasec/page.tsx
│   │   ├── gardner/page.tsx
│   │   └── big-five/page.tsx
│   ├── games/                   # Game routes
│   │   ├── career-explorer/page.tsx
│   │   ├── skill-matcher/page.tsx
│   │   ├── path-builder/page.tsx
│   │   ├── industry-simulator/page.tsx
│   │   ├── education-planner/page.tsx
│   │   ├── interview-prep/page.tsx
│   │   └── budget-calculator/page.tsx
│   ├── parent-dashboard/        # Parent features
│   │   ├── page.tsx
│   │   └── child/[id]/page.tsx
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── assessments/
│   │   ├── careers/
│   │   ├── payments/
│   │   └── user/
│   └── admin/                   # Admin pages (optional)
│
├── components/                  # Reusable React components
│   ├── auth/
│   ├── dashboard/
│   ├── games/
│   ├── assessments/
│   ├── chat/
│   ├── ui/                      # UI components (buttons, cards, etc.)
│   └── layout/
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useChat.ts
│   ├── useAssessments.ts
│   └── useCareerMatching.ts
│
├── lib/                         # Utility functions
│   ├── api.ts                   # API client functions
│   ├── auth.ts                  # Authentication utilities
│   ├── supabase.ts              # Supabase client setup
│   ├── openai.ts                # OpenAI integration
│   ├── matching-engine.ts       # Career matching algorithm
│   └── validators.ts            # Form validation
│
├── store/                       # Zustand state management
│   ├── authStore.ts
│   ├── chatStore.ts
│   ├── assessmentStore.ts
│   └── userStore.ts
│
├── types/                       # TypeScript type definitions
│   ├── auth.ts
│   ├── career.ts
│   ├── assessment.ts
│   ├── user.ts
│   └── game.ts
│
├── styles/                      # Global styles
│   ├── globals.css
│   └── tailwind.config.ts
│
├── supabase/                    # Supabase configuration
│   ├── migrations/
│   │   ├── 001_auth_and_profiles.sql
│   │   ├── 002_careers_and_assessments.sql
│   │   └── 003_subscriptions_and_payments.sql
│   └── seed.ts                  # Database seeding
│
├── public/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── manifest.json            # PWA manifest
│
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (git ignored)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── docs/                        # Documentation
    ├── SETUP_GUIDE.md          # This file
    ├── API_DOCS.md             # API endpoint documentation
    ├── ARCHITECTURE.md         # Detailed architecture
    └── DEPLOYMENT.md           # Deployment guide
```

---

## 7. Deployment

### Deploy to Vercel

Vercel is the recommended platform for deploying Next.js applications.

#### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket.

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Connect to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your Git provider and repository
4. Click "Import"

#### Step 3: Configure Environment Variables

1. In the Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `RAZORPAY_KEY_ID` (if using payments)
   - `RAZORPAY_KEY_SECRET` (if using payments)
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at `https://your-project.vercel.app`

#### Step 5: Custom Domain (Optional)

1. Go to project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Environment Variables for Production

Update these for production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
OPENAI_API_KEY=production-openai-key
RAZORPAY_KEY_ID=production-razorpay-id
RAZORPAY_KEY_SECRET=production-razorpay-secret
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Post-Deployment Checklist

- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Test payment processing
- [ ] Check error handling
- [ ] Monitor performance metrics
- [ ] Set up logging/monitoring
- [ ] Enable CORS if needed
- [ ] Set up automated backups

---

## 8. Useful Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linting
npm run type-check       # Run TypeScript type checking
npm run format           # Format code
```

### Database
```bash
npx supabase migration up              # Run all pending migrations
npx supabase migration list            # List all migrations
npx supabase db push                   # Push local changes to remote
npx supabase db pull                   # Pull remote changes locally
```

### Testing (if set up)
```bash
npm run test             # Run test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

---

## 9. Troubleshooting

### Common Issues

**Issue: "Cannot find module" errors**
- Solution: Run `npm install` to ensure all dependencies are installed
- Check that `node_modules` directory exists

**Issue: Supabase connection failing**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active
- Ensure your IP is not blocked by Supabase firewall

**Issue: OpenAI API errors**
- Verify `OPENAI_API_KEY` is correct and has proper permissions
- Check API quota and billing status at platform.openai.com
- Ensure you have sufficient API credits

**Issue: Database migration fails**
- Ensure migrations are run in order (001, 002, 003)
- Check Supabase logs for specific error messages
- Verify your Supabase account has database access

**Issue: Port 3000 already in use**
```bash
npm run dev -- -p 3001  # Use a different port
```

---

## 10. Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Razorpay Documentation](https://razorpay.com/docs)

---

## 11. Getting Help

- Check existing issues on GitHub
- Review logs in browser console and server logs
- Visit Supabase dashboard for database-related issues
- Check OpenAI platform dashboard for API-related issues
- Consult project documentation in `/docs` directory

---

**Last Updated:** February 2025
**Maintained by:** Career Agent Development Team
