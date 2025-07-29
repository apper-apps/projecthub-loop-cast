import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { taskService } from "@/services/api/taskService";
import { format } from "date-fns";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = taskService.getAll();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const newTask = taskService.create(formData);
      setTasks(prev => [...prev, newTask]);
      setFormData({ title: '', description: '' });
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = taskService.toggleComplete(taskId);
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTasks} />;

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your project tasks and to-dos
          </p>
          {tasks.length > 0 && (
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>{pendingTasks.length} pending</span>
              <span>{completedTasks.length} completed</span>
              <span>{tasks.length} total</span>
            </div>
          )}
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Task
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title"
                className={formErrors.title ? 'border-red-300' : ''}
              />
              {formErrors.title && (
                <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '' });
                  setFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Task
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tasks.length === 0 ? (
        <Empty
          title="No tasks yet"
          message="Create your first task to get started with managing your to-dos."
          icon="CheckSquare"
          actionLabel="Add Task"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Pending Tasks ({pendingTasks.length})
              </h2>
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Completed Tasks ({completedTasks.length})
              </h2>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, onToggleComplete, onDelete }) => {
  return (
    <Card className={`p-4 transition-all duration-200 ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.Id)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 hover:border-emerald-500'
          }`}
        >
          {task.completed && <ApperIcon name="Check" size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.Id)}
            className="text-gray-400 hover:text-red-600"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Tasks;