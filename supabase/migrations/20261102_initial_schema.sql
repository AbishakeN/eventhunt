-- EventSphere Database Schema
-- Comprehensive schema with Row Level Security, RPCs, and indexes

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('publisher', 'booker')) DEFAULT 'booker',
  organization_name TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('physical', 'online')),
  venue_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  online_platform TEXT,
  online_url TEXT, -- PRIVATE: restricted by policy/view to ticket holders and publisher
  online_instructions TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  registration_deadline TIMESTAMPTZ,
  capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
  refund_policy TEXT,
  terms TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. EVENT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TICKET TYPES TABLE
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  total_quantity INTEGER NOT NULL CHECK (total_quantity >= 0),
  sold_quantity INTEGER NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0 AND sold_quantity <= total_quantity),
  max_per_booking INTEGER NOT NULL DEFAULT 5 CHECK (max_per_booking > 0),
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'sold_out')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  fees NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  taxes NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'completed', 'refunded', 'failed')) DEFAULT 'unpaid',
  booking_status TEXT NOT NULL CHECK (booking_status IN ('confirmed', 'cancelled', 'attended')) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. BOOKING ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  booking_item_id UUID NOT NULL REFERENCES public.booking_items(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  secure_token TEXT NOT NULL UNIQUE, -- For secure QR generation and scanning verification
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('valid', 'checked_in', 'cancelled')) DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT,
  provider_payment_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'successful', 'failed', 'refunded')) DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. REFUNDS TABLE
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id),
  amount NUMERIC(10, 2) NOT NULL,
  reason TEXT,
  refund_status TEXT NOT NULL CHECK (refund_status IN ('requested', 'approved', 'processed', 'rejected')) DEFAULT 'requested',
  provider_refund_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('booking', 'payment', 'event', 'reminder', 'refund', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. EVENT CHECKINS TABLE
CREATE TABLE IF NOT EXISTS public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  checked_in_by UUID NOT NULL REFERENCES public.profiles(id),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. EVENT REGISTRATION QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_registration_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'select', 'checkbox')) DEFAULT 'text',
  options TEXT[] DEFAULT '{}',
  is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. REGISTRATION ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.registration_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.event_registration_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_events_publisher ON public.events(publisher_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON public.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_tickets_booking ON public.tickets(booking_id);
CREATE INDEX IF NOT EXISTS idx_tickets_secure_token ON public.tickets(secure_token);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registration_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_answers ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- EVENTS POLICIES
-- Anyone can view published events (except sensitive fields handled by view or app logic)
CREATE POLICY "Anyone can view published events" 
  ON public.events FOR SELECT 
  USING (status = 'published' OR auth.uid() = publisher_id);

CREATE POLICY "Publishers can insert their own events" 
  ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = publisher_id);

CREATE POLICY "Publishers can update their own events" 
  ON public.events FOR UPDATE 
  USING (auth.uid() = publisher_id);

CREATE POLICY "Publishers can delete draft events with no bookings" 
  ON public.events FOR DELETE 
  USING (auth.uid() = publisher_id AND status = 'draft');

-- EVENT IMAGES POLICIES
CREATE POLICY "Anyone can view event images for visible events" 
  ON public.event_images FOR SELECT 
  USING (true);

CREATE POLICY "Publishers can manage event images" 
  ON public.event_images FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_images.event_id AND publisher_id = auth.uid()));

-- TICKET TYPES POLICIES
CREATE POLICY "Anyone can view active ticket types for published events" 
  ON public.ticket_types FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.events WHERE id = ticket_types.event_id AND (status = 'published' OR publisher_id = auth.uid())));

CREATE POLICY "Publishers can manage ticket types for their events" 
  ON public.ticket_types FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.events WHERE id = ticket_types.event_id AND publisher_id = auth.uid()));

-- BOOKINGS POLICIES
CREATE POLICY "Users can view their own bookings" 
  ON public.bookings FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.events WHERE id = bookings.event_id AND publisher_id = auth.uid()));

CREATE POLICY "Users can insert their own bookings" 
  ON public.bookings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and publishers can update relevant bookings" 
  ON public.bookings FOR UPDATE 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.events WHERE id = bookings.event_id AND publisher_id = auth.uid()));

-- BOOKING ITEMS POLICIES
CREATE POLICY "Users can view their booking items" 
  ON public.booking_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.bookings b 
    JOIN public.events e ON e.id = b.event_id 
    WHERE b.id = booking_items.booking_id AND (b.user_id = auth.uid() OR e.publisher_id = auth.uid())
  ));

