import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  Eye, 
  Download, 
  XCircle, 
  Compass, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/api';
import { Booking, Ticket } from '@/types/database';
import { DigitalTicketModal } from '@/components/tickets/DigitalTicketModal';
import { formatDateTime, formatDate, formatCurrency } from '@/lib/utils';

export const BookerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  // Modal inspection state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await bookingService.getUserBookings(user.id);
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (booking: Booking) => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to cancel booking ${booking.booking_reference}? Reserved tickets will be released back to the event.`)) {
      try {
        await bookingService.cancelBooking(booking.id, user.id);
        toast.success('Booking cancelled successfully.');
        fetchBookings();
      } catch (err: any) {
        toast.error(err.message || 'Failed to cancel booking.');
      }
    }
  };

  const now = new Date();

  // Metrics
  const totalTickets = bookings
    .filter((b) => b.booking_status !== 'cancelled')
    .reduce((acc, b) => acc + (b.tickets?.length || 1), 0);

  const upcomingBookings = bookings.filter(
    (b) => b.booking_status === 'confirmed' && b.event && new Date(b.event.start_datetime) >= now
  );

  const pastBookings = bookings.filter(
    (b) => b.booking_status === 'confirmed' && b.event && new Date(b.event.start_datetime) < now
  );

  const cancelledBookings = bookings.filter((b) => b.booking_status === 'cancelled');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return b.booking_status === 'confirmed' && b.event && new Date(b.event.start_datetime) >= now;
    }
    if (activeTab === 'past') {
      return b.booking_status === 'confirmed' && b.event && new Date(b.event.start_datetime) < now;
    }
    if (activeTab === 'cancelled') {
      return b.booking_status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-semibold text-slate-500">Total Passes</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalTickets}</p>
          <p className="text-[11px] text-indigo-600 mt-0.5">Active issued tickets</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-semibold text-slate-500">Upcoming Events</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{upcomingBookings.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Ready for admission</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-semibold text-slate-500">Past Attended</span>
          <p className="text-2xl font-black text-slate-700 mt-1">{pastBookings.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Completed experiences</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-semibold text-slate-500">Cancelled</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{cancelledBookings.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Released reservations</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: `All Bookings (${bookings.length})` },
            { id: 'upcoming', label: `Upcoming (${upcomingBookings.length})` },
            { id: 'past', label: `Past (${pastBookings.length})` },
            { id: 'cancelled', label: `Cancelled (${cancelledBookings.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
        >
          <Compass className="w-4 h-4" />
          <span>Discover More Events</span>
        </Link>
      </div>

      {/* Bookings Card List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <TicketIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No bookings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any bookings in this section. Discover upcoming summits, masterclasses, and concerts!
          </p>
          <Link
            to="/events"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <span>Browse Events</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => {
            const ev = booking.event;
            const tickets = booking.tickets || [];
            const isCancelled = booking.booking_status === 'cancelled';

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-3xl border shadow-soft overflow-hidden transition-all ${
                  isCancelled ? 'opacity-70 border-slate-200' : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <img
                      src={ev?.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'}
                      alt={ev?.title}
                      className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {booking.booking_reference}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCancelled
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {booking.booking_status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {ev?.title || 'Event'}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateTime(ev?.start_datetime)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev?.location_type === 'online' ? 'Online Streaming' : ev?.venue_name || ev?.city}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Pricing summary */}
                  <div className="flex items-center justify-between md:justify-end gap-6 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid</span>
                      <p className="text-base font-extrabold text-slate-900">
                        {booking.total_amount === 0 ? 'Free' : formatCurrency(booking.total_amount)}
                      </p>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>

                {/* Individual Issued Tickets in this Booking */}
                <div className="p-6 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Issued Admission Passes ({tickets.length}):
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.attendee_name}</p>
                          <p className="font-mono text-[10px] text-slate-500 mt-0.5">{t.ticket_number}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-600">
                            {t.ticket_type?.name || 'Admission'}
                          </span>
                        </div>

                        {!isCancelled && (
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setSelectedBooking(booking);
                              setIsTicketModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Ticket</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Ticket Modal */}
      <DigitalTicketModal
        ticket={selectedTicket}
        booking={selectedBooking}
        event={selectedBooking?.event || null}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </div>
  );
};
