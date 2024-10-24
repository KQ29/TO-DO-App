import React, { useState, useEffect } from 'react';
import './App.css';
import './App.scss'; // Import SCSS styles
import { getTasks, addTask, deleteTask, updateTask } from './TaskAPI'; // Import all API functions

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null); // Track the task ID instead of index

  // Load tasks from the server when the component is mounted
  useEffect(() => {
    async function fetchTasks() {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    }
    fetchTasks();
  }, []);

  // Function to add or edit a task
  const handleAddOrEditTask = async () => {
    if (inputValue.trim() === '') return;
    const trimmedTask = inputValue.trim();

    const newTask = {
      name: trimmedTask,
      priority,
      dueDate,
      completed: false,
    };

    if (isEditing) {
      // Find task by ID
      const taskToEdit = tasks.find((task) => task.id === currentTaskId);
      if (taskToEdit && taskToEdit.id) {
        // Update the task on the server
        await updateTask(taskToEdit.id, newTask);
        // Update task in local state
        const updatedTasks = tasks.map((task) =>
          task.id === taskToEdit.id ? { ...task, ...newTask } : task
        );
        setTasks(updatedTasks);
        setIsEditing(false);
      }
    } else {
      const addedTask = await addTask(newTask); // Add the task on the server
      setTasks([...tasks, { ...newTask, id: addedTask.id }]); // Add to local state with ID
    }

    // Reset form fields
    setInputValue('');
    setPriority('low');
    setDueDate('');
  };

  // Function to remove a task
  const handleRemoveTask = async (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (taskToDelete && taskToDelete.id) {
      await deleteTask(taskToDelete.id); // Remove the task from the server
      const newTasks = tasks.filter((task) => task.id !== taskToDelete.id);
      setTasks(newTasks);
    }
  };

  // Function to toggle task completion status
  const toggleCompleteTask = async (taskId) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
    if (taskToUpdate && taskToUpdate.id) {
      await updateTask(taskToUpdate.id, updatedTask); // Update the task on the server
      const newTasks = tasks.map((task) =>
        task.id === taskToUpdate.id ? { ...task, completed: !task.completed } : task
      );
      setTasks(newTasks);
    }
  };

  // Function to edit a task
  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setInputValue(taskToEdit.name);
    setPriority(taskToEdit.priority);
    setDueDate(taskToEdit.dueDate);
    setIsEditing(true);
    setCurrentTaskId(taskId);
  };

  // Search tasks
  const filteredTasks = tasks.filter((task) =>
    task.name && task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check for overdue tasks
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
