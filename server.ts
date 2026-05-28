import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Robust environment-agnostic ESM/CJS path resolution
const _filename = typeof __filename !== 'undefined'
  ? __filename
  : (typeof import.meta !== 'undefined' && import.meta.url
    ? fileURLToPath(import.meta.url)
    : '');

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(_filename);

// Standard import for default data
import { defaultShayaris, defaultCategories } from './src/data/defaultShayaris.js';
import { emotionalQuestionPages } from './src/data/emotionalQuestions.js';

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE_PATH = path.join(process.cwd(), 'server_db.json');

// Memory cache of server-side community submissions
let db = {
  approved: [] as any[],
  pending: [] as any[],
  categories: defaultCategories
};

// Load community shayaris from disk
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      db = JSON.parse(content);
      // Ensure arrays and default lists are synchronized
      if (!Array.isArray(db.approved)) db.approved = [];
      if (!Array.isArray(db.pending)) db.pending = [];
      if (!Array.isArray(db.categories)) db.categories = defaultCategories;
    } else {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error loading server DB, using fresh template', err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server DB to disk', err);
  }
}

// Automatically load database on launch
loadDb();

// Unified slugs helper
function buildSimpleSlug(category: string, text: string, id: string): string {
  const cleanCat = category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // Roman/English words extractions for Hinglish/Unicode clean paths
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

// API Routes
app.get('/api/community-db', (req, res) => {
  res.json({
    approved: db.approved,
    pending: db.pending,
    categories: db.categories
  });
});

app.post('/api/submit-shayari', (req, res) => {
  const { text, category, author, highlightedWords, uploaderUsername, newCategory } = req.body;
  if (!text || !category) {
    return res.status(400).json({ error: 'Text and Category are required.' });
  }

  const id = Date.now().toString() + '-' + Math.floor(Math.random() * 900 + 100);
  const slug = buildSimpleSlug(category, text, id);

  const newShayari = {
    id,
    text,
    category,
    author: author || 'Anonymous',
    highlightedWords: highlightedWords || [],
    likes: 0,
    shares: 0,
    createdAt: new Date().toISOString(),
    status: 'pending',
    uploaderUsername,
    slug,
    seoTitle: `${category} Shayari - Pure Emotions of ${author || 'Anonymous'}`,
    seoDesc: text.substring(0, 150).replace(/\n/g, ' ')
  };

  db.pending.unshift(newShayari);

  // Auto include new category
  if (newCategory && !db.categories.includes(newCategory)) {
    db.categories.push(newCategory);
  }

  saveDb();
  res.status(201).json({ success: true, shayari: newShayari });
});

app.post('/api/approve-shayari', (req, res) => {
  const { id } = req.body;
  const index = db.pending.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pending shayari not found.' });
  }

  const item = db.pending[index];
  item.status = 'approved';
  // Standard title upgrade
  item.seoTitle = `${item.category} Shayari - "${item.text.substring(0, 30).trim()}..." | Roy No Rules`;
  
  db.pending.splice(index, 1);
  db.approved.unshift(item);
  saveDb();
  res.json({ success: true, shayari: item });
});

