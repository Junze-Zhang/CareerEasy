# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with turbopack (faster)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Project Architecture

This is a Next.js 15 application using the App Router with TypeScript and Tailwind CSS.

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom component utilities
- **UI Libraries**: Headless UI, Heroicons
- **Animation**: Framer Motion
- **Font**: Public Sans (Google Fonts)

### Directory Structure
- `src/app/` - App Router pages and layouts
- `src/components/` - Reusable components organized by category:
  - `navigation/` - Navigation components (Navbar)
  - `sections/` - Page sections (Hero)
  - `layout/` - Layout components (Footer)
- `src/styles/` - Custom CSS utilities and animations

### Import Aliases
- `@/*` maps to `./src/*` for absolute imports

### Component Organization
- Components are exported from `src/components/index.ts` for clean imports
- Use the existing component structure when adding new components
- Follow the established naming conventions (PascalCase for components)

### Styling System
- Uses Tailwind CSS with custom utilities defined in `globals.css`
- Custom color palette with primary (blue) and secondary (sky) themes
- Predefined component classes:
  - `.btn-primary`, `.btn-secondary`, `.btn-outline` for buttons
  - `.hero-title`, `.hero-subtitle` for typography
  - `.section-padding`, `.container-max` for layout
  - Custom animations and effects in `components.css`

### UI Patterns
- Floating navigation bar with glassmorphism effect
- Blue-based color scheme with gradients
- Mobile-first responsive design
- Uses Heroicons for consistent iconography

## Application Context

CareerEasy is an AI-powered job board website with the following features:

### Current Features
- **Job Board**: Standard job board functionality with candidate and job information management
- **AI-Powered ATS System**: Reasoning LLM-based Applicant Tracking System with candidate highlighting for quick employer review
- **AI Career Suggestions**: Intelligent career recommendation system for candidates

### Future AI Features (Planned)
- AI mock interview system
- AI-powered resume tailoring
- Additional intelligent career guidance tools

### Architecture
- **Frontend**: Next.js application (this repository)
- **Backend**: Django application (../CareerEasy and ../CareerEasyBackend)
- The frontend communicates with the Django backend via API calls