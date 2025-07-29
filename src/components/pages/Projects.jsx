import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ProjectCard from "@/components/molecules/ProjectCard";
import ProjectModal from "@/components/organisms/ProjectModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { projectService } from "@/services/api/projectService";
import { toast } from "react-toastify";
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

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

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await projectService.delete(project.Id);
        setProjects(prev => prev.filter(p => p.Id !== project.Id));
        toast.success("Project deleted successfully");
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

const navigate = useNavigate();

  const handleSaveProject = async (formData) => {
    try {
      if (editingProject) {
        const updatedProject = await projectService.update(editingProject.Id, formData);
        setProjects(prev => prev.map(p => p.Id === editingProject.Id ? updatedProject : p));
        toast.success("Project updated successfully");
      } else {
        const newProject = await projectService.create(formData);
        setProjects(prev => [newProject, ...prev]);
        toast.success("Project created successfully");
      }
    } catch (error) {
      toast.error("Failed to save project");
      throw error;
    }
  };

  const handleViewTasks = (projectId) => {
    navigate(`/tasks?projectId=${projectId}`);
  };

  if (loading) return <Loading type="projects" />;
  if (error) return <Error message={error} onRetry={loadProjects} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your projects
          </p>
        </div>
        <Button onClick={handleCreateProject} variant="primary">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Empty
          title="No projects yet"
          message="Create your first project to get started with organizing your work."
          actionLabel="Create Project"
          onAction={handleCreateProject}
          icon="Folder"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
<ProjectCard
              key={project.Id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onViewTasks={handleViewTasks}
            />
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProject}
        project={editingProject}
        title={editingProject ? "Edit Project" : "Create New Project"}
      />
    </div>
  );
};

export default Projects;