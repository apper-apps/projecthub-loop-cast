import projectsData from "@/services/mockData/projects.json";

class ProjectService {
  constructor() {
    this.storageKey = "projecthub_projects";
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      localStorage.setItem(this.storageKey, JSON.stringify(projectsData));
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.getData()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const projects = this.getData();
    const project = projects.find(p => p.Id === parseInt(id));
    if (!project) {
      throw new Error("Project not found");
    }
    return { ...project };
  }

  async create(projectData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const projects = this.getData();
    const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.Id)) : 0;
    
    const newProject = {
      Id: maxId + 1,
      title: projectData.title,
      description: projectData.description || "",
      status: projectData.status || "not-started",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = [newProject, ...projects];
    this.saveData(updatedProjects);
    return { ...newProject };
  }

  async update(id, projectData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const projects = this.getData();
    const index = projects.findIndex(p => p.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Project not found");
    }

    const updatedProject = {
      ...projects[index],
      title: projectData.title,
      description: projectData.description || "",
      status: projectData.status || projects[index].status,
      updatedAt: new Date().toISOString()
    };

    projects[index] = updatedProject;
    this.saveData(projects);
    return { ...updatedProject };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const projects = this.getData();
    const filteredProjects = projects.filter(p => p.Id !== parseInt(id));
    
    if (filteredProjects.length === projects.length) {
      throw new Error("Project not found");
    }

    this.saveData(filteredProjects);
    return true;
  }
}

export const projectService = new ProjectService();