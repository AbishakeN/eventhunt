import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Mail, Heart, Shield, Globe, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Ticket className="w-5 h-5 -rotate-12" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Event<span className="text-indigo-400">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier platform for hosting unforgettable events and discovering extraordinary live experiences. Built with Supabase and modern web technology.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-4 h-4" /> Bank-grade 256-bit SSL Security
              </span>
            </div>
          </div>

          {/* Quick links: Attendees */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              For Attendees
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/events" className="hover:text-indigo-400 transition">
                  Browse All Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=Technology" className="hover:text-indigo-400 transition">
                  Tech Conferences
                </Link>
              </li>
              <li>
                <Link to="/events?category=Music" className="hover:text-indigo-400 transition">
                  Concerts & Music
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-indigo-400 transition">
                  My Tickets & QR Codes
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links: Organizers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              For Hosts & Publishers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/publisher/events/create" className="hover:text-indigo-400 transition">
                  Create an Event
                </Link>
              </li>
              <li>
                <Link to="/publisher" className="hover:text-indigo-400 transition">
                  Publisher Dashboard
                </Link>
              </li>
              <li>
                <Link to="/publisher/scanner" className="hover:text-indigo-400 transition">
                  Live QR Gate Check-in
                </Link>
              </li>
              <li>
                <Link to="/publisher/revenue" className="hover:text-indigo-400 transition">
                  Revenue & Payouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition">
                  About EventSphere
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-indigo-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-400 transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EventSphere Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400 transition">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition">Terms</Link>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for world-class organizers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
