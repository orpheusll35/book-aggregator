
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
 * Global state for API key rotation
 */
let currentKeyIndex = 0;

/**
 * Builds a ScraperAPI URL to bypass Cloudflare.
 * Supports multiple comma-separated keys in SCRAPER_API_KEY.
 */
export function buildScraperApiUrl(targetUrl: string, renderJs: boolean = false, premium: boolean = false): string {
    const rawKeys = process.env.SCRAPER_API_KEY;
    if (!rawKeys) {
        console.warn('⚠️ SCRAPER_API_KEY is not set in .env. Falling back to direct request.');
        return targetUrl;
    }

    const keys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length === 0) return targetUrl;

    // Rotate through keys
    const apiKey = keys[currentKeyIndex % keys.length];
    currentKeyIndex++;

    if (keys.length > 1 && currentKeyIndex === 1) {
        console.log(`ℹ️ Multi-key mode active: Using ${keys.length} ScraperAPI keys.`);
    }

    let apiUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}`;

    if (renderJs) apiUrl += '&render=true';
    if (premium) apiUrl += '&premium=true';

    return apiUrl;
}

/**
 * Decodes HTML entities in a string.
 */
export function decodeHtmlEntities(str: string): string {
    if (!str) return str;

    // Numeric entities
    let decoded = str.replace(/&#(\d+);/g, (match, grp) => String.fromCharCode(parseInt(grp, 10)));
    decoded = decoded.replace(/&#x([\da-f]+);/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)));

    // Common named entities
    const entityMap: Record<string, string> = {
        '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
        '&nbsp;': ' ', '&ouml;': 'ö', '&Ouml;': 'Ö', '&ccedil;': 'ç', '&Ccedil;': 'Ç',
        '&uuml;': 'ü', '&Uuml;': 'Ü', '&shy;': '', '&rsquo;': "'", '&lsquo;': "'",
        '&rdquo;': '"', '&ldquo;': '"'
    };

    decoded = decoded.replace(/&[a-z0-9]+;/gi, (match) => entityMap[match] || match);

    return decoded.trim();
}
