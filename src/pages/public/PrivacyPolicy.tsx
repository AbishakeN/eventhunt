import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
            Privacy Policy
          </h1>
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              Last Updated: November 2026. At EventSphere, accessible from eventsphere.com, your privacy and digital security are fundamental principles.
            </p>
            <h3 className="text-base font-bold text-slate-900">1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us when creating an account, registering for events, configuring ticket inventories, and interacting with customer support. This includes full name, email, phone number, and organization details.
            </p>
            <h3 className="text-base font-bold text-slate-900">2. Row Level Security & QR Privacy</h3>
            <p>
              In accordance with our architecture, Row Level Security (RLS) guarantees that attendee identities and transaction details are isolated. Digital ticket QR codes contain non-guessable cryptographic tokens and never expose attendee personal identifying information or credit card credentials in plain text.
            </p>
            <h3 className="text-base font-bold text-slate-900">3. Payment Information</h3>
            <p>
              EventSphere does not store raw credit card numbers or banking secrets. Payment transactions are processed via secure server-verified gateways such as Razorpay.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
