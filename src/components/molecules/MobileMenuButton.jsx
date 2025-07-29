import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const MobileMenuButton = ({ isOpen, onClick }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="lg:hidden p-2"
    >
      <ApperIcon 
        name={isOpen ? "X" : "Menu"} 
        className="w-6 h-6" 
      />
    </Button>
  );
};

export default MobileMenuButton;