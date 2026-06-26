import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../../context/TasksContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Sparkles, Send, Check, AlertCircle } from 'lucide-react';
import { mockAIPrompt } from '../../services/mockAI';
import './Assistant.css';

export const Assistant = () => {
  const { addTask } = useTasks();
  const { addToast } = useToast();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      type: 'text',
      text: `Hello! I am your AI Study Assistant. I can help you structure your workload and stay on track. Try typing:
      
- **"Break down goal: Master React Native"** to generate tasks you can import directly to your Kanban board.
- **"Study plan for Math exam"** to get a structured timetable of focus sessions.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [importedTaskIds, setImportedTaskIds] = useState([]); // track imported indices/IDs

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      text: inputText.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputText.trim();
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = mockAIPrompt(query);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        ...response
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 750);
  };

  const handleImportTask = (task, index, uniqueId) => {
    addTask({
      title: task.title,
      description: task.description,
      subject: task.subject,
      priority: task.priority,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // default 3 days due
      status: 'Todo',
      estimatedTime: task.estimatedTime,
      labels: task.labels
    });

    setImportedTaskIds([...importedTaskIds, uniqueId]);
    addToast('Task Imported', `Added "${task.title}" to your Kanban board!`, 'success');
  };

  return (
    <div className="assistant-page-container">
      {/* Header Bar */}
      <div className="assistant-header-panel">
        <Sparkles size={20} color="var(--color-primary)" />
        <span className="assistant-title-text">AI Study Assistant</span>
        <Badge variant="primary">Beta</Badge>
      </div>

      {/* Messages Feed */}
      <div className="assistant-messages-list">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`msg-wrapper ${isUser ? 'user' : 'ai'}`}>
              <div className="msg-bubble">
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                
                {/* 1. Goal Breakdown Cards */}
                {msg.type === 'goal-breakdown' && msg.data && (
                  <div className="ai-suggested-list">
                    {msg.data.map((task, idx) => {
                      const uniqueId = `${msg.id}-${idx}`;
                      const isImported = importedTaskIds.includes(uniqueId);
                      return (
                        <Card key={idx} className="ai-task-card-feed">
                          <div className="ai-task-details">
                            <span className="ai-task-title">{task.title}</span>
                            <div className="ai-task-meta">
                              <span>Est: {task.estimatedTime}h</span>
                              <span>Priority: {task.priority}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isImported ? 'success' : 'primary'}
                            onClick={() => handleImportTask(task, idx, uniqueId)}
                            disabled={isImported}
                          >
                            {isImported ? <Check size={12} /> : 'Import'}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* 2. Study Plan Schedule Table */}
                {msg.type === 'study-plan' && msg.data && (
                  <table className="study-plan-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Recommended Sessions / Chapters</th>
                      </tr>
                    </thead>
                    <tbody>
                      {msg.data.slots.map((slot, idx) => (
                        <tr key={idx}>
                          <td><strong>{slot.day}</strong></td>
                          <td>{slot.time}</td>
                          <td>{slot.topic}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="msg-wrapper ai">
            <div className="msg-bubble" style={{ padding: '0.75rem 1rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Assistant is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Footer */}
      <div className="assistant-input-footer">
        <form onSubmit={handleSendMessage} className="assistant-input-form">
          <input
            type="text"
            placeholder="Type a message... (e.g. 'break down goal: build fullstack node app')"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="chat-text-input"
            disabled={isTyping}
            required
          />
          <Button type="submit" disabled={isTyping} style={{ padding: '0.625rem 1.25rem' }}>
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Assistant;
