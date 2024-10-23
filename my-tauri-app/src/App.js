import React, { useState, useEffect } from 'react';
import './App.css';
import './App.scss'; // Import SCSS styles

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddOrEditTask = () => {
    if (inputValue.trim() === '') return;
    const trimmedTask = inputValue.trim();

    const newTask = {
      text: trimmedTask,
      priority,
      dueDate,
      completed: false,
    };

    if (isEditing) {
      const updatedTasks = tasks.map((task, index) =>
        index === currentTaskIndex ? newTask : task
      );
      setTasks(updatedTasks);
      setIsEditing(false);
    } else {
      setTasks([...tasks, newTask]);
    }
    setInputValue('');
    setPriority('low');
    setDueDate('');
  };

  const handleRemoveTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const toggleCompleteTask = (index) => {
    const newTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
  };

  const handleEditTask = (index) => {
    setInputValue(tasks[index].text);
    setPriority(tasks[index].priority);
    setDueDate(tasks[index].dueDate);
    setIsEditing(true);
    setCurrentTaskIndex(index);
  };

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isTaskOverdue = (task) => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate && task.dueDate < today && !task.completed;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To-Do List</h1>

        {/* Task Input Form */}
        <div className="task-form">
          {/* Name the Task input field */}
          <label>
            Name the Task:
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isEditing ? 'Edit task' : 'Add a new task'}
            />
          </label>

          {/* Due Date input with label */}
          <label>
            Due Date:
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          {/* Priority selection with label */}
          <label>
            Priority:
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          {/* Button to add or edit the task */}
          <button onClick={handleAddOrEditTask}>
            {isEditing ? 'Edit Task' : 'Add Task'}
          </button>
        </div>

        {/* Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Display the list of tasks */}
        <ul>
          {filteredTasks.map((task, index) => (
            <li
              key={index}
              className={`${task.priority} ${isTaskOverdue(task) ? 'overdue' : ''}`}
            >
              <span
                className={task.completed ? 'completed' : ''}
                onClick={() => toggleCompleteTask(index)}
              >
                {task.text} {task.dueDate && ` (Due: ${task.dueDate})`}
              </span>

              {/* Button to edit the task */}
              <button onClick={() => handleEditTask(index)}>Edit</button>

              {/* Button to remove the task */}
              <button onClick={() => handleRemoveTask(index)}>Remove</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
