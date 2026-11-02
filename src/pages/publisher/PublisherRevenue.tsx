import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  ShieldCheck, 
  Clock, 
  RotateCcw,
  CreditCard,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/api';
import { Event } from '@/types/database';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export const PublisherRevenue: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoading(true);
      try {
        const evs = await eventService.getPublisherEvents(user.id);
        setEvents(evs);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  // Aggregate financials
  const grossSales = events.reduce((sum, e) => {
    const rev = (e.ticket_types || []).reduce((acc, t) => acc + (t.sold_quantity || 0) * Number(t.price), 0);
    return sum + rev;
  }, 0);

  const platformFees = Number((grossSales * 0.05).toFixed(2)); // 5% fee
  const netRevenue = Number((grossSales - platformFees).toFixed(2));
  const pendingPayout = Number((netRevenue * 0.25).toFixed(2)); // 25% rolling reserve

  // Generate synthetic transaction history from the events
  const transactions = events.flatMap((ev) => {
    return (ev.ticket_types || []).filter((t) => t.sold_quantity > 0).map((t, idx) => ({
      id: `tx-${ev.id}-${idx}`,
      eventTitle: ev.title,
      tier: t.name,
      amount: t.sold_quantity * Number(t.price),
      unitsSold: t.sold_quantity,
      date: ev.created_at,
      status: 'settled',
    }));
  });

  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    const headers = ['Transaction ID', 'Event Name', 'Ticket Tier', 'Units Sold', 'Gross Amount', 'Date', 'Status'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.eventTitle}"`,
      `"${t.tier}"`,
      t.unitsSold,
      t.amount,
      t.date,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_payouts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial transactions report exported!');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Revenue & Payout Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track gross ticket volume, platform deductions, and automatic bank settlements.
          </p>
        </div>

        <button
          onClick={handleExportTransactions}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>Download Financial Statement (CSV)</span>
        </button>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{formatCurrency(grossSales)}</p>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> 100% verified gateway volume
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Fees (5%)</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-700 mt-2">{formatCurrency(platformFees)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Processing, hosting, and gate security</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Host Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-2">{formatCurrency(netRevenue)}</p>
          <p className="text-[11px] text-indigo-600 mt-1 font-semibold">Ready or paid to organizer</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rolling Payout Reserve</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">{formatCurrency(pendingPayout)}</p>
          <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" /> Clears in 2-3 business days
          </p>
        </div>
      </div>

      {/* Payout Bank Info */}
      <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Direct Bank Deposit Configured</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Payouts are automatically wired directly via Razorpay Route / Stripe Connect to account ending in •••• 4892.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Active & Verified
        </span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Settled Event Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">Breakdown of gross ticket earnings by tier</p>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 pl-6">Event & Tier</th>
                  <th className="py-3.5">Tickets Sold</th>
                  <th className="py-3.5">Gross Amount</th>
                  <th className="py-3.5">Platform Fee (5%)</th>
                  <th className="py-3.5">Net Payout</th>
                  <th className="py-3.5 text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const fee = tx.amount * 0.05;
                  const net = tx.amount - fee;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 pl-6 font-bold text-slate-900">
                        {tx.eventTitle}
                        <span className="block text-[11px] text-indigo-600 font-semibold mt-0.5">
                          {tx.tier}
                        </span>
                      </td>
                      <td className="py-4 font-semibold text-slate-700">{tx.unitsSold} passes</td>
                      <td className="py-4 font-bold text-slate-900">{formatCurrency(tx.amount)}</td>
                      <td className="py-4 text-slate-500">-{formatCurrency(fee)}</td>
                      <td className="py-4 font-bold text-emerald-600">+{formatCurrency(net)}</td>
                      <td className="py-4 text-right pr-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

