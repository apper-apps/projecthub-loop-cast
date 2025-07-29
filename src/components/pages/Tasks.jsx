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
import TaskModal from "@/components/organisms/TaskModal";
const Tasks = () => {
const [searchParams] = useSearchParams();
const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    dueDate: '',
    priority: 'Medium'
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
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

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.Id === projectId);
    return project ? project.title : 'Unknown Project';
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
      setShowTaskModal(false);
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

const [editingTaskId, setEditingTaskId] = useState(null);

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

  const handleEditTask = (taskId) => {
    setEditingTaskId(taskId);
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.update(taskId, taskData);
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.Id === taskId ? updatedTask : task
        ));
        setEditingTaskId(null);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };
const handleProjectFilterChange = (projectId) => {
    setSelectedProjectFilter(projectId);
    loadTasks();
  };

  const handleFilterChange = (filter) => {
    setFilterBy(filter);
    if (filter === 'byProject') {
      // Keep current project filter or show all if none selected
    } else {
      // Clear project filter for other filter types
      setSelectedProjectFilter('');
    }
  };

  const handleSortChange = (sortField, order) => {
    setSortBy(sortField);
    setSortOrder(order);
  };

// Apply comprehensive filtering and sorting
  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        (task.title?.toLowerCase() || '').includes(query) ||
        (task.description?.toLowerCase() || '').includes(query)
      );
    }

    // Apply project filter
    if (selectedProjectFilter) {
      filtered = filtered.filter(task => task.projectId === parseInt(selectedProjectFilter));
    }

    // Apply status-based filters
    switch (filterBy) {
      case 'active':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      case 'dueToday':
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        filtered = filtered.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= todayStart && dueDate < todayEnd;
        });
        break;
      case 'highPriority':
        filtered = filtered.filter(task => task.priority === 'High');
        break;
      case 'byProject':
        // Project filtering already applied above
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        case 'projectId':
          const projectNameA = getProjectName(a.projectId).toLowerCase();
          const projectNameB = getProjectName(b.projectId).toLowerCase();
          comparison = projectNameA.localeCompare(projectNameB);
          break;
        case 'createdAt':
        default:
          const createdA = new Date(a.createdAt);
          const createdB = new Date(b.createdAt);
          comparison = createdA - createdB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredTasks = applyFiltersAndSort();
  const completedTasks = filteredTasks.filter(task => task.completed);
  const pendingTasks = filteredTasks.filter(task => !task.completed);

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

          {/* Search Bar */}
          <div className="relative max-w-md mt-4">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          {/* Filter Buttons */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterBy === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                All Tasks
              </Button>
              <Button
                variant={filterBy === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange('active')}
              >
                Active
              </Button>
              <Button
                variant={filterBy === 'completed' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange('completed')}
              >
                Completed
              </Button>
              <Button
                variant={filterBy === 'dueToday' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange('dueToday')}
              >
                Due Today
              </Button>
              <Button
                variant={filterBy === 'highPriority' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange('highPriority')}
              >
                High Priority
              </Button>
              <Button
                variant={filterBy === 'byProject' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange('byProject')}
              >
                By Project
              </Button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="mt-4">
            <label htmlFor="sortSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              id="sortSelect"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                handleSortChange(field, order);
              }}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="dueDate-asc">Due Date (Ascending)</option>
              <option value="dueDate-desc">Due Date (Descending)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="priority-asc">Priority (Low to High)</option>
              <option value="projectId-asc">Project (A to Z)</option>
              <option value="projectId-desc">Project (Z to A)</option>
              <option value="createdAt-asc">Creation Date (Oldest First)</option>
              <option value="createdAt-desc">Creation Date (Newest First)</option>
            </select>
          </div>

          {/* Project Filter - Show only when 'By Project' filter is active */}
          {filterBy === 'byProject' && (
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
          )}
        </div>
<Button
          onClick={() => setShowTaskModal(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Task
        </Button>
      </div>

<TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleFormSubmit}
        projects={projects}
        title="Create New Task"
      />

{tasks.length === 0 ? (
        <Empty
          title="No tasks yet"
          message="Create your first task to get started with managing your to-dos."
          icon="CheckSquare"
          actionLabel="Add Task"
          onAction={() => setShowTaskModal(true)}
        />
      ) : filteredTasks.length === 0 ? (
        <Empty
          title="No results found"
          message={searchQuery.trim() 
            ? `No tasks match "${searchQuery}". Try adjusting your search terms or filters.`
            : "No tasks match the selected filters. Try adjusting your filter criteria."
          }
          icon="Search"
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
                    projects={projects}
                    isEditing={editingTaskId === task.Id}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onUpdate={handleUpdateTask}
                    onCancelEdit={() => setEditingTaskId(null)}
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
                    projects={projects}
                    isEditing={editingTaskId === task.Id}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onUpdate={handleUpdateTask}
                    onCancelEdit={() => setEditingTaskId(null)}
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

const TaskCard = ({ task, projectName, projects, isEditing, onToggleComplete, onDelete, onEdit, onUpdate, onCancelEdit }) => {
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

  if (isEditing) {
    return (
      <Card className={`p-4 transition-all duration-200 ${getBorderClass()}`}>
        <EditTaskForm
          task={task}
          projects={projects}
          onSave={(updatedData) => onUpdate(task.Id, updatedData)}
          onCancel={onCancelEdit}
        />
      </Card>
    );
  }

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
            onClick={() => onEdit(task.Id)}
            className="text-gray-400 hover:text-blue-600"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
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

// Edit Task Form Component
const EditTaskForm = ({ task, projects, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    projectId: task.projectId || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    priority: task.priority || 'Medium'
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
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

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <Input
            id="edit-title"
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
          <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="edit-priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-project" className="block text-sm font-medium text-gray-700 mb-1">
            Project *
          </label>
          <select
            id="edit-project"
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
          <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <Input
            id="edit-dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default Tasks;