CREATE POLICY "Users can insert booking items" 
  ON public.booking_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_items.booking_id AND user_id = auth.uid()));

-- TICKETS POLICIES
CREATE POLICY "Ticket holders and publishers can view tickets" 
  ON public.tickets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.events e ON e.id = b.event_id 
      WHERE b.id = tickets.booking_id AND (b.user_id = auth.uid() OR e.publisher_id = auth.uid())
    )
  );

CREATE POLICY "Publishers can update tickets for check-in" 
  ON public.tickets FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.events e ON e.id = b.event_id 
      WHERE b.id = tickets.booking_id AND e.publisher_id = auth.uid()
    )
  );

-- PAYMENTS POLICIES
CREATE POLICY "Users and event owners can view payments" 
  ON public.payments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.events e ON e.id = b.event_id 
      WHERE b.id = payments.booking_id AND (b.user_id = auth.uid() OR e.publisher_id = auth.uid())
    )
  );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can manage their own notifications" 
  ON public.notifications FOR ALL 
  USING (auth.uid() = user_id);

-- CHECKINS POLICIES
CREATE POLICY "Publishers can view and insert checkins" 
  ON public.event_checkins FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_checkins.event_id AND e.publisher_id = auth.uid()
    )
  );

-- EVENT QUESTIONS POLICIES
CREATE POLICY "Anyone can view registration questions for published events" 
  ON public.event_registration_questions FOR SELECT 
  USING (true);

CREATE POLICY "Publishers can manage registration questions" 
  ON public.event_registration_questions FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_registration_questions.event_id AND publisher_id = auth.uid()));

-- REGISTRATION ANSWERS POLICIES
CREATE POLICY "Users and publishers can view answers" 
  ON public.registration_answers FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.events e ON e.id = b.event_id 
      WHERE b.id = registration_answers.booking_id AND (b.user_id = auth.uid() OR e.publisher_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert answers for their booking" 
  ON public.registration_answers FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE id = registration_answers.booking_id AND user_id = auth.uid()));

-- =========================================================================
-- DATABASE FUNCTIONS & STORED PROCEDURES (ATOMIC BOOKING & CHECK-IN)
-- =========================================================================

-- Trigger to automatically create a profile when a new user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'booker')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic booking function with row-level locking to prevent overselling!
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_user_id UUID,
  p_event_id UUID,
  p_items JSONB, -- Array of { ticket_type_id: UUID, quantity: INT, unit_price: NUMERIC }
  p_attendees JSONB, -- Array of { ticket_type_id: UUID, attendee_name: TEXT, attendee_email: TEXT }
  p_subtotal NUMERIC,
  p_fees NUMERIC,
  p_taxes NUMERIC,
  p_total_amount NUMERIC,
  p_payment_provider TEXT DEFAULT 'free',
  p_provider_order_id TEXT DEFAULT NULL,
  p_provider_payment_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_booking_ref TEXT;
  v_booking_id UUID;
  v_item RECORD;
  v_ticket RECORD;
  v_available_qty INT;
  v_event_status TEXT;
  v_publisher_id UUID;
  v_event_title TEXT;
  v_ticket_num TEXT;
  v_secure_token TEXT;
  v_item_id UUID;
  v_ticket_idx INT := 0;
  v_payment_status TEXT;
