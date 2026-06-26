import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Search, FileText, CheckSquare, Settings, Moon, Sun, Terminal } from 'lucide-react';

export const CommandBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef(null);
  
  const navigate = useNavigate();
  const { notes, addNote } = useNotes();
  const { tasks, addTask } = useTasks();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  // Keyboard listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Custom trigger from Header search click
    const handleCustomTrigger = () => {
      setIsOpen(true);
      setSearch('');
      setSelectedIndex(0);
    };
    window.addEventListener('toggle-command-bar', handleCustomTrigger);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-command-bar', handleCustomTrigger);
    };
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  // Commands list
  const commands = [
    {
      id: 'cmd-theme',
      title: `Toggle ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
      type: 'command',
      icon: theme === 'light' ? Moon : Sun,
      action: () => {
        toggleTheme();
        addToast('Theme Switched', `Active theme is now ${theme === 'light' ? 'Dark' : 'Light'}`, 'info');
      }
    },
    {
      id: 'cmd-note',
      title: 'Create Quick Note',
      type: 'command',
      icon: FileText,
      action: () => {
        addNote('New Note from Command Bar', '', 'General');
        addToast('Note Created', 'Quick draft added.', 'success');
        navigate('/notes');
      }
    },
    {
      id: 'cmd-task',
      title: 'Go to Tasks Board',
      type: 'command',
      icon: CheckSquare,
      action: () => navigate('/tasks')
    },
    {
      id: 'cmd-settings',
      title: 'Go to Settings',
      type: 'command',
      icon: Settings,
      action: () => navigate('/settings')
    }
  ];

  // Filter matched results
  const matchedCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase())
  );

  const matchedNotes = notes
    .filter((note) => note.title.toLowerCase().includes(search.toLowerCase()))
    .map((note) => ({
      id: note.id,
      title: note.title,
      type: 'note',
      icon: FileText,
      action: () => {
        navigate('/notes');
        // Trigger select event if Notes page handles it
      }
    }));

  const matchedTasks = tasks
    .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
    .map((task) => ({
      id: task.id,
      title: task.title,
      type: 'task',
      icon: CheckSquare,
      action: () => {
        navigate('/tasks');
      }
    }));

  const allItems = [...matchedCommands, ...matchedNotes, ...matchedTasks];

  // Keyboard navigation through list items
  useEffect(() => {
    const handleNavigation = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, selectedIndex, allItems]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => e.target.classList.contains('modal-overlay') && handleClose()}
      style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
    >
      <div 
        ref={containerRef}
        className="ui-card" 
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '0.875rem 1.25rem' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }} />
          <input
            type="text"
            placeholder="Type a command or search notes & tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '0.9375rem',
              color: 'var(--text-primary)'
            }}
            autoFocus
          />
          <Badge variant="secondary">ESC</Badge>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
          {allItems.length === 0 ? (
            <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No matches found.
            </div>
          ) : (
            allItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    handleClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                    color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={16} style={{ opacity: 0.8 }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.title}</span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6 }}>
                    {item.type}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div 
          style={{
            padding: '0.625rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
          </div>
          <span>Ctrl+K Toggle</span>
        </div>
      </div>
    </div>
  );
};

export default CommandBar;
