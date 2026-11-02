import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Video, Users, ArrowUpRight, Tag } from 'lucide-react';
import { Event } from '@/types/database';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const minPrice = event.min_price ?? 0;
  const isFree = minPrice === 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/95 backdrop-blur-md text-slate-800 shadow-sm">
              {event.category}
            </span>
            {event.location_type === 'online' ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                <Video className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                <MapPin className="w-3 h-3" /> In-Person
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3">
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-900/90 text-white backdrop-blur-md shadow-sm">
              {isFree ? 'Free' : `From ${formatCurrency(minPrice)}`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateTime(event.start_datetime)}</span>
          </div>

          <Link to={`/events/${event.slug || event.id}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate max-w-[180px]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate">
                {event.location_type === 'online' ? (event.online_platform || 'Online Webinar') : `${event.city || 'TBA'}, ${event.state || ''}`}
              </span>
            </div>

            {event.capacity && (
              <div className="flex items-center gap-1 text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{event.capacity} cap</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-5 pb-5">
        <Link
          to={`/events/${event.slug || event.id}`}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <span>View Details & Tickets</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

