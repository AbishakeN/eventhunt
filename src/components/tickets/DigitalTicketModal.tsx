import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { 
  X, 
  Download, 
  Printer, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { Ticket, Booking, Event } from '@/types/database';
import { formatDateTime, formatDate, formatTime } from '@/lib/utils';

interface DigitalTicketModalProps {
  ticket: Ticket | null;
  booking: Booking | null;
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  ticket,
  booking,
  event,
  isOpen,
  onClose,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !ticket || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      // Ticket styling in PDF
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 148, 25, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('EVENTSPHERE OFFICIAL TICKET', 10, 16);

      // Event Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.text(event.title.substring(0, 32), 10, 40);

      // Attendee Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('ATTENDEE NAME', 10, 52);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(ticket.attendee_name, 10, 58);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('TICKET TIER', 80, 52);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(ticket.ticket_type?.name || 'General Admission', 80, 58);

      // Date & Venue
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('DATE & TIME', 10, 70);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formatDateTime(event.start_datetime), 10, 76);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('LOCATION', 80, 70);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(event.location_type === 'online' ? 'Online Broadcast' : (event.venue_name || event.city || 'TBA'), 80, 76);

      // Ticket & Booking Reference
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('TICKET #', 10, 88);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(ticket.ticket_number, 10, 94);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('BOOKING REF', 80, 88);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(booking?.booking_reference || ticket.ticket_number, 80, 94);

      // Security notice
      doc.setDrawColor(226, 232, 240);
      doc.line(10, 105, 138, 105);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Cryptographic QR Code verification required at gate admission. Do not duplicate.', 10, 115);
      doc.text(`Security Token: ${ticket.secure_token}`, 10, 120);

      doc.save(`Ticket_${ticket.ticket_number}.pdf`);
      toast.success('Official PDF Ticket downloaded successfully!');
    } catch (e) {
      toast.error('Failed to generate PDF ticket.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Modal Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-900">Official Digital Pass</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              title="Download as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
              title="Print Pass"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div ref={ticketRef} className="p-6 sm:p-8 space-y-6">
          {/* Header Ticket Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-6 shadow-md">
            <div className="absolute inset-0 opacity-30">
              <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                {ticket.ticket_type?.name || 'General Admission'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2 leading-tight tracking-tight">
                {event.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatDateTime(event.start_datetime)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{event.location_type === 'online' ? 'Online Streaming' : event.venue_name || event.city}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Attendee Details & QR Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Info */}
            <div className="sm:col-span-2 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Attendee Name</span>
                <p className="text-base font-extrabold text-slate-900">{ticket.attendee_name}</p>
                <p className="text-slate-500 text-[11px]">{ticket.attendee_email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ticket Number</span>
                  <p className="font-mono font-bold text-slate-900">{ticket.ticket_number}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Booking Ref</span>
                  <p className="font-mono font-bold text-slate-900">
                    {booking?.booking_reference || ticket.ticket_number}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Admission Status</span>
                <div className="mt-0.5">
                  {ticket.status === 'checked_in' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Checked In
                    </span>
                  ) : ticket.status === 'cancelled' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      <Clock className="w-3 h-3" /> Valid for Entry
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cryptographic QR Code */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <QRCodeSVG
                value={ticket.secure_token || ticket.ticket_number}
                size={120}
                level="H"
                includeMargin={false}
              />
              <span className="mt-2 text-[9px] font-mono text-slate-400 break-all">
                {ticket.ticket_number}
              </span>
            </div>
          </div>

          {/* Security & Verification Guarantee */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>EventSphere Cryptographic Gate Security Verified</span>
            </span>
            <span>Non-transferable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
