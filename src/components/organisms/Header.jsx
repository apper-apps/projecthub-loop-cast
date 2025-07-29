import React from "react";
import ApperIcon from "@/components/ApperIcon";
import MobileMenuButton from "@/components/molecules/MobileMenuButton";

const Header = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:justify-start">
      <div className="flex items-center space-x-4">
        <MobileMenuButton 
          isOpen={isMobileMenuOpen}
          onClick={onMobileMenuToggle}
        />
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg">
            <ApperIcon name="Folder" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            ProjectHub
          </h1>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("en-US", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;