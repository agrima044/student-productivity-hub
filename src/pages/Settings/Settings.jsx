import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Sliders, 
  Type, 
  Database,
  Check
} from 'lucide-react';
import './Settings.css';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  // Font Size Scaling State
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSizeScale') || 'medium'; // small, medium, large
  });

  // Target Study Goal State
  const [studyGoal, setStudyGoal] = useState(user?.studyGoal || 20);

  // Apply font scale to document element
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'small') {
      root.style.fontSize = '14px';
    } else if (fontSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
    localStorage.setItem('fontSizeScale', fontSize);
  }, [fontSize]);

  const handleSaveGoal = (e) => {
    e.preventDefault();
    updateProfile({ studyGoal: parseInt(studyGoal, 10) || 20 });
    addToast('Target Saved', `Weekly study target set to ${studyGoal} hours.`, 'success');
  };

  // 1. Export Data as JSON
  const handleExportData = () => {
    try {
      const backupData = {
        notes: JSON.parse(localStorage.getItem('notes') || '[]'),
        tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
        timetable: JSON.parse(localStorage.getItem('timetable') || '[]'),
        attendance: JSON.parse(localStorage.getItem('attendance') || '[]'),
        goals: JSON.parse(localStorage.getItem('goals') || '[]'),
        notifications: JSON.parse(localStorage.getItem('notifications') || '[]'),
        user: JSON.parse(localStorage.getItem('user') || '{}'),
        theme: localStorage.getItem('theme') || 'dark',
        fontSizeScale: localStorage.getItem('fontSizeScale') || 'medium',
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `student_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      addToast('Backup Created', 'Your productivity backup JSON was downloaded.', 'success');
    } catch (error) {
      console.error(error);
      addToast('Export Failed', 'An error occurred while packaging data.', 'danger');
    }
  };

  // 2. Import Data from JSON
  const handleImportData = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        // Validation checks
        if (!parsed.notes || !parsed.tasks || !parsed.timetable || !parsed.attendance || !parsed.goals) {
          addToast('Import Failed', 'Invalid file layout. Missing key databases.', 'danger');
          return;
        }

        // Save back into local storage
        localStorage.setItem('notes', JSON.stringify(parsed.notes));
        localStorage.setItem('tasks', JSON.stringify(parsed.tasks));
        localStorage.setItem('timetable', JSON.stringify(parsed.timetable));
        localStorage.setItem('attendance', JSON.stringify(parsed.attendance));
        localStorage.setItem('goals', JSON.stringify(parsed.goals));
        if (parsed.notifications) localStorage.setItem('notifications', JSON.stringify(parsed.notifications));
        if (parsed.user) localStorage.setItem('user', JSON.stringify(parsed.user));
        if (parsed.theme) localStorage.setItem('theme', parsed.theme);
        if (parsed.fontSizeScale) localStorage.setItem('fontSizeScale', parsed.fontSizeScale);

        addToast('Data Imported Successfully', 'Restoring application states...', 'success');
        
        // Reload screen to reload all Contexts with new storage values
        setTimeout(() => {
          window.location.reload();
        }, 1200);

      } catch (error) {
        addToast('Import Failed', 'Could not parse JSON file. Ensure file is not corrupted.', 'danger');
      }
    };

    fileReader.readAsText(file);
  };

  return (
    <div className="settings-container">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>System Settings</h2>

      {/* 1. Theme Configuration */}
      <Card className="settings-section-card">
        <h3 className="settings-section-title flex items-center gap-2">
          {theme === 'dark' ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
          <span>Appearance</span>
        </h3>
        
        <div className="settings-row">
          <div className="settings-meta">
            <span className="settings-label">Interface Theme</span>
            <span className="settings-desc">Choose between a light theme or deep dark mode layout.</span>
          </div>
          <Button onClick={toggleTheme} variant="secondary">
            {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
          </Button>
        </div>
      </Card>

      {/* 2. Text Scaling */}
      <Card className="settings-section-card">
        <h3 className="settings-section-title flex items-center gap-2">
          <Type size={16} className="text-primary" />
          <span>Typography scale</span>
        </h3>

        <div className="settings-row">
          <div className="settings-meta">
            <span className="settings-label">Font Size Scale</span>
            <span className="settings-desc">Adjust the base text size to improve accessibility.</span>
          </div>

          <div className="font-size-buttons">
            <Button
              variant={fontSize === 'small' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFontSize('small')}
            >
              Small
            </Button>
            <Button
              variant={fontSize === 'medium' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFontSize('medium')}
            >
              Medium
            </Button>
            <Button
              variant={fontSize === 'large' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFontSize('large')}
            >
              Large
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Productivity Targets */}
      <Card className="settings-section-card">
        <h3 className="settings-section-title flex items-center gap-2">
          <Sliders size={16} className="text-primary" />
          <span>Productivity Goals</span>
        </h3>

        <form onSubmit={handleSaveGoal} className="flex flex-col gap-4">
          <div className="settings-row">
            <div className="settings-meta">
              <span className="settings-label">Weekly Study Hours Target</span>
              <span className="settings-desc">Set your study hour milestone target (visualized in Performance charts).</span>
            </div>
            
            <input
              type="number"
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value)}
              className="input-field"
              style={{ width: '100px' }}
              min="1"
              max="168"
              required
            />
          </div>

          <div className="flex" style={{ justifyContent: 'flex-end' }}>
            <Button type="submit" size="sm">
              Save Target
            </Button>
          </div>
        </form>
      </Card>

      {/* 4. Export & Import Backups */}
      <Card className="settings-section-card">
        <h3 className="settings-section-title flex items-center gap-2">
          <Database size={16} className="text-primary" />
          <span>Backup & Portability</span>
        </h3>

        <div className="settings-row">
          <div className="settings-meta">
            <span className="settings-label">Export / Import System Data</span>
            <span className="settings-desc">
              Back up all your notes, tasks, timetables, goals, and attendance records as a single JSON file. You can import this file to restore your data on other devices.
            </span>
          </div>
        </div>

        <div className="export-import-actions mt-2">
          <Button onClick={handleExportData} icon={Download} variant="primary">
            Export JSON
          </Button>

          <label className="file-input-label">
            <Upload size={16} />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
