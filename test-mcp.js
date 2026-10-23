// test-mcp.js
// Automated verification script for Aura+ MCP Server (Spec 2025-11-25+)

const http = require('http');

async function rpcCall(method, params = {}) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  });

  return new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:3001/mcp/rpc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const { spawn } = require('child_process');
const path = require('path');

let spawnedServer = null;

async function ensureServerRunning() {
  try {
    await rpcCall('initialize');
    return; // Already running
  } catch (e) {
    console.log('📡 Starting Aura+ MCP Server on port 3001...');
    spawnedServer = spawn(process.execPath, [path.join(__dirname, 'server', 'index.js')], {
      cwd: __dirname,
      env: { ...process.env, PORT: '3001' },
      stdio: 'inherit'
    });
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 400));
      try {
        await rpcCall('initialize');
        return;
      } catch (err) {
        // Retry
      }
    }
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Aura+ MCP Server Automated Test Suite');
  console.log('====================================================\n');

  try {
    await ensureServerRunning();

    // 1. Initialize Handshake
    console.log('1. Testing MCP Handshake (initialize)...');
    const initRes = await rpcCall('initialize');
    if (initRes.result?.protocolVersion === '2025-11-25') {
      console.log('   ✅ PASS: Protocol version 2025-11-25 validated.');
    } else {
      throw new Error(`Unexpected protocol version: ${JSON.stringify(initRes)}`);
    }

    // 2. Tools List
    console.log('\n2. Testing MCP Tools Discovery (tools/list)...');
    const toolsRes = await rpcCall('tools/list');
    const tools = toolsRes.result?.tools || [];
    if (tools.length >= 5) {
      console.log(`   ✅ PASS: Discovered ${tools.length} registered tools:`);
      tools.forEach((t) => console.log(`      - ${t.name}`));
    } else {
      throw new Error(`Expected at least 5 tools, got: ${tools.length}`);
    }

    // 3. Tool Execution: smart_home_control
    console.log('\n3. Testing Tool Call: smart_home_control...');
    const lightRes = await rpcCall('tools/call', {
      name: 'smart_home_control',
      arguments: { action: 'set_light', targetId: 'workspace', brightness: 100 }
    });
    if (lightRes.result?.content?.[0]?.text) {
      console.log('   ✅ PASS: Smart home actuation executed successfully.');
    } else {
      throw new Error(`Tool call failed: ${JSON.stringify(lightRes)}`);
    }

    // 4. Tool Execution: ring_security_triage
    console.log('\n4. Testing Tool Call: ring_security_triage...');
    const ringRes = await rpcCall('tools/call', {
      name: 'ring_security_triage',
      arguments: { cameraId: 'doorbell', triageDepth: 'verify_package' }
    });
    if (ringRes.result?.content?.[0]?.text?.includes('verified_safe')) {
      console.log('   ✅ PASS: Ring sentry optical triage returned safe posture.');
    } else {
      throw new Error(`Ring triage call failed: ${JSON.stringify(ringRes)}`);
    }

    // 5. Tool Execution: ambient_energy_optimizer
    console.log('\n5. Testing Tool Call: ambient_energy_optimizer...');
    const ecoRes = await rpcCall('tools/call', {
      name: 'ambient_energy_optimizer',
      arguments: { targetReductionPct: 25 }
    });
    if (ecoRes.result?.content?.[0]?.text?.includes('savedKw')) {
      console.log('   ✅ PASS: Energy load shedding computed and applied.');
    } else {
      throw new Error(`Energy optimizer failed: ${JSON.stringify(ecoRes)}`);
    }

    // 6. Resources List
    console.log('\n6. Testing MCP Resource Endpoints (resources/list)...');
    const resList = await rpcCall('resources/list');
    if (resList.result?.resources?.length > 0) {
      console.log(`   ✅ PASS: Discovered ${resList.result.resources.length} MCP resources.`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL MCP SPECIFICATION TESTS PASSED (6/6)');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (spawnedServer) {
      spawnedServer.kill();
    }
  }
}

runTests();
