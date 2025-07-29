import React from "react";
import { cn } from "@/utils/cn";
import NavItem from "@/components/molecules/NavItem";

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: "/", icon: "BarChart3", label: "Dashboard" },
    { to: "/projects", icon: "Folder", label: "Projects" },
    { to: "/tasks", icon: "CheckSquare", label: "Tasks" }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
              >
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-1 flex flex-col pt-8 pb-4 h-full overflow-y-auto">
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                className="block"
                onClick={onClose}
              >
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;