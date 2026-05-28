import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name
const _filename = typeof __filename !== 'undefined'
  ? __filename
  : (typeof import.meta !== 'undefined' && import.meta.url
    ? fileURLToPath(import.meta.url)
    : '');

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(_filename);

// Import primary data
import { defaultShayaris, defaultCategories } from '../src/data/defaultShayaris';
import { emotionalQuestionPages } from '../src/data/emotionalQuestions';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_PATH = path.join(PUBLIC_DIR, 'robots.txt');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Slugs helper identical to server slug generator
function buildSimpleSlug(category: string, text: string, id: string): string {
  const cleanCat = category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove special chars
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-');
  const part = cleanText || 'emotion';
  return `${cleanCat}/${part}-${id}`;
}

function generate() {
  const origin = 'https://royversehub.netlify.app';
  const lastmod = new Date().toISOString().split('T')[0];

  // Try to load any custom approved shayari database from `server_db.json` if it exists
  let customApproved: any[] = [];
  let customCategories: string[] = [];
  const dbPath = path.join(process.cwd(), 'server_db.json');
  if (fs.existsSync(dbPath)) {
    try {
      const dbContent = fs.readFileSync(dbPath, 'utf-8');
      const dbObj = JSON.parse(dbContent);
      if (dbObj && Array.isArray(dbObj.approved)) {
        customApproved = dbObj.approved;
      }
      if (dbObj && Array.isArray(dbObj.categories)) {
        customCategories = dbObj.categories;
      }
    } catch (_) {
      // Ignore
    }
  }

  const allApproved = [...defaultShayaris, ...customApproved];
  const allCategories = Array.from(new Set([...defaultCategories, ...customCategories])).filter(c => c !== 'All');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 1. Homepage URL
  xml += `
  <url>
    <loc>${origin}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // 2. Trust pages (Static Pages)
  const trustPaths = ['/about-us', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/contact-us'];
  trustPaths.forEach(tp => {
    xml += `
  <url>
    <loc>${origin}${tp}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
  });

  // 3. Category URLs
  allCategories.forEach(cat => {
    const cleanCat = cat.toLowerCase().replace(/\s+/g, '-');
    xml += `
  <url>
    <loc>${origin}/${cleanCat}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // 4. Individual Shayari pages
  allApproved.forEach(s => {
    const slugPath = s.slug || buildSimpleSlug(s.category, s.text, s.id);
    xml += `
  <url>
    <loc>${origin}/${slugPath}</loc>
    <lastmod>${s.createdAt ? s.createdAt.split('T')[0] : lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // 5. Emotional Question Pages (High intent sentiment search nodes)
  emotionalQuestionPages.forEach(eq => {
    xml += `
  <url>
    <loc>${origin}/${eq.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // 6. Creator Portfolio pages
  const defaultCreators = ['roynorules', 'KabirSpeaks', 'AadyaRoy', 'RitikRai'];
  defaultCreators.forEach(c => {
    xml += `
  <url>
    <loc>${origin}/creator/${c}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  xml += `\n</urlset>`;

  // Write static sitemap.xml to public target
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
  console.log(`[Sitemap Generator] Wrote valid sitemap with ${allApproved.length} shayaris to ${SITEMAP_PATH}`);

  // Write static robots.txt to public target
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
  fs.writeFileSync(ROBOTS_PATH, robotsTxt, 'utf-8');
  console.log(`[Sitemap Generator] Wrote robots.txt to ${ROBOTS_PATH}`);
}

generate();
