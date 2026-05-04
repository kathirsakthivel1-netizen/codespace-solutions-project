# Glassmorphic Kitchen Pal

A modern smart fridge management application with AI-powered inventory tracking, built with React, TypeScript, and Tailwind CSS.

## Features

- Real-time inventory management
- AI-powered food detection using TensorFlow.js
- Glassmorphic UI design
- Responsive design for mobile and desktop
- Supabase backend integration
- PWA support

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Create the following tables:
     ```sql
     -- Inventory table
     CREATE TABLE inventory (
       id TEXT PRIMARY KEY,
       label TEXT NOT NULL,
       className TEXT NOT NULL,
       category TEXT NOT NULL,
       emoji TEXT,
       color TEXT,
       quantity INTEGER DEFAULT 1,
       confidence REAL,
       addedAt BIGINT NOT NULL,
       updatedAt BIGINT NOT NULL,
       source TEXT NOT NULL
     );
     ```

4. Configure environment variables:
   - Copy `.env.local` and fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

## Deployment

### Render (Recommended)

1. Connect your GitHub repository to Render
2. Create a new Static Site
3. Configure build settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Manual Deployment

The `render.yaml` file is included for easy Render deployment. Just push to your repo and connect to Render.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **AI/ML**: TensorFlow.js, COCO-SSD
- **Backend**: Supabase
- **Deployment**: Render

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