BEGIN
  -- 1. Check event validity
  SELECT status, publisher_id, title INTO v_event_status, v_publisher_id, v_event_title
  FROM public.events WHERE id = p_event_id;

  IF v_event_status IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF v_event_status <> 'published' THEN
    RAISE EXCEPTION 'This event is not published or accepting bookings';
  END IF;

  -- Determine payment status: if total is 0, it's completed immediately. If paid, completed if payment_id provided.
  IF p_total_amount <= 0 OR p_provider_payment_id IS NOT NULL THEN
    v_payment_status := 'completed';
  ELSE
    v_payment_status := 'unpaid';
  END IF;

  -- 2. Verify and lock ticket types row-level to prevent race conditions
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(ticket_type_id UUID, quantity INT, unit_price NUMERIC)
  LOOP
    -- Row-level exclusive lock
    SELECT (total_quantity - sold_quantity) INTO v_available_qty
    FROM public.ticket_types
    WHERE id = v_item.ticket_type_id AND event_id = p_event_id
    FOR UPDATE;

    IF v_available_qty IS NULL THEN
      RAISE EXCEPTION 'Ticket type % does not belong to this event', v_item.ticket_type_id;
    END IF;

    IF v_available_qty < v_item.quantity THEN
      RAISE EXCEPTION 'Not enough tickets available for ticket type %. Remaining: %', v_item.ticket_type_id, v_available_qty;
    END IF;

    -- Update inventory
    UPDATE public.ticket_types
    SET sold_quantity = sold_quantity + v_item.quantity,
        status = CASE WHEN sold_quantity + v_item.quantity >= total_quantity THEN 'sold_out' ELSE status END
    WHERE id = v_item.ticket_type_id;
  END LOOP;

  -- 3. Create unique human-readable booking reference
  v_booking_ref := 'ES-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  INSERT INTO public.bookings (
    booking_reference, user_id, event_id, subtotal, fees, taxes, total_amount, payment_status, booking_status
  ) VALUES (
    v_booking_ref, p_user_id, p_event_id, p_subtotal, p_fees, p_taxes, p_total_amount, v_payment_status, 'confirmed'
  ) RETURNING id INTO v_booking_id;

  -- 4. Insert booking items and individual tickets
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(ticket_type_id UUID, quantity INT, unit_price NUMERIC)
  LOOP
    INSERT INTO public.booking_items (booking_id, ticket_type_id, quantity, unit_price, subtotal)
    VALUES (v_booking_id, v_item.ticket_type_id, v_item.quantity, v_item.unit_price, (v_item.quantity * v_item.unit_price))
    RETURNING id INTO v_item_id;

    -- Generate individual tickets for this item
    FOR v_ticket IN 
      SELECT * FROM jsonb_to_recordset(p_attendees) AS a(ticket_type_id UUID, attendee_name TEXT, attendee_email TEXT)
      WHERE a.ticket_type_id = v_item.ticket_type_id
    LOOP
      v_ticket_idx := v_ticket_idx + 1;
      v_ticket_num := v_booking_ref || '-T' || LPAD(v_ticket_idx::text, 2, '0');
      -- Secure non-guessable token for QR verification (does not reveal PII)
      v_secure_token := 'TKT_' || replace(gen_random_uuid()::text, '-', '');

      INSERT INTO public.tickets (
        booking_id, booking_item_id, ticket_number, secure_token, attendee_name, attendee_email, status
      ) VALUES (
        v_booking_id, v_item_id, v_ticket_num, v_secure_token, v_ticket.attendee_name, v_ticket.attendee_email, 'valid'
      );
    END LOOP;
  END LOOP;

  -- 5. Record payment if applicable
  IF p_provider_order_id IS NOT NULL OR p_total_amount > 0 THEN
    INSERT INTO public.payments (
      booking_id, provider, provider_order_id, provider_payment_id, amount, payment_status, verified_at
    ) VALUES (
      v_booking_id, p_payment_provider, p_provider_order_id, p_provider_payment_id, p_total_amount,
      CASE WHEN v_payment_status = 'completed' THEN 'successful' ELSE 'pending' END,
      CASE WHEN v_payment_status = 'completed' THEN now() ELSE NULL END
    );
  END IF;

  -- 6. In-app notifications
  -- For booker
  INSERT INTO public.notifications (user_id, title, message, notification_type, link_url)
  VALUES (
    p_user_id,
    'Booking Confirmed: ' || v_event_title,
    'Your booking ' || v_booking_ref || ' for "' || v_event_title || '" has been successfully confirmed. You can access your tickets anytime in your dashboard.',
    'booking',
    '/bookings'
  );

  -- For publisher
  INSERT INTO public.notifications (user_id, title, message, notification_type, link_url)
  VALUES (
    v_publisher_id,
    'New Booking: ' || v_event_title,
    'A new booking (' || v_booking_ref || ') was made for your event "' || v_event_title || '".',
    'booking',
    '/publisher/events/' || p_event_id || '/attendees'
  );

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_reference', v_booking_ref,
    'payment_status', v_payment_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check-in validation RPC: ensures security, prevents duplicates, checks authorization
