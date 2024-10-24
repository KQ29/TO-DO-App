import React, { useState, useEffect } from 'react';
import './App.css';
import './App.scss'; // Import SCSS styles
import { getTasks, addTask, deleteTask, updateTask } from './TaskAPI'; // Import Task API functions

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null); // Track task ID

  // Fetch tasks from the server when the component mounts
  useEffect(() => {
    async function fetchTasks() {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    }
    fetchTasks();
  }, []);

  // Function to handle adding or editing a task
  const handleAddOrEditTask = async () => {
    if (inputValue.trim() === '') return;
    const trimmedTask = inputValue.trim();

    const taskData = {
      name: trimmedTask,
      priority,
      dueDate,
      completed: false,
    };

    if (isEditing) {
      // If editing, update the task on the server
      await updateTask(currentTaskId, taskData); // Make sure to send the correct task ID
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === currentTaskId ? { ...task, ...taskData } : task
        )
      );
      // Reset the form state after editing
      setIsEditing(false);
      setCurrentTaskId(null);
    } else {
      // If adding, add a new task on the server
      const addedTask = await addTask(taskData);
      setTasks([...tasks, { ...taskData, id: addedTask.id }]);
    }

    // Clear the input fields
    setInputValue('');
    setPriority('low');
    setDueDate('');
  };

  // Function to handle removing a task
  const handleRemoveTask = async (taskId) => {
    await deleteTask(taskId); // Remove the task from the server
    setTasks(tasks.filter((task) => task.id !== taskId)); // Remove task locally
  };

  // Function to toggle task completion
  const toggleCompleteTask = async (taskId) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
    await updateTask(taskId, updatedTask); // Update task on the server
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Function to handle editing a task
  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setInputValue(taskToEdit.name);
    setPriority(taskToEdit.priority);
    setDueDate(taskToEdit.dueDate);
    setIsEditing(true);
    setCurrentTaskId(taskId); // Track task ID for editing
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) =>
    task.name && task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a task is overdue
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
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`${task.priority} ${isTaskOverdue(task) ? 'overdue' : ''}`}
            >
              <span
                className={task.completed ? 'completed' : ''}
                onClick={() => toggleCompleteTask(task.id)}
              >
                {task.name} {task.dueDate && ` (Due: ${task.dueDate})`}
              </span>

              {/* Button to edit the task */}
              <button onClick={() => handleEditTask(task.id)}>Edit</button>

              {/* Button to remove the task */}
              <button onClick={() => handleRemoveTask(task.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
