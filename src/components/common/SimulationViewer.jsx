import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Box, IconButton, Typography, Chip, Tooltip, LinearProgress } from '@mui/material';
import { PlayArrow, Pause, SkipNext, Replay, Speed } from '@mui/icons-material';

const NODE_W = 110;
const NODE_H = 44;

const statusColor = { idle: '#78909c', active: '#4caf50', warn: '#ff9800', error: '#f44336', highlight: '#2196f3' };

function Node({ x, y, label, status = 'idle', icon }) {
  const fill = statusColor[status] || statusColor.idle;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
        fill={fill} opacity={0.15} stroke={fill} strokeWidth={1.5} />
      {icon && <text x={-NODE_W / 2 + 10} y={5} fontSize={14}>{icon}</text>}
      <text x={0} y={5} textAnchor="middle" fontSize={11} fontWeight={600}
        fill={fill} fontFamily="system-ui">{label}</text>
    </g>
  );
}

function AnimatedPacket({ x1, y1, x2, y2, progress, color = '#2196f3', label }) {
  const cx = x1 + (x2 - x1) * progress;
  const cy = y1 + (y2 - y1) * progress;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1} strokeDasharray="4 4" opacity={0.3} />
      <circle cx={cx} cy={cy} r={6} fill={color}>
        <animate attributeName="r" values="5;7;5" dur="0.6s" repeatCount="indefinite" />
      </circle>
      {label && (
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={9} fill={color} fontWeight={600}
          fontFamily="system-ui">{label}</text>
      )}
    </g>
  );
}

function Connection({ x1, y1, x2, y2, active }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? '#2196f3' : '#78909c'} strokeWidth={active ? 2 : 1}
      strokeDasharray={active ? 'none' : '4 4'} opacity={active ? 0.8 : 0.3} />
  );
}

const SimulationViewer = memo(function SimulationViewer({ config }) {
  const { title, description, nodes, connections, steps, width = 600, height = 320 } = config;
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const intervalRef = useRef(null);
  const packetRef = useRef(null);

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  const advanceStep = useCallback(() => {
    setStepIdx(prev => {
      if (prev >= steps.length - 1) {
        setPlaying(false);
        return prev;
      }
      return prev + 1;
    });
    setPacketProgress(0);
  }, [steps.length]);

  // Auto-play
  useEffect(() => {
    if (playing) {
      const dur = (currentStep?.duration || 1500) / speedMultiplier;
      intervalRef.current = setTimeout(advanceStep, dur);
    }
    return () => clearTimeout(intervalRef.current);
  }, [playing, stepIdx, advanceStep, currentStep, speedMultiplier]);

  // Animate packet
  useEffect(() => {
    if (!currentStep?.packet) { setPacketProgress(0); return; }
    setPacketProgress(0);
    let start = null;
    const dur = ((currentStep.duration || 1500) * 0.7) / speedMultiplier;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setPacketProgress(p);
      if (p < 1) packetRef.current = requestAnimationFrame(animate);
    };
    packetRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(packetRef.current);
  }, [stepIdx, currentStep, speedMultiplier]);

  const handlePlay = () => {
    if (stepIdx >= steps.length - 1) { setStepIdx(-1); setPacketProgress(0); }
    setPlaying(true);
    if (stepIdx < 0) setStepIdx(0);
  };

  const handleReset = () => { setPlaying(false); setStepIdx(-1); setPacketProgress(0); };
  const handleStep = () => { setPlaying(false); advanceStep(); if (stepIdx < 0) setStepIdx(0); };
  const toggleSpeed = () => setSpeedMultiplier(s => s >= 2 ? 0.5 : s + 0.5);

  // Build node status map from current step
  const nodeStatus = {};
  if (currentStep?.nodeStates) {
    Object.entries(currentStep.nodeStates).forEach(([id, st]) => { nodeStatus[id] = st; });
  }

  const activeConns = new Set(currentStep?.activeConnections || []);

  return (
    <Box sx={{
      my: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper', overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, fontSize: '0.85rem' }}>
          ▶ {title}
        </Typography>
        <Chip label={`Step ${Math.max(stepIdx + 1, 0)}/${steps.length}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
      </Box>

      {/* SVG Canvas */}
      <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ minWidth: 400, maxHeight: 350, display: 'block' }}>
          <rect width={width} height={height} fill="transparent" />

          {/* Connections */}
          {connections.map((c, i) => {
            const from = nodes.find(n => n.id === c.from);
            const to = nodes.find(n => n.id === c.to);
            if (!from || !to) return null;
            return <Connection key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} active={activeConns.has(c.id)} />;
          })}

          {/* Animated packet */}
          {currentStep?.packet && (() => {
            const from = nodes.find(n => n.id === currentStep.packet.from);
            const to = nodes.find(n => n.id === currentStep.packet.to);
            if (!from || !to) return null;
            return <AnimatedPacket x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              progress={packetProgress} color={currentStep.packet.color} label={currentStep.packet.label} />;
          })()}

          {/* Nodes */}
          {nodes.map(n => (
            <Node key={n.id} x={n.x} y={n.y} label={n.label} icon={n.icon}
              status={nodeStatus[n.id] || 'idle'} />
          ))}
        </svg>
      </Box>

      {/* Step description */}
      <Box sx={{ px: 2, py: 1, minHeight: 40, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: currentStep ? 'text.primary' : 'text.disabled' }}>
          {currentStep?.description || description || 'Press play to start the simulation'}
        </Typography>
      </Box>

      {/* Progress */}
      <LinearProgress variant="determinate" value={steps.length > 0 ? ((stepIdx + 1) / steps.length) * 100 : 0}
        sx={{ height: 2 }} />

      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title="Reset"><IconButton size="small" onClick={handleReset}><Replay fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={playing ? 'Pause' : 'Play'}>
          <IconButton size="small" onClick={playing ? () => setPlaying(false) : handlePlay} color="primary">
            {playing ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Step"><IconButton size="small" onClick={handleStep}><SkipNext fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={`Speed: ${speedMultiplier}x`}>
          <IconButton size="small" onClick={toggleSpeed}>
            <Speed fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>{speedMultiplier}x</Typography>
      </Box>
    </Box>
  );
});

export default SimulationViewer;
