import axios from 'axios';
import * as cheerio from 'cheerio';

const STORE_URL_MAP = [
  { pattern: /amazon\./i,   slug: 'amazon' },
  { pattern: /flipkart\./i, slug: 'flipkart' },
  { pattern: /croma\./i,    slug: 'croma' },
  { pattern: /myntra\./i,   slug: 'myntra' },
  { pattern: /meesho\./i,   slug: 'meesho' },
];

const PRICE_SELECTORS = [
  '#priceblock_ourprice',
  '#priceblock_dealprice',
  '#price_inside_buybox',
  '.a-price .a-offscreen',
  'meta[property="product:price:amount"]',
  '[itemprop="price"]',
  '.price_color',
  '.product-price',
  '.price',
  '.offer-price',
];

function parseNumericPrice(rawText) {
  const cleaned = rawText.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  if (!cleaned) return null;
  const price = Number(cleaned[0]);
  return Number.isFinite(price) ? price : null;
}

/**
 * Detect which known store this URL belongs to.
 * Returns the store slug string, or null if unknown.
 */
export function detectStoreSlugFromUrl(url) {
  for (const { pattern, slug } of STORE_URL_MAP) {
    if (pattern.test(url)) return slug;
  }
  return null;
}

/**
 * Scrape the price from a URL.
 * Returns { price: number, storeSlug: string | null }
 */
export async function fetchPriceFromUrl(url) {
  if (!url) {
    throw new Error('Product URL is missing');
  }

  const storeSlug = detectStoreSlugFromUrl(url);

  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Connection: 'keep-alive',
    },
  });

  const $ = cheerio.load(response.data);

  for (const selector of PRICE_SELECTORS) {
    const el = $(selector).first();
    if (!el.length) continue;

    const content = el.attr('content');
    const candidate = content || el.text();
    const price = parseNumericPrice(candidate);
    if (price !== null) {
      return { price, storeSlug };
    }
  }

  const bodyText = $('body').text();
  const fallback = parseNumericPrice(bodyText);
  if (fallback !== null) {
    return { price: fallback, storeSlug };
  }

  throw new Error('Could not extract price from product page');
}