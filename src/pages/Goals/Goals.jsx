import React, { useState } from 'react';
import { useGoals } from '../../context/GoalsContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Plus, Trash2, Calendar, Target, CheckCircle2, ChevronRight, X } from 'lucide-react';
import './Goals.css';

export const Goals = () => {
  const { goals, addGoal, deleteGoal, toggleMilestone } = useGoals();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Academic');
  const [milestones, setMilestones] = useState([]);
  const [currentMilestoneText, setCurrentMilestoneText] = useState('');

  const resetForm = () => {
    setTitle('');
    setTargetDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setCategory('Academic');
    setMilestones([]);
    setCurrentMilestoneText('');
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (currentMilestoneText.trim()) {
      const newMilestone = {
        id: Date.now().toString() + Math.random().toString(),
        text: currentMilestoneText.trim(),
        completed: false
      };
      setMilestones([...milestones, newMilestone]);
      setCurrentMilestoneText('');
    }
  };

  const handleRemoveMilestoneDraft = (id) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Validation Error', 'Goal title is required', 'warning');
      return;
    }
    if (milestones.length === 0) {
      addToast('Validation Error', 'Please add at least one milestone to set a goal.', 'warning');
      return;
    }

    addGoal({
      title: title.trim(),
      targetDate,
      category,
      milestones
    });

    setModalOpen(false);
    resetForm();
  };

  const getDaysLeft = (targetStr) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const target = new Date(targetStr).setHours(0, 0, 0, 0);
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>SMART Goals</h2>
          <p className="text-sm text-muted">Set specific, measurable milestones and track your long-term progress.</p>
        </div>
        <Button onClick={handleOpenModal} icon={Plus}>
          Set New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Target size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <h3>No active goals</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Create a goal above with structured milestones to build progress habits.</p>
          </div>
        </Card>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const daysLeft = getDaysLeft(goal.targetDate);
            const isCompleted = goal.progress === 100;
            
            return (
              <Card key={goal.id} className="goal-card">
                <div className="goal-card-header">
                  <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <span className="goal-title-text">{goal.title}</span>
                      {isCompleted && <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="primary">{goal.category}</Badge>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(goal.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteGoal(goal.id, goal.title)}
                    className="header-btn"
                    style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer', padding: '0.25rem' }}
                    title="Delete Goal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <ProgressBar
                  value={goal.progress}
                  max={100}
                  label={`${goal.progress}% Completed`}
                />

                <div className="goal-card-meta">
                  <span>
                    {goal.milestones.filter(m => m.completed).length} of {goal.milestones.length} milestones
                  </span>
                  <span>
                    {daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? 'Due today!' : `Overdue by ${Math.abs(daysLeft)} days`}
                  </span>
                </div>

                <div className="goal-milestones-section">
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                    Milestone Checklist
                  </h4>
                  {goal.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="goal-milestone-item"
                      onClick={() => toggleMilestone(goal.id, m.id)}
                    >
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => {}} // toggles handled by parent div click
                        className="milestone-checkbox"
                      />
                      <span className={`milestone-text ${m.completed ? 'completed' : ''}`}>
                        {m.text}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Creator Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Set SMART Goal"
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            label="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master React Frontend Principles"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="profile-details-grid">
            <Input
              label="Target Category"
              type="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Academic', label: 'Academic' },
                { value: 'Career Development', label: 'Career Development' },
                { value: 'Health & Fitness', label: 'Health & Fitness' },
                { value: 'Personal Project', label: 'Personal Project' },
                { value: 'Finance', label: 'Finance' },
                { value: 'General', label: 'General' }
              ]}
            />
            <Input
              label="Target Completion Date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Milestones (Required to Set Goal)</label>
            <div className="milestone-input-row">
              <input
                type="text"
                placeholder="Add sub-task or milestone..."
                value={currentMilestoneText}
                onChange={(e) => setCurrentMilestoneText(e.target.value)}
                className="input-field"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone(e);
                  }
                }}
              />
              <Button type="button" onClick={handleAddMilestone} size="sm" style={{ height: '38px' }}>
                Add
              </Button>
            </div>

            {milestones.length > 0 && (
              <div className="milestones-add-list">
                {milestones.map((m) => (
                  <div key={m.id} className="milestone-draft-badge">
                    <span>{m.text}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMilestoneDraft(m.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={12} className="text-danger" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6" style={{ justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Set Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;
