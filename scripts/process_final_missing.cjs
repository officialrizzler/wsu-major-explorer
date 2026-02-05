const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');
const path = require('path');

// Config
const JSON_PATH = path.join(__dirname, '../data/course_requirements.json');
const CSV_PATH = path.join(__dirname, '../data/missing_course_data.csv');

// Helper: HTTP Request
async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    const baseUrl = new URL(url).origin;
                    redirectUrl = baseUrl + redirectUrl;
                }
                fetchHtml(redirectUrl).then(resolve).catch(reject);
                return;
            }
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => { resolve(data); });
        });
        req.on('error', (err) => reject(err));
    });
}

// Helper: Parse Catalog Page (Standard)
function parseCatalogPage(html) {
    const $ = cheerio.load(html);
    const courseGroups = [];

    $('.acalog-core').each((i, el) => {
        const groupRaw = $(el);
        let title = groupRaw.find('h2, h3, h4, strong').first().text().trim();
        if (!title || title === 'Legend') return;

        const items = [];
        groupRaw.find('ul > li').each((j, li) => {
            const text = $(li).text().trim();
            const isCourse = $(li).hasClass('acalog-course');
            const codeMatch = text.match(/^([A-Z]{2,4}\s+\d{3}[A-Z]?)/);

            if (isCourse || codeMatch) {
                const courseCode = codeMatch ? codeMatch[1] : '';
                const creditsMatch = text.match(/\(([^)]+credits?)\)/i) || text.match(/(\d+\s+credits?)/i);
                let courseTitle = text.replace(courseCode, '').replace(/\(?\d+\s+credits?\)?/i, '').replace(/^-?\s*/, '').trim();

                items.push({
                    type: 'course',
                    course_id: courseCode,
                    course_title: courseTitle,
                    credits: creditsMatch ? creditsMatch[1] : '?'
                });
            } else {
                items.push({ type: 'text', content: text });
            }
        });

        if (items.length > 0) {
            courseGroups.push({
                group_name: title,
                credits_required: null,
                display_type: 'list',
                items: items,
                notes: []
            });
        }
    });
    return courseGroups;
}

// Helper: Parse Marketing Page (Fallback)
function parseMarketingPage(html, url, note) {
    const $ = cheerio.load(html);
    const groups = [];

    // Attempt to finding a catalog link first
    const catalogLink = $('a[href*="catalog.winona.edu"]').first().attr('href');
    // If we want to be smart, we could return the catalog link to be fetched.
    // But for now, let's just scrape the text.

    // Extract main text content
    // Winona site structure usually has #main-content or .content
    let contentEl = $('#main-content');
    if (contentEl.length === 0) contentEl = $('.main-content');
    if (contentEl.length === 0) contentEl = $('main');
    if (contentEl.length === 0) contentEl = $('body');

    // Get paragraphs
    const paragraphs = [];
    contentEl.find('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 50) paragraphs.push(text); // Filter short nav text
    });

    const items = [];

    // Add User Note if exists
    if (note) {
        items.push({ type: 'text', content: `NOTE: ${note}` });
    }

    // Add Link
    items.push({ type: 'text', content: `View full details at: ${url}` });

    if (catalogLink) {
        items.push({ type: 'text', content: `Catalog Entry: ${catalogLink}` });
    }

    // Add Summary
    paragraphs.slice(0, 3).forEach(p => {
        items.push({ type: 'text', content: p });
    });

    groups.push({
        group_name: "Program Information",
        credits_required: null,
        display_type: 'list',
        items: items,
        notes: []
    });

    return groups;
}

async function run() {
    // 1. Load Data
    let data = {};
    if (fs.existsSync(JSON_PATH)) {
        data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    }

    // 2. Read CSV
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim());

    // Parse CSV (Simple)
    const toProcess = [];
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        // Simple split by comma, assuming no commas in URL
        const parts = lines[i].split(',');
        // Program ID, Program Page URL, Catalog URL, Notes
        // Notes might contain commas? Assuming not for now based on user input.
        if (parts.length >= 3) {
            toProcess.push({
                id: parts[0].trim(),
                pageUrl: parts[1].trim(),
                catalogUrl: parts[2].trim(),
                note: parts.slice(3).join(',').trim() // Join rest in case of commas
            });
        }
    }

    console.log(`Processing ${toProcess.length} items...`);

    for (const item of toProcess) {
        console.log(`Processing ${item.id}...`);
        try {
            const url = item.catalogUrl || item.pageUrl;
            const html = await fetchHtml(url);

            let groups = [];

            if (url.includes('catalog.winona.edu')) {
                console.log(`  - Parsing as Catalog`);
                groups = parseCatalogPage(html);
            }

            // If catalog parse failed or it wasn't a catalog URL
            if (groups.length === 0) {
                console.log(`  - Parsing as Marketing/Info Page`);
                groups = parseMarketingPage(html, item.pageUrl, item.note);
            } else {
                // If it successfully parsed as catalog, ADD the note to the first group
                if (item.note && groups.length > 0) {
                    groups[0].notes.push(`NOTE: ${item.note}`);
                }
            }

            if (groups.length > 0) {
                data[item.id] = groups;
                console.log(`  + Saved ${groups.length} groups.`);
            }

        } catch (e) {
            console.error(`  ! Error: ${e.message}`);
        }
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
    console.log(`Done. Updated ${JSON_PATH}`);
}

run();
