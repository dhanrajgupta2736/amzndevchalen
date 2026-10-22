// server/index.js
// Aura+ Model Context Protocol (MCP) Server & Ambient Orchestrator
// Spec Compliant: 2025-11-25+ Streamable HTTP & JSON-RPC 2.0

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('crypto');
const stateStore = require('./state/store');
const { MCP_TOOLS, MCP_RESOURCES, MCP_PROMPTS, executeTool, readResource } = require('./mcp/tools');
const bedrockBridge = require('./aws/bedrock');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve client dist build if present
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Track active SSE client sessions
const sseSessions = new Map();

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}

// -------------------------------------------------------------
// 1. MCP Streamable HTTP Spec (2025-11-25+) Endpoints
// -------------------------------------------------------------

// SSE stream endpoint
app.get('/mcp/sse', (req, res) => {
  const sessionId = generateSessionId();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  sseSessions.set(sessionId, res);

  stateStore.logMcpEvent({
    type: 'sse_connected',
    sessionId,
    remoteAddress: req.ip
  });

  // Initial event sending the message postback endpoint
  res.write(`event: endpoint\ndata: /mcp/messages?sessionId=${sessionId}\n\n`);

  req.on('close', () => {
    sseSessions.delete(sessionId);
    stateStore.logMcpEvent({
      type: 'sse_disconnected',
      sessionId
    });
  });
});

