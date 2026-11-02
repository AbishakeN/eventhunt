import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  QrCode, 
  Mail, 
  Tag,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, bookingService, checkinService } from '@/services/api';
import { Event, Ticket } from '@/types/database';
import { formatDateTime, formatDate } from '@/lib/utils';

export const PublisherAttendees: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || 'all');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const evs = await eventService.getPublisherEvents(user.id);
        setEvents(evs);

        const targetId = eventId || (selectedEventId !== 'all' ? selectedEventId : evs[0]?.id);
        if (targetId) {
          setSelectedEventId(targetId);
          const atts = await bookingService.getEventAttendees(targetId);
          setAttendees(atts || []);
        } else {
          setAttendees([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, eventId]);

  const handleEventSwitch = async (newId: string) => {
    setSelectedEventId(newId);
    setIsLoading(true);
    try {
      const atts = await bookingService.getEventAttendees(newId);
      setAttendees(atts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCheckIn = async (ticket: any) => {
    if (!user) return;
    try {
      const res = await checkinService.verifyAndCheckIn(ticket.ticket_number, selectedEventId, user.id);
      if (res.success) {
        toast.success(res.message);
        // Refresh local list
        const updated = attendees.map((a) =>
          a.id === ticket.id ? { ...a, status: 'checked_in', checked_in_at: new Date().toISOString() } : a
        );
        setAttendees(updated);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Check-in error');
    }
  };

  const handleExportCSV = () => {
    if (attendees.length === 0) {
      toast.error('No attendees to export');
      return;
    }

    const headers = ['Ticket Number', 'Attendee Name', 'Attendee Email', 'Ticket Type', 'Booking Reference', 'Payment Status', 'Status', 'Checked In At'];
    const rows = attendees.map((a) => [
      a.ticket_number,
      `"${a.attendee_name}"`,
      a.attendee_email,
      `"${a.ticket_type?.name || 'General'}"`,
      a.booking?.booking_reference || '',
      a.booking?.payment_status || 'completed',
      a.status,
      a.checked_in_at || 'Not Checked In',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_${selectedEventId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendee roster exported to CSV successfully!');
  };

  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.attendee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.attendee_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.booking?.booking_reference?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const checkedInCount = attendees.filter((a) => a.status === 'checked_in').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Attendee Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track reservations, manage gate admissions, and export rosters.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Roster to CSV</span>
        </button>
      </div>

      {/* Event Selector & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Selected Hosted Event:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => handleEventSwitch(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.category})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Total Bookings</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{attendees.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500">Gate Checked-in</span>
            <p className="text-xl font-black text-emerald-600 mt-0.5">
              {checkedInCount} / {attendees.length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search attendee by name, email, ticket #, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'valid', 'checked_in', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading attendee records...</div>
        ) : filteredAttendees.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No attendees found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Attendee</th>
                  <th className="py-3.5">Ticket # & Tier</th>
                  <th className="py-3.5">Booking Ref</th>
                  <th className="py-3.5">Payment</th>
                  <th className="py-3.5">Admission Status</th>
                  <th className="py-3.5 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendees.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-900">{att.attendee_name}</div>
                      <div className="text-[11px] text-slate-400">{att.attendee_email}</div>
                    </td>

                    <td className="py-4">
                      <span className="font-mono text-xs font-semibold text-slate-800 block">
                        {att.ticket_number}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-medium">
                        {att.ticket_type?.name || 'General Admission'}
                      </span>
                    </td>

                    <td className="py-4 font-mono text-slate-600">
                      {att.booking?.booking_reference || 'N/A'}
                    </td>

                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                        {att.booking?.payment_status || 'completed'}
                      </span>
                    </td>

                    <td className="py-4">
                      {att.status === 'checked_in' ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Checked In</span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            {formatDateTime(att.checked_in_at)}
                          </span>
                        </div>
                      ) : att.status === 'cancelled' ? (
                        <div className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Cancelled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>Awaiting Gate Entry</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 text-right pr-6">
                      {att.status === 'valid' && (
                        <button
                          type="button"
                          onClick={() => handleManualCheckIn(att)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-xs transition"
                        >
                          Manual Check-in
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

