# 🎥 3-Minute Demo Video Script & Walkthrough

> **Total Target Duration:** 2 minutes 45 seconds (Strictly under the 3:00 minute limit)  
> **Platform:** YouTube (Public or Unlisted) or Vimeo  
> **Audio:** English, clear and confident pace  
> **Screen Recording URL:** `http://localhost:3001` (Make sure `npm start` is running!)

---

## ⏱️ Video Timeline & Screen Walkthrough

### 0:00 - 0:25 | The Hook & Introduction
* **On Screen:** Full-screen browser open at `http://localhost:3001`. Show the glowing Alexa+ cyan orb and the status badges at the top (`MCP SPEC: 2025-11-25+`, `AWS BEDROCK AGENT`, `RING SENTRY: ONLINE`).
* **Voiceover:**
  > *"Hi everyone! This is **Aura+**, an autonomous ambient intelligence operating system and self-hosted Model Context Protocol server built for the **Amazon Developer Hackathon: Build, Ship, Shape** in the **Alexa+** track."*
  > 
  > *"With the launch of Alexa+, smart homes are transitioning from rigid voice commands to fluid, autonomous agentic systems. We built Aura+ to connect Amazon Bedrock Foundation Models, Ring optical security sentries, and smart ambient living using the open Model Context Protocol standard."*

---

### 0:25 - 0:55 | The Architecture: Streamable HTTP MCP Server
* **On Screen:** Click the **"⚡ MCP Inspector"** button in the top right to slide open the live protocol drawer.
* **Voiceover:**
  > *"At the core of Aura+ is a specification-compliant **MCP Server** implementing the **November 2025 Streamable HTTP standard** over Server-Sent Events and JSON-RPC 2.0."*
  > 
  > *(Point cursor at the JSON-RPC logs in the drawer)*
  > *"Here in our live MCP Inspector drawer, you can see real-time tool registrations, SSE stream lifecycles, and bidirectional JSON-RPC messages across 5 production tools: Smart Home Actuation, Ring Security Triage, Grid Energy Optimization, Calendar Synchronization, and Bedrock Agent Reasoning."*
* **On Screen:** Click "✕ Close" on the inspector drawer.

---

### 0:55 - 1:35 | Demo Scenario 1: Multi-Modal Ring Sentry Triage
* **On Screen:** Click the **"📦 Front Porch Delivery (Ring Triage)"** chip in the 1-Click Demo Scenarios bar.
* **Observe:** The Alexa+ voice orb pulses into speaking mode with live audio waves, the speech box updates with spoken confirmation, and the Ring camera feed shows the `COURIER 98%` bounding box.
* **Voiceover:**
  > *"Let's test an ambient event. When a delivery courier approaches the porch, Ring optical motion telemetry triggers our `ring_security_triage` MCP tool.*
  > 
  > *Amazon Bedrock analyzes the multi-modal camera feed, confirms an Amazon Logistics courier with 98% AI confidence, announces the parcel verification through Alexa+, and maintains the exterior perimeter without annoying false alarms."*
* **On Screen:** Click the **"💡 Floodlight Pulse"** button under the camera feed to show direct sensor interaction.

---

### 1:35 - 2:05 | Demo Scenario 2: Autonomous Eco-Pulse Energy Peak Shaving
* **On Screen:** Direct attention to the right-hand column: **"Eco-Pulse & Routine Sync"**. Click **"🌱 Eco-Pulse Peak Shaving (-30% Load)"** or the green button **"🌿 Shave Peak Load (-30%)"**.
* **Observe:** The energy meter reading drops (e.g. from 2.85 kW to 2.00 kW) and the visual bar turns green.
* **Voiceover:**
  > *"Next is autonomous grid load management. Before utility peak pricing hours, Aura+ automatically executes our `ambient_energy_optimizer` tool.*
  > 
  > *Watch the real-time power meter: it dynamically sheds over 0.85 kilowatts by dimming non-essential lighting zones by 35% and buffering the smart thermostat setpoint by 1.5 degrees, saving homeowners money autonomously."*

---

### 2:05 - 2:30 | Demo Scenario 3: Natural Speech & Developer Focus Mode
* **On Screen:** Click the glowing Alexa+ Orb in the center, or click the **"💻 Developer Focus Studio"** chip.
* **Observe:** Studio Focus Bar lighting turns active at 5000K daylight, living room dims, chimes mute.
* **Voiceover:**
  > *"Aura+ also acts on natural language voice queries. Clicking the ambient orb or typing into the command bar dispatches our Bedrock reasoning agent.*
  > 
  > *Activating 'Developer Focus Studio' tunes the workspace lights to 5000K crisp daylight, mutes doorbell chimes, and syncs our hackathon deadline from the calendar agenda."*

---

### 2:30 - 2:45 | Conclusion & Submission Wrap-Up
* **On Screen:** Re-open the **⚡ MCP Inspector** drawer briefly showing the latest executed tools (`smart_home_control`, `ambient_energy_optimizer`).
* **Voiceover:**
  > *"Aura+ is fully open-source under the MIT license, integrates Amazon Bedrock with Claude 3.5 Sonnet and Amazon Nova, and showcases the incredible future of Alexa+ and the Model Context Protocol.*
  > 
  > *Thank you to Amazon and Devpost for this amazing hackathon!"*

---

## 💡 Quick Tips for Recording:
1. Use **OBS Studio** or Windows Game Bar (`Win + G` / Snipping Tool video recorder) to record your browser screen at 1080p.
2. Keep audio on so the browser's speech synthesis or your voice is heard clearly.
3. Upload to YouTube as **"Unlisted"** or **"Public"** and copy the link into your Devpost submission form.
