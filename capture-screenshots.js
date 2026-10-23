// capture-screenshots.js
// Captures crisp, high-resolution 1080p project screenshots for Devpost Image Gallery

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureGallery() {
  const galleryDir = path.join(__dirname, 'image_gallery');
  if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
  }

  console.log('📸 Launching browser to capture project screenshots...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5 // Crisp retina quality
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Overview Dashboard
  console.log('Capturing: 1_aura_plus_ambient_dashboard.png');
  await page.screenshot({
    path: path.join(galleryDir, '1_aura_plus_ambient_dashboard.png'),
    fullPage: false
  });

  // 2. Scenario 1: Ring Sentry Vision Triage
  console.log('Capturing: 2_ring_sentry_optical_triage.png');
  const scenario1 = await page.$("button:has-text('Front Porch Delivery')");
  if (scenario1) await scenario1.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(galleryDir, '2_ring_sentry_optical_triage.png'),
    fullPage: false
  });

  // 3. Scenario 2: Eco-Pulse Peak Energy Shaving
  console.log('Capturing: 3_eco_pulse_energy_peak_shaving.png');
  const scenario2 = await page.$("button:has-text('Eco-Pulse Peak Shaving')");
  if (scenario2) await scenario2.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(galleryDir, '3_eco_pulse_energy_peak_shaving.png'),
    fullPage: false
  });

  // 4. Scenario 3: Developer Focus Studio
  console.log('Capturing: 4_developer_focus_studio_lighting.png');
  const scenario3 = await page.$("button:has-text('Developer Focus Studio')");
  if (scenario3) await scenario3.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(galleryDir, '4_developer_focus_studio_lighting.png'),
    fullPage: false
  });

  // 5. Live MCP Inspector Drawer
  console.log('Capturing: 5_mcp_streamable_protocol_inspector.png');
  const inspectorBtn = await page.$("button:has-text('MCP Inspector')");
  if (inspectorBtn) await inspectorBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(galleryDir, '5_mcp_streamable_protocol_inspector.png'),
    fullPage: false
  });

  // 6. Perimeter Night Sentry (Close drawer and click night lockdown)
  console.log('Capturing: 6_perimeter_night_sentry_lockdown.png');
  const closeBtn = await page.$("button:has-text('✕ Close')");
  if (closeBtn) await closeBtn.click();
  await page.waitForTimeout(600);
  const scenario4 = await page.$("button:has-text('Perimeter Night Sentry')");
  if (scenario4) await scenario4.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(galleryDir, '6_perimeter_night_sentry_lockdown.png'),
    fullPage: false
  });

  await browser.close();
  console.log('\n✅ All 6 project gallery screenshots captured successfully in /image_gallery!');
}

captureGallery().catch(err => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
