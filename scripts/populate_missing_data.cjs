const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');
const path = require('path');

// Config
const DELAY_MS = 200;
const JSON_PATH = path.join(__dirname, '../data/course_requirements.json');
const CSV_PATH = path.join(__dirname, '../data/found_catalog_data.csv');
const MISSING_CSV_PATH = path.join(__dirname, '../data/missing_course_data.csv');

// Helper: HTTP Request
// (Reusing fetch logic from scrape_courses.cjs)
async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Ensure absolute URL for redirect
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

        req.on('error', (err) => {
            reject(err);
        });
    });
}

// Helper: Parse Catalog Page
// (Reusing logic from scrape_courses.cjs, slightly robustified)
function parseCatalogPage(html) {
    const $ = cheerio.load(html);
    const courseGroups = [];

    $('.acalog-core').each((i, el) => {
        const groupRaw = $(el);

        // 1. Get Group Title
        let title = groupRaw.find('h2').text().trim();
        if (!title) title = groupRaw.find('h3').text().trim();
        if (!title) title = groupRaw.find('h4').text().trim();
        if (!title) title = groupRaw.find('strong').first().text().trim();

        if (!title || title === 'Legend' || title === 'Graduate School Recommendations') return;

        // 2. Parse items
        const listItems = groupRaw.find('ul > li');
        const items = [];

        listItems.each((j, li) => {
            const liEl = $(li);
            const text = liEl.text().trim();

            // Check if course
            let isCourse = liEl.hasClass('acalog-course');
            // heuristic checks
            const codeMatch = text.match(/^([A-Z]{2,4}\s+\d{3}[A-Z]?)/);

            if (isCourse || codeMatch) {
                const courseCode = codeMatch ? codeMatch[1] : '';

                const creditsMatch = text.match(/\(([^)]+credits?)\)/i) || text.match(/(\d+\s+credits?)/i);

                let courseTitle = text;
                if (courseCode) {
                    courseTitle = courseTitle.replace(courseCode, '').replace(/^-?\s*/, '').trim();
                }
                if (creditsMatch) {
                    // Remove credits from title
                    courseTitle = courseTitle.replace(creditsMatch[0], '').replace('()', '').trim();
                    courseTitle = courseTitle.replace(/[-–]\s*$/, '').trim();
                }

                items.push({
                    type: 'course',
                    course_id: courseCode,
                    course_title: courseTitle,
                    credits: creditsMatch ? creditsMatch[1] : '?'
                });
            } else {
                items.push({
                    type: 'text',
                    content: text
                });
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

async function run() {
    // 1. Load Data
    console.log('Loading data...');
    let existingData = {};
    if (fs.existsSync(JSON_PATH)) {
        existingData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    }

    // 2. Parse CSV
    // Format: missing_id,catalog_name,catalog_url,original_url
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',');

    // Simple CSV parser (assuming no commas in URLs, which is risky but likely safe for these specific URLs)
    // Actually, found_catalog_data.csv has standard format.
    // Let's use a regex to split safely or just assume standard split if no quoted fields contain commas.
    // The URLs definitely contain commas? No, URLs usually don't. Program titles might.
    // Let's be careful. The python csv writer wraps strings in quotes if they contain commas.
    // I will write a quick csv line parser.

    const parseCSVLine = (str) => {
        const result = [];
        let cur = '';
        let inQuote = false;
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (c === '"') { inQuote = !inQuote; }
            else if (c === ',' && !inQuote) { result.push(cur); cur = ''; }
            else { cur += c; }
        }
        result.push(cur);
        return result;
    }

    const toScrape = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length >= 3) {
            toScrape.push({
                id: cols[0],
                url: cols[2]
            });
        }
    }

    console.log(`Found ${toScrape.length} programs to scrape.`);

    let successCount = 0;
    const processedIds = new Set();

    // 3. Scrape Loop
    for (let i = 0; i < toScrape.length; i++) {
        const item = toScrape[i];
        console.log(`[${i + 1}/${toScrape.length}] Scraping ${item.id}...`);

        try {
            await new Promise(r => setTimeout(r, DELAY_MS));
            const html = await fetchHtml(item.url);
            const groups = parseCatalogPage(html);

            if (groups.length > 0) {
                existingData[item.id] = groups;
                processedIds.add(item.id);
                successCount++;
                console.log(`  + Found ${groups.length} groups.`);
            } else {
                console.log(`  - No data found.`);
            }
        } catch (e) {
            console.error(`  ! Error: ${e.message}`);
        }
    }

    // 4. Save JSON
    fs.writeFileSync(JSON_PATH, JSON.stringify(existingData, null, 2));
    console.log(`Updated database with ${successCount} new programs.`);

    // 5. Update Missing CSV
    let stillMissing = [];
    if (fs.existsSync(MISSING_CSV_PATH)) {
        const missingContent = fs.readFileSync(MISSING_CSV_PATH, 'utf8');
        const mLines = missingContent.split('\n').filter(l => l.trim());
        // Header
        stillMissing.push(mLines[0]);

        for (let i = 1; i < mLines.length; i++) {
            const cols = parseCSVLine(mLines[i]);
            const pid = cols[0];

            // If we didn't successfully process it AND it's not in the database from before
            if (!existingData[pid] || existingData[pid].length === 0) {
                stillMissing.push(mLines[i]);
            }
        }
    }

    fs.writeFileSync(MISSING_CSV_PATH, stillMissing.join('\n'));
    console.log(`Updated missing CSV. ${stillMissing.length - 1} remain.`);
}

run();
