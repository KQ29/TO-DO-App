import React, { useState, useEffect } from 'react';
import './App.css';
import './App.scss'; // Import SCSS styles
import { getTasks, addTask, deleteTask, updateTask } from './TaskAPI'; // Импорт всех API функций

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null); // Track the task ID instead of index

  // Загружаем задачи с сервера при монтировании компонента
  useEffect(() => {
    async function fetchTasks() {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    }
    fetchTasks();
  }, []);

  // Функция добавления или редактирования задачи
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
      const addedTask = await addTask(newTask); // Добавляем задачу на сервере
      setTasks([...tasks, { ...newTask, id: addedTask.id }]); // Добавляем в локальный стейт с ID
    }

    // Сбрасываем значения полей
    setInputValue('');
    setPriority('low');
    setDueDate('');
  };

  // Функция удаления задачи
  const handleRemoveTask = async (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (taskToDelete && taskToDelete.id) {
      await deleteTask(taskToDelete.id); // Удаляем задачу с сервера
      const newTasks = tasks.filter((task) => task.id !== taskToDelete.id);
      setTasks(newTasks);
    }
  };

  // Функция изменения статуса выполнения задачи
  const toggleCompleteTask = async (taskId) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
    if (taskToUpdate && taskToUpdate.id) {
      await updateTask(taskToUpdate.id, updatedTask); // Обновляем задачу на сервере
      const newTasks = tasks.map((task) =>
        task.id === taskToUpdate.id ? { ...task, completed: !task.completed } : task
      );
      setTasks(newTasks);
    }
  };

  // Функция редактирования задачи
  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setInputValue(taskToEdit.name);
    setPriority(taskToEdit.priority);
    setDueDate(taskToEdit.dueDate);
    setIsEditing(true);
    setCurrentTaskId(taskId);
  };

  // Поиск задач
  const filteredTasks = tasks.filter((task) =>
    task.name && task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Проверка просроченных задач
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
