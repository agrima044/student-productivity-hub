import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { Input } from '../../components/Input';
import { Plus, Trash2, CheckCircle, XCircle, Calculator, AlertTriangle } from 'lucide-react';
import './Attendance.css';

export const Attendance = () => {
  const { 
    attendance, 
    addSubject, 
    updateSubject, 
    deleteSubject, 
    logAttendance, 
    overallPercentage 
  } = useAttendance();
  const { addToast } = useToast();

  // Create Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [initialAtt, setInitialAtt] = useState('0');
  const [initialCond, setInitialCond] = useState('0');
  const [showForm, setShowForm] = useState(false);

  // What-If Calculator State
  const [calcSubjectId, setCalcSubjectId] = useState(attendance[0]?.id || '');
  const [consecutiveAttend, setConsecutiveAttend] = useState('5');

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubName.trim()) {
      addToast('Validation Error', 'Subject name is required', 'warning');
      return;
    }

    const att = parseInt(initialAtt, 10) || 0;
    const cond = parseInt(initialCond, 10) || 0;

    if (att > cond) {
      addToast('Validation Error', 'Attended classes cannot exceed conducted classes', 'warning');
      return;
    }

    addSubject(newSubName.trim(), att, cond);
    addToast('Subject Added', `Started tracking attendance for ${newSubName.trim()}`, 'success');
    setNewSubName('');
    setInitialAtt('0');
    setInitialCond('0');
    setShowForm(false);
  };

  const handleDeleteSubject = (id, sub) => {
    const confirm = window.confirm(`Stop tracking attendance for "${sub}"?`);
    if (confirm) {
      deleteSubject(id);
      addToast('Subject Removed', `Deleted ${sub} records.`, 'info');
      if (calcSubjectId === id && attendance.length > 1) {
        const remaining = attendance.filter(a => a.id !== id);
        setCalcSubjectId(remaining[0].id);
      }
    }
  };

  // Perform What-If Computations
  const getCalculatorResults = () => {
    const selectedSub = attendance.find((a) => a.id === calcSubjectId);
    if (!selectedSub) return null;

    const A = selectedSub.attended;
    const C = selectedSub.conducted;
    const X = parseInt(consecutiveAttend, 10) || 0;

    // Current Percentage
    const currentPercent = C > 0 ? (A / C) * 100 : 100;

    // Projection: (A + X) / (C + X)
    const projectedPercent = (C + X) > 0 ? ((A + X) / (C + X)) * 100 : 100;

    // Max consecutive misses to keep >= 75%
    // Solve: A / (C + Y) >= 0.75  => Y <= A / 0.75 - C
    let maxMisses = 0;
    if (currentPercent >= 75) {
      maxMisses = Math.floor(A / 0.75 - C);
      maxMisses = Math.max(0, maxMisses);
    }

    return {
      subject: selectedSub.subject,
      currentPercent,
      projectedPercent,
      maxMisses
    };
  };

  const calcResults = getCalculatorResults();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Attendance Tracker</h2>
          <p className="text-sm text-muted">Keep your course attendances above 75% to stay academic compliant.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={overallPercentage >= 75 ? 'success' : 'danger'} style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            Overall: {overallPercentage.toFixed(1)}%
          </Badge>
          <Button onClick={() => setShowForm(!showForm)} icon={Plus}>
            {showForm ? 'Close' : 'Add Subject'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAddSubject} className="flex flex-col gap-2">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Track New Course</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }} className="profile-details-grid">
              <Input
                label="Subject Name"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="e.g. Physics, Literature"
                required
              />
              <Input
                label="Classes Attended"
                type="number"
                value={initialAtt}
                onChange={(e) => setInitialAtt(e.target.value)}
                min="0"
              />
              <Input
                label="Classes Conducted"
                type="number"
                value={initialCond}
                onChange={(e) => setInitialCond(e.target.value)}
                min="0"
              />
            </div>
            <div className="flex gap-4 mt-2" style={{ justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Tracker
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="attendance-page">
        {/* Main Subject Tracker List */}
        <div className="attendance-list">
          {attendance.length === 0 ? (
            <Card>
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <h3>No subjects tracked yet</h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Add a subject above to monitor your attendance scores.</p>
              </div>
            </Card>
          ) : (
            attendance.map((item) => {
              const percentage = item.conducted > 0 ? (item.attended / item.conducted) * 100 : 100;
              const isDanger = percentage < 75;
              
              return (
                <Card key={item.id} className="attendance-card">
                  <div className="attendance-card-header">
                    <div className="flex items-center gap-3">
                      <span className="attendance-subject-title">{item.subject}</span>
                      {isDanger && (
                        <Badge variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertTriangle size={10} /> Below 75%
                        </Badge>
                      )}
                    </div>

                    <div className="attendance-quick-log">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          logAttendance(item.id, true);
                          addToast('Attendance Logged', `Logged present for ${item.subject}`, 'success');
                        }}
                        icon={CheckCircle}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          logAttendance(item.id, false);
                          addToast('Attendance Logged', `Logged absent for ${item.subject}`, 'warning');
                        }}
                        icon={XCircle}
                      >
                        Absent
                      </Button>
                    </div>
                  </div>

                  <div className="attendance-stats-row">
                    <ProgressBar 
                      value={item.attended} 
                      max={item.conducted} 
                      label={`${item.attended} / ${item.conducted} lectures attended`}
                    />
                    
                    <div className="flex items-center justify-between" style={{ marginLeft: 'auto', gap: '1rem' }}>
                      <div className="attendance-actions">
                        <div className="flex flex-col items-center">
                          <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ATTENDED</span>
                          <div className="flex items-center gap-1 mt-1">
                            <button className="attendance-counter-btn" onClick={() => updateSubject(item.id, item.attended - 1, item.conducted)}>-</button>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.attended}</span>
                            <button className="attendance-counter-btn" onClick={() => updateSubject(item.id, item.attended + 1, item.conducted)}>+</button>
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CONDUCTED</span>
                          <div className="flex items-center gap-1 mt-1">
                            <button className="attendance-counter-btn" onClick={() => updateSubject(item.id, item.attended, item.conducted - 1)}>-</button>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.conducted}</span>
                            <button className="attendance-counter-btn" onClick={() => updateSubject(item.id, item.attended, item.conducted + 1)}>+</button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSubject(item.id, item.subject)}
                        className="header-btn"
                        style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer', padding: '0.5rem' }}
                        title="Delete Tracker"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* What-If Prediction Calculator Sidebar */}
        <div className="attendance-calculator">
          {attendance.length > 0 && calcResults ? (
            <Card className="calculator-card">
              <h3 className="calculator-title flex items-center gap-2">
                <Calculator size={18} className="text-primary" />
                <span>Attendance Predictor</span>
              </h3>

              <Input
                label="Select Subject"
                type="select"
                value={calcSubjectId}
                onChange={(e) => setCalcSubjectId(e.target.value)}
                options={attendance.map((a) => ({ value: a.id, label: a.subject }))}
              />

              <Input
                label="Attend Consecutively"
                type="number"
                value={consecutiveAttend}
                onChange={(e) => setConsecutiveAttend(e.target.value)}
                placeholder="e.g. 5"
                min="0"
              />

              <div className="calculator-result-box">
                <div className="calculator-stat">
                  <span>Current:</span>
                  <span className={`font-semibold ${calcResults.currentPercent >= 75 ? 'text-success' : 'text-danger'}`} style={{ color: calcResults.currentPercent >= 75 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {calcResults.currentPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="calculator-stat">
                  <span>Projected Percentage:</span>
                  <span className="calculator-highlight font-semibold">
                    {calcResults.projectedPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="calculator-stat" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bypass Margin:</span>
                  {calcResults.currentPercent < 75 ? (
                    <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: '500' }}>
                      Currently below 75%! You must attend more classes to recover.
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                      You can miss up to{' '}
                      <strong style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                        {calcResults.maxMisses}
                      </strong>{' '}
                      lectures in a row without falling below 75%.
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Create at least one subject tracker to unlock the Predictor tool.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
