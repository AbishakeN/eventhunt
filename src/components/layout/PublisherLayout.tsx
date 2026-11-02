import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Users, 
  QrCode, 
  DollarSign, 
  Settings, 
  ArrowLeft,
  Sparkles,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const PublisherLayout: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', to: '/publisher', icon: LayoutDashboard, end: true },
    { label: 'Events & Hosting', to: '/publisher/events', icon: Calendar },
    { label: 'Create Event', to: '/publisher/events/create', icon: PlusCircle },
    { label: 'Attendees & Check-in', to: '/publisher/attendees', icon: Users },
    { label: 'QR Scanner Gate', to: '/publisher/scanner', icon: QrCode },
    { label: 'Revenue & Analytics', to: '/publisher/revenue', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Publisher Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Event<span className="text-indigo-400">Sphere</span>
              </span>
            </Link>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Publisher Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  )
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 mb-3">
            <p className="text-xs font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              switchRole('booker');
              navigate('/bookings');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch to Attendee Mode</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

