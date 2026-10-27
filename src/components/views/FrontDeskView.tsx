import React, { useState } from 'react';
import { Booking, ExtraServiceItem } from '../../types/hotel';
import { useHotel } from '../../context/HotelContext';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  KeyRound,
  LogOut,
  Plus,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  UtensilsCrossed,
  Wrench,
  X,
} from 'lucide-react';

interface FrontDeskViewProps {
  onOpenInvoice: (booking: Booking) => void;
  onOpenWalkInModal: () => void;
}

export const FrontDeskView: React.FC<FrontDeskViewProps> = ({
  onOpenInvoice,
  onOpenWalkInModal,
}) => {
  const {
    bookings,
    rooms,
    checkInGuest,
    checkOutGuest,
    serviceRequests,
    updateServiceStatus,
    metrics,
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQueueTab, setActiveQueueTab] = useState<'arrivals' | 'in_house' | 'departures'>('arrivals');

  // Check-In modal state
  const [checkInTarget, setCheckInTarget] = useState<Booking | null>(null);
  const [keyCardNumber, setKeyCardNumber] = useState('');
  const [idVerified, setIdVerified] = useState(true);

  // Check-Out modal state
  const [checkOutTarget, setCheckOutTarget] = useState<Booking | null>(null);
  const [minibarCharge, setMinibarCharge] = useState(0);
  const [diningCharge, setDiningCharge] = useState(0);
  const [damageCharge, setDamageCharge] = useState(0);

  // Filter bookings based on search
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    const matchName = b.guestName.toLowerCase().includes(query);
    const matchCode = b.bookingCode.toLowerCase().includes(query);
    const matchRoom = b.roomNumber.includes(query);
    return matchName || matchCode || matchRoom;
  });

  const arrivals = filteredBookings.filter((b) => b.bookingStatus === 'confirmed');
  const inHouse = filteredBookings.filter((b) => b.bookingStatus === 'checked_in');

  const handleExecuteCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInTarget) return;
    const card = keyCardNumber || `KEY-${checkInTarget.roomNumber}`;
    checkInGuest(checkInTarget.id, card);
    setCheckInTarget(null);
    setKeyCardNumber('');
  };

  const handleExecuteCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkOutTarget) return;

    const extras: ExtraServiceItem[] = [];
    const today = new Date().toISOString().split('T')[0];

    if (minibarCharge > 0) {
      extras.push({
        id: 'ex-mini-' + Date.now(),
        name: 'In-Room Minibar Consumption',
        amount: Number(minibarCharge),
        date: today,
      });
    }
    if (diningCharge > 0) {
      extras.push({
        id: 'ex-dine-' + Date.now(),
        name: 'In-Room Dining / Bistro Charge',
        amount: Number(diningCharge),
        date: today,
      });
    }
    if (damageCharge > 0) {
      extras.push({
        id: 'ex-misc-' + Date.now(),
        name: 'Incidentals / Additional Fees',
        amount: Number(damageCharge),
        date: today,
      });
    }

    checkOutGuest(checkOutTarget.id, extras);
    setCheckOutTarget(null);
    setMinibarCharge(0);
    setDiningCharge(0);
    setDamageCharge(0);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* View Header with KPI cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
            Front Desk Operations
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
            Reception & Guest Services Dispatch
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Process guest check-ins, program digital keycards, settle departures, and manage active service requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWalkInModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Walk-In Reservation</span>
          </button>
        </div>
      </div>

      {/* Front Desk Live Operational Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Arrivals Expected</span>
          <span className="text-2xl font-bold text-neutral-900 tabular-nums">
            {metrics.pendingArrivals}
          </span>
          <span className="text-[10px] text-blue-700 font-semibold block mt-1">Pending Check-in</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">In-House Guests</span>
          <span className="text-2xl font-bold text-neutral-900 tabular-nums">
            {metrics.pendingDepartures}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Currently Staying</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Occupancy Rate</span>
          <span className="text-2xl font-bold text-neutral-900 tabular-nums">
            {metrics.occupancyRate}%
          </span>
          <span className="text-[10px] text-neutral-500 block mt-1">{metrics.occupiedRooms} / {metrics.totalRooms} Rooms</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium block">Dirty Rooms</span>
          <span className="text-2xl font-bold text-amber-600 tabular-nums">
            {metrics.dirtyRooms}
          </span>
          <span className="text-[10px] text-amber-800 font-semibold block mt-1">Need Housekeeping</span>
        </div>
      </div>

      {/* Search and Queue Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest name, reservation code, or room..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        {/* Queue Selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setActiveQueueTab('arrivals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeQueueTab === 'arrivals'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Arrivals ({arrivals.length})
          </button>
          <button
            onClick={() => setActiveQueueTab('in_house')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeQueueTab === 'in_house'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            In-House & Departures ({inHouse.length})
          </button>
        </div>
      </div>

      {/* Queues Content */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
              <tr>
                <th className="px-5 py-3">Reservation</th>
                <th className="px-5 py-3">Guest Details</th>
                <th className="px-5 py-3">Room / Type</th>
                <th className="px-5 py-3">Dates & Nights</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {activeQueueTab === 'arrivals' ? (
                arrivals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-neutral-400">
                      No pending guest arrivals in queue.
                    </td>
                  </tr>
                ) : (
                  arrivals.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/80 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-neutral-900">{b.bookingCode}</span>
                        <span className="text-[10px] text-neutral-400 block">
                          Booked {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-neutral-900 block">{b.guestName}</span>
                        <span className="text-neutral-500 text-[11px] block">{b.guestPhone}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-neutral-900">Room {b.roomNumber}</span>
                        <span className="text-neutral-500 text-[11px] block">{b.roomCategory}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-neutral-900">{b.checkIn} → {b.checkOut}</span>
                        <span className="text-neutral-500 text-[11px] block">
                          {b.nights} Nights ({b.adults} Adults)
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          PAID ${b.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5 uppercase">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setCheckInTarget(b);
                            setKeyCardNumber(`KEY-${b.roomNumber}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-2xs transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Check In</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                inHouse.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-neutral-400">
                      No guests currently in-house.
                    </td>
                  </tr>
                ) : (
                  inHouse.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/80 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-neutral-900">{b.bookingCode}</span>
                        {b.keyCardAssigned && (
                          <span className="text-[10px] font-mono text-neutral-600 block">
                            Key: {b.keyCardAssigned}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-neutral-900 block">{b.guestName}</span>
                        <span className="text-neutral-500 text-[11px] block">{b.guestEmail}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-neutral-900">Room {b.roomNumber}</span>
                        <span className="text-neutral-500 text-[11px] block">{b.roomCategory}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-neutral-900">Departing: {b.checkOut}</span>
                        <span className="text-neutral-500 text-[11px] block">
                          Checked In {b.checkedInAt ? new Date(b.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Yesterday'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-neutral-900 tabular-nums">
                          ${b.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-600 block font-semibold">
                          Paid
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenInvoice(b)}
                          className="px-2.5 py-1.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-semibold transition"
                          title="View Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => setCheckOutTarget(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-2xs transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Process Departure</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Guest Service Requests Pipeline */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Active In-Room Service Requests
            </h2>
            <p className="text-xs text-neutral-500">
              Dispatched from guest portal and reception
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
            {serviceRequests.filter((s) => s.status !== 'completed').length} Pending Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {serviceRequests.map((srv) => {
            const isCompleted = srv.status === 'completed';
            const isInProgress = srv.status === 'in_progress';
            return (
              <div
                key={srv.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-900">Room {srv.roomNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {srv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-neutral-900 text-xs">{srv.title}</h4>
                  <p className="text-neutral-600 text-xs mt-1 leading-snug">{srv.details}</p>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    Guest: {srv.guestName} · {srv.assignedTo || 'Unassigned'}
                  </p>
                </div>

                {!isCompleted && (
                  <div className="pt-2 border-t border-neutral-200 flex gap-1.5">
                    {srv.status === 'pending' && (
                      <button
                        onClick={() => updateServiceStatus(srv.id, 'in_progress')}
                        className="flex-1 py-1 px-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded transition"
                      >
                        Accept & Dispatch
                      </button>
                    )}
                    <button
                      onClick={() => updateServiceStatus(srv.id, 'completed')}
                      className="flex-1 py-1 px-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded transition"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Check-In Modal */}
      {checkInTarget && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Guest Check-In</h3>
                <p className="text-xs text-neutral-500">
                  {checkInTarget.guestName} · Room {checkInTarget.roomNumber}
                </p>
              </div>
              <button
                onClick={() => setCheckInTarget(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteCheckIn} className="space-y-4">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Suite Type:</span>
                  <span className="font-semibold text-neutral-900">{checkInTarget.roomCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Duration:</span>
                  <span className="font-semibold text-neutral-900">{checkInTarget.nights} Nights ({checkInTarget.checkIn} to {checkInTarget.checkOut})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Status:</span>
                  <span className="font-bold text-emerald-700">Settled (${checkInTarget.totalPrice.toFixed(2)})</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Assign Digital Keycard ID
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={keyCardNumber}
                    onChange={(e) => setKeyCardNumber(e.target.value)}
                    required
                    placeholder="e.g. KEY-402A"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                <input
                  type="checkbox"
                  id="idCheck"
                  checked={idVerified}
                  onChange={(e) => setIdVerified(e.target.checked)}
                  className="rounded text-neutral-900"
                />
                <label htmlFor="idCheck" className="text-xs text-neutral-700 font-medium cursor-pointer">
                  Government photo ID & contact information verified
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCheckInTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!idVerified}
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  Issue Keycard & Complete Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-Out Modal */}
      {checkOutTarget && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Process Guest Departure</h3>
                <p className="text-xs text-neutral-500">
                  {checkOutTarget.guestName} · Room {checkOutTarget.roomNumber}
                </p>
              </div>
              <button
                onClick={() => setCheckOutTarget(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteCheckOut} className="space-y-4">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Previous Billed Total:</span>
                  <span className="font-semibold text-neutral-900">${checkOutTarget.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Issued Keycard:</span>
                  <span className="font-mono text-neutral-900">{checkOutTarget.keyCardAssigned || 'N/A'} (Returned)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-900 block mb-2">
                  Additional Incidentals & Consumption
                </label>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-neutral-700">Minibar Consumption ($)</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={minibarCharge}
                      onChange={(e) => setMinibarCharge(Number(e.target.value))}
                      className="w-24 text-xs font-mono text-right px-2 py-1 border border-neutral-200 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-neutral-700">Room Dining / Bistro ($)</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={diningCharge}
                      onChange={(e) => setDiningCharge(Number(e.target.value))}
                      className="w-24 text-xs font-mono text-right px-2 py-1 border border-neutral-200 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-neutral-700">Miscellaneous Service ($)</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={damageCharge}
                      onChange={(e) => setDamageCharge(Number(e.target.value))}
                      className="w-24 text-xs font-mono text-right px-2 py-1 border border-neutral-200 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="font-bold text-xs text-neutral-900">Final Adjusted Total</span>
                <span className="font-bold text-base text-neutral-950 tabular-nums">
                  ${(checkOutTarget.totalPrice + minibarCharge + diningCharge + damageCharge).toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                Notice: Room {checkOutTarget.roomNumber} will automatically be flagged as Dirty and added to Housekeeping Turnover.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCheckOutTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition"
                >
                  Confirm Departure & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
