import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Box, IconButton, Modal, Tooltip, Typography, Slider } from '@mui/material';
import {
  ZoomIn, ZoomOut, Fullscreen, Close, RestartAlt,
  FitScreen, Download,
} from '@mui/icons-material';
import useThemeMode from '../../hooks/useThemeMode';

let mermaidId = 0;
let mermaidPromise = null;

const getMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      m.default.initialize({ startOnLoad: false, securityLevel: 'loose' });
      return m.default;
    });
  }
  return mermaidPromise;
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

const toolbarBtnSx = {
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  '&:hover': { bgcolor: 'action.hover' },
};

const MermaidDiagram = memo(function MermaidDiagram({ chart }) {
  const ref = useRef(null);
  const { mode } = useThemeMode();
  const [svg, setSvg] = useState('');
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  useEffect(() => {
    let cancelled = false;
    getMermaid().then((mermaid) => {
      if (cancelled) return;
      mermaid.initialize({
        startOnLoad: false,
        theme: mode === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
      });
      const id = `mermaid-${++mermaidId}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      }).catch(() => {});
    });
    return () => { cancelled = true; };
  }, [chart, mode]);

  const handleOpen = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleZoomIn = useCallback(() =>
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)), []);

  const handleZoomOut = useCallback(() =>
    setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)), []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleFit = useCallback(() => {
    setZoom(0.5);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      return Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM);
    });
  }, []);

  const handlePointerDown = useCallback((e) => {
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    setPan({ x: d.startPanX + (e.clientX - d.startX), y: d.startPanY + (e.clientY - d.startY) });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current.dragging = false;
  }, []);

  const handleDownload = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  if (!svg) return null;

  return (
    <>
      {/* Inline diagram with expand button */}
      <Box
        sx={{
          my: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2,
          border: '1px solid', borderColor: 'divider', overflow: 'auto',
          position: 'relative', group: 'mermaid',
          '& svg': { maxWidth: '100%', height: 'auto' },
          '&:hover .expand-btn': { opacity: 1 },
        }}
      >
        <Box ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />
        <Tooltip title="Expand diagram" placement="left">
          <IconButton
            className="expand-btn"
            onClick={handleOpen}
            size="small"
            sx={{
              position: 'absolute', top: 8, right: 8, opacity: 0,
              transition: 'opacity 0.2s', ...toolbarBtnSx,
            }}
          >
            <Fullscreen fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Fullscreen modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'fixed', inset: 0, bgcolor: 'background.default',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Toolbar */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
            borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
            flexShrink: 0,
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 'auto' }}>
              Diagram Viewer
            </Typography>

            <Tooltip title="Zoom Out (−)"><IconButton size="small" onClick={handleZoomOut} sx={toolbarBtnSx}><ZoomOut fontSize="small" /></IconButton></Tooltip>

            <Box sx={{ width: 120, mx: 1 }}>
              <Slider
                size="small"
                value={zoom}
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={ZOOM_STEP}
                onChange={(_, v) => setZoom(v)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
              />
            </Box>

            <Tooltip title="Zoom In (+)"><IconButton size="small" onClick={handleZoomIn} sx={toolbarBtnSx}><ZoomIn fontSize="small" /></IconButton></Tooltip>

            <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 0.5 }} />

            <Tooltip title="Fit to screen"><IconButton size="small" onClick={handleFit} sx={toolbarBtnSx}><FitScreen fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Reset"><IconButton size="small" onClick={handleReset} sx={toolbarBtnSx}><RestartAlt fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Download SVG"><IconButton size="small" onClick={handleDownload} sx={toolbarBtnSx}><Download fontSize="small" /></IconButton></Tooltip>

            <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 0.5 }} />

            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 45, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </Typography>

            <Tooltip title="Close (Esc)"><IconButton size="small" onClick={handleClose} sx={toolbarBtnSx}><Close fontSize="small" /></IconButton></Tooltip>
          </Box>

          {/* Diagram canvas — pannable & zoomable */}
          <Box
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            sx={{
              flex: 1, overflow: 'hidden', cursor: dragRef.current.dragging ? 'grabbing' : 'grab',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              userSelect: 'none',
            }}
          >
            <Box
              dangerouslySetInnerHTML={{ __html: svg }}
              sx={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: dragRef.current.dragging ? 'none' : 'transform 0.15s ease',
                '& svg': { maxWidth: 'none', height: 'auto' },
              }}
            />
          </Box>

          {/* Bottom hint */}
          <Box sx={{
            textAlign: 'center', py: 0.5, bgcolor: 'background.paper',
            borderTop: '1px solid', borderColor: 'divider',
          }}>
            <Typography variant="caption" color="text.disabled">
              Scroll to zoom • Drag to pan • Esc to close
            </Typography>
          </Box>
        </Box>
      </Modal>
    </>
  );
});

export default MermaidDiagram;
