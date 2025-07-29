import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No items found", 
  message = "Get started by creating your first item.",
  actionLabel = "Create New",
  onAction,
  icon = "Inbox"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="p-4 bg-gray-50 rounded-2xl">
        <ApperIcon name={icon} className="w-12 h-12 text-gray-400" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 max-w-md">{message}</p>
      </div>
      {onAction && (
        <Button onClick={onAction} variant="primary" className="mt-6">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;