import React, { useState } from "react";
import { FaFeatherAlt, FaMagic, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Sidebar({ mobileOpen = false, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);

  // Sidebar classes for responsiveness
  const baseClasses = `fixed top-4 left-4 z-40 flex flex-col rounded-2xl
     text-white transition-all duration-300
    ${collapsed ? "w-16 sm:w-20 p-0 items-start" : "w-full max-w-xs sm:w-64 p-4 sm:p-6 items-start"} h-screen max-h-[90vh]`;

  // Mobile overlay: show only if mobileOpen, otherwise hidden on mobile
  const responsiveClasses = `
    hidden sm:flex
    ${mobileOpen ? "flex !fixed !inset-0 !z-50 !w-full !h-full !rounded-none !p-0 bg-black/60" : ""}
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      <aside
        className={`${baseClasses} ${responsiveClasses} ${mobileOpen ? "sm:rounded-2xl" : ""} ${mobileOpen ? "flex" : ""}`}
        style={mobileOpen ? { left: 0, top: 0, height: "100vh", borderRadius: 0, padding: 0, width: "100vw", maxWidth: 320 } : {}}
      >
        {/* Close button for mobile */}
        {mobileOpen && (
          <button
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 sm:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="text-2xl">&times;</span>
          </button>
        )}
        <div className={`flex items-center w-full ${collapsed ? "mt-4 mb-4" : "mb-10"}`}>
          <svg
            width={collapsed ? "40" : "32"}
            height={collapsed ? "40" : "32"}
            viewBox="0 0 32 32"
            fill="none"
            className={collapsed ? "" : "mr-3"}
            style={{ minWidth: 28, minHeight: 28 }}
          >
            <rect x="4" y="4" width="24" height="24" rx="7" fill="white" fillOpacity="0.85" />
            <rect x="10" y="10" width="12" height="12" rx="4" fill="#2563eb" fillOpacity="0.9" />
          </svg>
          {!collapsed && (
            <span className="font-bold text-lg tracking-wide">Mehul's Workspace</span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`ml-auto bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors duration-200 ${collapsed ? "" : "ml-4"}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <FaChevronRight className="text-xl" />
            ) : (
              <FaChevronLeft className="text-xl" />
            )}
          </button>
        </div>
        {!collapsed && (
          <nav className="flex flex-col gap-2">
            <SidebarItem icon={FaFeatherAlt} label="Grammar & Writing Style" collapsed={collapsed} />
            <SidebarItem icon={FaMagic} label="Smart Composer" collapsed={collapsed} />
          </nav>
        )}
        {collapsed && (
          <nav className="flex flex-col gap-4 mt-8 w-full">
            <SidebarItem icon={FaFeatherAlt} label="" collapsed={collapsed} />
            <SidebarItem icon={FaMagic} label="" collapsed={collapsed} />
          </nav>
        )}
      </aside>
    </>
  );
}

function SidebarItem({ icon: Icon, label, collapsed }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors w-full`}>
      <Icon className={collapsed ? "text-3xl" : "text-xl"} />
      {!collapsed && <span className="font-medium">{label}</span>}
    </div>
  );
}