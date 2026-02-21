# Book Aggregator Project

A dual-component project featuring a high-speed book scraper and a modern web dashboard.

## Project Structure

- **frontend/**: An Astro-based web application for browsing and searching books.
- **scraper/**: A TypeScript-based scraping engine for D&R and potentially other stores.

## Getting Started

### Prerequisites / Gereksinimler
- Node.js (v18+)
- Supabase account (or project credentials)
- ScraperAPI key (for the scraper component)

### Local Setup / Yerel Kurulum

Diğer kullanıcıların projeyi kendi bilgisayarlarında çalıştırması için şu adımları izlemesi gerekir:

1. **Clone the repository / Depoyu kopyalayın**:
   ```bash
   git clone https://github.com/orpheusll35/book-aggregator.git
   cd book-aggregator
   ```

2. **Environment Variables / Ortam Değişkenleri**:
   Since `.env` files are ignored for security, they must be created manually:
   
   - **Frontend**: Create `frontend/.env` based on `frontend/.env.example`.
   - **Scraper**: Create `scraper/.env` based on `scraper/.env.example`.
   *(Gerekli anahtarları bu dosyalara yapıştırın).*

3. **Install dependencies / Bağımlılıkları yükleyin**:
   ```bash
   # In frontend/
   cd frontend && npm install
   
   # In scraper/
   cd ../scraper && npm install
   ```

### Running the Project / Projeyi Çalıştıma

- **Start Frontend**: `npm run dev` (inside `frontend/`)
- **Start Scraper**: `npm run crawl` (inside `scraper/`)

### Running the Project

- **Start Frontend**: `npm run dev` (inside `frontend/`)
- **Start Scraper**: `npm run crawl` (inside `scraper/`)

## Features
- Bypasses Cloudflare & AWS WAF for D&R.
- High-speed data synchronization with Supabase.
- Mobile-responsive React components in the frontend.
