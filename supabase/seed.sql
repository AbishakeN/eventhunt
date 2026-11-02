-- =========================================================================
-- EventSphere Comprehensive Seed Data
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- It safely creates demo users, profiles, published events, tickets & bookings.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. SEED AUTH USERS & PROFILES
-- Demo Publisher: Alex Rivera (publisher@eventsphere.com / password123)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'publisher@eventsphere.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alex Rivera","role":"publisher"}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, full_name, email, phone, avatar_url, role, organization_name, bio
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Alex Rivera',
  'publisher@eventsphere.com',
  '+1 (555) 234-5678',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'publisher',
  'Nexus Event Labs',
  'Founder of Nexus Event Labs. Curating world-class tech symposiums and creative arts conferences worldwide.'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization_name = EXCLUDED.organization_name;

-- Demo Booker: Sarah Chen (booker@eventsphere.com / password123)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'booker@eventsphere.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sarah Chen","role":"booker"}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, full_name, email, phone, avatar_url, role, bio
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Sarah Chen',
  'booker@eventsphere.com',
  '+1 (555) 987-6543',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'booker',
  'Design engineer and technology enthusiast. Avid concert goer and lifelong learner.'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 2. SEED DEMO EVENTS
INSERT INTO public.events (
  id, publisher_id, title, slug, description, category, cover_image, 
  location_type, venue_name, address, city, state, postal_code,
  online_platform, online_url, online_instructions,
  start_datetime, end_datetime, timezone, registration_deadline, capacity, status, refund_policy, terms, tags
) VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Global AI & Cloud Summit 2026',
  'global-ai-cloud-summit-2026',
  'Join 3,000+ technology leaders, AI researchers, and cloud architects for the premier conference on Artificial Intelligence, LLMs, and distributed systems architecture. Featuring 40+ keynote speakers from top tech firms, deep-dive technical workshops, and an innovation exhibition floor.',
  'Technology',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  'physical',
  'Silicon Convention Center',
  '100 Tech Blvd, Innovation Quarter',
  'San Francisco',
  'CA',
  '94107',
  NULL,
  NULL,
  NULL,
  now() + interval '18 days',
  now() + interval '20 days',
  'America/Los_Angeles',
  now() + interval '17 days',
  600,
  'published',
  'Full refund available up to 7 days before event start date.',
  'Attendees must comply with the professional code of conduct. Badges must be worn at all times.',
  ARRAY['AI', 'Cloud', 'Machine Learning', 'Engineering']
),
(
  'e2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Echoes Live: Indie & Electronic Music Night',
  'echoes-live-indie-electronic-music-night',
  'An electric evening of live performances featuring breakthrough indie synth-pop bands, electronic DJs, visual art installations, and curated artisan food trucks under the stars.',
  'Music',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
  'physical',
  'The Grand Riverside Amphitheater',
  '452 Riverwalk Promenade',
  'Austin',
  'TX',
  '78701',
  NULL,
  NULL,
  NULL,
  now() + interval '24 days',
  now() + interval '24 days' + interval '7 hours',
  'America/Chicago',
  now() + interval '23 days',
  750,
  'published',
  'Non-refundable within 48 hours of showtime.',
  'Must be 18+ to attend. Valid ID required at entrance. Rain or shine event.',
  ARRAY['Live Music', 'Indie', 'Concert', 'Nightlife']
),
(
  'e3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Product Design & UX Mastery: Global Masterclass',
  'product-design-ux-mastery-global-masterclass',
  'An intensive live interactive online workshop for designers and engineers. Learn high-conversion design systems, micro-interactions, accessibility patterns, and AI-assisted Figma prototyping workflows.',
  'Design & Arts',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1600&q=80',
  'online',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'Zoom Enterprise Webinar',
  'https://zoom.us/j/94827103947?pwd=eventsphere_secure',
  'Join 10 minutes early. Ensure Figma Desktop app is updated to the latest version.',
  now() + interval '10 days',
  now() + interval '10 days' + interval '5 hours',
  'UTC',
  now() + interval '9 days',
  700,
  'published',
  'Full refund up to 24 hours prior to the workshop broadcast.',
  'Session will be recorded for registered participants. Screen capture of proprietary course materials is prohibited.',
  ARRAY['Design', 'UX', 'Figma', 'Web Design']
),
(
  'e4444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000001',
  'SaaS Founder & Venture Pitch Forum',
  'saas-founder-venture-pitch-forum',
  'Network with top venture capitalists, angel investors, and high-growth B2B founders. Includes live pitch competitions, breakout mentoring sessions, and an exclusive rooftop networking cocktail hour.',
  'Business & Startups',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80',
  'physical',
  'Metropolitan Sky Lounge',
  '750 3rd Avenue, Fl 32',
  'New York',
  'NY',
  '10017',
  NULL,
  NULL,
  NULL,
  now() + interval '32 days',
  now() + interval '32 days' + interval '8 hours',
  'America/New_York',
  now() + interval '30 days',
  250,
  'published',
  'Refundable up to 5 business days before the event.',
  'Business casual attire required. NDA signed at reception for proprietary founder pitch sessions.',
  ARRAY['Startup', 'Venture Capital', 'Networking', 'SaaS']
),
(
  'e5555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000001',
  'Artisan Culinary Expo & Wine Tasting',
  'artisan-culinary-expo-wine-tasting',
  'Experience gastronomic excellence with over 50 celebrated regional chefs, artisanal chocolatiers, and biodynamic winemakers. Features live cooking demos and unlimited tasting samples.',
  'Food & Drink',
  'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80',
  'physical',
  'Harborview Pavilion',
  '200 Pier 45 Marina Way',
  'Seattle',
  'WA',
  '98101',
  NULL,
  NULL,
  NULL,
  now() + interval '45 days',
  now() + interval '45 days' + interval '8 hours',
  'America/Los_Angeles',
  now() + interval '44 days',
  450,
  'published',
  'Non-refundable tickets. Transfers permitted up to 48 hours prior.',
  'Age 21+ only. Valid government issued ID required for wristband.',
  ARRAY['Food', 'Wine', 'Culinary', 'Tasting']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  cover_image = EXCLUDED.cover_image,
  start_datetime = EXCLUDED.start_datetime,
  end_datetime = EXCLUDED.end_datetime,
  capacity = EXCLUDED.capacity;

-- 3. SEED DEMO TICKET TYPES
INSERT INTO public.ticket_types (id, event_id, name, description, price, total_quantity, sold_quantity, max_per_booking, status)
VALUES
  -- AI Summit Tickets
  ('a1111111-1111-1111-1111-111111111101', 'e1111111-1111-1111-1111-111111111111', 'General Admission', 'Full access to all keynote sessions and expo floor for 3 days.', 299.00, 300, 142, 4, 'active'),
  ('a1111111-1111-1111-1111-111111111102', 'e1111111-1111-1111-1111-111111111111', 'VIP All-Access Pass', 'Priority seating, VIP lounge access, speaker dinner invite, and conference swag kit.', 699.00, 100, 48, 2, 'active'),
  ('a1111111-1111-1111-1111-111111111103', 'e1111111-1111-1111-1111-111111111111', 'Student / Academic', 'Discounted access for verified students and academic researchers.', 79.00, 100, 65, 1, 'active'),

  -- Echoes Music Tickets
  ('a2222222-2222-2222-2222-222222222201', 'e2222222-2222-2222-2222-222222222222', 'Early Bird General Admission', 'Early admission pass with fast-track entry.', 45.00, 500, 310, 6, 'active'),
  ('a2222222-2222-2222-2222-222222222202', 'e2222222-2222-2222-2222-222222222222', 'VIP Stage-Side Access', 'Dedicated front row viewing deck, 2 complimentary drinks, and express bar access.', 120.00, 200, 120, 4, 'active'),

  -- Design UX Online Masterclass
  ('a3333333-3333-3333-3333-333333333301', 'e3333333-3333-3333-3333-333333333333', 'Community Free Pass', 'Free live stream access to day 1 opening workshops and public Q&A.', 0.00, 150, 95, 1, 'active'),
  ('a3333333-3333-3333-3333-333333333302', 'e3333333-3333-3333-3333-333333333333', 'Full Interactive Ticket + Assets', 'Interactive workshop breakout rooms, raw Figma UI design kits, and lifetime replay recordings.', 89.00, 150, 72, 3, 'active'),

  -- SaaS Pitch Forum
  ('a4444444-4444-4444-4444-444444444401', 'e4444444-4444-4444-4444-444444444444', 'Founder Attendee Pass', 'Access to pitch stages, investor speed dating, and networking lunch.', 199.00, 150, 80, 2, 'active'),
  ('a4444444-4444-4444-4444-444444444402', 'e4444444-4444-4444-4444-444444444444', 'Investor Pass', 'Includes private deal room access and startup executive summaries binder.', 349.00, 100, 35, 2, 'active'),

  -- Culinary Expo
  ('a5555555-5555-5555-5555-555555555501', 'e5555555-5555-5555-5555-555555555555', 'General Tasting Entry', 'Access to tasting pavilion with 15 tasting tokens included.', 65.00, 300, 210, 4, 'active'),
  ('a5555555-5555-5555-5555-555555555502', 'e5555555-5555-5555-5555-555555555555', 'Connoisseur VIP Pass', 'Unlimited tastings, sommelier masterclass, and souvenir Riedel tasting glass.', 140.00, 100, 60, 2, 'active')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  total_quantity = EXCLUDED.total_quantity,
  sold_quantity = EXCLUDED.sold_quantity;

-- 4. SEED SAMPLE BOOKING & QR TICKET FOR SARAH CHEN
INSERT INTO public.bookings (
  id, booking_reference, user_id, event_id, subtotal, fees, taxes, total_amount, payment_status, booking_status, created_at
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'ES-DEMO9824',
  '00000000-0000-0000-0000-000000000002',
  'e1111111-1111-1111-1111-111111111111',
  299.00,
  15.00,
  25.12,
  339.12,
  'completed',
  'confirmed',
  now() - interval '5 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.booking_items (
  id, booking_id, ticket_type_id, quantity, unit_price, subtotal
) VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000010',
  'a1111111-1111-1111-1111-111111111101',
  1,
  299.00,
  299.00
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tickets (
  id, booking_id, booking_item_id, ticket_number, secure_token, attendee_name, attendee_email, status, created_at
) VALUES (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011',
  'ES-DEMO9824-T01',
  'TKT_demo_secure_token_999824',
  'Sarah Chen',
  'booker@eventsphere.com',
  'valid',
  now() - interval '5 days'
) ON CONFLICT (id) DO NOTHING;

-- 5. SEED INITIAL NOTIFICATIONS
INSERT INTO public.notifications (
  id, user_id, title, message, notification_type, is_read, link_url, created_at
) VALUES (
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000002',
  'Booking Confirmed: Global AI & Cloud Summit 2026',
  'Your booking ES-DEMO9824 is confirmed. You can access your digital QR tickets anytime.',
  'booking',
  false,
  '/bookings',
  now() - interval '5 days'
) ON CONFLICT (id) DO NOTHING;
