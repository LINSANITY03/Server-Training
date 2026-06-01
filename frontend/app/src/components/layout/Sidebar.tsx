"use client";

import { PAGES } from "@/lib/constant";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ isOpen, onToggle, activePage, onNavigate }: SidebarProps) {
  return (
    <nav 
      className={`h-screen border-r border-(--border) bg-(--surface) flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 relative
        ${isOpen ? "w-64" : "w-20"}`}
    >
      <div>
        {/* Branding Area */}
        <div className="h-16 flex items-center px-6 border-b border-(--border) gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-(--amber-dim) border border-[rgba(212,148,58,0.3)] flex items-center justify-center shrink-0">
            <i className="ti ti-crown text-(--amber) text-lg" aria-hidden="true" />
          </div>
          <span className={`font-serif font-semibold text-lg tracking-wide transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            Servox
          </span>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1.5 mt-4">
          {PAGES.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-(--radius) text-left transition-all duration-150 group relative
                  ${isActive 
                    ? "bg-(--amber-dim) text-(--amber-light) font-medium" 
                    : "text-(--text-muted) hover:text-(--text) hover:bg-(--surface2)"
                  }`}
              >
                <i className={`ti ${item.icon} text-xl shrink-0 transition-colors ${isActive ? "text-(--amber)" : "text-(--text-dim) group-hover:text-(--text-muted)"}`} aria-hidden="true" />
                
                <span className={`text-[13.5px] tracking-wide transition-all duration-200 whitespace-nowrap ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none absolute"}`}>
                  {item.label}
                </span>

                {/* Left active accent bar */}
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-0.5 bg-(--amber) rounded-r" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Collapse Toggle */}
      <div className="p-3 border-t border-(--border)">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-(--radius) text-left text-(--text-dim) hover:text-(--text-muted) hover:bg-(--surface2) transition-all"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <i className={`ti text-xl shrink-0 transition-transform duration-300 ${isOpen ? "ti-layout-sidebar-left-collapse" : "ti-layout-sidebar-left-expand rotate-180"}`} aria-hidden="true" />
          <span className={`text-[13px] tracking-wide whitespace-nowrap transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none absolute"}`}>
            Collapse Menu
          </span>
        </button>
      </div>
    </nav>
  );
}