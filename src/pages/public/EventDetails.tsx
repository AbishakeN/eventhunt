import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Video, 
  Users, 
  ShieldCheck, 
  Share2, 
  Heart, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  ExternalLink,
  Ticket as TicketIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BookingModal } from '@/components/bookings/BookingModal';
import { eventService, bookingService } from '@/services/api';
import { Event, Booking } from '@/types/database';
import { formatDateTime, formatTime, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const EventDetails: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvent() {
      if (!idOrSlug) return;
      setIsLoading(true);
      try {
        const data = await eventService.getBySlugOrId(idOrSlug);
        setEvent(data);

        // Check if current user already has a valid booking for this event
        if (user && data) {
          const userBookings = await bookingService.getUserBookings(user.id);
          const found = userBookings.find(
            (b) => b.event_id === data.id && b.booking_status !== 'cancelled'
          );
          if (found) setHasTicket(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, [idOrSlug, user]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    toast.success(!isSaved ? 'Added to your saved events' : 'Removed from saved events');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 w-full flex-1 animate-pulse space-y-6">
          <div className="h-96 rounded-3xl bg-slate-200" />
          <div className="h-10 w-2/3 bg-slate-200 rounded-xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center flex-1">
          <TicketIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Event Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The event you are looking for may have been unpublished or removed.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover Other Events</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const minPrice = event.min_price ?? 0;
  const isFree = minPrice === 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Action bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all events</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-xl border transition ${
                isSaved
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Save Event"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Share Event"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Cover Image & Header Card */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-soft-lg mb-8">
          <div className="aspect-[21/9] max-h-[480px] w-full overflow-hidden">
            <img
              src={event.cover_image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white">
                {event.category}
              </span>
              {event.location_type === 'online' ? (
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600/90 text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Virtual Event
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600/90 text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> In-Person Event
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-4xl">
              {event.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{formatDateTime(event.start_datetime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>
                  {event.location_type === 'online' ? (event.online_platform || 'Online Webinar') : `${event.venue_name || 'Venue'}, ${event.city || ''}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details, Organizer, Logistics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">About this Event</h2>
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
                <p>{event.description}</p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location & Access Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Location & Venue Details</h2>

              {event.location_type === 'physical' ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{event.venue_name || 'Physical Venue'}</h4>
                      <p className="text-slate-500 mt-0.5">{event.address}</p>
                      <p className="text-slate-500">{event.city}, {event.state} {event.postal_code}</p>
                    </div>
                  </div>

                  {/* Interactive Styled Map Card */}
                  <div className="h-56 rounded-2xl bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                    <MapPin className="w-10 h-10 text-indigo-600 animate-bounce mb-2" />
                    <p className="text-xs font-bold text-slate-900">{event.venue_name}</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                      {event.address}, {event.city}, {event.state}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue_name || ''} ${event.address || ''} ${event.city || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Online Event: Enforce Security Rule */
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Virtual Streaming Platform: {event.online_platform || 'Zoom Enterprise'}
                      </h4>
                      <p className="text-slate-500 mt-0.5">
                        Instructions: {event.online_instructions || 'Live link and broadcast credentials will be unlocked upon ticket booking.'}
                      </p>
                    </div>
                  </div>

                  {/* Private Meeting Link Protection Card */}
                  {hasTicket ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Authorized Attendee Access Unlocked</span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        Private Stream URL: <a href={event.online_url || '#'} target="_blank" rel="noopener noreferrer" className="font-mono font-bold underline ml-1">{event.online_url || 'https://zoom.us/j/eventsphere-stream'}</a>
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <Lock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">Private Broadcast Access</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          In accordance with EventSphere security policies, private streaming links are encrypted and restricted to verified ticket holders only.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Organizer Profile Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <img
                src={event.publisher?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={event.publisher?.full_name || 'Organizer'}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Organized by
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {event.publisher?.organization_name || event.publisher?.full_name || 'Nexus Event Labs'}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {event.publisher?.bio || 'Verified organizer dedicated to producing remarkable industry gatherings.'}
                </p>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Policies & Terms</h2>
              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <h4 className="font-bold text-slate-900">Refund Policy</h4>
                  <p className="mt-0.5">{event.refund_policy || 'Standard refund policy applies. Contact organizer for transfers.'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Terms of Attendance</h4>
                  <p className="mt-0.5">{event.terms || 'Valid government-issued photo ID required. Admission subject to venue rules.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Box Sticky Sidebar */}
          <div>
            <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-lg space-y-6">
              <div>
                <span className="text-xs font-semibold text-slate-500">Tickets from</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                  {isFree ? 'Free Admission' : formatCurrency(minPrice)}
                </div>
              </div>

              {/* Ticket tier breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Available Ticket Types
                </h4>
                {event.ticket_types && event.ticket_types.length > 0 ? (
                  event.ticket_types.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{t.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {t.total_quantity - t.sold_quantity} available
                        </span>
                      </div>
                      <span className="font-bold text-indigo-600">
                        {t.price === 0 ? 'Free' : formatCurrency(t.price)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Registration opens soon.</p>
                )}
              </div>

              {/* Action Button */}
              <div>
                {hasTicket ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>You have already booked tickets for this event.</span>
                    </div>
                    <Link
                      to="/bookings"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
                    >
                      <TicketIcon className="w-4 h-4" />
                      <span>View My Digital Tickets</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition hover:scale-[1.02]"
                  >
                    <TicketIcon className="w-4 h-4" />
                    <span>Book Tickets</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant Ticket Delivery • Verified QR Security</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Drawer / Modal */}
      <BookingModal
        event={event}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <Footer />
    </div>
  );
};
