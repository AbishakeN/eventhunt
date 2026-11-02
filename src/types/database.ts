export type UserRole = 'publisher' | 'booker';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  organization_name?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type LocationType = 'physical' | 'online';

export interface Event {
  id: string;
  publisher_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  cover_image: string;
  location_type: LocationType;
  venue_name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  online_platform?: string;
  online_url?: string; // Private link
  online_instructions?: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  registration_deadline?: string;
  capacity: number;
  status: EventStatus;
  refund_policy?: string;
  terms?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  // Computed / Joined properties:
  publisher?: Profile;
  ticket_types?: TicketType[];
  gallery_images?: string[];
  min_price?: number;
  max_price?: number;
  tickets_sold_count?: number;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  max_per_booking: number;
  sales_start?: string;
  sales_end?: string;
  status: 'active' | 'paused' | 'sold_out';
  created_at?: string;
}

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  display_order: number;
}

export type PaymentStatus = 'unpaid' | 'completed' | 'refunded' | 'failed';
export type BookingStatus = 'confirmed' | 'cancelled' | 'attended';

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  event_id: string;
  subtotal: number;
  fees: number;
  taxes: number;
  total_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  created_at: string;
  updated_at?: string;
  // Joined
  event?: Event;
  user?: Profile;
  items?: BookingItem[];
  tickets?: Ticket[];
  payments?: Payment[];
}

export interface BookingItem {
  id: string;
  booking_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  ticket_type?: TicketType;
}

export type TicketStatus = 'valid' | 'checked_in' | 'cancelled';

export interface Ticket {
  id: string;
  booking_id: string;
  booking_item_id: string;
  ticket_number: string;
  secure_token: string;
  attendee_name: string;
  attendee_email: string;
  status: TicketStatus;
  checked_in_at?: string;
  checked_in_by?: string;
  created_at: string;
  ticket_type?: TicketType;
  booking?: Booking;
}

export interface Payment {
  id: string;
  booking_id: string;
  provider: string;
  provider_order_id?: string;
  provider_payment_id?: string;
  amount: number;
  currency: string;
  payment_status: 'pending' | 'successful' | 'failed' | 'refunded';
  verified_at?: string;
  created_at: string;
}

export interface Refund {
  id: string;
  booking_id: string;
  payment_id?: string;
  amount: number;
  reason?: string;
  refund_status: 'requested' | 'approved' | 'processed' | 'rejected';
  provider_refund_id?: string;
  created_at: string;
}

export type NotificationType = 'booking' | 'payment' | 'event' | 'reminder' | 'refund' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface EventCheckin {
  id: string;
  ticket_id: string;
  event_id: string;
  checked_in_by: string;
  checked_in_at: string;
  ticket?: Ticket;
}

export interface EventRegistrationQuestion {
  id: string;
  event_id: string;
  question: string;
  question_type: 'text' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  is_required: boolean;
}

export interface RegistrationAnswer {
  id: string;
  booking_id: string;
  question_id: string;
  answer: string;
}

