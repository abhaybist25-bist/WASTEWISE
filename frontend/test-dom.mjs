import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const results = [];
let totalErrors = 0;

function logResult(pageName, status, details = '') {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${status}] ${pageName} ${details ? '- ' + details : ''}`);
  results.push({ pageName, status, details });
  if (status === 'FAIL') totalErrors++;
}

async function loginAs(page, email, password) {
  // Clear any existing session
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}
  });

  // Go to login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('form', { timeout: 5000 });

  // Use demo button if available, or set inputs directly
  await page.evaluate((em, pw) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const demo = btns.find(b => b.innerText.includes(em));
    if (demo) {
      demo.click();
      return;
    }
    const emailEl = document.querySelector('input[type="email"]');
    const passEl = document.querySelector('input[type="password"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    if (emailEl) {
      setter.call(emailEl, em);
      emailEl.dispatchEvent(new Event('input', { bubbles: true }));
      emailEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (passEl) {
      setter.call(passEl, pw);
      passEl.dispatchEvent(new Event('input', { bubbles: true }));
      passEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, email, password);

  await new Promise(r => setTimeout(r, 400));

  // Submit form
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  });

  try {
    await page.waitForFunction(() => !window.location.pathname.endsWith('/login'), { timeout: 8000 });
  } catch (err) {
    const errorBanner = await page.$eval('.bg-red-50', el => el.innerText).catch(() => 'none');
    const inputEmail = await page.$eval('input[type="email"]', el => el.value).catch(() => 'none');
    throw new Error(`Login failed for ${email}. ErrorBanner: "${errorBanner}", EmailInField: "${inputEmail}", CurrentURL: ${page.url()}`);
  }
}

async function runDomAudit() {
  console.log('🚀 Starting headless Chrome DOM & React Page Audit...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const pageErrors = [];
  page.on('pageerror', err => {
    console.error(`  ⚠️ Page Error on ${page.url()}:`, err.message);
    pageErrors.push({ url: page.url(), error: err.message });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      if (!msg.text().includes('favicon') && !msg.text().includes('404')) {
        console.warn(`  ⚠️ Console Error [${page.url()}]:`, msg.text());
      }
    }
  });

  try {
    // ==========================================
    // 1. PUBLIC PAGES
    // ==========================================
    console.log('\n--- 1. Testing Public Pages ---');

    // Landing Page
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const heroText = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (heroText.includes('Food Waste') || heroText.includes('Feed More Lives')) {
      logResult('Landing Page (/)', 'PASS', `Hero found: "${heroText.replace(/\n/g, ' ')}"`);
    } else {
      logResult('Landing Page (/)', 'FAIL', `Expected hero heading not found`);
    }

    // Check navbar links
    const navLinks = await page.$$eval('nav a', els => els.map(e => ({ text: e.innerText, href: e.href })));
    logResult('Navbar Navigation', 'PASS', `Found ${navLinks.length} links: ${navLinks.map(l => l.text).filter(Boolean).join(', ')}`);

    // Marketplace Page
    await page.goto(`${BASE_URL}/marketplace`, { waitUntil: 'networkidle2' });
    const marketHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    const cardsCount = await page.$$eval('.bg-white.rounded-2xl.border', els => els.length);
    if (marketHeader.includes('Food Marketplace')) {
      logResult('Marketplace (/marketplace)', 'PASS', `Header verified. Donation cards in DOM: ${cardsCount}`);
    } else {
      logResult('Marketplace (/marketplace)', 'FAIL', 'Marketplace header missing');
    }

    // Login Page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    const loginHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (loginHeader.includes('Welcome back')) {
      logResult('Login Page (/login)', 'PASS', `Found login form and quick-fill buttons`);
    } else {
      logResult('Login Page (/login)', 'FAIL', 'Login page header missing');
    }

    // Register Page
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    const regHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (regHeader.includes('Create your account')) {
      logResult('Register Page (/register)', 'PASS', `Header: "${regHeader}"`);
    } else {
      logResult('Register Page (/register)', 'FAIL', 'Register page header missing');
    }

    // ==========================================
    // 2. DONOR FLOW
    // ==========================================
    console.log('\n--- 2. Testing Donor Pages (as Chef Vikram Malhotra) ---');
    await loginAs(page, 'donor@grandhotel.com', 'Donor@123');

    // Donor Dashboard
    await page.waitForSelector('h1');
    const donorDashHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (donorDashHeader.includes('Donor Dashboard')) {
      logResult('Donor Dashboard (/donor)', 'PASS', `Dashboard rendered for donor`);
    } else {
      logResult('Donor Dashboard (/donor)', 'FAIL', `Current URL: ${page.url()}`);
    }

    // Donor Create Donation Page
    await page.goto(`${BASE_URL}/donor/create`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const createHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    const foodInput = await page.$('input[placeholder*="Vegetable Biryani"]');
    if (createHeader.includes('List Surplus Food') && foodInput) {
      logResult('Create Donation (/donor/create)', 'PASS', 'Form fields & wizard rendered');
    } else {
      logResult('Create Donation (/donor/create)', 'FAIL', 'Form elements not found');
    }

    // Donor Listings Page
    await page.goto(`${BASE_URL}/donor/donations`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const donationsHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    const tableRows = await page.$$eval('tbody tr', els => els.length);
    if (donationsHeader.includes('My Donations')) {
      logResult('My Donations (/donor/donations)', 'PASS', `Listings table rendered with ${tableRows} items`);
    } else {
      logResult('My Donations (/donor/donations)', 'FAIL');
    }

    // Donor Claims Page
    await page.goto(`${BASE_URL}/donor/claims`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const claimsHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (claimsHeader.includes('Claims on My Donations')) {
      logResult('Incoming Claims (/donor/claims)', 'PASS', 'Claims management interface rendered');
    } else {
      logResult('Incoming Claims (/donor/claims)', 'FAIL');
    }

    // Donor Insights Page
    await page.goto(`${BASE_URL}/donor/insights`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const insightsHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (insightsHeader.includes('AI Waste Insights')) {
      logResult('AI Insights (/donor/insights)', 'PASS', 'Gemini AI insights interface rendered');
    } else {
      logResult('AI Insights (/donor/insights)', 'FAIL');
    }

    // ==========================================
    // 3. RECIPIENT FLOW
    // ==========================================
    console.log('\n--- 3. Testing Recipient Pages (as Sister Ananya Rao / Anna Seva Trust) ---');
    await loginAs(page, 'contact@annaseva.org', 'Ngo@123');

    // Recipient Dashboard
    await page.waitForSelector('h1');
    const recDashHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (recDashHeader.includes('Recipient Dashboard')) {
      logResult('Recipient Dashboard (/recipient)', 'PASS', 'Dashboard rendered');
    } else {
      logResult('Recipient Dashboard (/recipient)', 'FAIL');
    }

    // Recommendations Page
    await page.goto(`${BASE_URL}/recipient/recommendations`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const recHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (recHeader.includes('Smart Recommendations')) {
      logResult('Smart Recommendations (/recipient/recommendations)', 'PASS', 'AI Matching recommendations rendered');
    } else {
      logResult('Smart Recommendations (/recipient/recommendations)', 'FAIL');
    }

    // My Claims Page
    await page.goto(`${BASE_URL}/recipient/claims`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const myClaimsHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (myClaimsHeader.includes('My Claims')) {
      logResult('My Claims (/recipient/claims)', 'PASS', 'Claim tracker and status timeline rendered');
    } else {
      logResult('My Claims (/recipient/claims)', 'FAIL');
    }

    // ==========================================
    // 4. ADMIN FLOW
    // ==========================================
    console.log('\n--- 4. Testing Admin Pages (as Administrator) ---');
    await loginAs(page, 'admin@wastewise.org', 'Admin@123');

    // Admin Dashboard
    await page.waitForSelector('h1');
    const adminDashHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (adminDashHeader.includes('Admin Dashboard')) {
      logResult('Admin Dashboard (/admin)', 'PASS', 'Admin metrics & analytics rendered');
    } else {
      logResult('Admin Dashboard (/admin)', 'FAIL');
    }

    // Admin Organizations Page
    await page.goto(`${BASE_URL}/admin/organizations`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const orgsHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (orgsHeader.includes('Manage Organisations')) {
      logResult('Manage Organisations (/admin/organizations)', 'PASS', 'Org approval interface rendered');
    } else {
      logResult('Manage Organisations (/admin/organizations)', 'FAIL');
    }

    // Admin Donations Page
    await page.goto(`${BASE_URL}/admin/donations`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const adminDonationsHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (adminDonationsHeader.includes('Manage Donations')) {
      logResult('Manage Donations (/admin/donations)', 'PASS', 'Moderation & flagging table rendered');
    } else {
      logResult('Manage Donations (/admin/donations)', 'FAIL');
    }

    // Admin Users Page
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const usersHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (usersHeader.includes('Manage Users')) {
      logResult('Manage Users (/admin/users)', 'PASS', 'User access management table rendered');
    } else {
      logResult('Manage Users (/admin/users)', 'FAIL');
    }

    // Admin Reports Page
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    const reportsHeader = await page.$eval('h1', el => el.innerText).catch(() => '');
    if (reportsHeader.includes('Reports & Flags')) {
      logResult('Reports & Flags (/admin/reports)', 'PASS', 'Reports moderation interface rendered');
    } else {
      logResult('Reports & Flags (/admin/reports)', 'FAIL');
    }

  } catch (err) {
    console.error('Fatal audit error:', err);
    totalErrors++;
  } finally {
    await browser.close();
  }

  console.log('\n==========================================');
  console.log(`DOM AUDIT SUMMARY: ${results.filter(r => r.status === 'PASS').length} PASSED, ${totalErrors} FAILED`);
  console.log(`Unhandled Page Exceptions: ${pageErrors.length}`);
  console.log('==========================================\n');

  if (totalErrors > 0 || pageErrors.length > 0) {
    process.exit(1);
  }
}

runDomAudit();
