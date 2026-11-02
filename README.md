# EventSphere – Professional Event Hosting & Ticket Booking Platform

EventSphere is a modern, responsive, SaaS-style event management and ticket booking platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## 🌟 Key Features

### 1. Dual Role Architecture
- **Event Publisher (Host):**
  - **Overview Dashboard:** Total events, tickets sold, registrations, net revenue, upcoming events, and interactive sales & performance charts (Recharts).
  - **Multi-step Event Creation Wizard (6 Steps):**
    - Step 1: Basic Information (Title, Description, Category, Cover Image, Tags).
    - Step 2: Date & Time (Start, End, Timezone, Registration Deadline).
    - Step 3: Location (In-Person Venue vs Online Virtual Stream). Private stream URLs are protected from public exposure.
    - Step 4: Ticket Configuration (Multiple ticket tiers: Free, General Admission, VIP, Early Bird with custom limits).
    - Step 5: Capacity, Refund Policy, and Terms of Attendance.
    - Step 6: Preview & Live Publishing.
  - **Hosted Events Management:** Live status changes, drafts, duplicates, unpublishing, and deletions.
  - **Attendee Management:** Search, filter by tier and payment status, manual check-in toggle, and 1-click **CSV Roster Export**.
  - **QR Code Gate Check-in System:**
    - Live camera-based QR code scanning using device camera.
    - Manual ticket number or secure token lookup.
    - Instant gate validation with duplicate check-in prevention, wrong-event rejection, and audit log.
  - **Revenue & Financials:** Gross sales, platform fee deductions (5%), host net revenue, pending settlements, and downloadable financial statements.

- **Event Booker (Attendee):**
  - **Discovery Engine:** Search events by keyword, category, format (in-person vs online), and price (free vs paid) with multiple sort options.
  - **Event Details:** Hero image, organizer bio, schedule, location details, interactive map preview, ticket tiers, and refund policies.
  - **Atomic Booking Engine:** Multi-ticket reservations, attendee info collection for every pass, subtotal, platform fees, taxes, and instant confirmation with celebration confetti.
  - **Digital Ticket Pass:** Unique ticket numbering, booking reference, and cryptographic non-guessable QR codes (no PII leaked in payload). Includes **Download PDF Ticket** (via jsPDF) and **Print Pass** functionality.
  - **Attendee Dashboard:** View all, upcoming, past, and cancelled bookings with ticket self-service and cancellation option that returns inventory.

### 2. Security & Backend Architecture
- **Supabase Database Schema:** 13 normalized tables (`profiles`, `events`, `event_images`, `ticket_types`, `bookings`, `booking_items`, `tickets`, `payments`, `refunds`, `notifications`, `event_checkins`, `event_registration_questions`, `registration_answers`).
- **Row Level Security (RLS):** Strict public, booker, and publisher isolation policies.
- **Atomic Inventory Reservations (RPC):** `create_booking_atomic` utilizes row-level locking (`FOR UPDATE`) to prevent overselling during simultaneous bookings.
- **In-App Notification Engine:** Real-time and polling alerts for booking confirmations, gate admissions, and event notifications.
- **Dual Runtime Support:** Direct live connection to Supabase PostgreSQL or seamless offline/local storage fallback for immediate review.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### Installation
```bash
git clone <repo-url>
cd abi
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RAZORPAY_KEY_ID=
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Backend Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261102_initial_schema.sql` from this repository and run the entire script. This will:
   - Create all tables with foreign keys and indexes.
   - Enable Row Level Security (RLS) on all tables and apply security policies.
   - Install the `handle_new_user()` trigger for automated user profiles.
   - Install the atomic booking stored procedure `create_booking_atomic()`.
   - Install the secure check-in validation stored procedure `verify_and_checkin_ticket()`.
   - Install the booking cancellation function `cancel_booking()`.
4. (Optional) Run `supabase/seed.sql` to populate realistic events and ticket tiers.
5. In **Project Settings > API**, copy the Project URL and `anon` public key into your `.env` file.

---

## 🛡️ Testing & QA Checklist

- [x] **Publisher Registration & Login:** Create host account or use one-click demo login.
- [x] **Booker Registration & Login:** Create attendee account or use one-click demo login.
- [x] **Event Creation:** 6-step wizard with multi-tier ticket pricing and location types.
- [x] **Event Discovery:** Filter by category, location format, and price type.
- [x] **Free Ticket Booking:** Instant zero-dollar confirmation and ticket issuance.
- [x] **Paid Ticket Checkout:** Fee & tax calculation, order generation, and verified confirmation.
- [x] **Digital Ticket & QR Generation:** Printable view, cryptographic QR token, and PDF download.
- [x] **QR Code Camera Scanner:** Live camera scanner, manual lookup, and duplicate check-in rejection.
- [x] **Attendee Management & CSV Export:** Full attendee table with 1-click CSV download.
- [x] **Revenue & Analytics:** Recharts visual charts and transaction report export.
