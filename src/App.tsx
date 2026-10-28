/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Navbar } from './components/Navbar';
import { GuestBrowseView } from './components/views/GuestBrowseView';
import { GuestReservationsView } from './components/views/GuestReservationsView';
import { FrontDeskView } from './components/views/FrontDeskView';
import { OperationsHousekeepingView } from './components/views/OperationsHousekeepingView';
import { AdminAnalyticsView } from './components/views/AdminAnalyticsView';
import { BookingModal } from './components/BookingModal';
import { RoomDetailsModal } from './components/RoomDetailsModal';
import { InvoiceModal } from './components/InvoiceModal';
import { Room } from './types/hotel';
import { CheckCircle2 } from 'lucide-react';

function HotelAppContent() {
  const { config, rooms, selectedBookingForInvoice, setSelectedBookingForInvoice, currentUser } = useHotel();

  const [activeTab, setActiveTab] = useState('explore');
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(null);
  const [selectedRoomBooking, setSelectedRoomBooking] = useState<Room | null>(null);
  const [bookingToast, setBookingToast] = useState<{ show: boolean; code: string }>({
    show: false,
    code: '',
  });

  const handleBookingSuccess = (code: string) => {
    setSelectedRoomBooking(null);
    setBookingToast({ show: true, code });
    setActiveTab('reservations');
    setTimeout(() => {
      setBookingToast({ show: false, code: '' });
    }, 6000);
  };

  const handleOpenWalkIn = () => {
    const available = rooms.find((r) => r.status === 'available' || r.status === 'inspected');
    if (available) {
      setSelectedRoomBooking(available);
    } else {
      setSelectedRoomBooking(rooms[0]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Booking Toast Alert */}
      {bookingToast.show && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3.5 rounded-xl bg-emerald-900 text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-xs">Reservation Guaranteed!</span>
                <span className="text-xs text-emerald-200 block">
                  Reference code <span className="font-mono font-bold text-white">{bookingToast.code}</span> confirmed. View your invoice in Reservations.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('reservations')}
              className="px-3 py-1 bg-white text-emerald-950 font-semibold text-xs rounded-lg hover:bg-emerald-50 transition shrink-0"
            >
              View Stay
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">
        {activeTab === 'explore' && (
          <GuestBrowseView
            onSelectRoom={(room) => setSelectedRoomDetails(room)}
            onBookRoom={(room) => setSelectedRoomBooking(room)}
          />
        )}

        {activeTab === 'reservations' && (
          <GuestReservationsView
            onOpenInvoice={(b) => setSelectedBookingForInvoice(b)}
          />
        )}

        {activeTab === 'frontdesk' && (
          <FrontDeskView
            onOpenInvoice={(b) => setSelectedBookingForInvoice(b)}
            onOpenWalkInModal={handleOpenWalkIn}
          />
        )}

        {activeTab === 'operations' && <OperationsHousekeepingView />}

        {activeTab === 'analytics' && <AdminAnalyticsView />}
      </main>

      {/* Modals & Overlays */}
      <RoomDetailsModal
        room={selectedRoomDetails}
        onClose={() => setSelectedRoomDetails(null)}
        onBookNow={(room) => {
          setSelectedRoomDetails(null);
          setSelectedRoomBooking(room);
        }}
      />

      <BookingModal
        room={selectedRoomBooking}
        onClose={() => setSelectedRoomBooking(null)}
        onBookingSuccess={handleBookingSuccess}
      />

      <InvoiceModal
        booking={selectedBookingForInvoice}
        onClose={() => setSelectedBookingForInvoice(null)}
      />

      {/* Quiet, Professional Hospitality Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-neutral-500">
            <div>
              <span className="font-bold text-neutral-900">{config.hotelName}</span>
              <p className="mt-0.5">{config.address}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>HotelPro PMS v2.4</span>
              <span aria-hidden="true">·</span>
              <span>Active Persona: <strong className="text-neutral-800 capitalize">{currentUser.name} ({currentUser.role})</strong></span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <HotelProvider>
      <HotelAppContent />
    </HotelProvider>
  );
}