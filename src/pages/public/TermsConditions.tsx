import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
            Terms of Service
          </h1>
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              Welcome to EventSphere. By accessing or using our platform, you agree to be bound by these Terms and Conditions.
            </p>
            <h3 className="text-base font-bold text-slate-900">1. Role Responsibilities</h3>
            <p>
              <strong>Event Publishers:</strong> Hosts are solely responsible for providing accurate descriptions, valid physical venues or authorized online links, honoring ticket admissions, and abiding by published cancellation/refund terms. Publishers may not arbitrarily alter or delete event records that invalidate active ticket holders.
            </p>
            <p>
              <strong>Event Bookers:</strong> Attendees must present valid digital or printed QR tickets at venue admission checkpoints. Duplicate check-in attempts or counterfeit tokens will be rejected by our automated gate scanner.
            </p>
            <h3 className="text-base font-bold text-slate-900">2. Ticket Inventory Integrity</h3>
            <p>
              EventSphere employs atomic row-level reservation locks to ensure ticket quantities reflect real-time capacity and prevent overselling.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
