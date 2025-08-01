# 🍲 NextMeal - AI Recipe Generator
## [Vercel Deployment Link](https://nexium-internship-1m5x.vercel.app/)


> Transform your ingredients into delicious recipes with AI-powered suggestions

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

## 🌟 Features

### 🤖 AI-Powered Recipe Generation
- **Multiple Recipe Options**: Generate 3 different recipe variations from your ingredients
- **Smart Ingredient Usage**: AI doesn't force all ingredients - creates flexible recipes
- **Dietary Preferences**: Customizable based on available appliances and preferences

### 👤 User Management
- **Username System**: Custom usernames instead of email display
- **Profile Settings**: Edit username and manage account preferences
- **Secure Authentication**: Supabase Auth with email verification

### 🎨 Modern UI/UX
- **Dynamic Backgrounds**: Tab-specific gradient backgrounds with smooth transitions
- **Dark Mode Support**: Beautiful themes for both light and dark modes
- **Glass Morphism**: Modern translucent design elements
- **Accordion Layout**: Space-efficient recipe browsing
- **Responsive Design**: Works perfectly on desktop and mobile

### 📱 Recipe Management
- **Save Recipes**: Bookmark your favorite AI-generated recipes
- **Shopping Lists**: Auto-generate shopping lists from recipe ingredients
- **Recipe Sharing**: Copy and share recipes with others
- **Organized Storage**: Accordion-style saved recipes for easy browsing

## 🏗️ Project Structure

```
grand_project/
├── next_meal_app/          # Main Next.js application
│   ├── app/                # App Router (Next.js 13+)
│   │   ├── auth/          # Authentication pages (login, signup)
│   │   ├── dashboard/     # Main dashboard page
│   │   ├── setup/         # Initial setup page
│   │   ├── protected/     # Protected routes
│   │   ├── page.tsx       # Home page
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Global styles & themes
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (accordion, button, card, etc.)
│   │   ├── dashboard-tabs.tsx      # Main dashboard navigation
│   │   ├── recipe-generator.tsx    # AI recipe generation
│   │   ├── saved-recipes.tsx       # Saved recipes with accordion
│   │   ├── shopping-list.tsx       # Shopping list management
│   │   ├── ingredient-input.tsx    # Ingredient management
│   │   ├── appliance-selector.tsx  # Kitchen appliances
│   │   ├── profile-settings.tsx    # User profile editing
│   │   ├── auth-button.tsx         # Authentication UI
│   │   ├── login-form.tsx          # Login form
│   │   ├── sign-up-form.tsx        # Sign up form
│   │   └── hero.tsx               # Landing page hero
│   ├── lib/              # Utility functions
│   │   ├── utils.ts      # General utilities
│   │   └── supabase/     # Supabase client setup
│   ├── database/         # Database schema
│   │   └── schema.sql    # Database tables
│   ├── supabase/         # Supabase migrations
│   │   └── migrations/   # Database migration files
│   ├── scripts/          # Setup scripts
│   │   └── setup-database.ts
│   ├── package.json      # Dependencies
│   ├── tailwind.config.ts # Tailwind configuration
│   └── next.config.ts    # Next.js configuration
├── docs/                 # Project documentation
│   ├── PRD.md           # Product Requirements Document
│   └── wireframes/      # UI wireframes and designs
├── README.md            # This file
├── CONTRIBUTING.md      # Contribution guidelines
└── LICENSE             # MIT License
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase** account
- **AI Service** (n8n webhook for recipe generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grand_project/next_meal_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. **Set up Supabase database**
   ```bash
   # Run the database setup script
   npm run setup-db
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## �️ How We Built This From Scratch

### Step 1: Project Setup
1. **Created Next.js App with Supabase Template**
   ```bash
   npx create-next-app@latest my-app --example with-supabase
   ```

2. **Set up Project Structure**
   - Organized components into logical folders
   - Created UI component library using Shadcn/ui
   - Set up Tailwind CSS configuration

### Step 2: Authentication System
1. **Supabase Auth Setup**
   - Configured Supabase project
   - Set up Row Level Security (RLS)
   - Created auth pages (login, signup)

2. **Username System Implementation**
   - Added username field to signup
   - Stored user metadata in Supabase
   - Created profile settings page

