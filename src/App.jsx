import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Trash2, Search, X, Loader2, FileText, AlertTriangle } from 'lucide-react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-message">{message}</div>
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-button modal-button-confirm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const saveTimeoutRef = useRef(null);
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (currentNoteId && (title || content)) {
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(() => {
        saveNotes();
      }, 500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, currentNoteId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
        e.preventDefault();
        deleteCurrentNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNoteId, notes]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedNotes = await window.electronAPI.loadNotes();
      setNotes(loadedNotes);
    } catch (err) {
      setError('Failed to load notes');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = useCallback(async () => {
    try {
      const updatedNotes = notes.map(note =>
        note.id === currentNoteId
          ? { ...note, title, content, updatedAt: new Date().toISOString() }
          : note
      );
      await window.electronAPI.saveNotes(updatedNotes);
      setNotes(updatedNotes);
      setIsSaving(false);
    } catch (err) {
      setError('Failed to save note');
      console.error('Save error:', err);
      setIsSaving(false);
    }
  }, [notes, currentNoteId, title, content]);

  const createNewNote = useCallback(() => {
    const newNote = {
      id: Date.now(),
      title: '',
      content: '',
      createdAt: new Date().toISOString()
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    selectNote(newNote.id);
    window.electronAPI.saveNotes(updatedNotes);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [notes]);

  const selectNote = useCallback((id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setCurrentNoteId(id);
      setTitle(note.title);
      setContent(note.content);
      setError(null);
    }
  }, [notes]);

  const confirmDelete = useCallback(async () => {
    if (!currentNoteId) return;

    try {
      const updatedNotes = notes.filter(n => n.id !== currentNoteId);
      setNotes(updatedNotes);
      setCurrentNoteId(null);
      setTitle('');
      setContent('');
      setShowDeleteModal(false);
      await window.electronAPI.saveNotes(updatedNotes);
    } catch (err) {
      setError('Failed to delete note');
      console.error('Delete error:', err);
    }
  }, [currentNoteId, notes]);

  const deleteCurrentNote = useCallback(() => {
    if (!currentNoteId) return;
    setShowDeleteModal(true);
  }, [currentNoteId]);

  const updateTitle = useCallback((newTitle) => {
    setTitle(newTitle);
    setNotes(notes.map(note =>
      note.id === currentNoteId ? { ...note, title: newTitle } : note
    ));
  }, [notes, currentNoteId]);

  const updateContent = useCallback((newContent) => {
    setContent(newContent);
    setNotes(notes.map(note =>
      note.id === currentNoteId ? { ...note, content: newContent } : note
    ));
  }, [notes, currentNoteId]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  const currentNote = notes.find(n => n.id === currentNoteId);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <Loader2 size={48} className="spinner" />
        <p>Loading notes...</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      <div className="titlebar">
        {isSaving && (
          <div className="saving-indicator">
            <Loader2 size={14} className="spinner" />
            <span>Saving...</span>
          </div>
        )}
      </div>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-header">
            <h1>Notes</h1>
            <button 
              onClick={createNewNote} 
              className="btn-new"
              title="New Note (⌘N)"
              aria-label="Create new note"
            >
              <Plus size={24} />
            </button>
          </div>
          
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              id="search-input"
              type="text"
              className="search-input"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear" 
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <div className="empty-notes">
                <FileText size={48} />
                <p>{searchQuery ? 'No notes found' : 'No notes yet'}</p>
                {!searchQuery && (
                  <button onClick={createNewNote} className="btn-create-first">
                    Create your first note
                  </button>
                )}
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`note-item ${note.id === currentNoteId ? 'active' : ''}`}
                  onClick={() => selectNote(note.id)}
                >
                  <div className="note-item-title">{note.title || 'Untitled'}</div>
                  <div className="note-item-preview">
                    {note.content.substring(0, 60) || 'No content'}
                  </div>
                  <div className="note-item-date">
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="editor-container">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          
          {!currentNote ? (
            <div className="empty-state">
              <FileText size={64} />
              <p>Select a note or create a new one</p>
              <button onClick={createNewNote} className="btn-create-empty">
                <Plus size={20} />
                New Note
              </button>
            </div>
          ) : (
            <div className="editor">
              <input
                ref={titleInputRef}
                type="text"
                className="note-title"
                placeholder="Title"
                value={title}
                onChange={(e) => updateTitle(e.target.value)}
                aria-label="Note title"
              />
              <textarea
                ref={contentInputRef}
                className="note-content"
                placeholder="Start typing..."
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                aria-label="Note content"
              />
              <div className="editor-footer">
                <div className="note-meta">
                  {currentNote.updatedAt && (
                    <span>Last edited: {new Date(currentNote.updatedAt).toLocaleString()}</span>
                  )}
                </div>
                <button 
                  onClick={deleteCurrentNote} 
                  className="btn-delete"
                  title="Delete Note (⌘⌫)"
                  aria-label="Delete note"
                >
                  <Trash2 size={16} />
                  Delete Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
