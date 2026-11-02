import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Search, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Calendar,
  Volume2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, checkinService, CheckinResult } from '@/services/api';
import { Event } from '@/types/database';
import { formatDateTime } from '@/lib/utils';

export const PublisherScanner: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null);
  const [scanHistory, setScanHistory] = useState<CheckinResult[]>([]);
  const [scannerActive, setScannerActive] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Load publisher's events
  useEffect(() => {
    async function initEvents() {
      if (!user) return;
      const evs = await eventService.getPublisherEvents(user.id);
      setEvents(evs);
      if (evs.length > 0) {
        setSelectedEventId(evs[0].id);
      }
    }
    initEvents();
  }, [user]);

  // Initialize or cleanup html5-qrcode scanner
  useEffect(() => {
    if (!scannerActive || !selectedEventId) {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }
      return;
    }

    const scannerElement = document.getElementById('qr-reader');
    if (!scannerElement) return;

    try {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleVerify(decodedText);
        },
        (error) => {
          // Scanning frames in progress - ignore normal non-detection frames
        }
      );

      scannerRef.current = scanner;
    } catch (e) {
      console.warn('QR scanner initialization:', e);
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }
    };
  }, [scannerActive, selectedEventId]);

  const handleVerify = async (codeToVerify: string) => {
    if (!selectedEventId || !user || !codeToVerify.trim() || isVerifying) return;
    setIsVerifying(true);

    try {
      const result = await checkinService.verifyAndCheckIn(codeToVerify, selectedEventId, user.id);
      setLastResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 9)]);

      // Audio feedback simulation
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        if (result.success) {
          osc.frequency.setValueAtTime(600, audioCtx.currentTime);
          osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.1);
        } else {
          osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        }
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch {}
    } catch (e: any) {
      setLastResult({
        success: false,
        code: 'INVALID_TICKET',
        message: e.message || 'Verification failure',
      });
    } finally {
      setIsVerifying(false);
      setManualCode('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerify(manualCode.trim());
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <QrCode className="w-8 h-8 text-indigo-600" />
          <span>Ticket QR Check-in System</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Camera-based gate scanner and manual reference validation with duplicate prevention.
        </p>
      </div>

      {/* Select Active Event */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Active Check-in Gate for Event:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setLastResult(null);
            }}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.category})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setScannerActive(!scannerActive)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
            scannerActive
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{scannerActive ? 'Stop Camera' : 'Start Camera Scanner'}</span>
        </button>
      </div>

      {/* Main Scanner & Manual Lookup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Camera Scanner & Manual Input */}
        <div className="space-y-6">
          {/* Camera Scanner Container */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft text-center">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Camera Stream Viewfinder</span>
            </h3>

            {scannerActive ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                <div id="qr-reader" className="w-full" />
              </div>
            ) : (
              <div className="py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                <Camera className="w-12 h-12 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">Camera is currently paused</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click "Start Camera Scanner" above to grant camera access.
                </p>
              </div>
            )}
          </div>

          {/* Manual Input Search */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Manual Ticket Token or Code Search</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Ticket # (e.g. ES-DEMO9824-T01) or Token..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isVerifying || !manualCode.trim()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition"
              >
                {isVerifying ? 'Checking...' : 'Validate'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Instant Live Result Card & Scan History */}
        <div className="space-y-6">
          {/* Result Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Gate Validation Verdict
            </h3>

            {!lastResult ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Scan a QR code or enter a ticket number to view validation status.
              </div>
            ) : lastResult.code === 'CHECKED_IN' ? (
              /* Valid Check-in */
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-200/60 text-emerald-900 text-xs font-black uppercase tracking-wider">
                    VALID TICKET • ADMIT
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-2">
                    {lastResult.ticket?.attendee_name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{lastResult.ticket?.attendee_email}</p>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ticket Number:</span>
                    <span className="font-mono font-bold text-slate-900">{lastResult.ticket?.ticket_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ticket Tier:</span>
                    <span className="font-bold text-indigo-600">{lastResult.ticket?.ticket_type}</span>
                  </div>
                </div>
              </div>
            ) : lastResult.code === 'ALREADY_CHECKED_IN' ? (
              /* Duplicate Check-in */
              <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-500 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-black uppercase tracking-wider">
                    DUPLICATE • ALREADY CHECKED IN
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">
                    {lastResult.ticket?.attendee_name}
                  </h4>
                </div>
                <p className="text-xs text-amber-900 font-semibold">{lastResult.message}</p>
              </div>
            ) : (
              /* Invalid or Cancelled */
              <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-500 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-rose-200/80 text-rose-950 text-xs font-black uppercase tracking-wider">
                    ADMISSION DENIED
                  </span>
                  <h4 className="text-base font-bold text-rose-900 mt-2">{lastResult.code}</h4>
                  <p className="text-xs text-rose-700 mt-1">{lastResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Scans Log */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Recent Gate Scans ({scanHistory.length})
            </h3>

            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent scans in this session.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {scanHistory.map((h, i) => (
                  <div key={i} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {h.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span className="font-bold text-slate-900">
                        {h.ticket?.attendee_name || h.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{h.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