### Step 3: Database Design
1. **Created Core Tables**
   ```sql
   -- Users' ingredients
   CREATE TABLE ingredients (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     name TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Kitchen appliances
   CREATE TABLE appliances (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     name TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Saved recipes
   CREATE TABLE saved_recipes (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     time TEXT,
     difficulty TEXT,
     servings TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Shopping list
   CREATE TABLE shopping_list_items (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     ingredient_name TEXT NOT NULL,
     quantity TEXT,
     recipe_title TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Set up Row Level Security**
   - Users can only access their own data
   - Implemented proper security policies

### Step 4: Core Features Development
1. **Ingredient Management**
   - Input component for adding ingredients
   - Real-time database updates
   - Delete functionality

2. **Appliance Selection**
   - Checkbox-based appliance selector
   - Predefined appliance list
   - User preference storage

3. **Recipe Generation**
   - Integration with AI service (n8n webhook)
   - Multiple recipe generation
   - Flexible ingredient usage

### Step 5: UI/UX Enhancements
1. **Accordion Layout**
   - Installed Radix UI Accordion
   - Space-efficient recipe display
   - Smooth expand/collapse animations

2. **Dynamic Backgrounds**
   - Tab-specific gradient backgrounds
   - Dark mode compatibility
   - Glass morphism effects

3. **Brand Enhancement**
   - Custom NextMeal branding
   - Consistent design system
   - Professional auth pages

### Step 6: Advanced Features
1. **Shopping List Integration**
   - Auto-generate from recipes
   - Ingredient parsing from AI content
   - Quantity management

2. **Recipe Management**
   - Save/unsave functionality
   - Recipe sharing (copy to clipboard)
   - Organized storage with accordion

3. **Profile System**
   - Username editing
   - Account management
   - User preferences

### Step 7: Technical Improvements
1. **TypeScript Integration**
   - Full type safety
   - Interface definitions
   - Error handling

2. **Performance Optimization**
   - Component optimization
   - Loading states
   - Error boundaries

3. **Responsive Design**
   - Mobile-first approach
   - Tablet compatibility
   - Desktop enhancements

### Step 8: Development Best Practices
1. **Code Organization**
   - Component separation
   - Utility functions
   - Clean architecture

2. **Error Handling**
   - User-friendly error messages
   - Graceful fallbacks
   - Loading states

3. **Accessibility**
   - WCAG compliance
   - Keyboard navigation
   - Screen reader support

### Key Learnings for Beginners
- **Start Simple**: Begin with basic CRUD operations
- **Iterate Quickly**: Add features incrementally
- **User-Centric**: Focus on user experience first
- **Security First**: Implement proper authentication
- **Modern Stack**: Use latest web technologies
- **Documentation**: Document as you build

## �📊 Database Schema

### Core Tables

#### `ingredients`
- Store user's available ingredients
- User-specific ingredient lists

#### `appliances`
- Track cooking appliances/equipment
- Used for recipe customization

#### `saved_recipes`
- Store user's favorite recipes
- Includes recipe content, metadata, and timestamps

#### `shopping_list_items`
- Auto-generated from recipes
- Quantity and ingredient tracking

## 🎨 Design System

### Color Themes
- **Light Mode**: Warm, inviting pastels
- **Dark Mode**: Professional, sophisticated gradients

### Component Library
- **Shadcn/ui**: Modern, accessible component system
- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first styling

### Typography
- Clean, readable fonts
- Proper hierarchy and spacing
- Accessibility-compliant contrast

## 🔧 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Component library
- **Radix UI**: Accessible primitives

### Backend
- **Supabase**: Database, Auth, and API
- **PostgreSQL**: Relational database
- **Row Level Security**: Data protection

### AI Integration
- **n8n**: Workflow automation for AI calls
- **Custom Webhooks**: Recipe generation API

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🎯 Key Features Explained

### Recipe Generation Flow
1. User adds ingredients to their kitchen
2. Selects appliances/equipment available
3. Clicks "Generate Recipe Options"
4. AI creates 3 different recipes
5. User can save, share, or add to shopping list

### User Experience
- **Progressive Enhancement**: Works without JavaScript
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant
- **Performance**: Optimized for speed

### Security
- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Environment Variables**: Secure configuration

## 📱 Usage

### For Users
1. **Sign up** with username and email
2. **Add ingredients** you have available
3. **Select appliances** in your kitchen
4. **Generate recipes** with AI
5. **Save favorites** for later
6. **Create shopping lists** from recipes

### For Developers
- **Component-based**: Reusable React components
- **Type-safe**: Full TypeScript coverage
- **Modern Stack**: Latest web technologies
- **Scalable**: Designed for growth

## 🚧 Roadmap

### Upcoming Features
- [ ] Recipe ratings and reviews
- [ ] Meal planning calendar
- [ ] Nutritional information
- [ ] Recipe categories and filters
- [ ] Social features and sharing
- [ ] Mobile app (React Native)
- [ ] Voice commands integration
- [ ] Smart kitchen appliance sync

### Technical Improvements
- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Offline functionality
- [ ] Progressive Web App (PWA)
- [ ] Advanced search and filtering
- [ ] Recipe recommendation engine


### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


## 🙏 Acknowledgments

- **Supabase** for the excellent backend-as-a-service
- **Vercel** for hosting and deployment
- **OpenAI** for AI recipe generation capabilities

---

**Built with ❤️ for food lovers and cooking enthusiasts**

> "Never wonder 'what's for dinner?' again!"
