import React, { useState } from 'react';
import { Room } from '../../types/hotel';
import { useHotel } from '../../context/HotelContext';
import {
  Bed,
  Calendar,
  Check,
  ChevronRight,
  Filter,
  Maximize2,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

interface GuestBrowseViewProps {
  onSelectRoom: (room: Room) => void;
  onBookRoom: (room: Room) => void;
}

export const GuestBrowseView: React.FC<GuestBrowseViewProps> = ({
  onSelectRoom,
  onBookRoom,
}) => {
  const { rooms, config, reviews } = useHotel();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guestCount, setGuestCount] = useState(2);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1000);

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (categoryFilter !== 'all' && r.roomType !== categoryFilter) return false;
    if (r.capacity.adults < guestCount && r.capacity.adults + r.capacity.children < guestCount) {
      return false;
    }
    if (r.basePrice > maxPrice) return false;
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section with Architectural Photograph */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200">
        <div className="relative h-[440px] sm:h-[500px] w-full">
          <img
            src="/images/hotel_hero_exterior_1793036063281.jpg"
            alt={config.hotelName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-neutral-950/10" />

          {/* Hero Content */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 max-w-4xl">
            <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase block mb-1">
              {config.tagline}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {config.hotelName}
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 mt-2 max-w-2xl leading-relaxed">
              Experience unparalleled coastal elegance. Handcrafted luxury suites, private oceanfront terraces, and bespoke concierge hospitality in California's premier marina enclave.
            </p>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="bg-white border-t border-neutral-200 p-4 sm:p-6 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold text-neutral-600 block mb-1">Check-In</label>
              <input
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-600 block mb-1">Check-Out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-600 block mb-1">Guests</label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full text-xs font-medium px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Guest{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                Max Nightly Budget
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-neutral-900 tabular-nums shrink-0">
                  ${maxPrice}
                </span>
              </div>
            </div>
            <div>
              <button
                onClick={() => {
                  const target = document.getElementById('room-results');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Suites</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Suites Grid */}
      <section id="room-results" className="space-y-6">
        
        {/* Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">
              Curated Suites & Accommodations
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Showing {filteredRooms.length} luxury rooms matching your preferences
            </p>
          </div>

          {/* Interactive filter buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Collections' },
              { id: 'suite', label: 'Presidential Suites' },
              { id: 'deluxe', label: 'Ocean Terraces' },
              { id: 'executive', label: 'Executive Studios' },
              { id: 'standard', label: 'Superior Rooms' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isAvailable = room.status === 'available' || room.status === 'inspected';
            return (
              <div
                key={room.id}
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                    <img
                      src={room.imageUrl}
                      alt={room.category}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                    />

                    {/* Clean unboxed status badge overlay */}
                    <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-white">
                      Room {room.roomNumber} · Floor {room.floor}
                    </div>

                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Available
                        </span>
                      ) : (
                        <span className="bg-neutral-900/80 backdrop-blur-md text-neutral-300 px-2 py-0.5 rounded text-[11px] font-semibold capitalize">
                          {room.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-neutral-900 text-base leading-snug group-hover:text-amber-800 transition">
                          {room.category}
                        </h3>
                        {/* Zero-Pill metadata separated by dots */}
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                          <span>{room.beds}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{room.sizeSqFt} sq ft</span>
                          <span aria-hidden="true">·</span>
                          <span>Max {room.capacity.adults} Adults</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-neutral-900 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="tabular-nums">{room.rating.toFixed(2)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Amenities Checklist Preview */}
                    <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5">
                      {room.amenities.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="text-[11px] text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-150"
                        >
                          {a}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-[11px] text-neutral-400 px-1 py-0.5">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer with Price and CTAs */}
                <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-150 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                      Starting From
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-neutral-950 tabular-nums">
                        ${room.basePrice}
                      </span>
                      <span className="text-xs text-neutral-500">/ night</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectRoom(room)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onBookRoom(room)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition"
                    >
                      Reserve
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Guest Reviews & Social Proof */}
      <section className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Guest Experiences
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Verified Patron Testimonials
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-base font-bold tabular-nums">4.92 / 5.0</span>
            <span className="text-neutral-400 font-normal">from 240+ verified stays</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-neutral-900 text-xs">{rev.guestName}</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] text-neutral-400 flex justify-between">
                <span>{rev.roomName}</span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
