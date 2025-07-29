import React, { useEffect, useState } from "react";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Tasks from "@/components/pages/Tasks";
import Projects from "@/components/pages/Projects";
import Card from "@/components/atoms/Card";
const Dashboard = () => {
const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [projectsData, tasksData] = await Promise.all([
        projectService.getAll(),
        taskService.getAll()
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
}, []);
  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

const now = new Date();
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === "active").length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed === true).length,
    overdueTasks: tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < now;
    }).length
  };

  // Get task counts for each project
  const getProjectTaskCount = (projectId) => {
    return tasks.filter(t => t.projectId?.Id === projectId).length;
  };

return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your projects and tasks progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <ApperIcon name="Folder" className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700">{stats.totalProjects}</p>
              <p className="text-sm font-medium text-primary-600">Total Projects</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <ApperIcon name="CheckSquare" className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.totalTasks}</p>
              <p className="text-sm font-medium text-blue-600">Total Tasks</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <ApperIcon name="CheckCircle" className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats.completedTasks}</p>
              <p className="text-sm font-medium text-emerald-600">Completed Tasks</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <ApperIcon name="AlertCircle" className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.overdueTasks}</p>
              <p className="text-sm font-medium text-orange-600">Overdue Tasks</p>
            </div>
          </div>
        </Card>
      </div>

      {projects.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Projects</h2>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <ApperIcon name="Folder" className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600 truncate max-w-md">
                      {project.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getProjectTaskCount(project.Id)} tasks
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === "active" 
                      ? "bg-primary-100 text-primary-800"
                      : project.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {project.status === "active" ? "Active" : 
                     project.status === "completed" ? "Completed" : "Not Started"}
                  </span>
                  <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;