import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { projectService } from '@/services/api/projectService';
import { taskService } from '@/services/api/taskService';
import { toast } from 'react-toastify';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectData, allTasks] = await Promise.all([
        projectService.getById(parseInt(id)),
        taskService.getAll()
      ]);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      setProject(projectData);
      setTasks(allTasks.filter(task => task.projectId === parseInt(id)));
    } catch (err) {
      console.error('Error loading project data:', err);
      setError('Failed to load project details');
      toast.error('Error loading project details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      'active': 'success',
      'completed': 'primary',
      'on-hold': 'warning',
      'not-started': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Active',
      'completed': 'Completed', 
      'on-hold': 'On Hold',
      'not-started': 'Not Started'
    };
    return labels[status] || status;
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadProjectData}
      />
    );
  }

  if (!project) {
    return (
      <Empty 
        message="Project not found"
        description="The requested project could not be found."
      />
    );
  }

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <button
          onClick={handleBackToProjects}
          className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
        >
          <ApperIcon name="Home" size={16} />
          <span>Projects</span>
        </button>
        <ApperIcon name="ChevronRight" size={16} />
        <span className="text-gray-900 font-medium">{project.title}</span>
      </nav>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h1>
              <Badge variant={getStatusVariant(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {project.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ApperIcon name="Calendar" size={16} />
                <span>Created: {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              {project.updatedAt && project.updatedAt !== project.createdAt && (
                <div className="flex items-center gap-2">
                  <ApperIcon name="Clock" size={16} />
                  <span>Updated: {format(new Date(project.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleBackToProjects}
            className="shrink-0"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Project Tasks
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            
            {totalTasks > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {tasks.length === 0 ? (
            <Empty 
              message="No tasks found"
              description="This project doesn't have any tasks assigned yet."
            />
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.Id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {task.completed ? (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <ApperIcon name="Check" size={12} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Calendar" size={12} />
                          <span>Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        {task.completed && (
                          <Badge variant="success" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;