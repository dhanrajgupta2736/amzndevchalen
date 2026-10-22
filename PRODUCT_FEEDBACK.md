# Product Feedback: Amazon Developer Hackathon

> **Required submission answer regarding tools, APIs, SDKs, and AWS services used**

---

## 1. Amazon Bedrock Runtime & AWS SDK (`@aws-sdk/client-bedrock-runtime`)

### What we used it for:
We utilized Amazon Bedrock (`amazon.nova-pro-v1:0` and `anthropic.claude-3-5-sonnet-20241022-v2:0`) via the `@aws-sdk/client-bedrock-runtime` JavaScript SDK to power the conversational reasoning engine and multi-step tool-planning pipeline for the Aura+ agent.

### What worked well:
* **The Unified `ConverseCommand` API**: The `converse` abstraction across different foundation models (Amazon Nova vs. Anthropic Claude) is a massive step forward. Switching between model IDs without having to change input formatting or payload structure saved hours of integration effort.
* **Inference Speed & Low Latency**: Amazon Nova Pro demonstrated exceptional time-to-first-token latency, making it feel viable for real-time ambient voice responses where sub-second latency is critical.
* **Token Usage Transparency**: The usage response (`inputTokens`, `outputTokens`) was immediately accessible in the response payload for auditing and telemetry.

### What needs work:
* **Local Emulator / Mock Utilities**: Testing Bedrock locally without active AWS credentials or during network timeouts requires developers to manually construct fallback handlers. An official AWS SDK "dry run" or local agent simulator would drastically accelerate developer onboarding.
* **Streaming Converse Typings**: While streaming inference is supported, integrating SSE-streamed JSON-RPC chunks across the MCP layer required manual buffer assembly.

### Onboarding Experience:
* **Rating:** 8.5 / 10. The AWS SDK v3 modular architecture (`@aws-sdk/client-bedrock-runtime`) is lightweight and easy to install. Documentation on AWS for the new Converse API was clean and well-structured.

### Would we build with it again?
* **Yes, absolutely.** The flexibility to swap between high-capability frontier models (Claude 3.5) and cost-efficient high-speed models (Nova Lite/Pro) makes Amazon Bedrock the premier platform for production-scale ambient agents.

---

## 2. Model Context Protocol (MCP) Streamable HTTP Specification (`2025-11-25+`)

### What we used it for:
We used the MCP Streamable HTTP specification to build a self-hosted MCP server that exposes smart environment actuation (`smart_home_control`), Ring optical sentry triage (`ring_security_triage`), grid energy shedding (`ambient_energy_optimizer`), and calendar coordination (`calendar_routine_sync`) to Alexa+.

### What worked well:
* **Standardized JSON Schema Tool Registration**: Defining tool schemas using standard JSON Schema syntax allows LLMs to reliably generate correct argument structures with virtually zero schema hallucination.
* **Bidirectional SSE Lifecycle**: Server-Sent Events coupled with HTTP POST backchannel creates a clean, lightweight transport that operates smoothly in browser-based and serverless environments without the heavyweight overhead of full WebSockets.
* **Separation of Concerns**: Resources, Prompts, and Tools are cleanly decoupled in the specification.

### What needs work:
* **Session Reconnection Protocol**: In the 2025-11-25 specification, guidance around recovering missed SSE events during transient client drops could be more formally defined (e.g. standardizing a `Last-Event-ID` replay buffer).
* **Reference Test Suites**: Providing a standardized CLI test harness that executes validation checks against a self-hosted MCP endpoint would help developers immediately verify spec compliance before deployment.

### Onboarding Experience:
* **Rating:** 9 / 10. Clear specification and elegant design. It is obvious why Amazon has embraced MCP as the open standard powering Alexa+.

### Would we build with it again?
* **Yes.** MCP is rapidly becoming the universal standard for agentic tool integration.

---

## 3. Ring API & Smart Home Simulators

### What we used it for:
We simulated Ring Video Doorbell Pro 2 optical motion events and telemetry data (courier approach detection, package verification, threat classification, and floodlight deterrent triggers) coupled with ambient smart home devices (Ultion smart deadbolts, multi-zone lighting, and thermostats).

### What worked well:
* **Multi-Modal Vision Potential**: Combining video camera telemetry with LLM vision reasoning enables high-accuracy triage that eliminates annoying false alarms.
* **Simulated Device State Feedback**: The ability to inspect and actuate devices within a unified state store made end-to-end prototyping seamless.

### What needs work:
* **Public Ring Developer Sandbox**: While Ring hardware is ubiquitous, an official cloud sandbox/mock environment with pre-recorded motion streams for hackathon participants would empower even more developers to build Ring-connected apps without requiring a physical camera on hand.

### Would we build with it again?
* **Yes.** Ambient security and caretaking are natural killer applications for voice assistants.