// JSON-RPC message handler
async function handleJsonRpc(payload) {
  const { jsonrpc, id, method, params } = payload;

  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id: id || null,
      error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' }
    };
  }

  stateStore.logMcpEvent({
    type: 'rpc_inbound',
    method,
    id,
    params
  });

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-11-25',
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
            logging: {}
          },
          serverInfo: {
            name: 'aura-plus-mcp-server',
            version: '1.2.0',
            description: 'Ambient Intelligent Guardian & Alexa+ MCP Orchestrator'
          }
        }
      };

    case 'notifications/initialized':
      return null; // Notifications do not have a response

    case 'ping':
      return { jsonrpc: '2.0', id, result: {} };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: MCP_TOOLS }
      };

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      if (!name) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name in params' }
        };
      }
      const toolOutput = await executeTool(name, args || {});
      return {
        jsonrpc: '2.0',
        id,
        result: toolOutput
      };
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { resources: MCP_RESOURCES }
      };

    case 'resources/read': {
      const { uri } = params || {};
      try {
        const resourceData = readResource(uri);
        return {
          jsonrpc: '2.0',
          id,
          result: { contents: [resourceData] }
        };
      } catch (e) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32002, message: e.message }
        };
      }
    }

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { prompts: MCP_PROMPTS }
      };

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` }
      };
  }
}

// POST message endpoint for SSE session
app.post('/mcp/messages', async (req, res) => {
  const { sessionId } = req.query;
  const sseRes = sseSessions.get(sessionId);

  const responseRpc = await handleJsonRpc(req.body);

  if (responseRpc) {
    if (sseRes) {
      sseRes.write(`event: message\ndata: ${JSON.stringify(responseRpc)}\n\n`);
    }
    return res.status(200).json(responseRpc);
  }

  res.status(202).json({ status: 'accepted' });
});

// Direct stateless JSON-RPC endpoint
app.post('/mcp/rpc', async (req, res) => {
  const responseRpc = await handleJsonRpc(req.body);
  if (responseRpc) {
    return res.status(200).json(responseRpc);
  }
  res.status(204).end();
});

// -------------------------------------------------------------
// 2. Application REST Endpoints for Alexa+ Ambient Experience
// -------------------------------------------------------------

// Get overall smart environment state & logs
app.get('/api/state', (req, res) => {
  res.json({
    status: 'ok',
    bedrock: bedrockBridge.getStatus(),
    state: stateStore.getSnapshot(),
    toolsCount: MCP_TOOLS.length,
    activeMcpSessions: sseSessions.size
  });
});

// Get registered MCP tools
app.get('/api/tools', (req, res) => {
  res.json({
    tools: MCP_TOOLS,
    resources: MCP_RESOURCES,
    prompts: MCP_PROMPTS
  });
});

// Execute an individual tool directly from UI
app.post('/api/tools/execute', async (req, res) => {
  const { name, args } = req.body;
  if (!name) return res.status(400).json({ error: 'Tool name required' });
  const result = await executeTool(name, args || {});
  res.json({ result, state: stateStore.getSnapshot() });
});

// End-to-end Alexa+ Conversational & Agent Flow
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // 1. Bedrock Agent evaluates speech input & ambient state
  const bedrockResult = await bedrockBridge.converse(message, stateStore.getSnapshot());

  // 2. Automatically dispatch corresponding MCP tool if identified
  let toolExecutionResult = null;
  if (bedrockResult.toolSuggested) {
    const args = {};
    if (bedrockResult.toolSuggested === 'ambient_energy_optimizer') {
      args.targetReductionPct = 25;
    } else if (bedrockResult.toolSuggested === 'ring_security_triage') {
      args.cameraId = 'doorbell';
      args.triageDepth = 'verify_package';
    } else if (bedrockResult.toolSuggested === 'smart_home_control') {
      if (message.toLowerCase().includes('night') || message.toLowerCase().includes('sleep')) {
        args.action = 'activate_scene';
        args.sceneName = 'night_guard';
      } else if (message.toLowerCase().includes('focus') || message.toLowerCase().includes('work')) {
        args.action = 'activate_scene';
        args.sceneName = 'focus';
      } else {
        args.action = 'set_light';
        args.brightness = 85;
      }
    }
    toolExecutionResult = await executeTool(bedrockResult.toolSuggested, args);
  }

  res.json({
    reply: bedrockResult.text,
    bedrock: bedrockResult,
    toolExecution: toolExecutionResult,
    updatedState: stateStore.getSnapshot()
  });
});

// Quick Scenarios Runner for 1-Click Judging Demos
app.post('/api/scenarios/run', async (req, res) => {
  const { scenarioId } = req.body;

  let scenarioData = {};

  if (scenarioId === 'front_door_delivery') {
    stateStore.recordRingEvent('doorbell', {
      threatLevel: 'low',
      label: 'Ring optical motion: Amazon Prime Courier on porch step',
      aiConfidence: 0.97
    });
    const toolRes = await executeTool('ring_security_triage', {
      cameraId: 'doorbell',
      triageDepth: 'verify_package',
      enableDeterrent: false
    });
    scenarioData = {
      title: 'Front Porch Courier Arrival',
      speech: "Alexa+ Alert: Amazon Delivery driver verified at front door with 1 parcel. Perimeter secure.",
      toolRes
    };
  } else if (scenarioId === 'eco_peak_shave') {
    const toolRes = await executeTool('ambient_energy_optimizer', {
      targetReductionPct: 30,
      mode: 'peak_shaving'
    });
    scenarioData = {
      title: 'Eco-Pulse Grid Peak Shaving',
      speech: "Alexa+ Energy: Shaved 0.85 kW across home lighting and HVAC to beat utility peak tariff.",
      toolRes
    };
  } else if (scenarioId === 'focus_studio') {
    const toolRes = await executeTool('smart_home_control', {
      action: 'activate_scene',
      sceneName: 'focus'
    });
    scenarioData = {
      title: 'Developer Deep-Work Routine',
      speech: "Alexa+ Focus: 5000K daylight workspace engaged. Chimes muted for deep concentration.",
      toolRes
    };
  } else if (scenarioId === 'night_lockdown') {
    const toolRes = await executeTool('smart_home_control', {
      action: 'activate_scene',
      sceneName: 'night_guard'
    });
    scenarioData = {
      title: 'Perimeter Night Sentry',
      speech: "Alexa+ Goodnight: Deadbolt locked, Ring sentry armed, ambient lights dimmed to warm amber.",
      toolRes
    };
  }

  res.json({
    status: 'ok',
    scenario: scenarioData,
    state: stateStore.getSnapshot()
  });
});

// Direct hardware actuation (toggle lights, thermostat, locks)
app.post('/api/action', (req, res) => {
  const { type, payload } = req.body;
  if (type === 'toggle_light') {
    stateStore.updateLight(payload.id, { state: payload.state });
  } else if (type === 'toggle_lock') {
    stateStore.toggleLock(payload.locked);
  } else if (type === 'set_thermostat') {
    stateStore.updateThermostat(payload.temp);
  }
  res.json({ state: stateStore.getSnapshot() });
});

// SPA Fallback Route for non-API requests (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/mcp')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Aura+ MCP Server (Amazon Developer Hackathon)`);
  console.log(` Spec: 2025-11-25+ Streamable HTTP`);
  console.log(` Port: http://localhost:${PORT}`);
  console.log(` SSE Stream: http://localhost:${PORT}/mcp/sse`);
  console.log(` JSON-RPC:   http://localhost:${PORT}/mcp/rpc`);
  console.log(` Bedrock:    ${bedrockBridge.getStatus().mode}`);
  console.log(`=======================================================`);
});
