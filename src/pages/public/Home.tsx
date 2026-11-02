import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Cpu, 
  Music, 
  Briefcase, 
  Palette, 
  UtensilsCrossed, 
  HeartHandshake,
  Star
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/events/EventCard';
import { eventService } from '@/services/api';
import { Event } from '@/types/database';
import { CATEGORIES } from '@/services/mockData';

export const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const data = await eventService.getAllPublished();
        setEvents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory)}`);
  };

  const categoryIcons: Record<string, any> = {
    'Technology': Cpu,
    'Music': Music,
    'Business & Startups': Briefcase,
    'Design & Arts': Palette,
    'Food & Drink': UtensilsCrossed,
    'Health & Wellness': HeartHandshake,
  };

  const featuredEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(1, 5);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-400/20 to-violet-400/20 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Next-Gen Event Hosting & Ticket Booking</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Discover Events. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              Create Experiences.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The end-to-end platform for booking exclusive conference tickets, concerts, masterclasses, or publishing and managing your own live events with ease.
          </p>

          {/* Search Bar Component */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 shadow-soft-lg flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-2 px-3 flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search events by title, keyword, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="w-full sm:w-auto px-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-44 text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition hover:scale-[1.02]"
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-200/60">
            <div>
              <p className="text-2xl font-black text-slate-900">50,000+</p>
              <p className="text-xs text-slate-500 font-medium">Tickets Booked</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">1,200+</p>
              <p className="text-xs text-slate-500 font-medium">Verified Events</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">99.98%</p>
              <p className="text-xs text-slate-500 font-medium">Check-in Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">4.9 / 5.0</p>
              <p className="text-xs text-slate-500 font-medium">Host Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Events
            </h2>
          </div>
          <Link
            to="/events"
            className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            <span>Explore all events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200/70 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Browse by Categories */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Browse by Category
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Find experiences that align with your passions, industry, and interests.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.filter((c) => c !== 'All Categories').map((category) => {
              const Icon = categoryIcons[category] || Sparkles;
              return (
                <button
                  key={category}
                  onClick={() => navigate(`/events?category=${encodeURIComponent(category)}`)}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-400 hover:shadow-soft transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center shadow-sm transition-colors mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events Carousel/Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Live Experiences
            </h2>
            <p className="text-xs text-slate-500 mt-1">Book early before seats fill up.</p>
          </div>
          <Link
            to="/events?sort=date-asc"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View schedule &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              Seamless Workflow
            </span>
            <h2 className="text-3xl font-extrabold mt-3 tracking-tight">
              How EventSphere Works
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Whether you are discovering events or hosting your own global conference, our platform handles everything flawlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/60 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-600/30">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Discover or Create</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Attendees search curated events by topic or location. Organizers set up ticket tiers, private online links, and venue logistics in minutes.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/60 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Ticket Booking</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enjoy seamless checkout with automated inventory reservations, currency options, instant confirmation, and encrypted fraud prevention.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/60 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-600/30">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">QR Gate Check-in</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Each attendee receives a unique cryptographic QR ticket. Hosts scan with any device camera to verify authenticity and prevent duplicates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become an Event Organizer Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-soft-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
              Host with EventSphere
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mt-4 tracking-tight leading-tight">
              Ready to publish your next world-class event?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Join thousands of summit organizers, artists, and educators. Manage ticket inventories, collect registrations, access real-time analytics, and gate check-ins effortlessly.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/publisher/events/create"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-xs sm:text-sm shadow-md transition hover:scale-105"
              >
                Create Event Now
              </Link>
              <Link
                to="/publisher"
                className="px-6 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm border border-indigo-400/30 transition"
              >
                Explore Publisher Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Leading Organizers & Attendees
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "EventSphere made our annual AI conference check-in completely frictionless. 800+ attendees scanned in under 35 minutes with zero false positives or queues!"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Reviewer"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Marcus Sterling</h4>
                  <p className="text-[10px] text-slate-400">Executive Director, TechVenture Summit</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "As an attendee, getting instant digital tickets with secure QR codes and offline access gives complete peace of mind. The UI is stunning and ultra fast."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Reviewer"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Elena Rostova</h4>
                  <p className="text-[10px] text-slate-400">Design Lead, Studio Metric</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Multi-tier ticket management with free and paid tiers saved us dozens of hours. The revenue analytics dashboard is crisp and transparent."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Reviewer"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">David Thorne</h4>
                  <p className="text-[10px] text-slate-400">Festival Director, Echoes Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

