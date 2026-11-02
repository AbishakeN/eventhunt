-- EventSphere Seed Data
-- Provides realistic sample publishers, published events, tickets, and categories

-- Sample publisher and attendee profiles (Note: in live Supabase, auth.users must exist first)
-- You can run this in Supabase SQL Editor or when testing against Supabase.

-- Seed Categories: Technology, Music, Business & Startups, Design & Arts, Food & Drink, Health & Wellness
-- Seed Events will be automatically populated with valid ticket types.

INSERT INTO public.events (
  id, publisher_id, title, slug, description, category, cover_image, 
  location_type, venue_name, address, city, state, postal_code,
  start_datetime, end_datetime, timezone, capacity, status, refund_policy, terms, tags
) VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Global AI & Cloud Summit 2026',
  'global-ai-cloud-summit-2026',
  'Join 3,000+ technology leaders, AI researchers, and cloud architects for the premier conference on Artificial Intelligence, LLMs, and distributed systems architecture. Featuring 40+ keynote speakers from top tech firms.',
  'Technology',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  'physical',
  'Silicon Convention Center',
  '100 Tech Blvd, Innovation Quarter',
  'San Francisco',
  'CA',
  '94107',
  '2026-11-20 09:00:00+00',
  '2026-11-22 18:00:00+00',
  'America/Los_Angeles',
  500,
  'published',
  'Full refund available up to 7 days before event start date.',
  'Attendees must comply with the code of conduct. Badges must be worn at all times.',
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
  'The Grand Arena',
  '452 Riverwalk Promenade',
  'Austin',
  'TX',
  '78701',
  '2026-11-25 18:00:00+00',
  '2026-11-26 01:00:00+00',
  'America/Chicago',
  1200,
  'published',
  'Non-refundable after 48 hours before the event.',
  'Must be 18+ to attend. Valid ID required at entrance.',
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
  '2026-12-05 14:00:00+00',
  '2026-12-05 19:00:00+00',
  'UTC',
  300,
  'published',
  'Full refund up to 24 hours prior to the workshop stream.',
  'Session will be recorded for registered participants.',
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
  '2026-12-10 10:00:00+00',
  '2026-12-10 18:00:00+00',
  'America/New_York',
  250,
  'published',
  'Refundable up to 5 days before the event.',
  'Business casual attire required.',
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
  '2026-12-18 12:00:00+00',
  '2026-12-18 20:00:00+00',
  'America/Los_Angeles',
  400,
  'published',
  'Non-refundable ticket.',
  'Age 21+ only. Valid government ID required for wine tasting wristband.',
  ARRAY['Food', 'Wine', 'Culinary', 'Tasting']
)
ON CONFLICT (id) DO NOTHING;

-- Seed Ticket Types
INSERT INTO public.ticket_types (id, event_id, name, description, price, total_quantity, sold_quantity, max_per_booking, status)
VALUES
  -- AI Summit Tickets
  ('t1111111-1111-1111-1111-111111111101', 'e1111111-1111-1111-1111-111111111111', 'General Admission', 'Full access to all keynote sessions and expo floor for 3 days.', 299.00, 300, 142, 4, 'active'),
  ('t1111111-1111-1111-1111-111111111102', 'e1111111-1111-1111-1111-111111111111', 'VIP All-Access Pass', 'Priority seating, VIP lounge access, speaker dinner invite, and conference swag kit.', 699.00, 100, 48, 2, 'active'),
  ('t1111111-1111-1111-1111-111111111103', 'e1111111-1111-1111-1111-111111111111', 'Student / Academic', 'Discounted access for verified students and academic researchers.', 79.00, 100, 65, 1, 'active'),

  -- Echoes Music Tickets
  ('t2222222-2222-2222-2222-222222222201', 'e2222222-2222-2222-2222-222222222222', 'Early Bird General Admission', 'Early admission pass with fast-track entry.', 45.00, 500, 310, 6, 'active'),
  ('t2222222-2222-2222-2222-222222222202', 'e2222222-2222-2222-2222-222222222222', 'VIP Stage-Side Access', 'Dedicated front row viewing deck, 2 complimentary drinks, and express bar access.', 120.00, 200, 120, 4, 'active'),

  -- Design UX Online Masterclass
  ('t3333333-3333-3333-3333-333333333301', 'e3333333-3333-3333-3333-333333333333', 'Community Free Pass', 'Free live stream access to day 1 opening workshops and public Q&A.', 0.00, 150, 95, 1, 'active'),
  ('t3333333-3333-3333-3333-333333333302', 'e3333333-3333-3333-3333-333333333333', 'Full Interactive Ticket + Assets', 'Interactive workshop breakout rooms, raw Figma UI design kits, and lifetime replay recordings.', 89.00, 150, 72, 3, 'active'),

  -- SaaS Pitch Forum
  ('t4444444-4444-4444-4444-444444444401', 'e4444444-4444-4444-4444-444444444444', 'Founder Attendee Pass', 'Access to pitch stages, investor speed dating, and networking lunch.', 199.00, 150, 80, 2, 'active'),
  ('t4444444-4444-4444-4444-444444444402', 'e4444444-4444-4444-4444-444444444444', 'Investor Pass', 'Includes private deal room access and startup executive summaries binder.', 349.00, 100, 35, 2, 'active'),

  -- Culinary Expo
  ('t5555555-5555-5555-5555-555555555501', 'e5555555-5555-5555-5555-555555555555', 'General Tasting Entry', 'Access to tasting pavilion with 15 tasting tokens included.', 65.00, 300, 210, 4, 'active'),
  ('t5555555-5555-5555-5555-555555555502', 'e5555555-5555-5555-5555-555555555555', 'Connoisseur VIP Pass', 'Unlimited tastings, sommelier masterclass, and souvenir Riedel tasting glass.', 140.00, 100, 60, 2, 'active')
ON CONFLICT (id) DO NOTHING;
