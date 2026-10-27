import React, { useState } from 'react';
import { Booking } from '../../types/hotel';
import { useHotel } from '../../context/HotelContext';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Download,
  FileText,
  KeyRound,
  RotateCcw,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  Wrench,
  X,
} from 'lucide-react';

interface GuestReservationsViewProps {
  onOpenInvoice: (booking: Booking) => void;
}

export const GuestReservationsView: React.FC<GuestReservationsViewProps> = ({
  onOpenInvoice,
}) => {
  const {
    bookings,
    currentUser,
    cancelBooking,
    addReview,
    createServiceRequest,
    config,
  } = useHotel();

  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'>('all');

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Service Request modal state
  const [serviceBooking, setServiceBooking] = useState<Booking | null>(null);
  const [serviceType, setServiceType] = useState<'room_service' | 'extra_towels' | 'maintenance' | 'luggage'>('room_service');
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');
  const [serviceSuccess, setServiceSuccess] = useState(false);

  // Cancellation confirm state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of travel itinerary');

  // Filter bookings: if logged in as guest Sarah, show Sarah's first or all if requested
  const userBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false;
    return true;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    addReview(
      reviewBooking.roomId,
      reviewBooking.bookingCode,
      currentUser.name,
      reviewRating,
      reviewComment
    );
    setReviewBooking(null);
    setReviewComment('');
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceBooking) return;
    createServiceRequest(
      serviceType,
      serviceTitle || `${serviceType.replace('_', ' ').toUpperCase()} Request`,
      serviceDetails,
      serviceBooking.roomNumber,
      serviceBooking.guestName
    );
    setServiceSuccess(true);
    setTimeout(() => {
      setServiceSuccess(false);
      setServiceBooking(null);
      setServiceTitle('');
      setServiceDetails('');
    }, 1500);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelBooking(cancelTarget.id, cancelReason);
    setCancelTarget(null);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
            Guest Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
            My Reservations & Stays
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your hotel reservations, review digital invoices, and request personalized in-room services.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'All Stays' },
            { id: 'confirmed', label: 'Upcoming' },
            { id: 'checked_in', label: 'In-House (Active)' },
            { id: 'checked_out', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {userBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
          <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No Reservations Found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            You don't have any reservations under the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userBookings.map((b) => {
            const isCheckedIn = b.bookingStatus === 'checked_in';
            const isConfirmed = b.bookingStatus === 'confirmed';
            const isCompleted = b.bookingStatus === 'checked_out';
            const isCancelled = b.bookingStatus === 'cancelled';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-300 transition"
              >
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Column: Code & Room info */}
                  <div className="lg:col-span-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-neutral-900">
                        {b.bookingCode}
                      </span>
                      {isCheckedIn && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          In-House Guest
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Confirmed Upcoming
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-700">
                          Completed Stay
                        </span>
                      )}
                      {isCancelled && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                          Cancelled (Refunded)
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-neutral-900 text-base">{b.roomCategory}</h3>
                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                      <span>Room {b.roomNumber}</span>
                      <span>·</span>
                      <span>{b.nights} Night{b.nights > 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{b.adults} Adults{b.children ? `, ${b.children} Kids` : ''}</span>
                    </div>

                    {b.keyCardAssigned && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 text-white rounded-md text-xs font-mono">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Keycard: {b.keyCardAssigned}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Dates & Schedule */}
                  <div className="lg:col-span-4 grid grid-cols-2 gap-4 py-2 border-y lg:border-y-0 lg:border-x border-neutral-100 lg:px-6 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-semibold">
                        Check-In
                      </span>
                      <p className="font-bold text-neutral-900 mt-0.5">{b.checkIn}</p>
                      <p className="text-[11px] text-neutral-500">From {config.checkInTime} PM</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider block font-semibold">
                        Check-Out
                      </span>
                      <p className="font-bold text-neutral-900 mt-0.5">{b.checkOut}</p>
                      <p className="text-[11px] text-neutral-500">By {config.checkOutTime} AM</p>
                    </div>
                  </div>

                  {/* Right Column: Financials & Action Buttons */}
                  <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end gap-4">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-neutral-400 block">Total Settled</span>
                      <span className="text-xl font-bold text-neutral-950 tabular-nums">
                        ${b.totalPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-neutral-500 block uppercase font-mono">
                        via {b.paymentMethod}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Invoice Button */}
                      <button
                        onClick={() => onOpenInvoice(b)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      {/* Request Services if In-House */}
                      {isCheckedIn && (
                        <button
                          onClick={() => setServiceBooking(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
                        >
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Order Service</span>
                        </button>
                      )}

                      {/* Review if Completed */}
                      {isCompleted && (
                        <button
                          onClick={() => setReviewBooking(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span>Write Review</span>
                        </button>
                      )}

                      {/* Cancel if Confirmed */}
                      {isConfirmed && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Cancel Stay</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Extra services breakdown strip if any */}
                {b.extraServices && b.extraServices.length > 0 && (
                  <div className="bg-neutral-50 px-6 py-2 border-t border-neutral-100 text-[11px] text-neutral-600 flex items-center gap-3">
                    <span className="font-semibold text-neutral-700">Add-ons:</span>
                    {b.extraServices.map((ex) => (
                      <span key={ex.id} className="text-neutral-500">
                        {ex.name} (${ex.amount})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Stay Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Review Your Stay</h3>
                <p className="text-xs text-neutral-500">{reviewBooking.roomCategory}</p>
              </div>
              <button
                onClick={() => setReviewBooking(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-neutral-800 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Share Your Experience
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell future guests about your stay, room comfort, hospitality, and views..."
                  required
                  rows={4}
                  className="w-full text-xs p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Stay Service Request Modal */}
      {serviceBooking && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Request In-Room Service</h3>
                <p className="text-xs text-neutral-500">
                  Room {serviceBooking.roomNumber} · {serviceBooking.guestName}
                </p>
              </div>
              <button
                onClick={() => setServiceBooking(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {serviceSuccess ? (
              <div className="p-6 text-center text-emerald-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Request Dispatched</h4>
                <p className="text-xs text-neutral-600">
                  Our front desk and service team have received your request.
                </p>
              </div>
            ) : (
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Service Department
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'room_service', label: 'In-Room Dining', icon: UtensilsCrossed },
                      { id: 'extra_towels', label: 'Towels & Linens', icon: Sparkles },
                      { id: 'maintenance', label: 'Maintenance / AC', icon: Wrench },
                      { id: 'luggage', label: 'Luggage Bellboy', icon: Clock },
                    ].map((svc) => {
                      const Icon = svc.icon;
                      return (
                        <button
                          type="button"
                          key={svc.id}
                          onClick={() => setServiceType(svc.id as any)}
                          className={`p-2.5 rounded-lg border text-left flex items-center gap-2 text-xs transition ${
                            serviceType === svc.id
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="font-medium">{svc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Request Title
                  </label>
                  <input
                    type="text"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="e.g. Additional pool towels, morning espresso refill"
                    required
                    className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Specific Instructions / Preferred Time
                  </label>
                  <textarea
                    value={serviceDetails}
                    onChange={(e) => setServiceDetails(e.target.value)}
                    placeholder="Please specify any timing preferences or room instructions..."
                    rows={3}
                    className="w-full text-xs p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setServiceBooking(null)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition"
                  >
                    Dispatch Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-neutral-900 text-sm">Cancel Reservation</h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to cancel booking <span className="font-bold font-mono text-neutral-900">{cancelTarget.bookingCode}</span>?
            </p>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <span className="font-bold block">100% Full Refund Guaranteed</span>
              <p>
                Eligible under the {config.cancellationFreeDays}-day policy. ${cancelTarget.totalPrice.toFixed(2)} will be credited back to your original payment method.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="Change of travel itinerary">Change of travel itinerary</option>
                <option value="Flight delay or cancellation">Flight delay or cancellation</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Booked another property">Booked another property</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition"
              >
                Confirm Cancellation & Refund
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
