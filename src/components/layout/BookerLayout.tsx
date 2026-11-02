import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, User, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const BookerLayout: React.FC = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
              alt={user?.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user?.full_name}</h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-md">
                  Attendee
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Events</span>
            </Link>
            <button
              onClick={() => {
                switchRole('publisher');
                navigate('/publisher');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Switch to Host Mode</span>
            </button>
          </div>
        </div>

        {/* Content Outlet */}
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};
