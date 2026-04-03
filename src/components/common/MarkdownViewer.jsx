import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter/dist/esm/index';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, Typography } from '@mui/material';
import MermaidDiagram from './MermaidDiagram';
import useThemeMode from '../../hooks/useThemeMode';

const markdownSx = {
  '& h1': { fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700, mt: 4, mb: 2, color: 'primary.main' },
  '& h2': { fontSize: { xs: '1.25rem', sm: '1.6rem' }, fontWeight: 600, mt: 3, mb: 1.5, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', pb: 1 },
  '& h3': { fontSize: { xs: '1.1rem', sm: '1.3rem' }, fontWeight: 600, mt: 2.5, mb: 1, color: 'text.primary' },
  '& h4': { fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 600, mt: 2, mb: 1 },
  '& p': { mb: 2, lineHeight: 1.8, color: 'text.secondary', fontSize: { xs: '0.9rem', sm: '1rem' } },
  '& ul, & ol': { pl: { xs: 2, sm: 3 }, mb: 2, color: 'text.secondary' },
  '& li': { mb: 0.5, lineHeight: 1.7, fontSize: { xs: '0.9rem', sm: '1rem' } },
  '& blockquote': {
    borderLeft: '4px solid', borderColor: 'primary.main',
    pl: 2, py: 0.5, my: 2, bgcolor: 'action.hover', borderRadius: '0 8px 8px 0',
  },
  '& table': { width: '100%', borderCollapse: 'collapse', my: 2, display: 'block', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  '& th, & td': { border: '1px solid', borderColor: 'divider', p: { xs: 0.75, sm: 1.5 }, textAlign: 'left', fontSize: { xs: '0.78rem', sm: '0.875rem' } },
  '& th': { bgcolor: 'action.hover', fontWeight: 600 },
  '& code:not(pre code)': {
    bgcolor: 'var(--code-bg)', px: 0.8, py: 0.2, borderRadius: 1,
    fontSize: '0.875em', fontFamily: "'Fira Code', monospace",
  },
  '& hr': { border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 3 },
  '& img': { maxWidth: '100%', borderRadius: 2 },
  '& strong': { color: 'text.primary' },
  '& .callout-info, & .callout-warn, & .callout-tip, & .callout-scenario, & .callout-interview': {
    p: 2, my: 2, borderRadius: 2, border: '1px solid',
    animation: 'calloutIn 0.4s ease both',
    '@keyframes calloutIn': {
      from: { opacity: 0, transform: 'translateX(-8px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
  },
  '& .callout-info': { borderColor: '#4a90d9', bgcolor: 'rgba(74,144,217,0.08)', borderLeft: '4px solid #4a90d9' },
  '& .callout-warn': { borderColor: '#d9a04a', bgcolor: 'rgba(217,160,74,0.08)', borderLeft: '4px solid #d9a04a' },
  '& .callout-tip': { borderColor: '#4a7c6f', bgcolor: 'rgba(74,124,111,0.08)', borderLeft: '4px solid #4a7c6f' },
  '& .callout-scenario': { borderColor: '#9b59b6', bgcolor: 'rgba(155,89,182,0.08)', borderLeft: '4px solid #9b59b6' },
  '& .callout-interview': { borderColor: '#e74c3c', bgcolor: 'rgba(231,76,60,0.06)', borderLeft: '4px solid #e74c3c' },
  '& .step': {
    p: 2, my: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
    bgcolor: 'background.paper',
    animation: 'stepIn 0.3s ease both',
    '@keyframes stepIn': {
      from: { opacity: 0, transform: 'translateY(8px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  },
};

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeRaw];

const MarkdownViewer = memo(function MarkdownViewer({ content, onNavigate }) {
  const { mode } = useThemeMode();

  const components = useMemo(() => ({
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match?.[1];
      const codeStr = String(children).replace(/\n$/, '');

      if (lang === 'mermaid') return <MermaidDiagram chart={codeStr} />;

      return !inline && lang ? (
        <Box sx={{ my: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ px: 2, py: 0.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">{lang}</Typography>
          </Box>
          <SyntaxHighlighter
            style={mode === 'dark' ? oneDark : oneLight}
            language={lang}
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.8rem' }}
            {...props}
          >
            {codeStr}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <code className={className} {...props}>{children}</code>
      );
    },
    a({ href, children, ...props }) {
      if (href && href.endsWith('.md')) {
        return (
          <Box
            component="a"
            onClick={(e) => { e.preventDefault(); onNavigate?.(href); }}
            sx={{
              color: 'primary.main', cursor: 'pointer', textDecoration: 'underline',
              fontWeight: 600, '&:hover': { color: 'primary.dark' },
            }}
            {...props}
          >
            {children}
          </Box>
        );
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },
  }), [mode, onNavigate]);

  return (
    <Box sx={markdownSx}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
});

export default MarkdownViewer;
