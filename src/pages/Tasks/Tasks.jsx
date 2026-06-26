import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit, 
  ArrowLeft, 
  ArrowRight,
  Filter
} from 'lucide-react';
import './Tasks.css';

export const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const { addToast } = useToast();

  // Filter States
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal Control States
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null); // Task object when editing, null when creating

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Todo');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [labels, setLabels] = useState([]);
  const [currentLabel, setCurrentLabel] = useState('');

  // Extract unique subjects for the filter dropdown
  const uniqueSubjects = ['All', ...new Set(tasks.map((t) => t.subject).filter(Boolean))];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setPriority('Medium');
    setDueDate(new Date().toISOString().split('T')[0]);
    setStatus('Todo');
    setEstimatedTime('');
    setLabels([]);
    setCurrentLabel('');
  };

  const handleOpenCreate = () => {
    setEditTask(null);
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (task, e) => {
    e.stopPropagation(); // Stop card click trigger
    setEditTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setSubject(task.subject);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setStatus(task.status);
    setEstimatedTime(task.estimatedTime);
    setLabels(task.labels || []);
    setCurrentLabel('');
    setModalOpen(true);
  };

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (currentLabel.trim() && !labels.includes(currentLabel.trim())) {
      setLabels([...labels, currentLabel.trim()]);
      setCurrentLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Validation Error', 'Task title is required.', 'warning');
      return;
    }

    const taskData = {
      title,
      description,
      subject: subject || 'General',
      priority,
      dueDate,
      status,
      estimatedTime: parseFloat(estimatedTime) || 0,
      labels
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
      addToast('Task Updated', `"${title}" has been saved.`, 'success');
    } else {
      addTask(taskData);
      addToast('Task Added', `"${title}" has been added to your board.`, 'success');
    }

    setModalOpen(false);
    resetForm();
  };

  const handleDelete = (id, title, e) => {
    e.stopPropagation(); // prevent modal trigger
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmDelete) return;

    deleteTask(id);
    addToast('Task Deleted', 'The task was removed from your board.', 'info');
  };

  const handleQuickMove = (id, currentStatus, direction, e) => {
    e.stopPropagation();
    const columns = ['Todo', 'In-Progress', 'Review', 'Done'];
    const currentIndex = columns.indexOf(currentStatus);
    let nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < columns.length) {
      moveTask(id, columns[nextIndex]);
      addToast('Task Moved', `Status changed to ${columns[nextIndex]}`, 'info');
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSubject = subjectFilter === 'All' || task.subject === subjectFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSubject && matchesPriority;
  });

  const boardColumns = [
    { id: 'Todo', title: 'To Do', badge: 'secondary' },
    { id: 'In-Progress', title: 'In Progress', badge: 'warning' },
    { id: 'Review', title: 'In Review', badge: 'info' },
    { id: 'Done', title: 'Completed', badge: 'success' }
  ];

  const checkOverdue = (dateStr, status) => {
    if (status === 'Done') return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>Tasks Board</h2>
        
        <div className="tasks-filters">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Subjects</option>
              {uniqueSubjects.filter(s => s !== 'All').map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <Button onClick={handleOpenCreate} icon={Plus}>
            Add New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="kanban-board">
        {boardColumns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          
          return (
            <div key={col.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <Badge variant={col.badge}>{colTasks.length}</Badge>
                  <span>{col.title}</span>
                </div>
              </div>

              <div className="column-list">
                {colTasks.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isOverdue = checkOverdue(task.dueDate, task.status);
                    
                    return (
                      <Card 
                        key={task.id} 
                        className="task-card"
                        onClick={(e) => handleOpenEdit(task, e)}
                      >
                        <div className="task-card-header">
                          <h4 className="task-card-title">{task.title}</h4>
                        </div>
                        
                        {task.description && (
                          <p className="task-card-desc">{task.description}</p>
                        )}

                        <div className="task-card-badges">
                          <Badge variant={
                            task.priority === 'High' ? 'danger' : 
                            task.priority === 'Medium' ? 'warning' : 'secondary'
                          }>
                            {task.priority}
                          </Badge>
                          <Badge variant="primary">{task.subject}</Badge>
                        </div>

                        {task.labels && task.labels.length > 0 && (
                          <div className="task-card-labels">
                            {task.labels.map((lbl, idx) => (
                              <span key={idx} className="task-label-tag">{lbl}</span>
                            ))}
                          </div>
                        )}

                        <div className="task-card-footer">
                          <div className="task-card-meta">
                            <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
                              <Calendar size={12} />
                              {isOverdue ? 'Overdue: ' : ''}
                              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            {task.estimatedTime > 0 && (
                              <span className="task-est-time">
                                <Clock size={12} style={{ marginRight: '0.25rem', display: 'inline', verticalAlign: 'text-bottom' }} />
                                {task.estimatedTime}h est.
                              </span>
                            )}
                          </div>

                          <div className="task-actions-btn-group">
                            {/* Quick status arrow shifters */}
                            <button
                              onClick={(e) => handleQuickMove(task.id, task.status, -1, e)}
                              disabled={task.status === 'Todo'}
                              className="header-btn"
                              style={{ padding: '0.25rem', opacity: task.status === 'Todo' ? 0.3 : 1 }}
                              title="Move Left"
                            >
                              <ArrowLeft size={14} />
                            </button>
                            <button
                              onClick={(e) => handleQuickMove(task.id, task.status, 1, e)}
                              disabled={task.status === 'Done'}
                              className="header-btn"
                              style={{ padding: '0.25rem', opacity: task.status === 'Done' ? 0.3 : 1 }}
                              title="Move Right"
                            >
                              <ArrowRight size={14} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(task.id, task.title, e)}
                              className="header-btn"
                              style={{ padding: '0.25rem', color: 'var(--color-danger)' }}
                              title="Delete Task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTask ? 'Edit Task' : 'Add New Task'}
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete Chemistry Lab Report"
            required
          />

          <Input
            label="Description"
            type="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly list key instructions or details..."
          />

          <div className="task-form-grid">
            <Input
              label="Subject / Course"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Chemistry, Computer Science"
              required
            />

            <Input
              label="Priority"
              type="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' }
              ]}
            />

            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />

            <Input
              label="Status"
              type="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'Todo', label: 'To Do' },
                { value: 'In-Progress', label: 'In Progress' },
                { value: 'Review', label: 'In Review' },
                { value: 'Done', label: 'Completed' }
              ]}
            />

            <Input
              label="Estimated Time (Hours)"
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 3.5"
              step="0.1"
              min="0"
            />

            <div className="form-group">
              <label className="input-label">Labels / Tags</label>
              <div className="task-label-input-group">
                <input
                  type="text"
                  placeholder="Press enter or click add..."
                  value={currentLabel}
                  onChange={(e) => setCurrentLabel(e.target.value)}
                  className="input-field"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel(e);
                    }
                  }}
                />
                <Button type="button" onClick={handleAddLabel} size="sm" style={{ height: '38px' }}>
                  Add
                </Button>
              </div>
              <div className="task-labels-preview">
                {labels.map((lbl) => (
                  <span 
                    key={lbl} 
                    className="task-label-remove-badge"
                    onClick={() => handleRemoveLabel(lbl)}
                    title="Click to remove"
                  >
                    {lbl} <span>×</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6" style={{ justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
