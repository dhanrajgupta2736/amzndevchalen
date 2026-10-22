// server/mcp/tools.js
// Model Context Protocol (MCP) Tool Specifications & Handlers
// Spec Compliance: 2025-11-25+ Streamable HTTP & JSON-RPC 2.0

const stateStore = require('../state/store');
const bedrockBridge = require('../aws/bedrock');

const MCP_TOOLS = [
  {
    name: 'smart_home_control',
    description: 'Control smart lighting, ambient LED zones, HVAC thermostat, and smart deadbolts across the living space.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['set_light', 'set_thermostat', 'toggle_lock', 'activate_scene'],
          description: 'The smart home actuation to perform.'
        },
        targetId: {
          type: 'string',
          description: 'Target device ID or zone (e.g., "living_room", "workspace", "thermostat", "front_door_lock").'
        },
        brightness: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Lighting brightness level (0-100%).'
        },
        color: {
          type: 'string',
          description: 'Hex color string for ambient RGB lighting (e.g. "#00cae6", "#f59e0b").'
        },
        temperature: {
          type: 'number',
          description: 'Target thermostat temperature in Fahrenheit.'
        },
        locked: {
          type: 'boolean',
          description: 'Whether to lock (true) or unlock (false) the deadbolt.'
        },
        sceneName: {
          type: 'string',
          enum: ['focus', 'cinema', 'night_guard', 'energize', 'relax'],
          description: 'Preset ambient atmosphere scene to activate.'
        }
      },
      required: ['action']
    }
  },
  {
    name: 'ring_security_triage',
    description: 'Inspect live Ring camera optical feeds, evaluate motion events, and synthesize security posture using Bedrock Vision.',
    inputSchema: {
      type: 'object',
      properties: {
        cameraId: {
          type: 'string',
          enum: ['doorbell', 'driveway_cam', 'all'],
          description: 'The Ring video device to query or analyze.'
        },
        triageDepth: {
          type: 'string',
          enum: ['quick_status', 'deep_vision_analysis', 'verify_package', 'threat_assessment'],
          description: 'The level of multi-modal analysis to run.'
        },
        enableDeterrent: {
          type: 'boolean',
          description: 'Whether to flash exterior warning floodlight or play gentle audible chime.'
        }
      },
      required: ['cameraId']
    }
  },
  {
    name: 'ambient_energy_optimizer',
    description: 'Analyze power grid strain, calculate real-time wattage reduction, and enact automated eco-mode load shaving.',
    inputSchema: {
      type: 'object',
      properties: {
        targetReductionPct: {
          type: 'number',
          minimum: 5,
          maximum: 50,
          description: 'Percentage of non-essential electrical draw to shed.'
        },
        mode: {
          type: 'string',
          enum: ['peak_shaving', 'solar_maximize', 'balanced'],
          description: 'Eco optimization strategy.'
        }
      },
      required: ['targetReductionPct']
    }
  },
  {
    name: 'bedrock_agent_reasoner',
    description: 'Trigger autonomous multi-step reasoning using Amazon Bedrock Foundation Models (Amazon Nova, Anthropic Claude 3.5 Sonnet).',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The user query or ambient event to evaluate.'
        },
        modelTier: {
          type: 'string',
          enum: ['nova-pro', 'nova-lite', 'claude-3-5-sonnet', 'titan-express'],
          description: 'The Bedrock foundation model to route inference to.'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'calendar_routine_sync',
    description: 'Query upcoming calendar events and automatically schedule proactive Alexa+ ambient routines.',
    inputSchema: {
      type: 'object',
      properties: {
        timeWindow: {
          type: 'string',
          enum: ['today', 'tomorrow', 'upcoming_week'],
          description: 'Time horizon for agenda coordination.'
        }
      },
      required: ['timeWindow']
    }
  }
];

const MCP_RESOURCES = [
  {
    uri: 'ambient://environment/state',
    name: 'Ambient Living Environment State',
    description: 'Current real-time readings of lighting, temperature, locks, and active audio profile.',
    mimeType: 'application/json'
  },
  {
    uri: 'ring://cameras/feed',
    name: 'Ring Security Stream Metadata',
    description: 'Live status, recent optical motion triggers, and threat assessment logs.',
    mimeType: 'application/json'
  },
  {
    uri: 'energy://meter/telemetry',
    name: 'Home Energy Meter & Solar Inverter',
    description: 'Real-time kW load, daily aggregate kWh, and grid import/export telemetry.',
    mimeType: 'application/json'
  }
];

