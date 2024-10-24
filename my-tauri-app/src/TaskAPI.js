const API_URL = "http://127.0.0.1:5000/tasks";

// Получить все задачи
export const getTasks = async () => {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// Добавить новую задачу
export const addTask = async (task) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

// Обновить задачу
export const updateTask = async (taskId, updatedTask) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask), 
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };  

// Удалить задачу
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};