app.post('/api/decline-shayari', (req, res) => {
  const { id } = req.body;
  const index = db.pending.findIndex(s => s.id === id);
  if (index !== -1) {
    db.pending.splice(index, 1);
    saveDb();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Pending shayari not found.' });
});

app.post('/api/delete-shayari', (req, res) => {
  const { id } = req.body;
  const index = db.approved.findIndex(s => s.id === id);
  if (index !== -1) {
    db.approved.splice(index, 1);
    saveDb();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Approved shayari not found.' });
});

app.post('/api/add-official-shayari', (req, res) => {
  const { text, category, author, highlightedWords } = req.body;
  if (!text || !category) {
    return res.status(400).json({ error: 'Text and Category are required.' });
  }

  const id = Date.now().toString();
  const slug = buildSimpleSlug(category, text, id);

  const officialShayari = {
    id,
    text,
    category,
    author: author || 'Roy No Rules',
    highlightedWords: highlightedWords || [],
    likes: Math.floor(Math.random() * 50) + 120,
    shares: Math.floor(Math.random() * 20) + 40,
    createdAt: new Date().toISOString(),
    status: 'approved',
    slug,
    seoTitle: `${category} Shayari by ${author || 'Roy No Rules'} - Heart Touching Status`,
    seoDesc: text.substring(0, 160).replace(/\n/g, ' ')
  };

  db.approved.unshift(officialShayari);
  saveDb();
  res.status(201).json({ success: true, shayari: officialShayari });
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'roynorules.com';
  const protocol = req.secure ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`);
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'roynorules.com';
  const protocol = req.secure ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  // Collect all approved shayaris (Default + Community approved)
  const allApproved = [...defaultShayaris, ...db.approved];
  const lastmod = new Date().toISOString().split('T')[0];

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

  // 2. Trust pages
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
  const activeCategories = Array.from(new Set([...defaultCategories, ...db.categories])).filter(c => c !== 'All');
  activeCategories.forEach(cat => {
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

  xml += `\n</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Dynamic pre-rendering metadata injector
function generateSeoHtml(template: string, requestPath: string, host: string, protocol: string): string {
  let title = 'Roy No Rules | Premium Hindi & Hinglish Shayari';
  let description = 'Discover premium Hinglish emotional shayari, motivation, attitude customizer, free recitation players, and premium HD wallpaper creation studio.';
  const currentOrigin = `${protocol}://${host}`;
  let canonical = `${currentOrigin}${requestPath}`;

  const cleanPath = requestPath.split('?')[0];

  const matchedEq = emotionalQuestionPages.find(eq => '/' + eq.slug === cleanPath);

  // Match emotional pages, trust pages, and dynamically generated profiles
  if (matchedEq) {
    title = matchedEq.seoTitle;
    description = matchedEq.seoDesc;
  } else if (cleanPath === '/about-us') {
    title = 'About Our Sanctuary | Roy No Rules';
    description = 'Learn about Roy No Rules shayari sanctuary, emotional dark aesthetics, and our community.';
  } else if (cleanPath === '/privacy-policy') {
    title = 'Privacy Safeguards | Roy No Rules';
    description = 'Full details on local-first secure client states and cookies privacy policies.';
  } else if (cleanPath === '/terms-and-conditions') {
    title = 'Terms & Conditions | Roy No Rules';
    description = 'Respectful conduct guidelines, copyright standards, and community moderator rules.';
  } else if (cleanPath === '/disclaimer') {
    title = 'Creative Disclaimers | Roy No Rules';
    description = 'Intellectual property and copyright claims disclaimers for fan-made shayaris.';
  } else if (cleanPath === '/contact-us') {
    title = 'Contact Us Direct | Roy No Rules';
    description = 'Get in touch with us at +91 9027671630 or email roynorules@gmail.com for support.';
  } else {
    // Check if it's a category or shayari page or creator
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 1) {
      // Category index or landing format (e.g. /sad or /sad-shayari)
      const rawCat = segments[0].toLowerCase().replace('-shayari', '');
      const matchedCat = [...defaultCategories, ...db.categories].find(
        c => c.toLowerCase() === rawCat || c.toLowerCase().replace(/\s+/g, '-') === rawCat
      );
      if (matchedCat) {
        title = `${matchedCat} Shayari & Status | Roy No Rules 👑`;
        description = `Discover handpicked, trending ${matchedCat} Hinglish and Hindi Shayari. Read, recite softly with room audio ambient players, and download custom aesthetic wallpaper cards.`;
      }
    } else if (segments.length === 2) {
      if (segments[0] === 'creator') {
        const creatorName = decodeURIComponent(segments[1]);
        title = `Creator @${creatorName} | Premium Creator Portfolio - Roy No Rules`;
        description = `Explore creative collections, daily active engagement metrics, and custom HD status cards designed by @${creatorName} inside the Roy No Rules content ecosystem.`;
      } else {
        const slugSubpart = segments[1].toLowerCase();
        // Find Shayari (default or community approved)
        const allShayaris = [...defaultShayaris, ...db.approved];
        const matchedShayari = allShayaris.find(s => {
          const itemSlug = s.slug || '';
          return itemSlug.toLowerCase().endsWith(slugSubpart) || s.id === slugSubpart;
        });

        if (matchedShayari) {
          title = matchedShayari.seoTitle || `${matchedShayari.category} Shayari by ${matchedShayari.author} | Roy No Rules`;
          description = matchedShayari.seoDesc || `${matchedShayari.text.substring(0, 160).replace(/\n/g, ' ')}`;
        }
      }
    }
  }

  // Replace tags in head dynamically
  let output = template;

  // Real-time dynamic JSON-LD Schema Markup injection
  let schemaData: any = null;
  const currentEq = emotionalQuestionPages.find(eq => '/' + eq.slug === cleanPath);
  if (currentEq) {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": currentEq.heading,
      "description": currentEq.seoDesc,
      "articleBody": currentEq.intro,
      "author": {
        "@type": "Person",
        "name": "Roy No Rules Editorial Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Roy No Rules",
        "logo": {
          "@type": "ImageObject",
          "url": `${currentOrigin}/favicon.ico`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonical
      }
    };
  } else if (cleanPath === '/' || cleanPath === '') {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Roy No Rules",
      "url": currentOrigin,
      "description": description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${currentOrigin}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  } else {
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 1) {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${segments[0].replace('-shayari', '').toUpperCase()} Vibe Station`,
        "url": canonical,
        "description": description,
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": currentOrigin },
            { "@type": "ListItem", "position": 2, "name": segments[0], "item": canonical }
          ]
        }
      };
    } else if (segments.length === 2) {
      if (segments[0] === 'creator') {
        schemaData = {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": segments[1],
            "description": description,
            "url": canonical
          }
        };
      } else {
        schemaData = {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": title,
          "genre": segments[0],
          "creator": {
            "@type": "Person",
            "name": title.split('by ')[1]?.split(' |')[0] || "Roy No Rules Guest Author"
          },
          "text": description,
          "url": canonical
        };
      }
    }
  }

  if (schemaData) {
    const schemaTag = `\n    <script type="application/ld+json">${JSON.stringify(schemaData)}</script>`;
    output = output.replace(/<\/head>/i, `${schemaTag}</head>`);
  }

  // Title replacement
  if (output.includes('<title>')) {
    output = output.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  } else {
    output = output.replace(/<\/head>/i, `<title>${title}</title></head>`);
  }

  // Description meta tag replacement/injection
  const descTag = `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`;
  if (output.includes('name="description"')) {
    output = output.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, descTag);
  } else {
    output = output.replace(/<\/head>/i, `${descTag}</head>`);
  }

  // Canonical tag
  const canonTag = `<link rel="canonical" href="${canonical}" />`;
  if (output.includes('rel="canonical"')) {
    output = output.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonTag);
  } else {
    output = output.replace(/<\/head>/i, `${canonTag}</head>`);
  }

  // Open Graph
  const ogTags = `
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Roy No Rules..." />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
  `;
  output = output.replace(/<\/head>/i, `${ogTags}</head>`);

  return output;
}

// Vite integration or static file rendering
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);

    // Serve index.html transformed with Vite and dynamic SEO meta tags
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.resolve(_dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);

        const host = req.get('host') || 'localhost:3000';
        const protocol = req.secure ? 'https' : 'http';
        const html = generateSeoHtml(template, url, host, protocol);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files (except for dynamic sitemap and index routes)
    app.use(express.static(distPath, { index: false }));

    app.get('*', (req, res) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.join(distPath, 'index.html');
        if (!fs.existsSync(templatePath)) {
          return res.status(404).send('Application build in progress. Please refresh.');
        }
        const template = fs.readFileSync(templatePath, 'utf-8');

        const host = req.get('host') || 'roynorules.com';
        const protocol = req.secure ? 'https' : 'http';
        const html = generateSeoHtml(template, url, host, protocol);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error('Production serve error:', e);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Roy No Rules] SEO and Sitemap enabled server running on port ${PORT}`);
  });
}

startServer();