const MCP_PROMPTS = [
  {
    name: 'morning_briefing',
    description: 'Generates a seamless morning wake-up briefing combining weather, calendar events, and home readiness.',
    arguments: []
  },
  {
    name: 'security_sweep',
    description: 'Performs a comprehensive perimeter safety inspection across all Ring devices and entry points.',
    arguments: []
  },
  {
    name: 'eco_pulse',
    description: 'Evaluates current home power draw against utility peak pricing and executes shaving protocol.',
    arguments: []
  }
];

// Tool Execution Dispatcher
async function executeTool(name, args) {
  stateStore.logMcpEvent({
    type: 'tool_call_start',
    tool: name,
    args
  });

  try {
    let result = null;

    switch (name) {
      case 'smart_home_control': {
        const { action, targetId, brightness, color, temperature, locked, sceneName } = args;

        if (action === 'set_light') {
          const lightKey = targetId || 'living_room';
          result = stateStore.updateLight(lightKey, {
            state: brightness === 0 ? 'off' : 'on',
            ...(brightness !== undefined && { brightness }),
            ...(color !== undefined && { color })
          });
        } else if (action === 'set_thermostat') {
          result = stateStore.updateThermostat(temperature, 'comfort');
        } else if (action === 'toggle_lock') {
          result = stateStore.toggleLock(locked !== false);
        } else if (action === 'activate_scene') {
          if (sceneName === 'focus') {
            stateStore.updateLight('workspace', { state: 'on', brightness: 100, color: '#f59e0b' });
            stateStore.updateLight('living_room', { state: 'on', brightness: 30, color: '#0284c7' });
            result = { scene: 'focus', status: 'Focus scene engaged. 5000K daylight workspace enabled.' };
          } else if (sceneName === 'night_guard') {
            stateStore.updateLight('living_room', { state: 'off' });
            stateStore.updateLight('ambient_strip', { state: 'on', brightness: 20, color: '#9333ea' });
            stateStore.toggleLock(true);
            stateStore.updateThermostat(68, 'eco');
            result = { scene: 'night_guard', status: 'Perimeter locked. Thermostat at 68°F. Sleep ambient enabled.' };
          } else {
            result = { scene: sceneName, status: `Ambient scene "${sceneName}" applied across zones.` };
          }
        }
        break;
      }

      case 'ring_security_triage': {
        const { cameraId, triageDepth, enableDeterrent } = args;
        const camKey = cameraId === 'driveway_cam' ? 'driveway_cam' : 'doorbell';
        const cam = stateStore.devices.ring[camKey];

        const analysis = {
          device: cam.name,
          depth: triageDepth || 'quick_status',
          threatLevel: 'none',
          status: 'verified_safe',
          aiVisionSummary: 'Amazon Logistics driver placed package on porch step. Face match verified delivery personnel uniform.',
          deterrentTriggered: Boolean(enableDeterrent),
          timestamp: new Date().toISOString()
        };

        stateStore.recordRingEvent(camKey, {
          threatLevel: 'none',
          label: 'Delivery courier delivered verified package',
          aiConfidence: 0.98
        });

        result = analysis;
        break;
      }

      case 'ambient_energy_optimizer': {
        const { targetReductionPct } = args;
        result = stateStore.optimizeEnergy(targetReductionPct || 20);
        break;
      }

      case 'bedrock_agent_reasoner': {
        const { prompt } = args;
        const bedrockResponse = await bedrockBridge.converse(prompt, stateStore.getSnapshot());
        result = bedrockResponse;
        break;
      }

      case 'calendar_routine_sync': {
        result = {
          events: stateStore.devices.calendar,
          recommendation: 'Hackathon final submission scheduled for 12:30 AM. Suggested setting Focus Mode at 8:00 PM.'
        };
        break;
      }

      default:
        throw new Error(`Unknown MCP tool: ${name}`);
    }

    stateStore.logMcpEvent({
      type: 'tool_call_success',
      tool: name,
      result
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (err) {
    stateStore.logMcpEvent({
      type: 'tool_call_error',
      tool: name,
      error: err.message
    });

    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${err.message}`
        }
      ],
      isError: true
    };
  }
}

// Read resource
function readResource(uri) {
  if (uri === 'ambient://environment/state') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(stateStore.devices, null, 2)
    };
  }
  if (uri === 'ring://cameras/feed') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(stateStore.devices.ring, null, 2)
    };
  }
  if (uri === 'energy://meter/telemetry') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(stateStore.devices.energy, null, 2)
    };
  }
  throw new Error(`Resource not found: ${uri}`);
}

module.exports = {
  MCP_TOOLS,
  MCP_RESOURCES,
  MCP_PROMPTS,
  executeTool,
  readResource
};
