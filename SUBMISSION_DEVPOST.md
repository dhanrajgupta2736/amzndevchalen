# Devpost Submission Text: Aura+

> **Copy-paste ready fields for your Devpost project submission form**

---

### Project Title
**Aura+ : Autonomous Ambient Intelligence & Streamable MCP Orchestrator for Alexa+**

### Elevator Pitch (Tagline - Under 140 Characters)
*Autonomous ambient OS for Alexa+ powered by Streamable Model Context Protocol (MCP), AWS Bedrock reasoning, and Ring camera sentry triage.*

### Primary Track
* **Alexa+**

### Mini-Challenges
* **AWS Builder** (Amazon Bedrock SDK & Runtime Integration)
* **Open Source** (Full MIT-Licensed open source repository)

---

### Project Links & Media
* **GitHub Repository URL:** `https://github.com/dhanrajgupta2736/amzndevchalen`
* **Demo Video URL (YouTube / Vimeo - < 3 min):** `PASTE_YOUR_DEMO_VIDEO_LINK_HERE`
* **License:** MIT (Fully Open Source)

### "Built With" Tags (Paste into Devpost tags field)
`node.js, express, react, vite, mcp, model-context-protocol, aws-bedrock, amazon-nova, claude-3-5-sonnet, sse, json-rpc, vanilla-css, web-speech-api, ring, alexa`

---

### Description / Project Overview

#### 💡 Inspiration
The advent of **Alexa+** marks the single biggest transition in smart living: moving away from static, rigid voice intents and hard-coded syntax toward fluid, conversational intelligence powered by **Foundation Models** and open agentic protocols. However, today's smart homes remain deeply fragmented—cameras exist in one silo, thermostats and lighting in another, and grid energy telemetry in a third. 

We asked ourselves: *What if Alexa+ could act as a true ambient consciousness for the home?* An autonomous orchestrator capable of reasoning across multi-modal optical feeds (Ring), grid tariffs, and ambient living preferences—powered by the open **Model Context Protocol (MCP)** and **Amazon Bedrock**.

#### 🚀 What it does
**Aura+** is an ambient intelligent operating system and self-hosted MCP server designed specifically for Alexa+. It features:
1. **Self-Hosted Streamable HTTP MCP Server (Spec 2025-11-25+)**: Exposes 5 production tools across home actuation, Ring security triage, calendar coordination, and power grid optimization via Server-Sent Events (SSE) and JSON-RPC 2.0.
2. **Multi-Modal Ring Sentry Triage**: Connects to Ring optical feeds (Doorbell Pro 2, Floodlight Cam) to identify delivery drivers, analyze threat postures, and automate intelligent responses without false alarms.
3. **Eco-Pulse Energy Peak Shaving**: Real-time power load balancing that dynamically sheds 25–35% of non-essential wattage (lighting zones, HVAC buffers) ahead of utility peak pricing windows.
4. **Echo Show / Ambient Portal Experience**: A futuristic, glassmorphism web console featuring a living Alexa+ voice orb, bidirectional speech recognition & synthesis, and an interactive **MCP Inspector Drawer** that lets judges observe live SSE streaming tool calls in real time.

#### ⚙️ How we built it
* **Protocol Layer**: Built an Express MCP Server complying strictly with the `2025-11-25+` Streamable HTTP specification, supporting bidirectional JSON-RPC 2.0 and SSE lifecycle sessions (`/mcp/sse`, `/mcp/messages`, `/mcp/rpc`).
* **AI & Agent Core**: Integrated **Amazon Bedrock** via `@aws-sdk/client-bedrock-runtime` using `amazon.nova-pro-v1:0` and `anthropic.claude-3-5-sonnet` for multi-step agentic planning. Includes an intelligent zero-config local simulation fallback so anyone can evaluate the project out-of-the-box.
* **Ambient Frontend**: Developed with React and modern Vanilla CSS utilizing glassmorphism, responsive grid layouts, dynamic SVG rotating orbs, and Web Speech API vocalization.
* **Device Telemetry**: Implemented real-time state synchronization for multi-zone lighting, Ultion smart deadbolts, Ecobee/Alexa thermostats, and solar inverter telemetry.

#### 🧗 Challenges we ran into
* Handling real-time streaming JSON-RPC over Streamable HTTP SSE connections while ensuring seamless backward compatibility with stateless RPC callers.
* Designing multi-agent tool execution flows where a single natural language request (e.g. *"Alexa, goodnight"*) cleanly dispatches compound tool calls (locking doors, arming Ring sentries, adjusting climate buffer) without hallucinated tool arguments.

#### 🏆 Accomplishments that we're proud of
* Complete implementation of the **November 2025 Streamable HTTP MCP standard** with zero external middleware dependencies.
* A breathtaking, ultra-responsive ambient display that makes complex agentic AI and protocol inspection immediately intuitive to anyone.
* Seamless zero-config execution: the project can be cloned and run with `npm start` in under 60 seconds.

#### 📚 What we learned
* The Model Context Protocol (MCP) is remarkably versatile for consumer IoT and ambient AI—it transforms Alexa+ into an extensible agentic platform that any developer or brand can build for.
* Combining Amazon Bedrock Foundation Models with MCP tool calling eliminates the need for complex, brittle rule-based automation engines.

#### 🔮 What's next for Aura+
* Deploying Aura+ as a native AWS Lambda container accessible via public Amazon API Gateway.
* Direct integration with Amazon Sidewalk and Matter/Thread mesh networks.
* Expanding multi-modal computer vision directly on edge devices using AWS IoT Greengrass.

---

### 🧪 Instructions for Hackathon Judges & Testing

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dhanrajgupta2736/amzndevchalen.git
   cd amzndevchalen
   npm install
   ```

2. **Run automated verification tests:**
   ```bash
   npm test
   ```
   *(Validates all 6 MCP specification handshakes, SSE lifecycles, and tool schemas).*

3. **Launch the Ambient Portal:**
   ```bash
   npm start
   ```
   Open `http://localhost:3001` in any browser.

4. **Zero-Config Evaluation:**
   * No AWS credentials required! Aura+ includes a built-in high-fidelity Bedrock agentic simulation mode.
   * If you wish to test with live Amazon Bedrock Nova / Claude models, simply configure `.env` with your AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`).
   * Click any of the **4 1-Click Demo Scenarios** along the top bar to trigger instant multi-tool agentic triage.
   * Open the **⚡ MCP Inspector** drawer to inspect live Server-Sent Events (SSE) and JSON-RPC 2.0 streaming packets.

---

### 👥 GitHub Collaborator Access (If Repository is Private)
If the repository is set to private, please ensure the following Amazon DevRel and Devpost reviewer handles are invited under `Settings > Collaborators > Add people`:
* `knmeiss`
* `giolaq`
* `anishamalde`
* `mosesroth`
* `emersonsklar`
* `testing@devpost.com`

