// Mock AI Study Assistant Response Generator

export const mockAIPrompt = (message) => {
  const msg = message.toLowerCase();
  
  // 1. Goal breakdown trigger
  if (msg.includes('goal') || msg.includes('breakdown') || msg.includes('break down')) {
    let goalName = message.replace(/(break down|goal|suggest|generate|subtasks|tasks for)/gi, '').trim();
    if (!goalName) goalName = "Master React Portfolios";

    return {
      type: 'goal-breakdown',
      text: `Sure, here is a structured subtask breakdown to help you achieve your goal: **"${goalName}"**. You can click "Import to Board" on any subtask to add it directly to your Tasks board!`,
      data: [
        {
          title: `Research resources for "${goalName}"`,
          description: `Identify documentation, reference sheets, courses, and sample databases related to "${goalName}".`,
          subject: 'Self-Study',
          priority: 'Medium',
          estimatedTime: 1.5,
          labels: ['Research']
        },
        {
          title: `Build base architecture for "${goalName}"`,
          description: `Initialize project directories, draft file systems, and configure settings.`,
          subject: 'Self-Study',
          priority: 'High',
          estimatedTime: 3.5,
          labels: ['Coding']
        },
        {
          title: `Review milestone progress for "${goalName}"`,
          description: `Conduct testing, check edge cases, and list any adjustments.`,
          subject: 'Self-Study',
          priority: 'Low',
          estimatedTime: 1.0,
          labels: ['Review']
        }
      ]
    };
  }

  // 2. Exam study plan trigger
  if (msg.includes('exam') || msg.includes('study plan') || msg.includes('timetable') || msg.includes('schedule')) {
    const subject = message.match(/(?:for|in)\s+([a-zA-Z\s0-9]+)(?:exam|test)?/i)?.[1]?.trim() || "general exams";
    return {
      type: 'study-plan',
      text: `Here is a custom Pomodoro study calendar to prepare you for your upcoming **${subject}** assessments. This schedule divides target chapters into focus blocks:`,
      data: {
        subject: subject,
        slots: [
          { day: 'Monday', time: '16:00 - 17:30', topic: 'Chapter 1: Foundations & Core Concepts (2 Focus Pomodoros)' },
          { day: 'Wednesday', time: '18:00 - 19:30', topic: 'Chapter 2: Formulas, Proofs & Exercises (2 Focus Pomodoros)' },
          { day: 'Saturday', time: '10:00 - 12:00', topic: 'Full Mock Test & Reviewing Mistake Journals (3 Focus Pomodoros)' }
        ]
      }
    };
  }

  // 3. Default text response
  return {
    type: 'text',
    text: `Hello! I am your AI Study Assistant. I can help you structure your workload and stay on track. Try typing:
    
- **"Break down goal: Master React Native"** to generate tasks you can import directly to your Kanban board.
- **"Study plan for Math exam"** to get a structured timetable of focus sessions.`
  };
};

export default mockAIPrompt;
