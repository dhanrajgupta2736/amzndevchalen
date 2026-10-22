// client/src/App.jsx
// Aura+ : Autonomous Ambient AI Guardian & Streamable MCP Orchestrator for Alexa+

import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [ambientState, setAmbientState] = useState(null);
  const [bedrockMeta, setBedrockMeta] = useState(null);
  const [mcpLogs, setMcpLogs] = useState([]);

  // Voice & Interaction State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [lastSpeech, setLastSpeech] = useState({
    prompt: 'System initialized and connected to Model Context Protocol server.',
    reply: 'Aura+ is active. Monitoring front door Ring sensors, home energy load, and Alexa+ ambient zones.',
    reasoningChain: ['Initialized MCP stream', 'Connected to AWS Bedrock AgentCore', 'Synchronized smart devices'],
    latencyMs: 120,
    model: 'Amazon Nova Pro (Bedrock)'
  });

  // UI Panels
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(false);

  // Poll state and MCP stream
  const fetchState = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/state`);
      if (res.ok) {
        const data = await res.json();
        setConnected(true);
        setAmbientState(data.state);
        setBedrockMeta(data.bedrock);
        if (data.state?.mcpLogs) {
          setMcpLogs(data.state.mcpLogs);
        }
      }
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech Synthesis
  const speakText = (text) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          handleSendPrompt(transcript);
        };

        recognition.start();
      } catch {
        simulateVoiceTrigger();
      }
    } else {
      simulateVoiceTrigger();
    }
  };

  const simulateVoiceTrigger = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleSendPrompt("Alexa, check front door and optimize ambient lights");
    }, 1500);
  };

  // Send Prompt to Bedrock & MCP
  const handleSendPrompt = async (textToSend) => {
    const text = textToSend || promptInput;
    if (!text || !text.trim()) return;

    setLoading(true);
    setPromptInput('');

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setLastSpeech({
          prompt: text,
          reply: data.reply,
          reasoningChain: data.bedrock?.reasoningChain || ['Dispatched MCP Tool Call'],
          latencyMs: data.bedrock?.latencyMs || 150,
          model: data.bedrock?.model || 'Amazon Nova Pro'
        });
        speakText(data.reply);
        fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run Scenario
  const runScenario = async (scenarioId, label) => {
    setActiveScenario(label);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/scenarios/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId })
      });

      if (res.ok) {
        const data = await res.json();
        setLastSpeech({
          prompt: `[Autonomous Trigger]: ${data.scenario.title}`,
          reply: data.scenario.speech,
          reasoningChain: [
            `Evaluated scenario: ${scenarioId}`,
            'Dispatched Streamable MCP tool execution',
            'Synchronized peripheral sensor state'
          ],
          latencyMs: 98,
          model: 'Bedrock Agent (Autonomous Routine)'
        });
        speakText(data.scenario.speech);
        fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setActiveScenario(null), 3000);
    }
  };

  // Direct Actuation
  const toggleLight = async (id, currentState) => {
    await fetch(`${API_BASE}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'toggle_light',
        payload: { id, state: currentState === 'on' ? 'off' : 'on' }
      })
    });
    fetchState();
  };

  const toggleLock = async (currentLocked) => {
    await fetch(`${API_BASE}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'toggle_lock',
        payload: { locked: !currentLocked }
      })
    });
    fetchState();
  };

  const devices = ambientState?.devices || {};
  const lighting = devices.lighting || {};
  const ring = devices.ring || {};
  const energy = devices.energy || {};
  const climate = devices.climate || {};
  const calendar = devices.calendar || [];

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Aura+ Ambient OS</h1>
            <p className="brand-subtitle">Autonomous Ambient Intelligence & MCP Orchestrator for Alexa+</p>
          </div>
        </div>

        <div className="header-badges">
          <div className="badge badge-cyan">
            <span className="pulse-dot pulse-cyan"></span>
            MCP SPEC: 2025-11-25+
          </div>
          <div className="badge badge-emerald">
            <span className="pulse-dot pulse-emerald"></span>
            AWS BEDROCK AGENT
          </div>
          <div className="badge badge-amber">
            <span className="pulse-dot pulse-amber"></span>
            RING SENTRY: ONLINE
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setVoiceMuted(!voiceMuted)}
            title="Toggle Voice Output"
          >
            {voiceMuted ? '🔇 Audio Muted' : '🔊 Voice Voice Active'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setInspectorOpen(!inspectorOpen)}
          >
            ⚡ MCP Inspector ({mcpLogs.length})
          </button>
        </div>
      </header>

      {/* Quick Scenarios Bar */}
      <section className="scenarios-strip">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          1-CLICK DEMO SCENARIOS:
        </span>
        <button 
          className="scenario-chip"
          onClick={() => runScenario('front_door_delivery', 'Front Porch Courier')}
        >
          📦 Front Porch Delivery (Ring Triage)
        </button>
        <button 
          className="scenario-chip"
          onClick={() => runScenario('eco_peak_shave', 'Eco Peak Shaving')}
        >
          🌱 Eco-Pulse Peak Shaving (-30% Load)
        </button>
        <button 
          className="scenario-chip"
          onClick={() => runScenario('focus_studio', 'Developer Focus Studio')}
        >
          💻 Developer Focus Studio (5000K Light)
        </button>
        <button 
          className="scenario-chip"
          onClick={() => runScenario('night_lockdown', 'Perimeter Night Sentry')}
        >
          🌙 Perimeter Night Sentry (Lock + Eco)
        </button>
      </section>

      {/* Ambient Consciousness Zone */}
      <section className="glass-panel ambient-hero">
        <div className="ambient-status-line">
          {isSpeaking ? (
            <div className="audio-wave">
              <span className="audio-bar"></span>
              <span className="audio-bar"></span>
              <span className="audio-bar"></span>
              <span className="audio-bar"></span>
              <span className="audio-bar"></span>
            </div>
          ) : (
            <span className="pulse-dot pulse-cyan"></span>
          )}
          <span>
            {isSpeaking 
              ? 'ALEXA+ VOCALIZING RESPONSE...' 
              : isListening 
              ? 'LISTENING TO AMBIENT VOICE...' 
              : 'ALEXA+ AMBIENT AURA READY'}
          </span>
        </div>

        {/* Ambient Alexa+ Orb */}
        <div 
          className={`orb-container ${isListening ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onClick={toggleListening}
          title="Click to talk with Alexa+"
        >
          <div className="orb-ring-outer"></div>
          <div className="orb-ring"></div>
          <div className="orb-core">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
        </div>

        {/* Speech and Thought Box */}
        <div className="speech-box">
          <div className="speech-prompt-label">User Query / Ambient Event</div>
          <div className="speech-prompt-text">"{lastSpeech.prompt}"</div>

          <div className="speech-prompt-label">Alexa+ Synthesized Vocal Output</div>
          <div className="speech-response-text">{lastSpeech.reply}</div>

          <div className="reasoning-chips">
            <span className="reasoning-chip" style={{ color: 'var(--alexa-cyan)' }}>
              ⚡ {lastSpeech.latencyMs}ms Latency
            </span>
            <span className="reasoning-chip" style={{ color: 'var(--accent-emerald)' }}>
              🧠 {lastSpeech.model}
            </span>
            {lastSpeech.reasoningChain?.map((step, idx) => (
              <span key={idx} className="reasoning-chip">
                ✓ {step}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Voice Prompt Suggestions & Text Bar */}
        <form 
          className="prompt-bar-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
        >
          <input 
            type="text" 
            className="prompt-input"
            placeholder="Talk or type to Alexa+ (e.g. 'Alexa, who is at the door?' or 'Alexa, save energy')..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Reasoning...' : 'Ask Alexa+'}
          </button>
        </form>
      </section>

      {/* 3-Column Operations Grid */}
      <main className="dashboard-grid">
        {/* Column 1: Ring Sentry Vision Triage */}
        <section className="glass-panel">
          <div className="card-header">
            <div className="card-title-group">
              <span style={{ fontSize: '1.2rem' }}>📹</span>
              <h3 className="card-title">Ring Vision & Sentry Triage</h3>
            </div>
            <span className="badge badge-amber">AI Optical Shield</span>
          </div>

          <div className="card-body">
            {/* Feed 1: Doorbell */}
            <div className="ring-feed-wrapper">
              <img 
                src={ring.doorbell?.liveFeedUrl || 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=800&q=80'} 
                alt="Front Porch Ring Cam" 
                className="ring-feed-img"
              />
              <div className="ring-overlay-badge">
                <span className="pulse-dot pulse-amber"></span>
                RING PRO 2: LIVE PORCH
              </div>
              <div className="ring-bounding-box">
                <span className="bounding-tag">COURIER 98%</span>
              </div>
            </div>

            <div className="ring-telemetry-box">
              <div className="telemetry-row">
                <span className="telemetry-label">Latest Event:</span>
                <span className="telemetry-val" style={{ color: 'var(--alexa-cyan)' }}>
                  {ring.doorbell?.lastEvent?.label || 'Monitoring entryway'}
                </span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Threat Classification:</span>
                <span className="telemetry-val" style={{ color: 'var(--accent-emerald)' }}>
                  {ring.doorbell?.lastEvent?.threatLevel === 'none' ? 'Verified Safe (None)' : 'Low (Standard Activity)'}
                </span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Bedrock Vision Confidence:</span>
                <span className="telemetry-val">
                  {(ring.doorbell?.lastEvent?.aiConfidence * 100 || 98).toFixed(0)}%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => handleSendPrompt("Alexa, who is at the front door?")}
              >
                🔍 Inspect Feed
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => handleSendPrompt("Alexa, flash exterior deterrent light")}
              >
                💡 Floodlight Pulse
              </button>
            </div>
          </div>
        </section>

        {/* Column 2: Ambient Smart Environment Actuation */}
        <section className="glass-panel">
          <div className="card-header">
            <div className="card-title-group">
              <span style={{ fontSize: '1.2rem' }}>💡</span>
              <h3 className="card-title">Ambient Living & Multi-Zone</h3>
            </div>
            <span className="badge badge-cyan">MCP Actuation</span>
          </div>

          <div className="card-body">
            <div className="devices-list">
              {/* Living Room */}
              <div className="device-tile">
                <div className="device-info">
                  <h4>{lighting.living_room?.name || 'Living Room Luminescence'}</h4>
                  <p>Ambient Cyan • {lighting.living_room?.brightness || 80}% Intensity</p>
                </div>
                <button 
                  className={`btn ${lighting.living_room?.state === 'on' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  onClick={() => toggleLight('living_room', lighting.living_room?.state)}
                >
                  {lighting.living_room?.state === 'on' ? 'Active' : 'Off'}
                </button>
              </div>

              {/* Workspace */}
              <div className="device-tile">
                <div className="device-info">
                  <h4>{lighting.workspace?.name || 'Studio Focus Bar'}</h4>
                  <p>5000K High-Clarity Daylight • {lighting.workspace?.brightness || 95}%</p>
                </div>
                <button 
                  className={`btn ${lighting.workspace?.state === 'on' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  onClick={() => toggleLight('workspace', lighting.workspace?.state)}
                >
                  {lighting.workspace?.state === 'on' ? 'Active' : 'Off'}
                </button>
              </div>

              {/* Climate / Thermostat */}
              <div className="device-tile">
                <div className="device-info">
                  <h4>Alexa Smart Thermostat</h4>
                  <p>Target: {climate.thermostat?.targetTemp || 70}°F • Mode: {climate.thermostat?.mode?.toUpperCase() || 'ECO'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleSendPrompt("Alexa, set thermostat to 72")}
                  >
                    + 72°F
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleSendPrompt("Alexa, lower temperature to 68 for sleep")}
                  >
                    - 68°F
                  </button>
                </div>
              </div>

              {/* Smart Deadbolt */}
              <div className="device-tile">
                <div className="device-info">
                  <h4>Ultion Smart Deadbolt</h4>
                  <p>{devices.security?.front_door_lock?.locked ? '🔒 Securely Engaged' : '🔓 Unlocked (Open)'}</p>
                </div>
                <button 
                  className={`btn ${devices.security?.front_door_lock?.locked ? 'btn-accent' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  onClick={() => toggleLock(devices.security?.front_door_lock?.locked)}
                >
                  {devices.security?.front_door_lock?.locked ? 'Locked' : 'Unlocked'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Column 3: Energy Pulse & Calendar Autonomy */}
        <section className="glass-panel">
          <div className="card-header">
            <div className="card-title-group">
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <h3 className="card-title">Eco-Pulse & Routine Sync</h3>
            </div>
            <span className="badge badge-emerald">Bedrock Optimized</span>
          </div>

          <div className="card-body">
            {/* Real-time Load Gauge */}
            <div className="energy-meter-container">
              <div className="energy-reading">
                {energy.currentLoadKw || 2.85}
                <span className="energy-unit">kW Load</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Peak Pricing Threshold: {energy.peakThresholdKw || 4.5} kW
              </p>

              <div className="energy-bar-track">
                <div 
                  className="energy-bar-fill" 
                  style={{ width: `${Math.min(100, ((energy.currentLoadKw || 2.85) / 4.5) * 100)}%` }}
                ></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Solar Gen: {energy.solarGenerationKw || 1.4} kW</span>
                <span>Eco Status: {energy.ecoModeActive ? 'Active' : 'Standby'}</span>
              </div>
            </div>

            <button 
              className="btn btn-accent" 
              style={{ width: '100%', marginBottom: '18px' }}
              onClick={() => runScenario('eco_peak_shave', 'Peak Shaving')}
            >
              🌿 Shave Peak Load (-30%)
            </button>

            {/* Upcoming Agenda Routine */}
            <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Proactive Agenda Coordination
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {calendar.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    background: 'rgba(8, 14, 28, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{item.title}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--alexa-cyan)' }}>{item.time}</p>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Real-time MCP Protocol Inspector Drawer */}
      <aside className={`mcp-drawer ${inspectorOpen ? '' : 'closed'}`}>
        <div className="mcp-drawer-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              ⚡ Model Context Protocol Inspector
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Spec 2025-11-25+ Streamable HTTP & JSON-RPC 2.0 Live Stream
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            onClick={() => setInspectorOpen(false)}
          >
            ✕ Close
          </button>
        </div>

        <div className="mcp-drawer-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--alexa-cyan)', fontFamily: 'var(--font-mono)' }}>
              SESSION: {connected ? 'ACTIVE (Stream Open)' : 'CONNECTING...'}
            </span>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
              onClick={fetchState}
            >
              🔄 Refresh
            </button>
          </div>

          {mcpLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '40px' }}>
              Waiting for inbound MCP tool calls or RPC events...
            </p>
          ) : (
            mcpLogs.map((log) => (
              <div key={log.id} className={`mcp-log-entry ${log.type}`}>
                <div className="mcp-log-header">
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>
                    {log.type === 'tool_call_start' && `🛠️ Tool: ${log.tool}`}
                    {log.type === 'tool_call_success' && `✅ Success: ${log.tool}`}
                    {log.type === 'rpc_inbound' && `📨 RPC Method: ${log.method}`}
                    {log.type === 'sse_connected' && `🔗 SSE Stream Connected`}
                    {log.type === 'sse_disconnected' && `🔌 SSE Session Closed`}
                  </span>
                  <span style={{ fontSize: '0.65rem' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {log.args && (
                  <pre className="mcp-json-pre">
                    {JSON.stringify(log.args, null, 2)}
                  </pre>
                )}

                {log.result && (
                  <pre className="mcp-json-pre" style={{ color: 'var(--accent-emerald)' }}>
                    {JSON.stringify(log.result, null, 2)}
                  </pre>
                )}

                {log.params && (
                  <pre className="mcp-json-pre">
                    {JSON.stringify(log.params, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