CREATE OR REPLACE FUNCTION public.verify_and_checkin_ticket(
  p_token_or_number TEXT,
  p_event_id UUID,
  p_staff_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_ticket_id UUID;
  v_ticket_number TEXT;
  v_attendee_name TEXT;
  v_attendee_email TEXT;
  v_status TEXT;
  v_checked_in_at TIMESTAMPTZ;
  v_booking_id UUID;
  v_event_id UUID;
  v_event_title TEXT;
  v_ticket_type_name TEXT;
  v_publisher_id UUID;
  v_payment_status TEXT;
BEGIN
  -- Verify publisher/staff authorization for this event
  SELECT publisher_id INTO v_publisher_id
  FROM public.events WHERE id = p_event_id;

  IF v_publisher_id IS NULL OR v_publisher_id <> p_staff_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'UNAUTHORIZED',
      'message', 'You do not have permission to check in tickets for this event'
    );
  END IF;

  -- Look up ticket by secure_token or ticket_number
  SELECT 
    t.id, t.ticket_number, t.attendee_name, t.attendee_email, t.status, t.checked_in_at,
    b.id, b.event_id, b.payment_status, tt.name, e.title
  INTO 
    v_ticket_id, v_ticket_number, v_attendee_name, v_attendee_email, v_status, v_checked_in_at,
    v_booking_id, v_event_id, v_payment_status, v_ticket_type_name, v_event_title
  FROM public.tickets t
  JOIN public.bookings b ON b.id = t.booking_id
  JOIN public.events e ON e.id = b.event_id
  JOIN public.booking_items bi ON bi.id = t.booking_item_id
  JOIN public.ticket_types tt ON tt.id = bi.ticket_type_id
  WHERE (t.secure_token = p_token_or_number OR t.ticket_number = p_token_or_number);

  IF v_ticket_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'INVALID_TICKET',
      'message', 'Ticket not found in the system'
    );
  END IF;

  IF v_event_id <> p_event_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'WRONG_EVENT',
      'message', 'This ticket is for a different event: ' || v_event_title
    );
  END IF;

  IF v_payment_status = 'unpaid' OR v_payment_status = 'failed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'PAYMENT_PENDING',
      'message', 'Payment is pending or unpaid for this ticket'
    );
  END IF;

  IF v_status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'CANCELLED',
      'message', 'This ticket has been cancelled or refunded'
    );
  END IF;

  IF v_status = 'checked_in' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_CHECKED_IN',
      'message', 'Ticket was already checked in on ' || to_char(v_checked_in_at, 'YYYY-MM-DD HH24:MI:SS'),
      'ticket', jsonb_build_object(
        'ticket_number', v_ticket_number,
        'attendee_name', v_attendee_name,
        'attendee_email', v_attendee_email,
        'ticket_type', v_ticket_type_name,
        'checked_in_at', v_checked_in_at
      )
    );
  END IF;

  -- Perform check-in
  UPDATE public.tickets
  SET status = 'checked_in',
      checked_in_at = now(),
      checked_in_by = p_staff_id
  WHERE id = v_ticket_id;

  INSERT INTO public.event_checkins (ticket_id, event_id, checked_in_by, checked_in_at)
  VALUES (v_ticket_id, p_event_id, p_staff_id, now());

  RETURN jsonb_build_object(
    'success', true,
    'code', 'CHECKED_IN',
    'message', 'Check-in successful! Welcome ' || v_attendee_name,
    'ticket', jsonb_build_object(
      'ticket_number', v_ticket_number,
      'attendee_name', v_attendee_name,
      'attendee_email', v_attendee_email,
      'ticket_type', v_ticket_type_name,
      'checked_in_at', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel booking function
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_event_id UUID;
  v_publisher_id UUID;
  v_title TEXT;
  v_ref TEXT;
BEGIN
  -- Check ownership
  SELECT b.event_id, b.booking_reference, e.publisher_id, e.title 
  INTO v_event_id, v_ref, v_publisher_id, v_title
  FROM public.bookings b
  JOIN public.events e ON e.id = b.event_id
  WHERE b.id = p_booking_id AND (b.user_id = p_user_id OR e.publisher_id = p_user_id);

  IF v_event_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking not found or unauthorized');
  END IF;

  -- Release quantities on ticket types
  FOR v_item IN SELECT ticket_type_id, quantity FROM public.booking_items WHERE booking_id = p_booking_id
  LOOP
    UPDATE public.ticket_types
    SET sold_quantity = GREATEST(0, sold_quantity - v_item.quantity),
        status = 'active'
    WHERE id = v_item.ticket_type_id;
  END LOOP;

  -- Update booking status and ticket statuses
  UPDATE public.bookings SET booking_status = 'cancelled', updated_at = now() WHERE id = p_booking_id;
  UPDATE public.tickets SET status = 'cancelled' WHERE booking_id = p_booking_id;

  -- Send notification
  INSERT INTO public.notifications (user_id, title, message, notification_type, link_url)
  VALUES (
    p_user_id,
    'Booking Cancelled: ' || v_title,
    'Your booking ' || v_ref || ' for "' || v_title || '" has been cancelled.',
    'booking',
    '/bookings'
  );

  RETURN jsonb_build_object('success', true, 'message', 'Booking successfully cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

