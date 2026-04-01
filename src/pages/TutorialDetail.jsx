import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Box, Typography, IconButton, Chip, CircularProgress, TextField, Button,
  Collapse, Paper, Divider,
} from '@mui/material';
import {
  ArrowBack, NoteAdd, Delete, Save, AccessTime,
  ArrowBackIos, ArrowForwardIos,
} from '@mui/icons-material';
import MarkdownViewer from '../components/common/MarkdownViewer';
import InterviewPanel from '../components/common/InterviewPanel';
import { getTutorialById, getAdjacentTutorials } from '../features/tutorials/tutorialRegistry';

// Build lookup map once at module level
const mdModules = import.meta.glob('../content/**/*.md', { query: '?raw', import: 'default' });
const mdKeysByFolder = {};
for (const key of Object.keys(mdModules)) {
  const parts = key.split('/');
  const folder = parts[parts.length - 2];
  if (!mdKeysByFolder[folder]) mdKeysByFolder[folder] = [];
  mdKeysByFolder[folder].push(key);
}

const mdCache = {};

const NOTES_KEY = 'tech-tutorial-notes-by-tutorial';

const loadTutorialNotes = (tutorialId) => {
  try {
    return (JSON.parse(localStorage.getItem(NOTES_KEY)) || {})[tutorialId] || [];
  } catch { return []; }
};

const saveTutorialNotes = (tutorialId, notes) => {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
    all[tutorialId] = notes;
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
};

function findMdKey(id, fileHint) {
  const keys = mdKeysByFolder[id] || [];
  if (fileHint) {
    const clean = fileHint.replace('./', '').replace('.md', '');
    return keys.find((k) => k.includes(clean));
  }
  return keys.find((k) => k.includes(`/${id}.md`) || k.includes(`/${id}/`)) || keys[0];
}

const getReadingTime = (text) => {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
};

export default function TutorialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [subPage, setSubPage] = useState(null);
  const tutorial = getTutorialById(id);
  const { prev, next } = useMemo(() => getAdjacentTutorials(id), [id]);
  const loadIdRef = useRef(0);

  const readingTime = useMemo(() => content ? getReadingTime(content) : '', [content]);

  const loadMd = useCallback((fileHint) => {
    const thisLoad = ++loadIdRef.current;
    const key = findMdKey(id, fileHint);

    if (!key) {
      setContent('# 🚧 Coming Soon\n\nThis tutorial is under construction. Check back soon!');
      setLoading(false);
      return;
    }

    if (mdCache[key]) {
      setContent(mdCache[key]);
      setLoading(false);
      return;
    }

    setLoading(true);
    mdModules[key]().then((md) => {
      if (thisLoad !== loadIdRef.current) return;
      mdCache[key] = md;
      setContent(md);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    setSubPage(null);
    loadMd(null);
    setNotes(loadTutorialNotes(id));
  }, [id, loadMd]);

  const handleSubNavigate = useCallback((href) => {
    setSubPage(href.replace('./', '').replace('.md', ''));
    loadMd(href);
  }, [loadMd]);

  const handleBackToMain = useCallback(() => {
    setSubPage(null);
    loadMd(null);
  }, [loadMd]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updated = [{ id: Date.now(), text: newNote, createdAt: new Date().toISOString() }, ...notes];
    setNotes(updated);
    saveTutorialNotes(id, updated);
    setNewNote('');
  };

  const handleDeleteNote = (noteId) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    saveTutorialNotes(id, updated);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => subPage ? handleBackToMain() : navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
            {tutorial?.title || id}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {tutorial?.subcategory && (
              <Chip label={tutorial.subcategory} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 22 }} />
            )}
            {readingTime && !loading && (
              <Chip
                icon={<AccessTime sx={{ fontSize: '0.8rem !important' }} />}
                label={readingTime}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            )}
            {subPage && (
              <Chip
                label={subPage.replace(/-/g, ' ')}
                size="small"
                variant="outlined"
                color="secondary"
                onDelete={handleBackToMain}
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            )}
            {!subPage && tutorial?.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
            ))}
          </Box>
        </Box>
        <Button
          size="small"
          variant={notesOpen ? 'contained' : 'outlined'}
          startIcon={<NoteAdd />}
          onClick={() => setNotesOpen(!notesOpen)}
          sx={{ textTransform: 'none', borderRadius: 2, flexShrink: 0 }}
        >
          Notes {notes.length > 0 && `(${notes.length})`}
        </Button>
      </Box>

      {/* Notes panel */}
      <Collapse in={notesOpen}>
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            📝 Notes for this tutorial
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small" fullWidth multiline maxRows={3}
              placeholder="Add a note about what you learned..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
            />
            <Button variant="contained" onClick={handleAddNote} disabled={!newNote.trim()}
              sx={{ minWidth: 'auto', px: 2 }}>
              <Save fontSize="small" />
            </Button>
          </Box>
          {notes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              No notes yet.
            </Typography>
          ) : (
            notes.map((note) => (
              <Box key={note.id} sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1, py: 1,
                borderBottom: '1px solid', borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}>
                <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {note.text}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Typography>
                  <IconButton size="small" onClick={() => handleDeleteNote(note.id)} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </Paper>
      </Collapse>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <MarkdownViewer content={content} onNavigate={handleSubNavigate} />
      )}

      {/* Interview Panel — floating FAB + drawer */}
      {!loading && !subPage && <InterviewPanel content={content} />}

      {/* Prev / Next navigation */}
      {!loading && !subPage && (prev || next) && (
        <>
          <Divider sx={{ mt: 6, mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            {prev ? (
              <Box
                onClick={() => navigate(`/tutorials/${prev.id}`)}
                sx={{
                  flex: 1, p: 2, borderRadius: 2, cursor: 'pointer',
                  border: '1px solid', borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <ArrowBackIos sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">Previous</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{prev.title}</Typography>
              </Box>
            ) : <Box sx={{ flex: 1 }} />}

            {next ? (
              <Box
                onClick={() => navigate(`/tutorials/${next.id}`)}
                sx={{
                  flex: 1, p: 2, borderRadius: 2, cursor: 'pointer', textAlign: 'right',
                  border: '1px solid', borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Next</Typography>
                  <ArrowForwardIos sx={{ fontSize: 12, color: 'text.secondary' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{next.title}</Typography>
              </Box>
            ) : <Box sx={{ flex: 1 }} />}
          </Box>
        </>
      )}
    </Box>
  );
}
