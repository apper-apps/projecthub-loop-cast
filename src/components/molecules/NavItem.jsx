import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const NavItem = ({ to, icon, children, className }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
          "hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset",
          isActive 
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg border-l-4 border-primary-700" 
            : "text-gray-700 hover:text-primary-700",
          className
        )
      }
    >
      <ApperIcon name={icon} className="w-5 h-5 mr-3 flex-shrink-0" />
      {children}
    </NavLink>
  );
};

export default NavItem;