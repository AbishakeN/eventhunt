import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Event, TicketType, Booking, BookingItem, Ticket, Notification, Profile, EventStatus } from '@/types/database';
import { INITIAL_EVENTS, INITIAL_TICKET_TYPES, INITIAL_PROFILES } from './mockData';
import { generateRef, generateSecureToken, isUUID, generateUUID } from '@/lib/utils';

// Local storage keys for persistent mock mode
const STORAGE_KEYS = {
  EVENTS: 'eventsphere_events',
  TICKETS_TYPES: 'eventsphere_ticket_types',
  BOOKINGS: 'eventsphere_bookings',
  BOOKING_ITEMS: 'eventsphere_booking_items',
  TICKETS: 'eventsphere_tickets',
  NOTIFICATIONS: 'eventsphere_notifications',
  PROFILES: 'eventsphere_profiles',
  ACTIVE_USER: 'eventsphere_active_user',
};

// Initialize localStorage data if empty
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  // Auto-upgrade legacy mock non-UUID strings to valid UUIDs
  try {
    const rawEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const rawProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if ((rawEvents && rawEvents.includes('ev-ai-summit-2026')) || (rawProfiles && rawProfiles.includes('user-publisher-01'))) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      localStorage.setItem(STORAGE_KEYS.TICKETS_TYPES, JSON.stringify(INITIAL_TICKET_TYPES));
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      localStorage.removeItem(STORAGE_KEYS.BOOKING_ITEMS);
      localStorage.removeItem(STORAGE_KEYS.TICKETS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    }
  } catch {}

  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS_TYPES)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS_TYPES, JSON.stringify(INITIAL_TICKET_TYPES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    // Generate an initial sample booking for Booker Sarah Chen
    const sampleBookingId = '00000000-0000-0000-0000-000000000010';
    const sampleBookingRef = 'ES-DEMO9824';
    const sampleEvent = INITIAL_EVENTS[0];
    const sampleTicketType = INITIAL_TICKET_TYPES[0];

    const sampleBooking: Booking = {
      id: sampleBookingId,
      booking_reference: sampleBookingRef,
      user_id: '00000000-0000-0000-0000-000000000002',
      event_id: sampleEvent.id,
      subtotal: 299,
      fees: 15,
      taxes: 25.12,
      total_amount: 339.12,
      payment_status: 'completed',
      booking_status: 'confirmed',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    const sampleItem: BookingItem = {
      id: '00000000-0000-0000-0000-000000000011',
      booking_id: sampleBookingId,
      ticket_type_id: sampleTicketType.id,
      quantity: 1,
      unit_price: 299,
      subtotal: 299,
    };

    const sampleTicket: Ticket = {
      id: '00000000-0000-0000-0000-000000000012',
      booking_id: sampleBookingId,
      booking_item_id: sampleItem.id,
      ticket_number: `${sampleBookingRef}-T01`,
      secure_token: 'TKT_demo_secure_token_999824',
      attendee_name: 'Sarah Chen',
      attendee_email: 'booker@eventsphere.com',
      status: 'valid',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    const sampleNotification: Notification = {
      id: '00000000-0000-0000-0000-000000000013',
      user_id: '00000000-0000-0000-0000-000000000002',
      title: 'Booking Confirmed: Global AI & Cloud Summit 2026',
      message: 'Your booking ES-DEMO9824 is confirmed. Get ready for an extraordinary experience!',
      notification_type: 'booking',
      is_read: false,
      link_url: '/bookings',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([sampleBooking]));
    localStorage.setItem(STORAGE_KEYS.BOOKING_ITEMS, JSON.stringify([sampleItem]));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([sampleTicket]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([sampleNotification]));
  }
}

initializeLocalStorage();

// LocalStorage helpers
function getLocal<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocal<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// ==========================================
// EVENTS SERVICE
// ==========================================
export const eventService = {
  async getAllPublished(filters?: { category?: string; search?: string; sort?: string; priceType?: string }) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('events')
          .select('*, publisher:profiles(*), ticket_types(*)')
          .eq('status', 'published');

        if (filters?.category && filters.category !== 'All Categories') {
          query = query.eq('category', filters.category);
        }

        if (filters?.search) {
          query = query.ilike('title', `%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Event[];
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    // Local fallback
    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);
    const profiles = getLocal<Profile>(STORAGE_KEYS.PROFILES);

    let published = events
      .filter((e) => e.status === 'published')
      .map((ev) => {
        const evTickets = ticketTypes.filter((t) => t.event_id === ev.id);
        const publisher = profiles.find((p) => p.id === ev.publisher_id);
        const prices = evTickets.map((t) => Number(t.price));
        return {
          ...ev,
          ticket_types: evTickets,
          publisher,
          min_price: prices.length ? Math.min(...prices) : 0,
          max_price: prices.length ? Math.max(...prices) : 0,
        };
      });

    if (filters?.category && filters.category !== 'All Categories') {
      published = published.filter((e) => e.category === filters.category);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      published = published.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters?.priceType === 'free') {
      published = published.filter((e) => e.min_price === 0);
    } else if (filters?.priceType === 'paid') {
      published = published.filter((e) => (e.min_price || 0) > 0);
    }

    if (filters?.sort === 'price-low') {
      published.sort((a, b) => (a.min_price || 0) - (b.min_price || 0));
    } else if (filters?.sort === 'price-high') {
      published.sort((a, b) => (b.min_price || 0) - (a.min_price || 0));
    } else if (filters?.sort === 'date-asc') {
      published.sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());
    } else {
      // Default: newest
      published.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return published;
  },

  async getBySlugOrId(identifier: string) {
    if (isSupabaseConfigured) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        const { data, error } = await supabase
          .from('events')
          .select('*, publisher:profiles(*), ticket_types(*)')
          .or(isUUID ? `id.eq.${identifier},slug.eq.${identifier}` : `slug.eq.${identifier}`)
          .single();

        if (error) throw error;
        return data as Event;
      } catch (err) {
        console.warn('Supabase getBySlugOrId failed, checking local store:', err);
      }
    }

    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);
    const profiles = getLocal<Profile>(STORAGE_KEYS.PROFILES);

    const ev = events.find((e) => e.id === identifier || e.slug === identifier);
    if (!ev) return null;

    const evTickets = ticketTypes.filter((t) => t.event_id === ev.id);
    const publisher = profiles.find((p) => p.id === ev.publisher_id);
    const prices = evTickets.map((t) => Number(t.price));

    return {
      ...ev,
      ticket_types: evTickets,
      publisher,
      min_price: prices.length ? Math.min(...prices) : 0,
      max_price: prices.length ? Math.max(...prices) : 0,
    };
  },

  async getPublisherEvents(publisherId: string) {
    if (isSupabaseConfigured && isUUID(publisherId)) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, ticket_types(*)')
          .eq('publisher_id', publisherId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Event[];
      } catch (err) {
        console.warn('Supabase getPublisherEvents fallback:', err);
      }
    }

    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);
    const bookings = getLocal<Booking>(STORAGE_KEYS.BOOKINGS);

    return events
      .filter((e) => e.publisher_id === publisherId)
      .map((ev) => {
        const evTickets = ticketTypes.filter((t) => t.event_id === ev.id);
        const evBookings = bookings.filter((b) => b.event_id === ev.id && b.booking_status !== 'cancelled');
        const ticketsSold = evTickets.reduce((acc, t) => acc + (t.sold_quantity || 0), 0);
        return {
          ...ev,
          ticket_types: evTickets,
          tickets_sold_count: ticketsSold,
          total_revenue: evBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createEvent(eventData: Partial<Event>, ticketTypes: Partial<TicketType>[]) {
    const newEventId = generateUUID();
    const slug = eventData.slug || generateRef().toLowerCase();

    const fullEvent: Event = {
      id: newEventId,
      publisher_id: eventData.publisher_id || '00000000-0000-0000-0000-000000000001',
      title: eventData.title || 'Untitled Event',
      slug,
      description: eventData.description || '',
      category: eventData.category || 'Technology',
      cover_image: eventData.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
      location_type: eventData.location_type || 'physical',
      venue_name: eventData.venue_name,
      address: eventData.address,
      city: eventData.city,
      state: eventData.state,
      postal_code: eventData.postal_code,
      online_platform: eventData.online_platform,
      online_url: eventData.online_url,
      online_instructions: eventData.online_instructions,
      start_datetime: eventData.start_datetime || new Date().toISOString(),
      end_datetime: eventData.end_datetime || new Date().toISOString(),
      timezone: eventData.timezone || 'UTC',
      registration_deadline: eventData.registration_deadline,
      capacity: Number(eventData.capacity) || 100,
      status: eventData.status || 'published',
      refund_policy: eventData.refund_policy,
      terms: eventData.terms,
      tags: eventData.tags || [],
      created_at: new Date().toISOString(),
    };

    const newTicketTypes: TicketType[] = ticketTypes.map((t) => ({
      id: generateUUID(),
      event_id: newEventId,
      name: t.name || 'General Admission',
      description: t.description,
      price: Number(t.price) || 0,
      total_quantity: Number(t.total_quantity) || 100,
      sold_quantity: 0,
      max_per_booking: Number(t.max_per_booking) || 5,
      status: 'active',
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured) {
      try {
        const { data: createdEvent, error: evErr } = await supabase
          .from('events')
          .insert({
            ...fullEvent,
            id: undefined, // Let Supabase generate UUID if configured
          })
          .select()
          .single();

        if (evErr) throw evErr;

        if (createdEvent && ticketTypes.length > 0) {
          const formattedTickets = ticketTypes.map((t) => ({
            event_id: createdEvent.id,
            name: t.name,
            description: t.description,
            price: t.price,
            total_quantity: t.total_quantity,
            sold_quantity: 0,
            max_per_booking: t.max_per_booking || 5,
            status: 'active',
          }));

          await supabase.from('ticket_types').insert(formattedTickets);
        }

        return createdEvent as Event;
      } catch (err) {
        console.warn('Supabase createEvent failed, saving to local store:', err);
      }
    }

    // Local fallback
    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const existingTicketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);

    setLocal(STORAGE_KEYS.EVENTS, [fullEvent, ...events]);
    setLocal(STORAGE_KEYS.TICKETS_TYPES, [...existingTicketTypes, ...newTicketTypes]);

    return { ...fullEvent, ticket_types: newTicketTypes };
  },

  async updateEventStatus(eventId: string, status: EventStatus) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('events').update({ status }).eq('id', eventId);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase updateEventStatus error:', err);
      }
    }

    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const updated = events.map((e) => (e.id === eventId ? { ...e, status, updated_at: new Date().toISOString() } : e));
    setLocal(STORAGE_KEYS.EVENTS, updated);
  },

  async updateEvent(eventId: string, updates: Partial<Event>) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('events').update(updates).eq('id', eventId).select().single();
        if (error) throw error;
        return data as Event;
      } catch (err) {
        console.warn('Supabase updateEvent error:', err);
      }
    }

    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const updated = events.map((e) => (e.id === eventId ? { ...e, ...updates, updated_at: new Date().toISOString() } : e));
    setLocal(STORAGE_KEYS.EVENTS, updated);
    return updated.find((e) => e.id === eventId);
  },

  async deleteEvent(eventId: string) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase deleteEvent error:', err);
      }
    }

    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    setLocal(STORAGE_KEYS.EVENTS, events.filter((e) => e.id !== eventId));
  },
};

// ==========================================
// BOOKING & CHECKOUT SERVICE
// ==========================================
export interface CreateBookingParams {
  userId: string;
  eventId: string;
  items: { ticketTypeId: string; quantity: number; unitPrice: number }[];
  attendees: { ticketTypeId: string; attendeeName: string; attendeeEmail: string }[];
  subtotal: number;
  fees: number;
  taxes: number;
  totalAmount: number;
  paymentProvider?: string;
  providerPaymentId?: string;
  providerOrderId?: string;
}

export const bookingService = {
  async createBooking(params: CreateBookingParams): Promise<{ success: boolean; booking: Booking; tickets: Ticket[] }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('create_booking_atomic', {
          p_user_id: params.userId,
          p_event_id: params.eventId,
          p_items: params.items.map((it) => ({
            ticket_type_id: it.ticketTypeId,
            quantity: it.quantity,
            unit_price: it.unitPrice,
          })),
          p_attendees: params.attendees.map((at) => ({
            ticket_type_id: at.ticketTypeId,
            attendee_name: at.attendeeName,
            attendee_email: at.attendeeEmail,
          })),
          p_subtotal: params.subtotal,
          p_fees: params.fees,
          p_taxes: params.taxes,
          p_total_amount: params.totalAmount,
          p_payment_provider: params.paymentProvider || 'free',
          p_provider_order_id: params.providerOrderId || null,
          p_provider_payment_id: params.providerPaymentId || null,
        });

        if (error) throw error;

        // Fetch the created booking with tickets
        const { data: bData } = await supabase
          .from('bookings')
          .select('*, event:events(*), tickets(*)')
          .eq('id', data.booking_id)
          .single();

        return {
          success: true,
          booking: bData as Booking,
          tickets: (bData?.tickets || []) as Ticket[],
        };
      } catch (err) {
        console.warn('Supabase create_booking_atomic error, executing atomic local transaction:', err);
      }
    }

    // Local atomic booking implementation
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);
    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const bookings = getLocal<Booking>(STORAGE_KEYS.BOOKINGS);
    const bookingItems = getLocal<BookingItem>(STORAGE_KEYS.BOOKING_ITEMS);
    const tickets = getLocal<Ticket>(STORAGE_KEYS.TICKETS);
    const notifications = getLocal<Notification>(STORAGE_KEYS.NOTIFICATIONS);

    // 1. Validate and lock ticket quantities
    for (const item of params.items) {
      const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
      if (!tt) throw new Error('Ticket type not found');
      const available = tt.total_quantity - tt.sold_quantity;
      if (available < item.quantity) {
        throw new Error(`Sold out or insufficient tickets for ${tt.name}. Only ${available} remaining.`);
      }
    }

    // 2. Decrement inventory
    const updatedTicketTypes = ticketTypes.map((t) => {
      const match = params.items.find((it) => it.ticketTypeId === t.id);
      if (match) {
        const newSold = t.sold_quantity + match.quantity;
        return {
          ...t,
          sold_quantity: newSold,
          status: (newSold >= t.total_quantity ? 'sold_out' : t.status) as 'active' | 'sold_out',
        };
      }
      return t;
    });

    const targetEvent = events.find((e) => e.id === params.eventId);
    const bookingRef = generateRef();
    const bookingId = 'bk-' + Math.random().toString(36).substring(2, 9);
    const isPaid = params.totalAmount > 0;

    const newBooking: Booking = {
      id: bookingId,
      booking_reference: bookingRef,
      user_id: params.userId,
      event_id: params.eventId,
      subtotal: params.subtotal,
      fees: params.fees,
      taxes: params.taxes,
      total_amount: params.totalAmount,
      payment_status: isPaid ? 'completed' : 'completed',
      booking_status: 'confirmed',
      created_at: new Date().toISOString(),
      event: targetEvent,
    };

    // 3. Create items and tickets
    const createdItems: BookingItem[] = [];
    const createdTickets: Ticket[] = [];
    let ticketIndex = 1;

    for (const it of params.items) {
      const itemId = 'bki-' + Math.random().toString(36).substring(2, 9);
      const tt = ticketTypes.find((t) => t.id === it.ticketTypeId);
      const bItem: BookingItem = {
        id: itemId,
        booking_id: bookingId,
        ticket_type_id: it.ticketTypeId,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        subtotal: it.quantity * it.unitPrice,
        ticket_type: tt,
      };
      createdItems.push(bItem);

      // Attendees for this item
      const itemAttendees = params.attendees.filter((a) => a.ticketTypeId === it.ticketTypeId);
      for (const att of itemAttendees) {
        const ticketNum = `${bookingRef}-T${String(ticketIndex++).padStart(2, '0')}`;
        const secToken = generateSecureToken();
        const tkt: Ticket = {
          id: 'tkt-' + Math.random().toString(36).substring(2, 9),
          booking_id: bookingId,
          booking_item_id: itemId,
          ticket_number: ticketNum,
          secure_token: secToken,
          attendee_name: att.attendeeName,
          attendee_email: att.attendeeEmail,
          status: 'valid',
          created_at: new Date().toISOString(),
          ticket_type: tt,
          booking: newBooking,
        };
        createdTickets.push(tkt);
      }
    }

    // 4. Notifications
    const newNotifBooker: Notification = {
      id: 'ntf-' + Math.random().toString(36).substring(2, 9),
      user_id: params.userId,
      title: `Booking Confirmed: ${targetEvent?.title || 'Event'}`,
      message: `Your booking ${bookingRef} has been confirmed. ${createdTickets.length} ticket(s) issued.`,
      notification_type: 'booking',
      is_read: false,
      link_url: '/bookings',
      created_at: new Date().toISOString(),
    };

    const newNotifPublisher: Notification = {
      id: 'ntf-' + Math.random().toString(36).substring(2, 9),
      user_id: targetEvent?.publisher_id || 'user-publisher-01',
      title: `New Ticket Booking: ${targetEvent?.title || 'Event'}`,
      message: `${params.attendees[0]?.attendeeName || 'An attendee'} just booked ${createdTickets.length} ticket(s) [Ref: ${bookingRef}].`,
      notification_type: 'booking',
      is_read: false,
      link_url: `/publisher/events/${params.eventId}/attendees`,
      created_at: new Date().toISOString(),
    };

    // Save state
    setLocal(STORAGE_KEYS.TICKETS_TYPES, updatedTicketTypes);
    setLocal(STORAGE_KEYS.BOOKINGS, [newBooking, ...bookings]);
    setLocal(STORAGE_KEYS.BOOKING_ITEMS, [...createdItems, ...bookingItems]);
    setLocal(STORAGE_KEYS.TICKETS, [...createdTickets, ...tickets]);
    setLocal(STORAGE_KEYS.NOTIFICATIONS, [newNotifBooker, newNotifPublisher, ...notifications]);

    return {
      success: true,
      booking: { ...newBooking, tickets: createdTickets, items: createdItems },
      tickets: createdTickets,
    };
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    if (isSupabaseConfigured && isUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, event:events(*), tickets(*, ticket_type:ticket_types(*)), items:booking_items(*, ticket_type:ticket_types(*))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Booking[];
      } catch (err) {
        console.warn('Supabase getUserBookings error:', err);
      }
    }

    const bookings = getLocal<Booking>(STORAGE_KEYS.BOOKINGS);
    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);
    const tickets = getLocal<Ticket>(STORAGE_KEYS.TICKETS);
    const items = getLocal<BookingItem>(STORAGE_KEYS.BOOKING_ITEMS);
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);

    return bookings
      .filter((b) => b.user_id === userId)
      .map((b) => {
        const ev = events.find((e) => e.id === b.event_id);
        const bTickets = tickets
          .filter((t) => t.booking_id === b.id)
          .map((t) => {
            const bi = items.find((i) => i.id === t.booking_item_id);
            const tt = ticketTypes.find((tp) => tp.id === bi?.ticket_type_id);
            return { ...t, ticket_type: tt, booking: b };
          });

        const bItems = items
          .filter((i) => i.booking_id === b.id)
          .map((i) => {
            const tt = ticketTypes.find((tp) => tp.id === i.ticket_type_id);
            return { ...i, ticket_type: tt };
          });

        return { ...b, event: ev, tickets: bTickets, items: bItems };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getEventAttendees(eventId: string) {
    if (isSupabaseConfigured && isUUID(eventId)) {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*, booking:bookings!inner(*, event:events!inner(*)), ticket_type:ticket_types(*)')
          .eq('booking.event_id', eventId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase getEventAttendees error:', err);
      }
    }

    const tickets = getLocal<Ticket>(STORAGE_KEYS.TICKETS);
    const bookings = getLocal<Booking>(STORAGE_KEYS.BOOKINGS);
    const items = getLocal<BookingItem>(STORAGE_KEYS.BOOKING_ITEMS);
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);

    const eventBookings = bookings.filter((b) => b.event_id === eventId);
    const bookingIds = new Set(eventBookings.map((b) => b.id));

    return tickets
      .filter((t) => bookingIds.has(t.booking_id))
      .map((t) => {
        const booking = eventBookings.find((b) => b.id === t.booking_id);
        const item = items.find((i) => i.id === t.booking_item_id);
        const ticketType = ticketTypes.find((tt) => tt.id === item?.ticket_type_id);
        return {
          ...t,
          booking,
          ticket_type: ticketType,
        };
      });
  },

  async cancelBooking(bookingId: string, userId: string) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('cancel_booking', {
          p_booking_id: bookingId,
          p_user_id: userId,
        });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase cancel_booking error:', err);
      }
    }

    const bookings = getLocal<Booking>(STORAGE_KEYS.BOOKINGS);
    const items = getLocal<BookingItem>(STORAGE_KEYS.BOOKING_ITEMS);
    const tickets = getLocal<Ticket>(STORAGE_KEYS.TICKETS);
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);
    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    // Return inventory
    const bItems = items.filter((i) => i.booking_id === bookingId);
    const updatedTicketTypes = ticketTypes.map((t) => {
      const match = bItems.find((bi) => bi.ticket_type_id === t.id);
      if (match) {
        return {
          ...t,
          sold_quantity: Math.max(0, t.sold_quantity - match.quantity),
          status: 'active' as const,
        };
      }
      return t;
    });

    const updatedBookings = bookings.map((b) =>
      b.id === bookingId ? { ...b, booking_status: 'cancelled' as const, updated_at: new Date().toISOString() } : b
    );

    const updatedTickets = tickets.map((t) =>
      t.booking_id === bookingId ? { ...t, status: 'cancelled' as const } : t
    );

    const ev = events.find((e) => e.id === booking.event_id);
    const notif: Notification = {
      id: 'ntf-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      title: `Booking Cancelled: ${ev?.title || 'Event'}`,
      message: `Your booking ${booking.booking_reference} has been successfully cancelled.`,
      notification_type: 'booking',
      is_read: false,
      link_url: '/bookings',
      created_at: new Date().toISOString(),
    };

    setLocal(STORAGE_KEYS.TICKETS_TYPES, updatedTicketTypes);
    setLocal(STORAGE_KEYS.BOOKINGS, updatedBookings);
    setLocal(STORAGE_KEYS.TICKETS, updatedTickets);
    setLocal(STORAGE_KEYS.NOTIFICATIONS, [notif, ...getLocal<Notification>(STORAGE_KEYS.NOTIFICATIONS)]);

    return { success: true };
  },
};

// ==========================================
// CHECK-IN & QR VERIFICATION SERVICE
// ==========================================
export interface CheckinResult {
  success: boolean;
  code: 'CHECKED_IN' | 'ALREADY_CHECKED_IN' | 'INVALID_TICKET' | 'WRONG_EVENT' | 'PAYMENT_PENDING' | 'CANCELLED' | 'UNAUTHORIZED';
  message: string;
  ticket?: {
    ticket_number: string;
    attendee_name: string;
    attendee_email: string;
    ticket_type?: string;
    checked_in_at?: string;
  };
}

export const checkinService = {
  async verifyAndCheckIn(tokenOrNumber: string, eventId: string, staffId: string): Promise<CheckinResult> {
    const cleanToken = tokenOrNumber.trim();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('verify_and_checkin_ticket', {
          p_token_or_number: cleanToken,
          p_event_id: eventId,
          p_staff_id: staffId,
        });

        if (error) throw error;
        return data as CheckinResult;
      } catch (err) {
        console.warn('Supabase verify_and_checkin_ticket error, checking local store:', err);
      }
    }

    const tickets = getLocal<Ticket>(STORAGE_KEYS.TICKETS);
    const bookings = getLocal<Booking>(STORAGE_KEYS.BOOKINGS);
    const items = getLocal<BookingItem>(STORAGE_KEYS.BOOKING_ITEMS);
    const ticketTypes = getLocal<TicketType>(STORAGE_KEYS.TICKETS_TYPES);
    const events = getLocal<Event>(STORAGE_KEYS.EVENTS);

    const ev = events.find((e) => e.id === eventId);
    if (!ev || ev.publisher_id !== staffId) {
      return {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'You do not have permission to check in tickets for this event.',
      };
    }

    const ticket = tickets.find(
      (t) => t.secure_token === cleanToken || t.ticket_number.toLowerCase() === cleanToken.toLowerCase()
    );

    if (!ticket) {
      return {
        success: false,
        code: 'INVALID_TICKET',
        message: 'Ticket not found in the system. Please verify the code or reference number.',
      };
    }

    const booking = bookings.find((b) => b.id === ticket.booking_id);
    if (!booking || booking.event_id !== eventId) {
      const ticketEvent = events.find((e) => e.id === booking?.event_id);
      return {
        success: false,
        code: 'WRONG_EVENT',
        message: `This ticket belongs to a different event: "${ticketEvent?.title || 'Unknown'}"`,
      };
    }

    if (booking.payment_status === 'unpaid' || booking.payment_status === 'failed') {
      return {
        success: false,
        code: 'PAYMENT_PENDING',
        message: 'Payment for this ticket is pending or failed. Admission denied.',
      };
    }

    if (ticket.status === 'cancelled') {
      return {
        success: false,
        code: 'CANCELLED',
        message: 'This ticket was cancelled or refunded. It cannot be used.',
      };
    }

    const item = items.find((i) => i.id === ticket.booking_item_id);
    const tt = ticketTypes.find((t) => t.id === item?.ticket_type_id);

    if (ticket.status === 'checked_in') {
      return {
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: `Already checked in at ${new Date(ticket.checked_in_at || '').toLocaleTimeString()}`,
        ticket: {
          ticket_number: ticket.ticket_number,
          attendee_name: ticket.attendee_name,
          attendee_email: ticket.attendee_email,
          ticket_type: tt?.name,
          checked_in_at: ticket.checked_in_at,
        },
      };
    }

    // Check in the ticket
    const now = new Date().toISOString();
    const updatedTickets = tickets.map((t) =>
      t.id === ticket.id ? { ...t, status: 'checked_in' as const, checked_in_at: now, checked_in_by: staffId } : t
    );
    setLocal(STORAGE_KEYS.TICKETS, updatedTickets);

    return {
      success: true,
      code: 'CHECKED_IN',
      message: `Check-in approved! Welcome, ${ticket.attendee_name}.`,
      ticket: {
        ticket_number: ticket.ticket_number,
        attendee_name: ticket.attendee_name,
        attendee_email: ticket.attendee_email,
        ticket_type: tt?.name,
        checked_in_at: now,
      },
    };
  },
};

// ==========================================
// NOTIFICATIONS SERVICE
// ==========================================
export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isSupabaseConfigured && isUUID(userId)) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Notification[];
      } catch (err) {
        console.warn('Supabase notifications fallback:', err);
      }
    }

    const list = getLocal<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    return list.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markAsRead(notificationId: string) {
    if (isSupabaseConfigured && isUUID(notificationId)) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
      } catch (err) {
        console.warn('Supabase markAsRead error:', err);
      }
    }

    const list = getLocal<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    setLocal(
      STORAGE_KEYS.NOTIFICATIONS,
      list.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  },

  async markAllAsRead(userId: string) {
    if (isSupabaseConfigured && isUUID(userId)) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase markAllAsRead error:', err);
      }
    }

    const list = getLocal<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    setLocal(
      STORAGE_KEYS.NOTIFICATIONS,
      list.map((n) => (n.user_id === userId ? { ...n, is_read: true } : n))
    );
  },
};

