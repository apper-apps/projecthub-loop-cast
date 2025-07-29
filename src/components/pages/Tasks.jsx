import React from "react";
import Empty from "@/components/ui/Empty";

const Tasks = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600 mt-1">
          Manage your project tasks and to-dos
        </p>
      </div>

      <Empty
        title="No tasks yet"
        message="Task management will be available soon. For now, focus on creating and organizing your projects."
        icon="CheckSquare"
      />
    </div>
  );
};

export default Tasks;