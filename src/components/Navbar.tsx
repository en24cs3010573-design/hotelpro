import React, { useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { UserRole } from '../types/hotel';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    currentUser,
    setCurrentUserRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    config,
    resetToInitialDemo,
  } = useHotel();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string }> = {
    guest: { title: 'Guest Persona', badge: 'Guest', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    staff: { title: 'Front Desk Receptionist', badge: 'Staff', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    manager: { title: 'Operations Manager', badge: 'Manager', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    admin: { title: 'Hotel Administrator', badge: 'Admin', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  };

  const navItems = [
    { id: 'explore', label: 'Explore & Book' },
    { id: 'reservations', label: 'My Reservations' },
    { id: 'frontdesk', label: 'Front Desk' },
    { id: 'operations', label: 'Operations & Rooms' },
    { id: 'analytics', label: 'Admin & Analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 text-left group transition"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-neutral-800 transition">
                HP
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap block leading-tight">
                  HotelPro
                </span>
                <span className="text-[11px] text-neutral-500 font-medium whitespace-nowrap block">
                  {config.hotelName}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions, Role Persona & Notifications */}
          <div className="flex items-center gap-2.5 shrink-0">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-neutral-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-left hover:bg-neutral-50 cursor-pointer transition ${
                            !n.read ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-semibold text-neutral-900 truncate">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 shrink-0">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Persona Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white transition shadow-xs text-left"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-neutral-900 leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-medium capitalize mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Switch Active Role
                    </span>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {(['guest', 'staff', 'manager', 'admin'] as UserRole[]).map((r) => {
                      const isCurrent = currentUser.role === r;
                      const info = roleLabels[r];
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            setCurrentUserRole(r);
                            setShowRoleMenu(false);
                            if (r === 'guest') setActiveTab('explore');
                            if (r === 'staff') setActiveTab('frontdesk');
                            if (r === 'manager') setActiveTab('operations');
                            if (r === 'admin') setActiveTab('analytics');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition ${
                            isCurrent
                              ? 'bg-neutral-900 text-white font-medium'
                              : 'text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{info.title}</div>
                            <div
                              className={`text-[10px] ${
                                isCurrent ? 'text-neutral-300' : 'text-neutral-400'
                              }`}
                            >
                              Role: {info.badge}
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 mt-1.5 border-t border-neutral-100 px-1">
                    <button
                      onClick={() => {
                        resetToInitialDemo();
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-neutral-100 overflow-x-auto gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
