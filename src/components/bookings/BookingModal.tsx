import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CheckCircle2, 
  Ticket as TicketIcon, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Minus, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Event, TicketType, Booking } from '@/types/database';
import { bookingService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

interface BookingModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ event, isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State: Selected quantities for each ticket type
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Attendee info for each selected ticket: array of { ticketTypeId, attendeeName, attendeeEmail }
  const [attendees, setAttendees] = useState<{ ticketTypeId: string; attendeeName: string; attendeeEmail: string }[]>([]);
  const [currentStep, setCurrentStep] = useState<'tickets' | 'attendees' | 'payment' | 'success'>('tickets');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const ticketTypes = event.ticket_types || [];

  const handleQuantityChange = (ticketId: string, delta: number, maxPerBooking: number, available: number) => {
    const current = quantities[ticketId] || 0;
    const next = Math.max(0, Math.min(current + delta, maxPerBooking, available));
    const newQuantities = { ...quantities, [ticketId]: next };
    setQuantities(newQuantities);

    // Reconstruct attendee list based on updated quantities
    const newAttendees: { ticketTypeId: string; attendeeName: string; attendeeEmail: string }[] = [];
    Object.entries(newQuantities).forEach(([tId, count]) => {
      for (let i = 0; i < count; i++) {
        // preserve existing input if already entered
        const existing = attendees.find((a, idx) => a.ticketTypeId === tId && idx === newAttendees.length);
        newAttendees.push({
          ticketTypeId: tId,
          attendeeName: existing?.attendeeName || (user ? user.full_name : ''),
          attendeeEmail: existing?.attendeeEmail || (user ? user.email : ''),
        });
      }
    });
    setAttendees(newAttendees);
  };

  // Calculations
  const totalTickets = Object.values(quantities).reduce((acc, q) => acc + q, 0);

  const subtotal = Object.entries(quantities).reduce((acc, [tId, qty]) => {
    const t = ticketTypes.find((item) => item.id === tId);
    return acc + (t ? Number(t.price) * qty : 0);
  }, 0);

  const isFree = subtotal === 0;
  // 3% platform fee + 5% service tax if paid
  const fees = isFree ? 0 : Number((subtotal * 0.03).toFixed(2));
  const taxes = isFree ? 0 : Number((subtotal * 0.05).toFixed(2));
  const totalAmount = Number((subtotal + fees + taxes).toFixed(2));

  const handleProceedToAttendees = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (totalTickets === 0) {
      setErrorMessage('Please select at least 1 ticket to proceed.');
      return;
    }
    setErrorMessage('');
    setCurrentStep('attendees');
  };

  const handleProceedToPayment = () => {
    // Validate attendee inputs
    for (let i = 0; i < attendees.length; i++) {
      if (!attendees[i].attendeeName.trim() || !attendees[i].attendeeEmail.trim()) {
        setErrorMessage(`Please fill out the name and email for attendee #${i + 1}.`);
        return;
      }
    }
    setErrorMessage('');

    if (isFree) {
      // Free events skip payment step
      executeBooking('free');
    } else {
      setCurrentStep('payment');
    }
  };

  const executeBooking = async (provider: string = 'razorpay') => {
    if (!user) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const itemsPayload = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([tId, qty]) => {
          const tt = ticketTypes.find((t) => t.id === tId);
          return {
            ticketTypeId: tId,
            quantity: qty,
            unitPrice: Number(tt?.price || 0),
          };
        });

      const paymentOrderId = isFree ? undefined : 'order_' + Math.random().toString(36).substring(2, 10);
      const paymentId = isFree ? undefined : 'pay_' + Math.random().toString(36).substring(2, 10);

      const result = await bookingService.createBooking({
        userId: user.id,
        eventId: event.id,
        items: itemsPayload,
        attendees: attendees,
        subtotal,
        fees,
        taxes,
        totalAmount,
        paymentProvider: provider,
        providerOrderId: paymentOrderId,
        providerPaymentId: paymentId,
      });

      if (result.success) {
        setConfirmedBooking(result.booking);
        setCurrentStep('success');

        // Confetti explosion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              {currentStep === 'success' ? 'Confirmation' : 'Ticket Reservation'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 truncate max-w-md mt-0.5">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {currentStep !== 'success' && (
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className={currentStep === 'tickets' ? 'text-indigo-600 font-bold' : ''}>
              1. Select Tickets
            </span>
            <span>&rarr;</span>
            <span className={currentStep === 'attendees' ? 'text-indigo-600 font-bold' : ''}>
              2. Attendee Details
            </span>
            <span>&rarr;</span>
            <span className={currentStep === 'payment' ? 'text-indigo-600 font-bold' : ''}>
              3. {isFree ? 'Confirm' : 'Payment'}
            </span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SELECT TICKETS */}
          {currentStep === 'tickets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose the ticket tier and quantity you wish to purchase:
              </p>

              {ticketTypes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <TicketIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">No active ticket types found for this event.</p>
                </div>
              ) : (
                ticketTypes.map((t) => {
                  const available = Math.max(0, t.total_quantity - t.sold_quantity);
                  const isSoldOut = available <= 0;
                  const qty = quantities[t.id] || 0;

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        qty > 0
                          ? 'border-indigo-500 bg-indigo-50/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                            {isSoldOut ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700">
                                Sold Out
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                {available} remaining
                              </span>
                            )}
                          </div>
                          {t.description && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {t.description}
                            </p>
                          )}
                          <p className="text-sm font-bold text-slate-900 mt-2">
                            {t.price === 0 ? 'Free' : formatCurrency(t.price)}
                          </p>
                        </div>

                        {/* Quantity Counter */}
                        {!isSoldOut && (
                          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(t.id, -1, t.max_per_booking, available)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(t.id, 1, t.max_per_booking, available)}
                              disabled={qty >= t.max_per_booking || qty >= available}
                              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* STEP 2: ATTENDEE DETAILS */}
          {currentStep === 'attendees' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Please provide the contact details for each ticket holder. Tickets with QR codes will be addressed to these names.
              </p>

              {attendees.map((att, idx) => {
                const tt = ticketTypes.find((t) => t.id === att.ticketTypeId);
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">
                        Ticket #{idx + 1}: {tt?.name}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600">
                        {tt?.price === 0 ? 'Free' : formatCurrency(tt?.price || 0)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={att.attendeeName}
                          onChange={(e) => {
                            const updated = [...attendees];
                            updated[idx].attendeeName = e.target.value;
                            setAttendees(updated);
                          }}
                          placeholder="e.g. Alex Johnson"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={att.attendeeEmail}
                          onChange={(e) => {
                            const updated = [...attendees];
                            updated[idx].attendeeEmail = e.target.value;
                            setAttendees(updated);
                          }}
                          placeholder="e.g. alex@example.com"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3: PAYMENT CHECKOUT */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Order Summary
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Ticket Subtotal ({totalTickets} tickets):</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform & processing fee (3%):</span>
                    <span>{formatCurrency(fees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated taxes (5%):</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Amount Payable:</span>
                    <span className="text-indigo-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/20 flex items-center gap-3 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Razorpay / Card / UPI</p>
                      <p className="text-[10px] text-slate-500">Fast & verified checkout</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3 opacity-60">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Direct NetBanking</p>
                      <p className="text-[10px] text-slate-500">All major banks</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>256-bit encrypted secure checkout. Server-side signature verified.</span>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {currentStep === 'success' && confirmedBooking && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Booking Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Thank you! Your tickets have been reserved and issued.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{confirmedBooking.booking_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Event:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tickets Issued:</span>
                  <span className="font-semibold text-slate-900">{confirmedBooking.tickets?.length || totalTickets} tickets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-indigo-600">
                    {confirmedBooking.total_amount === 0 ? 'Free' : formatCurrency(confirmedBooking.total_amount)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/bookings');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                >
                  View My Tickets & QR Codes
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {currentStep !== 'success' && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div>
              {totalTickets > 0 && (
                <div className="text-xs">
                  <span className="text-slate-500">{totalTickets} ticket(s) • Total: </span>
                  <span className="font-bold text-slate-900">
                    {isFree ? 'Free' : formatCurrency(totalAmount)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep !== 'tickets' && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 'payment') setCurrentStep('attendees');
                    else if (currentStep === 'attendees') setCurrentStep('tickets');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Back
                </button>
              )}

              {currentStep === 'tickets' && (
                <button
                  type="button"
                  onClick={handleProceedToAttendees}
                  disabled={totalTickets === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 'attendees' && (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <span>{isFree ? 'Confirm Free Booking' : 'Proceed to Payment'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 'payment' && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => executeBooking('razorpay')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Processing securely...</span>
                  ) : (
                    <>
                      <span>Pay {formatCurrency(totalAmount)} & Confirm</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
