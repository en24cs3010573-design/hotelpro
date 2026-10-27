import React from 'react';
import { Booking } from '../types/hotel';
import { useHotel } from '../context/HotelContext';
import { CheckCircle2, Download, Printer, X, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, onClose }) => {
  const { config } = useHotel();

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${booking.bookingCode.replace('HP-', '')}-${booking.checkIn.replace(/-/g, '')}`;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Modal Top Actions */}
        <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide uppercase text-neutral-300">
              Official Hospitality Tax Invoice
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 sm:p-10 space-y-8" id="invoice-printable">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
                {config.hotelName}
              </h1>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">{config.address}</p>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                Tel: {config.phone} · {config.email}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                {booking.paymentStatus === 'refunded' ? 'REFUNDED' : 'PAID IN FULL'}
              </span>
              <p className="text-xs font-mono font-semibold text-neutral-900 mt-2">
                {invoiceNumber}
              </p>
              <p className="text-xs text-neutral-500">
                Date: {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Billed To & Reservation Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Guest Information
              </span>
              <p className="font-semibold text-neutral-900 text-sm">{booking.guestName}</p>
              <p className="text-neutral-600 mt-0.5">{booking.guestEmail}</p>
              <p className="text-neutral-600">{booking.guestPhone}</p>
              {booking.keyCardAssigned && (
                <p className="text-neutral-500 font-mono mt-1">
                  Keycard: <span className="font-semibold text-neutral-800">{booking.keyCardAssigned}</span>
                </p>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Stay Particulars
              </span>
              <p className="font-semibold text-neutral-900">
                Room {booking.roomNumber} · {booking.roomCategory}
              </p>
              <div className="text-neutral-600 mt-1 space-y-0.5">
                <p>Check-In: <span className="font-medium text-neutral-900">{booking.checkIn}</span></p>
                <p>Check-Out: <span className="font-medium text-neutral-900">{booking.checkOut}</span></p>
                <p>Duration: <span className="font-medium text-neutral-900">{booking.nights} Night(s)</span> ({booking.adults} Adults{booking.children ? `, ${booking.children} Children` : ''})</p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3 text-center">Nights / Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    Room Charges ({booking.roomCategory})
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-neutral-600">
                    {booking.nights}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                    ${(booking.roomCharges / booking.nights).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-neutral-900">
                    ${booking.roomCharges.toFixed(2)}
                  </td>
                </tr>

                {booking.extraServices.map((extra) => (
                  <tr key={extra.id}>
                    <td className="px-4 py-3 font-medium text-neutral-800">
                      {extra.name}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-neutral-600">1</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                      ${extra.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-neutral-900">
                      ${extra.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td className="px-4 py-3 text-neutral-600">
                    Hospitality Occupancy Tax ({config.taxRatePercent}%)
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-neutral-600">—</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600">—</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-900">
                    ${booking.taxes.toFixed(2)}
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 text-neutral-600">
                    Concierge & Resort Facility Fee
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-neutral-600">—</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600">—</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-900">
                    ${booking.serviceFee.toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-neutral-50/80 border-t border-neutral-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3.5 text-right font-bold text-neutral-800 text-sm">
                    Total Amount Settled
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-neutral-950 text-base tabular-nums">
                    ${booking.totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Method & Security footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 gap-2">
            <div>
              <p>
                Payment Method: <span className="font-semibold capitalize text-neutral-800">{booking.paymentMethod}</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                Confirmation Reference: {booking.bookingCode} · Secured 256-bit TLS
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-neutral-400">
              <p>Thank you for choosing {config.hotelName}</p>
              <p>All rights reserved · HotelPro PMS</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
