import React, { useState, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  Plus, 
  Search, 
  Trash2, 
  ChevronLeft, 
  FileText, 
  Check, 
  FolderPlus,
  Save,
  Eye,
  Edit
} from 'lucide-react';
import './Notes.css';

export const Notes = () => {
  const { notes, addNote, updateNote, deleteNote, categories } = useNotes();
  const { addToast } = useToast();

  const [activeNoteId, setActiveNoteId] = useState(() => {
    return notes.length > 0 ? notes[0].id : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'editor'
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Form states for the active note (to make typing smooth without context re-render lags)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isSaving, setIsSaving] = useState(false);
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState('');

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Sync active note details to local form states when activeNoteId changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setCategory(activeNote.category || 'General');
      setIsPreviewMode(false);
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
      setIsPreviewMode(false);
    }
  }, [activeNoteId, activeNote]);

  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br />');
    return { __html: html };
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!activeNoteId || !activeNote) return;

    // Check if anything actually changed to prevent endless renders
    if (
      title === activeNote.title &&
      content === activeNote.content &&
      category === activeNote.category
    ) {
      return;
    }

    setIsSaving(true);
    const saveTimer = setTimeout(() => {
      updateNote(activeNoteId, title, content, category);
      setIsSaving(false);
    }, 600); // 600ms debounce

    return () => clearTimeout(saveTimer);
  }, [title, content, category, activeNoteId]);

  const handleCreateNote = () => {
    const defaultTitle = 'New Note';
    const defaultContent = '';
    const cat = selectedCategory !== 'All' ? selectedCategory : 'General';
    const newNote = addNote(defaultTitle, defaultContent, cat);
    setActiveNoteId(newNote.id);
    setMobileView('editor');
    addToast('Note Created', 'Draft note added to your notebook.', 'success');
  };

  const handleDeleteNote = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;

    deleteNote(id);
    addToast('Note Deleted', 'The note has been removed.', 'info');
    
    // Choose another active note if the deleted one was active
    if (activeNoteId === id) {
      const remainingNotes = notes.filter((n) => n.id !== id);
      if (remainingNotes.length > 0) {
        setActiveNoteId(remainingNotes[0].id);
      } else {
        setActiveNoteId(null);
      }
      setMobileView('list');
    }
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryText.trim()) return;
    setCategory(newCategoryText.trim());
    setNewCategoryText('');
    setShowCatInput(false);
    addToast('Category Added', 'Assigned custom category to current note.', 'success');
  };

  // Filter notes based on search & category selection
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'All' || note.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="notes-page">
      {/* Sidebar List Section */}
      <div className={`notes-sidebar ${mobileView === 'editor' ? 'hidden' : ''}`}>
        <div className="notes-sidebar-header">
          <Button onClick={handleCreateNote} icon={Plus} fullWidth>
            Create New Note
          </Button>
          <div className="notes-search-wrapper">
            <Search size={16} className="notes-search-icon" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notes-search-input"
            />
          </div>
        </div>

        {/* Category horizontal scrolling bar */}
        <div className="notes-categories-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notes Items List */}
        <div className="notes-list">
          {filteredNotes.length === 0 ? (
            <div className="dropdown-empty">
              <p>No notes found</p>
              <span className="text-xs text-muted">Create one or modify filters.</span>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`note-item ${activeNoteId === note.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveNoteId(note.id);
                  setMobileView('editor');
                }}
              >
                <div className="note-item-header">
                  <h4 className="note-item-title">{note.title || 'Untitled Note'}</h4>
                  <span className="note-item-category">{note.category}</span>
                </div>
                <p className="note-item-snippet">
                  {note.content || <span style={{ fontStyle: 'italic' }}>Empty content...</span>}
                </p>
                <span className="note-item-date">
                  {new Date(note.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note Editor Area */}
      <div className={`notes-editor ${mobileView === 'list' ? 'hidden' : ''}`}>
        {activeNote ? (
          <>
            {/* Editor Toolbar Header */}
            <div className="editor-header">
              <div className="editor-meta">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileView('list')}
                  className="menu-toggle"
                  style={{ marginRight: '0.5rem', display: 'flex' }}
                >
                  <ChevronLeft size={16} />
                  <span>Notes</span>
                </Button>
                
                {showCatInput ? (
                  <form onSubmit={handleCreateCategory} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Category name..."
                      value={newCategoryText}
                      onChange={(e) => setNewCategoryText(e.target.value)}
                      className="input-field"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '120px' }}
                      required
                      autoFocus
                    />
                    <Button type="submit" size="sm" variant="success" style={{ padding: '0.25rem 0.5rem' }}>
                      <Check size={12} />
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowCatInput(false)} style={{ padding: '0.25rem 0.5rem' }}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="editor-category-badge">{category}</span>
                    <button 
                      onClick={() => setShowCatInput(true)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}
                      title="Change category"
                    >
                      <FolderPlus size={14} />
                    </button>
                  </div>
                )}
                
                <span className="editor-status-text">
                  {isSaving ? 'Saving...' : (
                    <>
                      <Check size={12} color="var(--color-success)" />
                      <span>Auto-saved</span>
                    </>
                  )}
                </span>
              </div>

              <div className="editor-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  icon={isPreviewMode ? Edit : Eye}
                >
                  {isPreviewMode ? 'Edit Note' : 'Preview'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteNote(activeNote.id)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Note Title & Content Body Input Fields */}
            <div className="editor-body">
              <input
                type="text"
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="editor-title-input"
                disabled={isPreviewMode}
              />
              
              {isPreviewMode ? (
                <div 
                  className="editor-textarea markdown-preview"
                  dangerouslySetInnerHTML={renderMarkdown(content)}
                  style={{ overflowY: 'auto', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }}
                />
              ) : (
                <textarea
                  placeholder="Start writing thoughts, tasks, lectures, or plans..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="editor-textarea"
                />
              )}
            </div>
          </>
        ) : (
          <div className="notes-empty-state">
            <FileText size={64} style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
            <h2>No Note Selected</h2>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Select an existing note from the sidebar, or create a new note to start writing.
            </p>
            <Button onClick={handleCreateNote} className="mt-4" icon={Plus}>
              Create New Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
