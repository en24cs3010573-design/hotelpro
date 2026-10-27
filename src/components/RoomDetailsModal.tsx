import React, { useState } from 'react';
import { Room } from '../types/hotel';
import { useHotel } from '../context/HotelContext';
import {
  Bed,
  Check,
  ChevronRight,
  Clock,
  Maximize2,
  Shield,
  Star,
  Users,
  Wifi,
  X,
} from 'lucide-react';

interface RoomDetailsModalProps {
  room: Room | null;
  onClose: () => void;
  onBookNow: (room: Room) => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  onClose,
  onBookNow,
}) => {
  const { reviews, config } = useHotel();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!room) return null;

  const roomReviews = reviews.filter((r) => r.roomId === room.id);
  const images = room.gallery && room.gallery.length > 0 ? room.gallery : [room.imageUrl];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                Suite Portfolio
              </span>
              <h2 className="text-base font-bold tracking-tight text-white">
                {room.category}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Gallery View */}
          <div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-100 relative shadow-sm">
              <img
                src={images[activeImageIndex] || room.imageUrl}
                alt={room.category}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-2">
                <span>Room {room.roomNumber}</span>
                <span className="text-neutral-400">·</span>
                <span>Floor {room.floor}</span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      activeImageIndex === idx
                        ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Specs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-neutral-100 text-xs">
            <div>
              <span className="text-neutral-400 block text-[11px]">Bedding Setup</span>
              <span className="font-semibold text-neutral-900 mt-0.5 block">{room.beds}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Guest Capacity</span>
              <span className="font-semibold text-neutral-900 mt-0.5 block">
                Up to {room.capacity.adults} Adults, {room.capacity.children} Children
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Suite Dimensions</span>
              <span className="font-semibold text-neutral-900 mt-0.5 block font-mono">
                {room.sizeSqFt} sq ft
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Guest Rating</span>
              <div className="flex items-center gap-1 font-semibold text-neutral-900 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="tabular-nums">{room.rating.toFixed(2)}</span>
                <span className="text-neutral-400 font-normal">({room.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
              The Experience
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed">{room.description}</p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Included In-Room Amenities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {room.amenities.map((amenity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-50 text-xs text-neutral-800"
                >
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hotel Policies */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
            <h4 className="font-bold text-neutral-900 text-xs mb-1">Hotel Stay Guidelines</h4>
            <p>· Check-in begins at {config.checkInTime} PM; Check-out is by {config.checkOutTime} AM.</p>
            <p>· 100% smoke-free property; complimentary high-speed Wi-Fi 6 in all rooms & residences.</p>
            <p>· Free cancellation up to {config.cancellationFreeDays} days before scheduled arrival date.</p>
          </div>

          {/* Reviews List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Guest Reviews ({roomReviews.length})
              </h3>
            </div>
            {roomReviews.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3">
                No individual reviews yet for this room suite.
              </p>
            ) : (
              <div className="space-y-3">
                {roomReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl border border-neutral-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{rev.guestName}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-700">{rev.comment}</p>
                    {rev.reply && (
                      <div className="bg-neutral-50 p-2.5 rounded-lg border-l-2 border-neutral-400 text-[11px] text-neutral-600 mt-2">
                        <span className="font-bold text-neutral-800 block">{rev.reply.replierName}</span>
                        <span>{rev.reply.text}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 block">Nightly Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-950 tabular-nums">
                ${room.basePrice}
              </span>
              <span className="text-xs text-neutral-500">/ night</span>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onBookNow(room);
            }}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition"
          >
            Proceed to Reservation
          </button>
        </div>

      </div>
    </div>
  );
};
