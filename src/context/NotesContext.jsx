import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotesContext = createContext();

const MOCK_NOTES = [
  {
    id: 'note-1',
    title: 'Semester Prep Checklist 📚',
    content: '1. Register for CS 301 and MATH 205\n2. Purchase notebooks and digital stationery\n3. Schedule study slots in the productivity planner\n4. Review syllabus for grading rubrics',
    category: 'General',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'note-2',
    title: 'React Hooks Cheat-Sheet ⚛️',
    content: '- useState: Manages local component state\n- useEffect: Handles side effects (fetching, subscriptions, manual DOM edits)\n- useContext: Consumes context values globally without prop-drilling\n- useMemo / useCallback: Performance tuning and caching computations',
    category: 'Computer Science',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

export const NotesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);

  // Load notes initially
  useEffect(() => {
    const fetchNotes = async () => {
      if (isAuthenticated) {
        try {
          const data = await api.notes.getAll();
          if (data) {
            setNotes(data);
            return;
          }
        } catch (err) {
          console.warn('Failed to load notes from API, loading local storage', err);
        }
      }
      
      // Fallback
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (e) {
          setNotes(MOCK_NOTES);
        }
      } else {
        setNotes(MOCK_NOTES);
      }
    };

    fetchNotes();
  }, [isAuthenticated]);

  // Sync to local storage for offline support
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  const addNote = async (title, content, category = 'General') => {
    const noteData = {
      title: title || 'Untitled Note',
      content: content || '',
      category: category || 'General'
    };

    try {
      const newNote = await api.notes.create(noteData);
      if (newNote) {
        setNotes((prev) => [newNote, ...prev]);
        return newNote;
      }
    } catch (err) {
      console.warn('API note creation failed, saving locally', err);
    }

    // Local Fallback
    const localNote = {
      id: Date.now().toString(),
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes((prev) => [localNote, ...prev]);
    return localNote;
  };

  const updateNote = async (id, title, content, category) => {
    // Map locally first for responsive UI
    setNotes((prev) =>
      prev.map((note) => {
        const noteId = note._id || note.id;
        if (noteId === id) {
          return {
            ...note,
            title: title !== undefined ? title : note.title,
            content: content !== undefined ? content : note.content,
            category: category !== undefined ? category : note.category,
            updatedAt: new Date().toISOString()
          };
        }
        return note;
      })
    );

    // Sync to backend in background
    try {
      const noteToUpdate = notes.find((n) => (n._id || n.id) === id);
      if (noteToUpdate && noteToUpdate._id) {
        await api.notes.update(id, { title, content, category });
      }
    } catch (err) {
      console.warn('API note update failed, background save only', err);
    }
  };

  const deleteNote = async (id) => {
    setNotes((prev) => prev.filter((note) => (note._id || note.id) !== id));

    try {
      const noteToDelete = notes.find((n) => (n._id || n.id) === id);
      if (noteToDelete && noteToDelete._id) {
        await api.notes.delete(id);
      }
    } catch (err) {
      console.warn('API note deletion failed, background only', err);
    }
  };

  // Get unique categories for filters
  const categories = ['All', ...new Set(notes.map((note) => note.category || 'General'))];

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, categories }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
export default NotesContext;
