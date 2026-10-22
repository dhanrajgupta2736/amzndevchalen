# Feature Requests: Amazon Developer Team

> **Optional Submission Field from Hackathon Guidelines:**  
> *What you'd want built, why it matters, and how urgent it is (critical / important / nice-to-have).*

---

### 1. Official Amazon Bedrock Local Agent Sandbox / Offline Mode
* **What we'd want built:** An offline emulation mode or mock package in the `@aws-sdk/client-bedrock-runtime` (or via the AWS CLI) that lets developers simulate structured tool-calling responses without needing live AWS credentials or billing setup during initial local prototyping.
* **Why it matters:** Lowering friction for early-stage prototyping and student/hackathon teams. It allows developers to test MCP servers and Agentic workflows offline before linking production IAM keys.
* **Urgency:** **Important**

---

### 2. Standardized Alexa+ Client MCP Test Harness CLI
* **What we'd want built:** An official CLI tool (e.g. `npx @amazon/alexa-mcp-verify http://localhost:3001/mcp/sse`) that connects to a developer's self-hosted MCP server over Streamable HTTP and executes automated validation checks for spec compliance, schema validity, and tool latency.
* **Why it matters:** Ensures developers can verify that their MCP servers will work flawlessly with the real Alexa+ runtime before submitting for skill/agent review.
* **Urgency:** **Important**

---

### 3. Native Matter & Amazon Sidewalk MCP Connector Bridges
* **What we'd want built:** First-party MCP resource bridges for devices on Matter, Thread, and Amazon Sidewalk networks, allowing an Alexa+ MCP server to query device states directly without writing vendor-specific IoT adapters.
* **Why it matters:** Dramatically accelerates smart home and neighborhood-scale sensor integration.
* **Urgency:** **Nice-to-have**

---

### 4. Interactive Virtual Home Simulator for Ring & Alexa
* **What we'd want built:** A 3D or visual cloud-hosted simulator (similar to AWS RoboMaker or a web sandbox) where developers can simulate doorbell button presses, approaching couriers, light adjustments, and room audio without needing physical hardware at their desk.
* **Why it matters:** Greatly expands participation in Ring and Alexa+ hackathons worldwide.
* **Urgency:** **Critical for developer ecosystem growth**
