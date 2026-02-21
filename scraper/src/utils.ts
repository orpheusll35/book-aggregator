
/**
 * Random list of common User-Agents to rotate between.
 */
export const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Apple) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
];

/**
 * Returns a random User-Agent from the list.
 */
export function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Adds a random delay (jitter) to mimic human behavior.
 * @param min Minimum delay in ms
 * @param max Maximum delay in ms
 */
export function jitter(min: number = 500, max: number = 2000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Common headers for scraping to mimic a browser.
 */
export function getHeaders() {
    return {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    };
}

import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Builds a ScraperAPI URL to bypass Cloudflare.
 * Returns the original URL if SCRAPER_API_KEY is not set.
 */
export function buildScraperApiUrl(targetUrl: string, renderJs: boolean = false, premium: boolean = false): string {
    const apiKey = process.env.SCRAPER_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ SCRAPER_API_KEY is not set in .env. Falling back to direct request (might get blocked).');
        return targetUrl;
    }

    // ScraperAPI syntax: http://api.scraperapi.com?api_key=KEY&url=URL
    let apiUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}`;

    // If JS rendering is needed (useful for Cloudflare challenges)
    if (renderJs) {
        apiUrl += '&render=true';
    }

    // Add premium=true if needed for hard-to-scrape sites like D&R
    if (premium) {
        apiUrl += '&premium=true';
    }

    return apiUrl;
}
