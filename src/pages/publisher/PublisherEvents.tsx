import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  MapPin, 
  Edit3, 
  Trash2, 
  Copy, 
  Ban, 
  CheckCircle, 
  Eye, 
  Users, 
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/api';
import { Event, EventStatus } from '@/types/database';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export const PublisherEvents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await eventService.getPublisherEvents(user.id);
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
    try {
      await eventService.updateEventStatus(eventId, newStatus);
      toast.success(`Event status changed to ${newStatus}`);
      loadEvents();
    } catch {
      toast.error('Failed to change status');
    }
  };

  const handleDuplicate = async (event: Event) => {
    try {
      const dup = {
        ...event,
        title: `${event.title} (Copy)`,
        slug: `${event.slug}-copy-${Math.random().toString(36).substring(2, 6)}`,
        status: 'draft' as const,
      };
      const ticketTypes = (event.ticket_types || []).map((t) => ({
        name: t.name,
        price: t.price,
        total_quantity: t.total_quantity,
        max_per_booking: t.max_per_booking,
        description: t.description,
      }));

      await eventService.createEvent(dup, ticketTypes);
      toast.success('Event duplicated as draft!');
      loadEvents();
    } catch {
      toast.error('Failed to duplicate event');
    }
  };

  const handleDelete = async (eventId: string, status: EventStatus) => {
    if (status !== 'draft') {
      toast.error('Only draft events with no bookings can be permanently deleted. Use "Cancel Event" instead.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this draft event?')) {
      try {
        await eventService.deleteEvent(eventId);
        toast.success('Draft event deleted');
        loadEvents();
      } catch {
        toast.error('Failed to delete event');
      }
    }
  };

  const filtered = events.filter((e) => {
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hosted Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your draft, active, and completed experiences.
          </p>
        </div>

        <Link
          to="/publisher/events/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event title, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'published', 'draft', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / Card Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No events found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or create your first event.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event) => {
            const sold = (event.ticket_types || []).reduce((acc, t) => acc + (t.sold_quantity || 0), 0);
            const totalRevenue = (event.ticket_types || []).reduce(
              (acc, t) => acc + (t.sold_quantity || 0) * Number(t.price),
              0
            );

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-indigo-200 transition"
              >
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          event.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : event.status === 'draft'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {event.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">• {event.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm md:text-base">
                      {event.title}
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateTime(event.start_datetime)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.location_type === 'online' ? 'Online' : `${event.city || 'TBA'}`}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Sold</p>
                    <p className="text-sm font-bold text-slate-900">{sold} / {event.capacity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gross Sales</p>
                    <p className="text-sm font-bold text-indigo-600">{formatCurrency(totalRevenue)}</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                    <Link
                      to={`/publisher/events/${event.id}/attendees`}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                      title="Manage Attendees"
                    >
                      <Users className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/events/${event.slug || event.id}`}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                      title="Preview Event Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(event)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                      title="Duplicate Event"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {event.status === 'draft' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(event.id, 'published')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Publish Live"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    {event.status === 'published' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(event.id, 'draft')}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Unpublish to Draft"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {event.status === 'draft' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id, event.status)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
