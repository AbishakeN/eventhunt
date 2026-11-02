import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield, Sparkles, Users, Award, Target, Heart } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              About EventSphere
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Empowering Extraordinary Gatherings Worldwide
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              EventSphere was built to bridge the gap between world-class event creators and passionate audiences through modern cloud technology, bulletproof ticketing security, and delightful user experiences.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Cryptographic Gate Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every ticket is protected with a non-guessable, tamper-proof secure token and high-contrast QR code, guaranteeing zero duplicate entry or fraud.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant Scalability</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Powered by Supabase PostgreSQL row-level locks and transaction management, our booking engine prevents overselling even during high-velocity drops.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Host & Attendee First</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transparent revenue management, instant CSV attendee exports, and offline ticket downloads make event management effortless for organizers.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
