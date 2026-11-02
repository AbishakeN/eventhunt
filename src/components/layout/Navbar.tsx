import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Bell, 
  Ticket, 
  PlusCircle, 
  User, 
  LogOut, 
  LayoutDashboard, 
  QrCode, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Database,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { checkSupabaseHealth } from '@/integrations/supabase/client';
import { formatTime, cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout, switchRole, isSupabaseLive } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; tablesExist: boolean; message: string }>({
    connected: false,
    tablesExist: false,
    message: 'Checking database...',
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkSupabaseHealth().then((res) => {
      setDbStatus(res);
    });
  }, []);

  const handleRoleToggle = () => {
    const nextRole = role === 'publisher' ? 'booker' : 'publisher';
    switchRole(nextRole);
    if (nextRole === 'publisher') {
      navigate('/publisher');
    } else {
      navigate('/bookings');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 -rotate-12" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Event<span className="text-indigo-600">Sphere</span>
                </span>
                <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/50">
                  PRO
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/events"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600",
                  location.pathname === '/events' ? "text-indigo-600 font-semibold" : "text-slate-600"
                )}
              >
                Discover Events
              </Link>
              <Link
                to="/about"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600",
                  location.pathname === '/about' ? "text-indigo-600 font-semibold" : "text-slate-600"
                )}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600",
                  location.pathname === '/contact' ? "text-indigo-600 font-semibold" : "text-slate-600"
                )}
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Supabase status badge */}
            <div 
              className={cn(
                "hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-help transition",
                dbStatus.tablesExist
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : dbStatus.connected
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}
              title={dbStatus.message}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {dbStatus.tablesExist
                  ? "Supabase Live"
                  : dbStatus.connected
                  ? "Supabase Connected (Migration Needed)"
                  : "Local Storage Mode"}
              </span>
            </div>

            {/* Role switch toggle pill */}
            {isAuthenticated && (
              <button
                onClick={handleRoleToggle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-sm"
                title="Switch view between Host and Attendee mode"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Switch to {role === 'publisher' ? 'Booker' : 'Publisher'}</span>
              </button>
            )}

            {/* Quick Action Button for Publisher */}
            {isAuthenticated && role === 'publisher' && (
              <Link
                to="/publisher/events/create"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            )}

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10 z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 rounded">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link_url) navigate(n.link_url);
                              setShowNotifications(false);
                            }}
                            className={cn(
                              "p-3.5 transition cursor-pointer hover:bg-slate-50 text-left flex gap-3",
                              !n.is_read && "bg-indigo-50/40"
                            )}
                          >
                            <div className="mt-0.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Ticket className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {formatTime(n.created_at)}
                              </p>
                            </div>
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full bg-indigo-600 self-center flex-shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/20 transition"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.full_name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-50 text-indigo-700">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {role === 'publisher' ? (
                        <>
                          <Link
                            to="/publisher"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Publisher Dashboard</span>
                          </Link>
                          <Link
                            to="/publisher/events"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>My Hosted Events</span>
                          </Link>
                          <Link
                            to="/publisher/scanner"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Ticket QR Check-in</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/bookings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>My Bookings & Tickets</span>
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <User className="w-4 h-4" />
                        <span>Account Profile</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-150">
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Discover Events
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Contact
            </Link>
            {isAuthenticated && (
              <>
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      handleRoleToggle();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-between"
                  >
                    <span>Switch Role to {role === 'publisher' ? 'Booker' : 'Publisher'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                {role === 'publisher' ? (
                  <Link
                    to="/publisher"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    Publisher Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    My Bookings & Tickets
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

