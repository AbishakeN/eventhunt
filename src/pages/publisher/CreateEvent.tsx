import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Video, 
  Ticket as TicketIcon, 
  Settings, 
  Eye, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/api';
import { CATEGORIES } from '@/services/mockData';
import { LocationType, TicketType, Event } from '@/types/database';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // 'Technology'
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80');
  const [tagsInput, setTagsInput] = useState('Tech, AI, Innovation');

  // Step 2: Date and Time
  const defaultStart = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16);
  const defaultEnd = new Date(Date.now() + 14 * 86400000 + 4 * 3600000).toISOString().slice(0, 16);
  const [startDatetime, setStartDatetime] = useState(defaultStart);
  const [endDatetime, setEndDatetime] = useState(defaultEnd);
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [registrationDeadline, setRegistrationDeadline] = useState(defaultStart);

  // Step 3: Location
  const [locationType, setLocationType] = useState<LocationType>('physical');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [onlinePlatform, setOnlinePlatform] = useState('Zoom Enterprise Webinar');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [onlineInstructions, setOnlineInstructions] = useState('');

  // Step 4: Tickets
  const [ticketTypes, setTicketTypes] = useState<Partial<TicketType>[]>([
    {
      name: 'General Admission',
      description: 'Standard access to the event.',
      price: 49,
      total_quantity: 150,
      max_per_booking: 4,
    },
    {
      name: 'VIP Experience Pass',
      description: 'Front row seating & VIP networking lounge access.',
      price: 149,
      total_quantity: 50,
      max_per_booking: 2,
    },
  ]);

  // Step 5: Settings
  const [capacity, setCapacity] = useState(200);
  const [refundPolicy, setRefundPolicy] = useState('Full refund available up to 7 days before event start date.');
  const [terms, setTerms] = useState('All attendees must present valid government photo ID upon entrance. Tickets are non-transferable within 48 hours of showtime.');

  // Ticket manipulation
  const handleAddTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: 'New Ticket Tier',
        description: '',
        price: 0,
        total_quantity: 100,
        max_per_booking: 5,
      },
    ]);
  };

  const handleRemoveTicketType = (index: number) => {
    if (ticketTypes.length === 1) {
      toast.error('You must offer at least one ticket type.');
      return;
    }
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleUpdateTicket = (index: number, field: keyof TicketType, val: any) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: val };
    setTicketTypes(updated);
  };

  // Step Validation
  const validateStep = (step: number) => {
    if (step === 1) {
      if (!title.trim()) {
        toast.error('Event title is required');
        return false;
      }
      if (!description.trim()) {
        toast.error('Event description is required');
        return false;
      }
    } else if (step === 2) {
      if (!startDatetime || !endDatetime) {
        toast.error('Please specify valid start and end dates');
        return false;
      }
      if (new Date(endDatetime) <= new Date(startDatetime)) {
        toast.error('End date must be after start date');
        return false;
      }
    } else if (step === 3) {
      if (locationType === 'physical' && (!venueName.trim() || !city.trim())) {
        toast.error('Venue name and city are required for in-person events');
        return false;
      }
      if (locationType === 'online' && !onlineUrl.trim()) {
        toast.error('Online meeting link is required for virtual events');
        return false;
      }
    } else if (step === 4) {
      if (ticketTypes.length === 0) {
        toast.error('At least one ticket tier must be configured');
        return false;
      }
      for (const t of ticketTypes) {
        if (!t.name?.trim()) {
          toast.error('All ticket tiers must have a name');
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async (status: 'draft' | 'published') => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const created = await eventService.createEvent(
        {
          publisher_id: user.id,
          title,
          description,
          category,
          cover_image: coverImage,
          location_type: locationType,
          venue_name: locationType === 'physical' ? venueName : undefined,
          address: locationType === 'physical' ? address : undefined,
          city: locationType === 'physical' ? city : undefined,
          state: locationType === 'physical' ? state : undefined,
          postal_code: locationType === 'physical' ? postalCode : undefined,
          online_platform: locationType === 'online' ? onlinePlatform : undefined,
          online_url: locationType === 'online' ? onlineUrl : undefined,
          online_instructions: locationType === 'online' ? onlineInstructions : undefined,
          start_datetime: new Date(startDatetime).toISOString(),
          end_datetime: new Date(endDatetime).toISOString(),
          timezone,
          registration_deadline: new Date(registrationDeadline).toISOString(),
          capacity: Number(capacity),
          status,
          refund_policy: refundPolicy,
          terms,
          tags,
        },
        ticketTypes
      );

      toast.success(status === 'published' ? 'Event published successfully!' : 'Event saved as draft!');
      navigate('/publisher/events');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Date & Time' },
    { num: 3, title: 'Location' },
    { num: 4, title: 'Tickets' },
    { num: 5, title: 'Policies' },
    { num: 6, title: 'Preview & Publish' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Event
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Follow our 6-step guided wizard to configure and publish your experience.
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft overflow-x-auto">
        <div className="flex items-center justify-between min-w-[550px]">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                type="button"
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
                className={`flex items-center gap-2 text-xs font-bold transition ${
                  currentStep === s.num
                    ? 'text-indigo-600'
                    : currentStep > s.num
                    ? 'text-emerald-600 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    currentStep === s.num
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : currentStep > s.num
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span>{s.title}</span>
              </button>
              {idx < stepsList.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-3 ${
                    currentStep > s.num ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Form Containers */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10">
        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 1: Event Fundamentals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Title, categorization, and visual presentation</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NextGen Web & AI Developer Summit 2026"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Technology, AI, Cloud, Python"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cover Image URL *
              </label>
              <input
                type="url"
                required
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {/* Presets */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">Suggested presets:</span>
                <button
                  type="button"
                  onClick={() => setCoverImage('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80')}
                  className="text-[10px] text-indigo-600 hover:underline"
                >
                  Conference
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80')}
                  className="text-[10px] text-indigo-600 hover:underline"
                >
                  Music Festival
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1600&q=80')}
                  className="text-[10px] text-indigo-600 hover:underline"
                >
                  Workshop
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Event Description *
              </label>
              <textarea
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a captivating, detailed overview of the schedule, keynote speakers, topics, and attendee takeaways..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DATE & TIME */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2: Date, Time & Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure when the experience starts, ends, and registrations close</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDatetime}
                  onChange={(e) => setStartDatetime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDatetime}
                  onChange={(e) => setEndDatetime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Time Zone *
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="Europe/London">London / GMT</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registration Cutoff Deadline
                </label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 3: Venue & Location Type</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select whether this event is physically hosted or conducted online</p>
            </div>

            {/* Toggle format */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLocationType('physical')}
                className={`p-4 rounded-2xl border text-left transition ${
                  locationType === 'physical'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <MapPin className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-bold text-xs sm:text-sm">In-Person Venue</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Convention center, stadium, studio, hall</p>
              </button>

              <button
                type="button"
                onClick={() => setLocationType('online')}
                className={`p-4 rounded-2xl border text-left transition ${
                  locationType === 'online'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <Video className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-bold text-xs sm:text-sm">Online / Virtual Event</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Encrypted link protected for ticket holders</p>
              </button>
            </div>

            {locationType === 'physical' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Moscone Convention Center"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="747 Howard Street"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="94103"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Online Platform Name
                  </label>
                  <input
                    type="text"
                    value={onlinePlatform}
                    onChange={(e) => setOnlinePlatform(e.target.value)}
                    placeholder="e.g. Zoom Webinar, Google Meet, YouTube Live"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Meeting URL (Encrypted & Private) *</span>
                    <span className="text-[10px] text-indigo-600 font-normal">Hidden from public until booked</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={onlineUrl}
                    onChange={(e) => setOnlineUrl(e.target.value)}
                    placeholder="https://zoom.us/j/123456789?pwd=..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Attendee Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={onlineInstructions}
                    onChange={(e) => setOnlineInstructions(e.target.value)}
                    placeholder="e.g. Please join 10 minutes prior to keynote. Mic will be muted on entry..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: TICKETS CONFIGURATION */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 4: Ticket Tiers & Pricing</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure free or paid passes with custom quantities</p>
              </div>
              <button
                type="button"
                onClick={handleAddTicketType}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-4">
              {ticketTypes.map((ticket, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Tier #{idx + 1}</span>
                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTicketType(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tier Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={ticket.name}
                        onChange={(e) => handleUpdateTicket(idx, 'name', e.target.value)}
                        placeholder="e.g. Early Bird / VIP Pass"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Price (USD) (0 for Free) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={ticket.price}
                        onChange={(e) => handleUpdateTicket(idx, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Total Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={ticket.total_quantity}
                        onChange={(e) => handleUpdateTicket(idx, 'total_quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Max Allowed per Booking
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={ticket.max_per_booking || 5}
                        onChange={(e) => handleUpdateTicket(idx, 'max_per_booking', Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Perks & Description
                    </label>
                    <input
                      type="text"
                      value={ticket.description || ''}
                      onChange={(e) => handleUpdateTicket(idx, 'description', e.target.value)}
                      placeholder="e.g. Includes front row seats, backstage pass, and merchandise."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: POLICIES */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 5: Capacity & Legal Policies</h3>
              <p className="text-xs text-slate-500 mt-0.5">Attendee limits, refund policy, and code of conduct</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Venue Capacity Limit *
              </label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Refund Policy *
              </label>
              <textarea
                rows={3}
                required
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Terms and Conditions
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 6: PREVIEW & PUBLISH */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 6: Review & Publish</h3>
              <p className="text-xs text-slate-500 mt-0.5">Preview how your event will appear to prospective attendees</p>
            </div>

            {/* Event Preview Card */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
              <div className="aspect-[21/9] relative bg-slate-900">
                <img src={coverImage} alt={title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/95 text-slate-900">
                    {category}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white">
                    {locationType === 'online' ? 'Online Event' : 'In-Person'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">{title || 'Untitled Event'}</h2>
                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{formatDateTime(startDatetime)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>{locationType === 'online' ? onlinePlatform : `${venueName}, ${city}`}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {description}
                </p>

                {/* Ticket Summary */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Configured Ticket Tiers:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ticketTypes.map((t, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between text-xs">
                        <span className="font-semibold text-slate-900">{t.name} ({t.total_quantity} qty)</span>
                        <span className="font-bold text-indigo-600">{t.price === 0 ? 'Free' : formatCurrency(t.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition hover:scale-[1.01]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handlePublish('draft')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handlePublish('published')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Event Live'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

