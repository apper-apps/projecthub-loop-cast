import mockTasks from '@/services/mockData/tasks.json';
import { toast } from 'react-toastify';

let tasks = [...mockTasks];
let nextId = Math.max(...tasks.map(task => task.Id)) + 1;

export const taskService = {
  getAll() {
    return [...tasks];
  },

  getById(id) {
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    return tasks.find(task => task.Id === taskId) || null;
  },

  create(taskData) {
    const newTask = {
      Id: nextId++,
      title: taskData.title || '',
      description: taskData.description || '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    toast.success('Task created successfully!');
    return { ...newTask };
  },

  update(id, taskData) {
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    const index = tasks.findIndex(task => task.Id === taskId);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    tasks[index] = {
      ...tasks[index],
      ...taskData,
      Id: taskId // Ensure ID cannot be changed
    };
    
    toast.success('Task updated successfully!');
    return { ...tasks[index] };
  },

  delete(id) {
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    const index = tasks.findIndex(task => task.Id === taskId);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = tasks.splice(index, 1)[0];
    toast.success('Task deleted successfully!');
    return deletedTask;
  },

  toggleComplete(id) {
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    const task = tasks.find(task => task.Id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    task.completed = !task.completed;
    const status = task.completed ? 'completed' : 'pending';
    toast.success(`Task marked as ${status}!`);
    return { ...task };
  }
};