export type UserRole = 'guest' | 'staff' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  department?: string;
  active: boolean;
  registeredAt: string;
}

export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  bedType: string;
  maxAdults: number;
  maxChildren: number;
  sizeSqFt: number;
  image: string;
}

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'cleaning' | 'maintenance' | 'inspected';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  category: string; // 'Presidential Suite' | 'Deluxe Ocean View' | 'Executive Double' | 'Superior King'
  roomType: 'suite' | 'deluxe' | 'executive' | 'standard';
  basePrice: number;
  weekendRate: number;
  capacity: {
    adults: number;
    children: number;
  };
  beds: string;
  sizeSqFt: number;
  amenities: string[];
  status: RoomStatus;
  currentGuest?: {
    name: string;
    bookingId: string;
    checkOutDate: string;
  };
  imageUrl: string;
  gallery: string[];
  description: string;
  rating: number;
  reviewCount: number;
}

export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'pay_at_hotel';

export interface ExtraServiceItem {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. HP-89421
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomCategory: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  children: number;
  roomCharges: number;
  taxes: number; // 12%
  serviceFee: number;
  extraServices: ExtraServiceItem[];
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  bookingStatus: BookingStatus;
  keyCardAssigned?: string;
  specialRequests?: string;
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  refundAmount?: number;
  refundReason?: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  category: string;
  assignedStaffId: string;
  assignedStaffName: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed' | 'inspected';
  notes: string;
  checklist: {
    id: string;
    label: string;
    done: boolean;
  }[];
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  bookingId: string;
  roomNumber: string;
  guestName: string;
  type: 'room_service' | 'maintenance' | 'extra_towels' | 'laundry' | 'luggage';
  title: string;
  details: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  roomId: string;
  roomName: string;
  bookingId: string;
  guestName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  stayDate: string;
  reply?: {
    text: string;
    repliedAt: string;
    replierName: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'checkin' | 'service' | 'payment' | 'system';
  targetRole?: UserRole | 'all';
}

export interface AdminLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ip: string;
}

export interface HotelConfig {
  hotelName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  taxRatePercent: number;
  seasonalMultiplier: number;
  allowInstantBooking: boolean;
  cancellationFreeDays: number;
}
