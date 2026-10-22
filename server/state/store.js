// server/state/store.js
// In-memory state store for Aura+ Smart Environment & Ring Devices

class StateStore {
  constructor() {
    this.devices = {
      lighting: {
        living_room: { id: 'light-lr', name: 'Living Room Luminescence', state: 'on', brightness: 80, color: '#00cae6', mode: 'ambient' },
        workspace: { id: 'light-ws', name: 'Studio Focus Bar', state: 'on', brightness: 95, color: '#f59e0b', mode: 'focus' },
        entryway: { id: 'light-ent', name: 'Porch Guard Accent', state: 'off', brightness: 40, color: '#38bdf8', mode: 'security' },
        ambient_strip: { id: 'light-strip', name: 'Echo Glow Ambient Strip', state: 'on', brightness: 60, color: '#a855f7', mode: 'breathe' }
      },
      climate: {
        thermostat: { id: 'clim-main', name: 'Ecobee / Alexa Smart Thermostat', currentTemp: 71, targetTemp: 70, mode: 'eco', humidity: 46 }
      },
      security: {
        front_door_lock: { id: 'lock-main', name: 'Ultion Smart Deadbolt', locked: true, battery: 94 },
        patio_sensor: { id: 'sens-patio', name: 'Patio Multi-Sensor', active: true, motionDetected: false }
      },
      ring: {
        doorbell: {
          id: 'ring-doorbell-pro',
          name: 'Front Porch Ring Pro 2',
          status: 'online',
          liveFeedUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=800&q=80',
          lastEvent: {
            timestamp: new Date().toISOString(),
            type: 'motion_detected',
            threatLevel: 'low',
            label: 'Delivery courier approaching front gate (holding package)',
            aiConfidence: 0.96
          }
        },
        driveway_cam: {
          id: 'ring-floodlight-driveway',
          name: 'Driveway Floodlight Cam Plus',
          status: 'online',
          liveFeedUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
          lastEvent: {
            timestamp: new Date(Date.now() - 180000).toISOString(),
            type: 'vehicle_detected',
            threatLevel: 'none',
            label: 'Authorized vehicle parked in driveway',
            aiConfidence: 0.99
          }
        }
      },
      energy: {
        currentLoadKw: 2.85,
        peakThresholdKw: 4.5,
        dailyConsumptionKwh: 14.2,
        solarGenerationKw: 1.4,
        gridExportKw: 0.0,
        ecoModeActive: true
      },
      calendar: [
        { id: 'evt-1', title: 'Amazon Dev Hackathon Deadline', time: '12:30 AM (Tonight)', category: 'critical', duration: 'Final Submission' },
        { id: 'evt-2', title: 'Product Architecture Review with Team', time: 'Tomorrow 10:00 AM', category: 'work', duration: '45 mins' },
        { id: 'evt-3', title: 'Smart Home Energy Peak Shaving Window', time: 'Today 5:00 PM - 8:00 PM', category: 'automation', duration: '3 hours' }
      ]
    };

    this.mcpLogs = [];
    this.conversationHistory = [];
    this.maxLogs = 100;
  }

  logMcpEvent(event) {
    const entry = {
      id: `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.mcpLogs.unshift(entry);
    if (this.mcpLogs.length > this.maxLogs) {
      this.mcpLogs.pop();
    }
    return entry;
  }

  getSnapshot() {
    return {
      devices: this.devices,
      mcpLogs: this.mcpLogs.slice(0, 25),
      timestamp: new Date().toISOString()
    };
  }

  updateLight(lightKey, updates) {
    if (this.devices.lighting[lightKey]) {
      this.devices.lighting[lightKey] = { ...this.devices.lighting[lightKey], ...updates };
      return this.devices.lighting[lightKey];
    }
    return null;
  }

  updateThermostat(targetTemp, mode) {
    if (targetTemp !== undefined) this.devices.climate.thermostat.targetTemp = targetTemp;
    if (mode !== undefined) this.devices.climate.thermostat.mode = mode;
    return this.devices.climate.thermostat;
  }

  toggleLock(locked) {
    this.devices.security.front_door_lock.locked = locked;
    return this.devices.security.front_door_lock;
  }

  recordRingEvent(camKey, eventData) {
    if (this.devices.ring[camKey]) {
      this.devices.ring[camKey].lastEvent = {
        timestamp: new Date().toISOString(),
        ...eventData
      };
      return this.devices.ring[camKey];
    }
    return null;
  }

  optimizeEnergy(targetReductionPct) {
    const reduction = (this.devices.energy.currentLoadKw * (targetReductionPct / 100));
    this.devices.energy.currentLoadKw = Math.max(1.1, Number((this.devices.energy.currentLoadKw - reduction).toFixed(2)));
    this.devices.energy.ecoModeActive = true;
    return {
      previousLoad: (this.devices.energy.currentLoadKw + reduction).toFixed(2),
      currentLoad: this.devices.energy.currentLoadKw,
      savedKw: reduction.toFixed(2),
      actionsTaken: [
        'Dimmed ambient LED accent zones by 35%',
        'Adjusted smart climate setpoint by +1.5°F eco buffer',
        'Deferred water heater heating cycle until solar peak',
        'Suspended standby computing workstation drains'
      ]
    };
  }
}

module.exports = new StateStore();
