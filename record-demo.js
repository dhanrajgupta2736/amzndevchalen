// record-demo.js
// Automated Video Producer for Aura+ Alexa+ Hackathon Submission
// Produces a smooth, narrated 1080p demo video (.webm) strictly under 3 minutes

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function recordDemo() {
  const recordingsDir = path.join(__dirname, 'recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  console.log('🎬 Initializing Aura+ Automated Demo Video Recorder...');
  console.log('📐 Resolution: 1920x1080 Full HD');
  console.log('🌐 Target URL: http://localhost:3001');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Navigate to application
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Inject Custom Demo Overlay (Glowing Cursor + Subtitle/Narration Banner)
  await page.evaluate(() => {
    // 1. Add glowing animated cursor
    const cursor = document.createElement('div');
    cursor.id = 'demo-virtual-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 202, 230, 0.95) 0%, rgba(56, 189, 248, 0.4) 60%, transparent 100%);
      box-shadow: 0 0 16px rgba(0, 202, 230, 0.9), 0 0 30px rgba(0, 202, 230, 0.5);
      border: 2px solid #ffffff;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
      left: 960px;
      top: 540px;
    `;
    document.body.appendChild(cursor);

    // 2. Add Narration Subtitle Banner at bottom
    const banner = document.createElement('div');
    banner.id = 'demo-narration-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 1200px;
      background: rgba(10, 15, 29, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0, 202, 230, 0.4);
      border-radius: 16px;
      padding: 16px 28px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 202, 230, 0.15);
      z-index: 999990;
      display: flex;
      align-items: center;
      gap: 20px;
      font-family: 'Segoe UI', -apple-system, sans-serif;
      transition: all 0.4s ease;
    `;

    banner.innerHTML = `
      <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #00CAE6, #3b82f6); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; box-shadow: 0 0 16px rgba(0,202,230,0.4);">
        🎙️
      </div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #00CAE6; font-weight: 700;">
            AURA+ PRESENTATION WALKTHROUGH
          </span>
          <span id="demo-badge" style="font-size: 0.72rem; padding: 2px 10px; border-radius: 999px; background: rgba(0,202,230,0.15); color: #38bdf8; border: 1px solid rgba(0,202,230,0.3); font-weight: 600;">
            TRACK: ALEXA+
          </span>
        </div>
        <div id="demo-caption-text" style="color: #f8fafc; font-size: 1.05rem; line-height: 1.4; font-weight: 500;">
          Welcome to Aura+ : Autonomous Ambient Intelligence & Streamable MCP Orchestrator for Alexa+.
        </div>
      </div>
    `;
    document.body.appendChild(banner);
  });

  // Helper function to animate cursor and update caption
  async function showScene({ text, badge = 'TRACK: ALEXA+', targetSelector = null, waitMs = 4000, click = false }) {
    console.log(`\n📢 [SCENE]: ${text}`);

    // Update Narration Banner
    await page.evaluate(({ text, badge }) => {
      const capEl = document.getElementById('demo-caption-text');
      const badgeEl = document.getElementById('demo-badge');
      if (capEl) capEl.textContent = text;
      if (badgeEl) badgeEl.textContent = badge;
    }, { text, badge });

    // Move Cursor if selector provided
    if (targetSelector) {
      const el = await page.$(targetSelector);
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;

          // Animate cursor
          await page.evaluate(({ x, y }) => {
            const cursor = document.getElementById('demo-virtual-cursor');
            if (cursor) {
              cursor.style.left = `${x}px`;
              cursor.style.top = `${y}px`;
            }
          }, { x: targetX, y: targetY });

          await page.waitForTimeout(800);

          if (click) {
            // Pulse click effect
            await page.evaluate(() => {
              const cursor = document.getElementById('demo-virtual-cursor');
              if (cursor) {
                cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
                setTimeout(() => {
                  cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 200);
              }
            });

            await el.click();
            await page.waitForTimeout(500);
          }
        }
      }
    }

    await page.waitForTimeout(waitMs);
  }

  // =========================================================================
  // DEMO TIMELINE SCRIPT (Timed strictly under 3 minutes: ~100 seconds)
  // =========================================================================

  // 1. Hook & Intro
  await showScene({
    text: "Welcome to Aura+: An Autonomous Ambient Operating System and Self-Hosted Model Context Protocol (MCP) Server for Alexa+.",
    badge: "ALEXA+ TRACK",
    waitMs: 5000
  });

  await showScene({
    text: "Moving beyond rigid voice intents: Aura+ bridges Alexa+ ambient living with Amazon Bedrock Foundation Models and Ring multi-modal sentry cameras.",
    badge: "AWS BUILDER CHALLENGE",
    targetSelector: ".brand-logo",
    waitMs: 5000
  });

  // 2. Open Live MCP Protocol Inspector
  await showScene({
    text: "At the core is our Streamable HTTP MCP Server (November 2025 Specification) supporting bidirectional Server-Sent Events (SSE) and JSON-RPC 2.0.",
    badge: "MCP SPEC: 2025-11-25+",
    targetSelector: "button:has-text('MCP Inspector')",
    click: true,
    waitMs: 4000
  });

  await showScene({
    text: "Judges can inspect real-time tool registrations across 5 production tools: smart_home_control, ring_security_triage, ambient_energy_optimizer, bedrock_agent, and calendar_routine_sync.",
    badge: "MCP PROTOCOL DRAWER",
    targetSelector: ".drawer-content",
    waitMs: 6000
  });

  // Close Inspector Drawer
  await showScene({
    text: "Every tool execution produces transparent JSON-RPC 2.0 traces and state snapshots streamed directly to the Alexa+ Ambient Portal.",
    badge: "JSON-RPC 2.0 LOGS",
    targetSelector: "button:has-text('✕ Close')",
    click: true,
    waitMs: 3500
  });

  // 3. Scenario 1: Multi-Modal Ring Sentry Triage
  await showScene({
    text: "Scenario 1: Front Porch Delivery. Optical telemetry from Ring Doorbell Pro triggers the ring_security_triage MCP tool.",
    badge: "DEMO SCENARIO 1",
    targetSelector: "button:has-text('Front Porch Delivery')",
    click: true,
    waitMs: 6000
  });

  await showScene({
    text: "Amazon Bedrock vision model analyzes the live feed, verifies an Amazon Logistics courier with 98% AI confidence, and Alexa+ announces parcel safety.",
    badge: "RING OPTICAL SENTRY",
    targetSelector: ".ring-feed-wrapper",
    waitMs: 5500
  });

  // Floodlight Pulse interaction
  await showScene({
    text: "Autonomous actuation: Alexa+ coordinates exterior floodlights and confirms zero threat posture without false alarm fatigue.",
    badge: "MULTI-MODAL TRIAGE",
    targetSelector: "button:has-text('Floodlight Pulse')",
    click: true,
    waitMs: 4000
  });

  // 4. Scenario 2: Autonomous Eco-Pulse Peak Energy Shaving
  await showScene({
    text: "Scenario 2: Eco-Pulse Peak Shaving. Before utility peak pricing hours, Aura+ executes ambient_energy_optimizer to shave grid load.",
    badge: "DEMO SCENARIO 2",
    targetSelector: "button:has-text('Eco-Pulse Peak Shaving')",
    click: true,
    waitMs: 6000
  });

  await showScene({
    text: "Watch the real-time energy telemetry: Aura+ dynamically sheds 0.85 kW (-30%) by dimming secondary zones and buffering HVAC setpoints.",
    badge: "ECO-PULSE BALANCING",
    targetSelector: ".energy-stat-box",
    waitMs: 5500
  });

  // 5. Scenario 3: Contextual Ambient Control - Developer Focus Studio
  await showScene({
    text: "Scenario 3: Developer Focus Studio. Activating work mode primes lighting to 5000K crisp daylight, mutes doorbell chimes, and secures locks.",
    badge: "DEMO SCENARIO 3",
    targetSelector: "button:has-text('Developer Focus Studio')",
    click: true,
    waitMs: 6000
  });

  await showScene({
    text: "Multi-device coordination: Studio focus lighting engages at 100%, living room zones dim to 20%, and the Ultion smart deadbolt engages automatically.",
    badge: "AMBIENT ACTUATION",
    targetSelector: ".card-title:has-text('Ambient Actuation')",
    waitMs: 5500
  });

  // 6. Scenario 4: Perimeter Night Sentry
  await showScene({
    text: "Scenario 4: Perimeter Night Sentry. One voice command locks all deadbolts, sets eco-night thermostat buffer (68°F), and arms exterior motion sensors.",
    badge: "DEMO SCENARIO 4",
    targetSelector: "button:has-text('Perimeter Night Sentry')",
    click: true,
    waitMs: 6000
  });

  // 7. Re-open Inspector to show final tool execution trace
  await showScene({
    text: "Reviewing the live MCP Protocol Inspector: Notice the full timeline of JSON-RPC 2.0 requests, tool dispatches, and Bedrock inference latencies.",
    badge: "MCP INSPECTOR VERIFICATION",
    targetSelector: "button:has-text('MCP Inspector')",
    click: true,
    waitMs: 6000
  });

  // 8. Closing Outro Card
  await showScene({
    text: "Aura+ is 100% open-source (MIT), zero-config ready, and built for the Amazon Developer Hackathon: Build, Ship, Shape.",
    badge: "OPEN SOURCE & AWS BUILDER",
    targetSelector: "button:has-text('✕ Close')",
    click: true,
    waitMs: 4000
  });

  await showScene({
    text: "GitHub: https://github.com/dhanrajgupta2736/amzndevchalen — Thank you to Amazon and Devpost!",
    badge: "SUBMISSION READY",
    waitMs: 5000
  });

  // End recording
  console.log('🏁 Demo walkthrough complete. Finalizing video file...');
  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const rawVideoPath = await video.path();
    const finalVideoPath = path.join(recordingsDir, 'aura_plus_alexa_demo.webm');
    
    // Copy/rename to clean friendly name
    fs.copyFileSync(rawVideoPath, finalVideoPath);

    const stats = fs.statSync(finalVideoPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n======================================================');
    console.log('🎉 AUTOMATED DEMO VIDEO SUCCESSFULLY PRODUCED!');
    console.log(`📁 Video File: ${finalVideoPath}`);
    console.log(`📊 File Size:  ${sizeMb} MB`);
    console.log('⏱️ Duration:   ~1 minute 40 seconds (Strictly under 3:00 min)');
    console.log('======================================================\n');
  }
}

recordDemo().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
