import React, { useState, useEffect } from 'react';
import { 
  Bot, ShieldAlert, Zap, Thermometer, Compass, 
  Activity, Play, RotateCcw, AlertOctagon, CheckCircle2
} from 'lucide-react';

export const AstraRoboticsHUD: React.FC = () => {
  const [roboticsState, setRoboticsState] = useState({
    connected: true,
    deviceId: 'ASTRA-ROBOTIC-01',
    mode: 'IDLE',
    telemetry: {
      batteryPct: 94,
      voltage: 24.2,
      motorTempC: 38.5,
      jointAngles: [0, 45, 90, 0, 15, 0],
      imu: { pitch: 0.2, roll: -0.1, yaw: 124.5 },
      lidarDistanceMinM: 1.84,
      safetyInterlockActive: true
    }
  });

  const [suitState, setSuitState] = useState({
    suitId: 'ASTRA-EXO-MARK-I',
    connected: true,
    helmetHudOnline: true,
    mode: 'NORMAL',
    power: { batteryPct: 88, voltage: 48.4, drawWatts: 145.2, estimatedMinutes: 240 },
    thermal: { coreTempC: 36.8, exhaustTempC: 41.2 },
    balance: { stabilityScore: 0.99, assistTorqueNm: 12.4 },
    climbingModule: { enabled: false, adhesionState: 'DISENGAGED', maxSafeLoadKg: 110 }
  });

  const [simulationActive, setSimulationActive] = useState(false);
  const [eStopTriggered, setEStopTriggered] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8990/api/devices')
      .then(res => res.json())
      .then(data => {
        if (data.roboticsState) setRoboticsState(data.roboticsState);
        if (data.suitState) setSuitState(data.suitState);
      })
      .catch(() => {});
  }, []);

  const handleEStop = async () => {
    try {
      await fetch('http://localhost:8990/api/devices/dev-robotic-01/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'estop' })
      });
      setEStopTriggered(true);
      setRoboticsState(prev => ({ ...prev, mode: 'EMERGENCY_STOP' }));
    } catch {
      setEStopTriggered(true);
    }
  };

  const handleResetEStop = () => {
    setEStopTriggered(false);
    setRoboticsState(prev => ({ ...prev, mode: 'IDLE' }));
  };

  const runDigitalTwinSimulation = () => {
    setSimulationActive(true);
    setTimeout(() => {
      setSimulationActive(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">ROBOTICS & WEARABLE HARDWARE HUD</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Kinematics abstraction layer, telemetry suit monitoring, and digital twin pre-flight simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {eStopTriggered ? (
            <button
              onClick={handleResetEStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-mono text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Emergency Stop
            </button>
          ) : (
            <button
              onClick={handleEStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
            >
              <AlertOctagon className="w-4 h-4" /> HARDWARE E-STOP
            </button>
          )}
        </div>
      </div>

      {/* Grid: Robotics Unit & Wearable Exoskeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Autonomous Robotics Unit */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">{roboticsState.deviceId}</h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
              eStopTriggered 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {eStopTriggered ? 'EMERGENCY_STOP' : roboticsState.mode}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1 text-white/50 text-[10px]">
                <Zap className="w-3 h-3 text-amber-400" /> BATTERY
              </div>
              <p className="text-base font-bold text-white mt-1">{roboticsState.telemetry.batteryPct}%</p>
              <span className="text-[10px] text-white/40">{roboticsState.telemetry.voltage}V</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1 text-white/50 text-[10px]">
                <Thermometer className="w-3 h-3 text-rose-400" /> MOTOR TEMP
              </div>
              <p className="text-base font-bold text-white mt-1">{roboticsState.telemetry.motorTempC}°C</p>
              <span className="text-[10px] text-emerald-400">Nominal</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1 text-white/50 text-[10px]">
                <Compass className="w-3 h-3 text-blue-400" /> MIN LIDAR
              </div>
              <p className="text-base font-bold text-white mt-1">{roboticsState.telemetry.lidarDistanceMinM}m</p>
              <span className="text-[10px] text-white/40">Clear zone</span>
            </div>
          </div>

          {/* Joint Angles Visual Bar */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[11px] font-mono text-white/60">ACTUATOR JOINT POSITIONS (6-DOF)</span>
            <div className="grid grid-cols-6 gap-2 font-mono text-[10px] text-center">
              {roboticsState.telemetry.jointAngles.map((angle, idx) => (
                <div key={idx} className="p-2 rounded bg-white/5 border border-white/5">
                  <div className="text-white/40">J{idx + 1}</div>
                  <div className="text-amber-400 font-bold mt-0.5">{angle}°</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> KINEMATIC SAFETY INTERLOCK
            </span>
            <span className="text-[10px] text-white/50">NO RAW PWM PERMITTED</span>
          </div>
        </div>

        {/* Card 2: Wearable Exoskeleton & Suit */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">{suitState.suitId}</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              HUD {suitState.helmetHudOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1 text-white/50 text-[10px]">
                <Zap className="w-3 h-3 text-amber-400" /> SUIT POWER
              </div>
              <p className="text-base font-bold text-white mt-1">{suitState.power.batteryPct}%</p>
              <span className="text-[10px] text-white/40">{suitState.power.estimatedMinutes} min</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1 text-white/50 text-[10px]">
                <Thermometer className="w-3 h-3 text-amber-400" /> CORE TEMP
              </div>
              <p className="text-base font-bold text-white mt-1">{suitState.thermal.coreTempC}°C</p>
              <span className="text-[10px] text-emerald-400">Thermoregulated</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1 text-white/50 text-[10px]">
                <ShieldAlert className="w-3 h-3 text-blue-400" /> STABILITY
              </div>
              <p className="text-base font-bold text-white mt-1">{Math.round(suitState.balance.stabilityScore * 100)}%</p>
              <span className="text-[10px] text-white/40">Assist: {suitState.balance.assistTorqueNm}Nm</span>
            </div>
          </div>

          {/* Conceptual Climbing Interface Research */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-amber-400 font-semibold">SURFACE ADHESION MODULE (RESEARCH ONLY)</span>
              <span className="text-[10px] text-white/50">{suitState.climbingModule.adhesionState}</span>
            </div>
            <p className="text-[11px] text-white/60">
              Electro-adhesion telemetry is evaluated by independent physical microcontrollers. Max safety load: {suitState.climbingModule.maxSafeLoadKg}kg.
            </p>
          </div>

          {/* Pre-Flight Digital Twin Simulator */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="text-xs font-mono text-white/60">
              PHYSICS DIGITAL TWIN SIMULATION
            </div>
            <button
              onClick={runDigitalTwinSimulation}
              disabled={simulationActive}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              <Play className={`w-3.5 h-3.5 ${simulationActive ? 'animate-pulse' : ''}`} />
              {simulationActive ? 'Simulating Physics...' : 'Run Simulation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
