# Friction Log Entries (Amazon Developer Hackathon)

> **Submission for up to 10% Judging Bonus**  
> Formatted according to the official criteria:  
> *Task Attempted | Steps Taken | Expected vs. Actual | Severity Rating | Workaround Used | Actionable Suggestion*

---

### Friction Entry #1: Streamable HTTP MCP Session Lifecycle & Disconnection Handling
* **Task Attempted:** Implementing the official `2025-11-25+` MCP Streamable HTTP transport with Server-Sent Events (`/mcp/sse`) and JSON-RPC message posting (`/mcp/messages?sessionId=...`).
* **Steps Taken:**
  1. Configured an Express route for `GET /mcp/sse` emitting `text/event-stream` headers.
  2. Generated a unique `sessionId` and sent the initial `event: endpoint` handshake to the client.
  3. Attempted client reconnections after network jitter.
* **Expected vs. What Actually Happened:**
  * *Expected:* The MCP specification would provide a standard header or query parameter for resuming an interrupted SSE session without re-registering tools.
  * *Actual:* Disconnected clients often caused orphaned session handles on the server, resulting in missed JSON-RPC response delivery if the client refreshed before the POST handler responded.
* **Severity Rating:** **Medium (P2)**
* **Workaround Used:** Implemented an in-memory session registry with active response object maps and automatic stale session cleanup on socket `'close'` events, accompanied by a direct stateless fallback endpoint (`/mcp/rpc`) for rapid tool testing.
* **Actionable Suggestion:** Include a formal session resumption token and message replay window specification in the next revision of the MCP Streamable HTTP guidelines.

---

### Friction Entry #2: Express v5 Wildcard Catch-All Routing Conflict with Path-to-Regexp
* **Task Attempted:** Serving both the API routes (`/api/*`, `/mcp/*`) and the built single-page application (`index.html`) on a single port for frictionless 1-command deployment (`npm start`).
* **Steps Taken:**
  1. Installed `express: ^5.3.0`.
  2. Added a standard catch-all fallback route `app.get('*', ...)`.
  3. Started the server on Node.js v24.
* **Expected vs. What Actually Happened:**
  * *Expected:* Standard wildcard routing would route unmatched requests to the Vite SPA bundle.
  * *Actual:* Express 5 crashed on startup with `PathError [TypeError]: Missing parameter name at index 1: *; visit https://git.new/pathToRegexpError for info` due to breaking changes in `path-to-regexp` v8.
* **Severity Rating:** **High (P1 - Breaking Startup Crash)**
* **Workaround Used:** Replaced `app.get('*', ...)` with an Express 5 compatible middleware `app.use((req, res, next) => { ... })` checking `req.path.startsWith('/api')` before serving `index.html`.
* **Actionable Suggestion:** Update documentation and starter templates to illustrate Express 5 routing patterns or provide an official Amazon-maintained starter repo for Node.js MCP servers.

---

### Friction Entry #3: AWS Bedrock SDK Local Testing Without AWS Credentials
* **Task Attempted:** Developing and debugging multi-step Bedrock agent tool planning while ensuring team members and hackathon judges can immediately clone and run the project without requiring active AWS account credentials or incurring live API costs.
* **Steps Taken:**
  1. Initialized `@aws-sdk/client-bedrock-runtime` with `BedrockRuntimeClient`.
  2. Attempted to run local test suites in an environment with unconfigured AWS credentials.
* **Expected vs. What Actually Happened:**
  * *Expected:* An offline mock or validation mode in the SDK to simulate realistic model responses for tool calling pipelines.
  * *Actual:* The SDK immediately threw credential resolution exceptions (`CredentialsProviderError`), crashing unconfigured runs.
* **Severity Rating:** **Medium (P2)**
* **Workaround Used:** Built a dynamic `BedrockAgentBridge` wrapper that inspects environment variables; if credentials are valid, it executes live `ConverseCommand` against Amazon Nova / Claude 3.5; if missing, it transparently transitions into a high-fidelity local agent reasoning simulator with simulated token metrics and thought chains.
* **Actionable Suggestion:** Release an official `@aws-sdk/client-bedrock-mock` or `--offline` flag in the AWS SDK to let developers unit test agentic workflows with pre-recorded or deterministic mock responses.

---

### Friction Entry #4: Cross-Device State Sync Between MCP Tool Execution and Ambient UI
* **Task Attempted:** Reflecting real-time changes in device states (e.g. smart light colors, thermostat setpoints, Ring camera threat levels) across both the MCP server and the ambient display without manual page refreshes.
* **Steps Taken:**
  1. Triggered `smart_home_control` tool execution via natural speech.
  2. Expected the web portal's ambient display to update immediately.
* **Expected vs. What Actually Happened:**
  * *Expected:* In an ideal setup, MCP tool calls would automatically broadcast event updates to subscribed client listeners over SSE.
  * *Actual:* While MCP has resource subscriptions in the spec, implementation details across frontend web apps require custom SSE subscriber bridges.
* **Severity Rating:** **Low (P3)**
* **Workaround Used:** Implemented an in-memory centralized `StateStore` that updates synchronously during tool execution, returns snapshot state in response payloads, and broadcasts updates through both SSE and a polling fallback.
* **Actionable Suggestion:** Provide an out-of-the-box React hook (`useMcpTool`, `useMcpResource`) in an Amazon-curated Alexa+ client SDK.

---

### Friction Entry #5: Ring Optical Motion Telemetry in Headless Hackathon Environments
* **Task Attempted:** Integrating Ring Doorbell and Floodlight optical motion feeds into an AI vision triage pipeline without requiring physical hardware at the hackathon workstation.
* **Steps Taken:**
  1. Reviewed Ring developer documentation for simulated device feeds.
  2. Attempted to connect to a cloud-hosted Ring sandbox.
* **Expected vs. What Actually Happened:**
  * *Expected:* An official Ring Developer Sandbox API with simulated doorbell presses, motion vectors, and test video clips.
  * *Actual:* No official interactive public sandbox was available without active physical devices, requiring developers to synthesize motion telemetry and camera snapshots.
* **Severity Rating:** **Medium (P2)**
* **Workaround Used:** Built a realistic Ring optical telemetry simulator with live video streams, verified delivery courier bounding boxes, threat confidence calculations, and deterrent floodlight actuators.
* **Actionable Suggestion:** Provide a cloud-hosted "Ring Virtual Home Sandbox" accessible via Amazon Developer Portal with pre-recorded motion scenarios for rapid hackathon prototyping.
