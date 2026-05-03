import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from "lucide-react";
import { usePermissions } from '../hooks/usePermissions';
import { useUIStore } from '../stores/useUIStore';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  resource?: string | null;
  adminOnly?: boolean;
}

interface SidebarProps {
  navigation: NavigationItem[];
}

export default function Sidebar({ navigation }: SidebarProps) {
  const location = useLocation();
  const { isAdmin, can } = usePermissions();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // فلترة عناصر القائمة بناءً على الصلاحيات
  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.resource === null || item.resource === undefined) return true;
    return can('view', item.resource);
  });

  return (
    <div 
      className={`flex flex-col h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-xl ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 dark:border-gray-700">
        {sidebarOpen && (
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            Djadwal
          </h1>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {sidebarOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none translate-x-1'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <item.icon
                className={`flex-shrink-0 h-6 w-6 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                } ${!sidebarOpen ? 'mx-auto' : 'ml-3'}`}
              />
              {sidebarOpen && (
                <span className="font-bold text-sm tracking-wide">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} px-2 py-1`}>
          {sidebarOpen && <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">الإصدار 2.0</span>}
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
        </div>
      </div>
    </div>
  );
}