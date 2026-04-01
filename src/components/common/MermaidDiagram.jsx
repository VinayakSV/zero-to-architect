import { useEffect, useRef, useState, memo } from 'react';
import { Box } from '@mui/material';
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

const MermaidDiagram = memo(function MermaidDiagram({ chart }) {
  const ref = useRef(null);
  const { mode } = useThemeMode();
  const [svg, setSvg] = useState('');

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

  return (
    <Box
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
      sx={{
        my: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2,
        border: '1px solid', borderColor: 'divider', overflow: 'auto',
        '& svg': { maxWidth: '100%', height: 'auto' },
      }}
    />
  );
});

export default MermaidDiagram;
