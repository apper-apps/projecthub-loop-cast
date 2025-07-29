import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Projects from "@/components/pages/Projects";
import Textarea from "@/components/atoms/Textarea";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
const Tasks = () => {
const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [showForm, setShowForm] = useState(false);
const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    dueDate: '',
    priority: 'Medium'
  });
const [formErrors, setFormErrors] = useState({});
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      setSelectedProjectFilter(projectId);
    }
  }, [searchParams]);

const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectId = selectedProjectFilter || searchParams.get('projectId');
      const data = await taskService.getAll(projectId ? parseInt(projectId) : null);
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
    if (!formData.projectId) {
      errors.projectId = 'Project is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

try {
      const newTask = await taskService.create(formData);
setTasks(prev => [...prev, newTask]);
      setFormData({ title: '', description: '', projectId: '', dueDate: '', priority: 'Medium' });
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
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
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
    } catch (err) {
console.error('Error deleting task:', err);
    }
  };

  const handleProjectFilterChange = (projectId) => {
    setSelectedProjectFilter(projectId);
    loadTasks();
  };

  // Filter tasks based on selected project
  const filteredTasks = selectedProjectFilter 
    ? tasks.filter(task => task.projectId === parseInt(selectedProjectFilter))
    : tasks;

  const completedTasks = filteredTasks.filter(task => task.completed);
  const pendingTasks = filteredTasks.filter(task => !task.completed);

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.Id === projectId);
    return project ? project.title : 'Unknown Project';
  };
if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTasks} />;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your project tasks and to-dos
          </p>
{filteredTasks.length > 0 && (
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>{pendingTasks.length} pending</span>
              <span>{completedTasks.length} completed</span>
              <span>{filteredTasks.length} total</span>
            </div>
          )}

          {/* Project Filter */}
          <div className="mt-4">
            <label htmlFor="projectFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Project
            </label>
            <select
              id="projectFilter"
              value={selectedProjectFilter}
              onChange={(e) => handleProjectFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.Id} value={project.Id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
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
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <select
                id="projectId"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.projectId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.Id} value={project.Id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {formErrors.projectId && (
                <p className="text-red-600 text-sm mt-1">{formErrors.projectId}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

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

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '', projectId: '', dueDate: '', priority: 'Medium' });
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

{filteredTasks.length === 0 ? (
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
                    projectName={getProjectName(task.projectId)}
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
                    projectName={getProjectName(task.projectId)}
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

const TaskCard = ({ task, projectName, onToggleComplete, onDelete }) => {
  // Determine due date status
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'due-today';
    return 'upcoming';
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);
  
  // Get priority badge variant
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Determine card border color based on due date status
  const getBorderClass = () => {
    if (task.completed) return 'bg-gray-50 border-gray-200';
    
    switch (dueDateStatus) {
      case 'overdue':
        return 'bg-white border-red-200 hover:border-red-300';
      case 'due-today':
        return 'bg-white border-orange-200 hover:border-orange-300';
      default:
        return 'bg-white border-gray-200 hover:border-gray-300';
    }
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${getBorderClass()}`}>
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.priority && (
              <Badge variant={getPriorityVariant(task.priority)}>
                {task.priority}
              </Badge>
            )}
            {projectName && (
              <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                {projectName}
              </span>
            )}
          </div>
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-gray-400">
              Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </p>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <ApperIcon name="Calendar" size={12} />
                <p className={`text-xs ${
                  task.completed 
                    ? 'text-gray-400' 
                    : dueDateStatus === 'overdue' 
                      ? 'text-red-600 font-medium' 
                      : dueDateStatus === 'due-today'
                        ? 'text-orange-600 font-medium'
                        : 'text-gray-500'
                }`}>
                  {dueDateStatus === 'overdue' 
                    ? `Overdue: ${format(new Date(task.dueDate), 'MMM d, yyyy')}`
                    : dueDateStatus === 'due-today'
                      ? 'Due today'
                      : `Due: ${format(new Date(task.dueDate), 'MMM d, yyyy')}`
                  }
                </p>
              </div>
            )}
          </div>
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