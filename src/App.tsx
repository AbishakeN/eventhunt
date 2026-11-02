import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Protected Route Guard
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Public Pages
import { Home } from '@/pages/public/Home';
import { DiscoverEvents } from '@/pages/public/DiscoverEvents';
import { EventDetails } from '@/pages/public/EventDetails';
import { About } from '@/pages/public/About';
import { Contact } from '@/pages/public/Contact';
import { PrivacyPolicy } from '@/pages/public/PrivacyPolicy';
import { TermsConditions } from '@/pages/public/TermsConditions';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ProfilePage } from '@/pages/auth/ProfilePage';

// Layouts
import { PublisherLayout } from '@/components/layout/PublisherLayout';
import { BookerLayout } from '@/components/layout/BookerLayout';

// Publisher Dashboard Pages
import { PublisherOverview } from '@/pages/publisher/PublisherOverview';
import { PublisherEvents } from '@/pages/publisher/PublisherEvents';
import { CreateEvent } from '@/pages/publisher/CreateEvent';
import { PublisherAttendees } from '@/pages/publisher/PublisherAttendees';
import { PublisherScanner } from '@/pages/publisher/PublisherScanner';
import { PublisherRevenue } from '@/pages/publisher/PublisherRevenue';

// Booker Dashboard Pages
import { BookerDashboard } from '@/pages/booker/BookerDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 mins
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<DiscoverEvents />} />
              <Route path="/events/:idOrSlug" element={<EventDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Publisher Protected Portal */}
              <Route
                path="/publisher"
                element={
                  <ProtectedRoute allowedRoles={['publisher']}>
                    <PublisherLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<PublisherOverview />} />
                <Route path="events" element={<PublisherEvents />} />
                <Route path="events/create" element={<CreateEvent />} />
                <Route path="attendees" element={<PublisherAttendees />} />
                <Route path="events/:eventId/attendees" element={<PublisherAttendees />} />
                <Route path="scanner" element={<PublisherScanner />} />
                <Route path="revenue" element={<PublisherRevenue />} />
              </Route>

              {/* Booker / Attendee Protected Portal */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={['booker', 'publisher']}>
                    <BookerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<BookerDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
