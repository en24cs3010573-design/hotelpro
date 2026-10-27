import React, { useState } from 'react';
import { Room } from '../types/hotel';
import { useHotel } from '../context/HotelContext';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

interface BookingModalProps {
  room: Room | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onClose: () => void;
  onBookingSuccess: (bookingCode: string) => void;
}

const AVAILABLE_ADDONS = [
  { id: 'add-1', name: 'Private Mercedes S-Class Airport Transfer', price: 150 },
  { id: 'add-2', name: 'Vintage Moët & Chandon In-Room Upon Arrival', price: 120 },
  { id: 'add-3', name: 'Couples Sunset Hydrotherapy Spa Pass', price: 160 },
  { id: 'add-4', name: 'Daily Gourmet Oceanfront Breakfast Buffet', price: 45 },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  initialCheckIn,
  initialCheckOut,
  onClose,
  onBookingSuccess,
}) => {
  const { config, createBooking, currentUser } = useHotel();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(initialCheckIn || todayStr);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrowStr);
  const [adults, setAdults] = useState(Math.min(2, room?.capacity.adults || 2));
  const [children, setChildren] = useState(0);

  const [guestName, setGuestName] = useState(currentUser.name || '');
  const [guestEmail, setGuestEmail] = useState(currentUser.email || '');
  const [guestPhone, setGuestPhone] = useState(currentUser.phone || '+1 (555) 234-5678');
  const [specialRequests, setSpecialRequests] = useState('');

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'pay_at_hotel'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('883');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!room) return null;

  // Nights calculation
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const effectiveBase = room.basePrice * config.seasonalMultiplier;
  const roomCharges = Math.round(effectiveBase * nights);
  const taxes = Math.round(roomCharges * (config.taxRatePercent / 100) * 100) / 100;
  const serviceFee = 35;

  const addonsList = AVAILABLE_ADDONS.filter((a) => selectedAddons.includes(a.id));
  const addonsTotal = addonsList.reduce((acc, a) => acc + a.price, 0);
  const grandTotal = Math.round((roomCharges + taxes + serviceFee + addonsTotal) * 100) / 100;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMessage('Please fill in guest contact details.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Simulate authentic payment processing latency
    setTimeout(async () => {
      const res = await createBooking({
        roomId: room.id,
        checkIn,
        checkOut,
        adults,
        children,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        paymentMethod,
        extraAddons: addonsList,
      });

      setIsProcessing(false);
      if (res.success && res.booking) {
        onBookingSuccess(res.booking.bookingCode);
      } else {
        setErrorMessage(res.error || 'Failed to complete booking.');
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Reserve Your Stay</h2>
              <p className="text-[11px] text-neutral-400">
                {room.category} · Room {room.roomNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmReservation} className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 Columns: Form Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Dates & Guests */}
              <div>
                <label className="text-xs font-bold text-neutral-900 block mb-2">
                  Stay Dates & Guests
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      min={todayStr}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">Adults</label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          {num} Adult{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">Children</label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full text-xs font-medium px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    >
                      {[0, 1, 2, 3].map((num) => (
                        <option key={num} value={num}>
                          {num} Children
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold text-neutral-900 block mb-2">
                  Primary Guest Contact
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="guest@example.com"
                        required
                        className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        required
                        className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">
                      Special Requests (Optional)
                    </label>
                    <input
                      type="text"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Quiet floor, early arrival notification, allergen-free bedding"
                      className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Bespoke Add-ons */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold text-neutral-900 block mb-2">
                  Enhance Your Stay (Optional)
                </label>
                <div className="space-y-2">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                              isSelected
                                ? 'bg-white text-neutral-900 border-white'
                                : 'border-neutral-300'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-medium text-xs">{addon.name}</span>
                        </div>
                        <span className="tabular-nums font-semibold shrink-0 text-xs">
                          +${addon.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold text-neutral-900 block mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { id: 'card', label: 'Credit Card' },
                    { id: 'upi', label: 'UPI / QR' },
                    { id: 'netbanking', label: 'Net Banking' },
                    { id: 'pay_at_hotel', label: 'Pay at Desk' },
                  ].map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition ${
                        paymentMethod === pm.id
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2">
                    <div>
                      <label className="text-[10px] text-neutral-500 block mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs font-mono px-2.5 py-1.5 border border-neutral-200 rounded bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-0.5">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full text-xs font-mono px-2.5 py-1.5 border border-neutral-200 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 block mb-0.5">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          className="w-full text-xs font-mono px-2.5 py-1.5 border border-neutral-200 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right 5 Columns: Summary & Price Receipt */}
            <div className="lg:col-span-5 bg-neutral-50 p-6 rounded-xl border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-neutral-200">
                  <img
                    src={room.imageUrl}
                    alt={room.category}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-neutral-900 text-sm">{room.category}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Room {room.roomNumber} · Floor {room.floor} · {room.beds}
                </p>

                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>
                      ${room.basePrice} × {nights} Night{nights > 1 ? 's' : ''}
                    </span>
                    <span className="tabular-nums font-medium text-neutral-900">${roomCharges}</span>
                  </div>

                  {addonsList.map((addon) => (
                    <div key={addon.id} className="flex justify-between text-neutral-600">
                      <span className="truncate pr-2">{addon.name}</span>
                      <span className="tabular-nums font-medium text-neutral-900">${addon.price}</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-neutral-600">
                    <span>Occupancy Tax ({config.taxRatePercent}%)</span>
                    <span className="tabular-nums font-medium text-neutral-900">${taxes}</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Resort Service Fee</span>
                    <span className="tabular-nums font-medium text-neutral-900">${serviceFee}</span>
                  </div>

                  <div className="pt-3 border-t border-neutral-300 flex justify-between items-baseline">
                    <span className="font-bold text-neutral-900 text-sm">Total Due</span>
                    <span className="font-extrabold text-neutral-950 text-xl tabular-nums">
                      ${grandTotal}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <span className="font-semibold block">Risk-Free Cancellation</span>
                    <span>Cancel up to {config.cancellationFreeDays} days prior to check-in for a 100% refund.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200 space-y-2">
                {errorMessage && (
                  <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing ? 'Verifying & Securing Booking...' : `Confirm & Pay $${grandTotal}`}
                  </span>
                </button>
                <p className="text-[10px] text-neutral-400 text-center">
                  Encrypted via HotelPro Hospitality Gateway · Instant Confirmation
                </p>
              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};
