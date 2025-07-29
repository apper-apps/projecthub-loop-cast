import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { projectService } from "@/services/api/projectService";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadProjects} />;

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your projects and progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <ApperIcon name="Folder" className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-700">{stats.total}</p>
              <p className="text-sm font-medium text-primary-600">Total Projects</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <ApperIcon name="TrendingUp" className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats.active}</p>
              <p className="text-sm font-medium text-emerald-600">Active Projects</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <ApperIcon name="CheckCircle" className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
              <p className="text-sm font-medium text-blue-600">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {projects.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Projects</h2>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
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