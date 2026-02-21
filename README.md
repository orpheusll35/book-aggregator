# Book Aggregator Project

A dual-component project featuring a high-speed book scraper and a modern web dashboard.

## Project Structure

- **frontend/**: An Astro-based web application for browsing and searching books.
- **scraper/**: A TypeScript-based scraping engine for D&R and potentially other stores.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase account
- ScraperAPI key (for the scraper)

### Installation

1. Clone the repository.
2. Setup environment variables:
   - Copy `.env.example` (if provided) or create a `.env` in both `frontend/` and `scraper/` with your credentials.
3. Install dependencies:
   ```bash
   # In frontend/
   npm install
   
   # In scraper/
   npm install
   ```

### Running the Project

- **Start Frontend**: `npm run dev` (inside `frontend/`)
- **Start Scraper**: `npm run crawl` (inside `scraper/`)

## Features
- Bypasses Cloudflare & AWS WAF for D&R.
- High-speed data synchronization with Supabase.
- Mobile-responsive React components in the frontend.
