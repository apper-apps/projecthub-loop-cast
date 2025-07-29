import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const ProjectCard = ({ project, onEdit, onDelete, onClick }) => {
const getStatusVariant = (status) => {
    switch (status) {
      case "active":
        return "primary";
      case "completed":
        return "success";
      case "on-hold":
        return "warning";
      case "archived":
        return "secondary";
      default:
        return "default";
    }
  };

const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "on-hold":
        return "On Hold";
      case "archived":
        return "Archived";
      case "not-started":
        return "Not Started";
      default:
        return "Not Started";
    }
  };

  return (
<Card 
      hover 
      className="p-6 space-y-4 group cursor-pointer" 
      onClick={() => onClick && onClick(project.Id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Created {format(new Date(project.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(project);
            }}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(project);
            }}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
        {project.description || "No description provided"}
      </p>
<div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusVariant(project.status)}>
            {getStatusLabel(project.status)}
          </Badge>
          <div className="flex items-center text-xs text-gray-500">
            <ApperIcon name="Calendar" className="w-3 h-3 mr-1" />
            {format(new Date(project.updatedAt), "MMM d")}
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {project.completedTaskCount || 0} of {project.totalTaskCount || 0} tasks completed
            </span>
            <span className="font-medium text-gray-700">
              {project.percentageCompleted || 0}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${project.percentageCompleted || 0}%`
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;