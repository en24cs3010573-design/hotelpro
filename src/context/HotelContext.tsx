import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AdminLog,
  Booking,
  ExtraServiceItem,
  HotelConfig,
  HousekeepingTask,
  NotificationItem,
  Review,
  Room,
  RoomStatus,
  ServiceRequest,
  User,
  UserRole,
} from '../types/hotel';
import {
  INITIAL_BOOKINGS,
  INITIAL_CONFIG,
  INITIAL_HOUSEKEEPING,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWS,
  INITIAL_ROOMS,
  INITIAL_SERVICES,
  INITIAL_USERS,
} from '../data/seedData';

interface BookingFormData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'pay_at_hotel';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  extraAddons?: { name: string; price: number }[];
}

interface HotelContextType {
  // Current user & Auth
  currentUser: User;
  users: User[];
  setCurrentUserRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  updateUserStatus: (userId: string, active: boolean) => void;
  updateUserRole: (userId: string, role: UserRole) => void;

  // Hotel Config
  config: HotelConfig;
  updateConfig: (newConfig: Partial<HotelConfig>) => void;

  // Rooms
  rooms: Room[];
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateRoomPricing: (roomId: string, basePrice: number, weekendRate: number) => void;
  addNewRoom: (roomData: Omit<Room, 'id' | 'rating' | 'reviewCount'>) => void;

  // Bookings
  bookings: Booking[];
  createBooking: (data: BookingFormData) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  checkInGuest: (bookingId: string, keyCard: string) => void;
  checkOutGuest: (bookingId: string, extras?: ExtraServiceItem[]) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  selectedBookingForInvoice: Booking | null;
  setSelectedBookingForInvoice: (booking: Booking | null) => void;

  // Housekeeping & Tasks
  housekeepingTasks: HousekeepingTask[];
  updateTaskStatus: (taskId: string, status: HousekeepingTask['status']) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  assignHousekeeping: (roomId: string, staffName: string, priority: HousekeepingTask['priority'], notes: string) => void;

  // Service Requests
  serviceRequests: ServiceRequest[];
  createServiceRequest: (type: ServiceRequest['type'], title: string, details: string, roomNumber: string, guestName: string) => void;
  updateServiceStatus: (serviceId: string, status: ServiceRequest['status']) => void;

  // Reviews
  reviews: Review[];
  addReview: (roomId: string, bookingId: string, guestName: string, rating: number, comment: string) => void;
  replyToReview: (reviewId: string, replyText: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // System & Audit Logs
  logs: AdminLog[];
  addLog: (action: string, details: string) => void;

  // Analytics Metrics
  metrics: {
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number; // percentage e.g. 75%
    availableRooms: number;
    dirtyRooms: number;
    maintenanceRooms: number;
    totalRevenue: number;
    adr: number; // Average Daily Rate
    revpar: number; // Revenue Per Available Room
    pendingArrivals: number;
    pendingDepartures: number;
  };

  // State Management
  resetToInitialDemo: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'hotelpro_v1_';

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage read error', e);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedRole = getStorage<UserRole>('active_role', 'guest');
    const matched = users.find((u) => u.role === savedRole);
    return matched || users[0];
  });

  const [config, setConfig] = useState<HotelConfig>(() => getStorage('config', INITIAL_CONFIG));
  const [rooms, setRooms] = useState<Room[]>(() => getStorage('rooms', INITIAL_ROOMS));
  const [bookings, setBookings] = useState<Booking[]>(() => getStorage('bookings', INITIAL_BOOKINGS));
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(() =>
    getStorage('housekeeping', INITIAL_HOUSEKEEPING)
  );
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() =>
    getStorage('services', INITIAL_SERVICES)
  );
  const [reviews, setReviews] = useState<Review[]>(() => getStorage('reviews', INITIAL_REVIEWS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [logs, setLogs] = useState<AdminLog[]>(() => getStorage('logs', INITIAL_LOGS));

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

  // Sync to local storage on changes
  useEffect(() => setStorage('users', users), [users]);
  useEffect(() => setStorage('config', config), [config]);
  useEffect(() => setStorage('rooms', rooms), [rooms]);
  useEffect(() => setStorage('bookings', bookings), [bookings]);
  useEffect(() => setStorage('housekeeping', housekeepingTasks), [housekeepingTasks]);
  useEffect(() => setStorage('services', serviceRequests), [serviceRequests]);
  useEffect(() => setStorage('reviews', reviews), [reviews]);
  useEffect(() => setStorage('notifications', notifications), [notifications]);
  useEffect(() => setStorage('logs', logs), [logs]);

  const addLog = (action: string, details: string) => {
    const newLog: AdminLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser.name,
      role: currentUser.role.toUpperCase(),
      action,
      details,
      ip: '192.168.1.' + Math.floor(Math.random() * 80 + 10),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const notify = (
    title: string,
    message: string,
    type: NotificationItem['type'] = 'system',
    targetRole: UserRole | 'all' = 'all'
  ) => {
    const item: NotificationItem = {
      id: 'notif-' + Date.now(),
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
      targetRole,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const setCurrentUserRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      setStorage('active_role', role);
      addLog('ROLE_SWITCH', `Switched active session to persona ${matched.name} (${role})`);
    }
  };

  const switchUser = (userId: string) => {
    const matched = users.find((u) => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
      setStorage('active_role', matched.role);
    }
  };

  const updateUserStatus = (userId: string, active: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active } : u)));
    addLog('USER_STATUS_CHANGE', `Toggled user ${userId} active status to ${active}`);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    addLog('USER_ROLE_CHANGE', `Updated role of user ${userId} to ${role}`);
  };

  const updateConfig = (newConfig: Partial<HotelConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      addLog('HOTEL_CONFIG_UPDATE', 'Updated hotel settings & platform parameters');
      return updated;
    });
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status,
            currentGuest: status === 'available' ? undefined : r.currentGuest,
          };
        }
        return r;
      })
    );
    addLog('ROOM_STATUS_CHANGE', `Room ${roomId} status changed to ${status}`);
    notify('Room Status Updated', `Room ${roomId} marked as ${status}`, 'system', 'staff');
  };

  const updateRoomPricing = (roomId: string, basePrice: number, weekendRate: number) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, basePrice, weekendRate } : r))
    );
    addLog('ROOM_PRICING_UPDATED', `Room ${roomId} base rate set to $${basePrice}, weekend $${weekendRate}`);
  };

  const addNewRoom = (roomData: Omit<Room, 'id' | 'rating' | 'reviewCount'>) => {
    const newId = 'room-' + roomData.roomNumber;
    const newRoom: Room = {
      ...roomData,
      id: newId,
      rating: 5.0,
      reviewCount: 0,
    };
    setRooms((prev) => [...prev, newRoom]);
    addLog('ROOM_CREATED', `Added new room ${newRoom.roomNumber} (${newRoom.category})`);
    notify('New Room Added', `Room ${newRoom.roomNumber} added to inventory`, 'system', 'admin');
  };

  const createBooking = async (data: BookingFormData) => {
    const room = rooms.find((r) => r.id === data.roomId);
    if (!room) return { success: false, error: 'Room not found' };

    // Calculate nights
    const start = new Date(data.checkIn);
    const end = new Date(data.checkOut);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    // Pricing calculation
    const effectiveBase = room.basePrice * config.seasonalMultiplier;
    const roomCharges = Math.round(effectiveBase * nights);
    const taxes = Math.round(roomCharges * (config.taxRatePercent / 100) * 100) / 100;
    const serviceFee = 35;

    const extraServices: ExtraServiceItem[] = (data.extraAddons || []).map((addon, idx) => ({
      id: 'ex-' + Date.now() + '-' + idx,
      name: addon.name,
      amount: addon.price,
      date: data.checkIn,
    }));

    const extrasTotal = extraServices.reduce((sum, item) => sum + item.amount, 0);
    const totalPrice = Math.round((roomCharges + taxes + serviceFee + extrasTotal) * 100) / 100;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingCode = `HP-${randomSuffix}`;

    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      bookingCode,
      guestId: currentUser.role === 'guest' ? currentUser.id : 'user-guest-' + Date.now(),
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomCategory: room.category,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights,
      adults: data.adults,
      children: data.children,
      roomCharges,
      taxes,
      serviceFee,
      extraServices,
      totalPrice,
      paymentStatus: 'paid',
      paymentMethod: data.paymentMethod,
      bookingStatus: 'confirmed',
      specialRequests: data.specialRequests,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Update room status
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? {
              ...r,
              status: 'occupied',
              currentGuest: {
                name: data.guestName,
                bookingId: bookingCode,
                checkOutDate: data.checkOut,
              },
            }
          : r
      )
    );

    addLog(
      'BOOKING_CREATED',
      `Booking ${bookingCode} created for ${data.guestName} in Room ${room.roomNumber} ($${totalPrice})`
    );

    notify(
      'Booking Confirmed',
      `Your reservation at ${config.hotelName} for Room ${room.roomNumber} is confirmed (${bookingCode}).`,
      'booking',
      'guest'
    );

    notify(
      'New Guest Reservation',
      `New booking ${bookingCode} for ${data.guestName} (${room.category}) arriving ${data.checkIn}.`,
      'booking',
      'staff'
    );

    return { success: true, booking: newBooking };
  };

  const checkInGuest = (bookingId: string, keyCard: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              bookingStatus: 'checked_in',
              keyCardAssigned: keyCard,
              checkedInAt: new Date().toISOString(),
            }
          : b
      )
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.roomId
          ? {
              ...r,
              status: 'occupied',
              currentGuest: {
                name: booking.guestName,
                bookingId: booking.bookingCode,
                checkOutDate: booking.checkOut,
              },
            }
          : r
      )
    );

    addLog(
      'GUEST_CHECKED_IN',
      `Checked in ${booking.guestName} to Room ${booking.roomNumber}. Keycard ${keyCard} assigned.`
    );

    notify(
      'Guest Checked In',
      `${booking.guestName} has checked into Room ${booking.roomNumber}. Keycard ${keyCard} issued.`,
      'checkin',
      'staff'
    );
  };

  const checkOutGuest = (bookingId: string, extras: ExtraServiceItem[] = []) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const extrasTotal = extras.reduce((sum, item) => sum + item.amount, 0);
    const finalTotal = booking.totalPrice + extrasTotal;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              bookingStatus: 'checked_out',
              extraServices: [...b.extraServices, ...extras],
              totalPrice: finalTotal,
              checkedOutAt: new Date().toISOString(),
            }
          : b
      )
    );

    // Mark room as dirty and trigger housekeeping task
    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.roomId
          ? {
              ...r,
              status: 'dirty',
              currentGuest: undefined,
            }
          : r
      )
    );

    // Create housekeeping turnover task
    const newTask: HousekeepingTask = {
      id: 'hk-' + Date.now(),
      roomId: booking.roomId,
      roomNumber: booking.roomNumber,
      category: booking.roomCategory,
      assignedStaffId: 'user-staff-1',
      assignedStaffName: 'Front Desk Dispatch',
      priority: 'high',
      status: 'pending',
      notes: `Departure turnover for ${booking.guestName}. Sanitize and restock.`,
      checklist: [
        { id: 'c1', label: 'Strip bed linens and replace with fresh 600TC cotton', done: false },
        { id: 'c2', label: 'Deep sanitize bathroom fixtures, mirrors, and floor', done: false },
        { id: 'c3', label: 'Restock luxury toiletries and towel bundles', done: false },
        { id: 'c4', label: 'Audit and replenish in-room minibar & coffee station', done: false },
        { id: 'c5', label: 'Vacuum and wipe down surfaces', done: false },
      ],
      updatedAt: new Date().toISOString(),
    };
    setHousekeepingTasks((prev) => [newTask, ...prev]);

    addLog(
      'GUEST_CHECKED_OUT',
      `Processed checkout for ${booking.guestName} from Room ${booking.roomNumber}. Final bill: $${finalTotal}. Room marked dirty for turnover.`
    );

    notify(
      'Turnover Required',
      `Room ${booking.roomNumber} vacated. Housekeeping turnover task created.`,
      'checkin',
      'staff'
    );
  };

  const cancelBooking = (bookingId: string, reason?: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              bookingStatus: 'cancelled',
              paymentStatus: 'refunded',
              refundAmount: b.totalPrice,
              refundReason: reason || 'Cancelled by guest request',
            }
          : b
      )
    );

    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.roomId && r.status === 'occupied'
          ? { ...r, status: 'available', currentGuest: undefined }
          : r
      )
    );

    addLog(
      'BOOKING_CANCELLED',
      `Cancelled booking ${booking.bookingCode} for ${booking.guestName}. Full refund of $${booking.totalPrice} initiated.`
    );

    notify(
      'Reservation Cancelled',
      `Booking ${booking.bookingCode} cancelled. Refund of $${booking.totalPrice} processed.`,
      'payment',
      'all'
    );
  };

  const updateTaskStatus = (taskId: string, status: HousekeepingTask['status']) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );

    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (task) {
      if (status === 'completed' || status === 'inspected') {
        setRooms((prev) =>
          prev.map((r) => (r.id === task.roomId ? { ...r, status: status === 'inspected' ? 'inspected' : 'available' } : r))
        );
      } else if (status === 'in_progress') {
        setRooms((prev) =>
          prev.map((r) => (r.id === task.roomId ? { ...r, status: 'cleaning' } : r))
        );
      }
    }

    addLog('HOUSEKEEPING_UPDATE', `Task ${taskId} status changed to ${status}`);
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedChecklist = t.checklist.map((item) =>
            item.id === checklistId ? { ...item, done: !item.done } : item
          );
          const allDone = updatedChecklist.every((i) => i.done);
          return {
            ...t,
            checklist: updatedChecklist,
            status: allDone ? 'completed' : t.status === 'pending' ? 'in_progress' : t.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const assignHousekeeping = (
    roomId: string,
    staffName: string,
    priority: HousekeepingTask['priority'],
    notes: string
  ) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const newTask: HousekeepingTask = {
      id: 'hk-' + Date.now(),
      roomId: room.id,
      roomNumber: room.roomNumber,
      category: room.category,
      assignedStaffId: 'staff-custom',
      assignedStaffName: staffName,
      priority,
      status: 'pending',
      notes,
      checklist: [
        { id: 'c1', label: 'Change linens and make beds', done: false },
        { id: 'c2', label: 'Bathroom sanitation and mirror buffing', done: false },
        { id: 'c3', label: 'Replenish bath towels and cosmetics', done: false },
        { id: 'c4', label: 'Surface dusting and vacuum', done: false },
      ],
      updatedAt: new Date().toISOString(),
    };

    setHousekeepingTasks((prev) => [newTask, ...prev]);
    addLog('TASK_ASSIGNED', `Housekeeping assigned to ${staffName} for Room ${room.roomNumber}`);
    notify('Task Assigned', `Housekeeping assigned to ${staffName} for Room ${room.roomNumber}`, 'service', 'staff');
  };

  const createServiceRequest = (
    type: ServiceRequest['type'],
    title: string,
    details: string,
    roomNumber: string,
    guestName: string
  ) => {
    const newReq: ServiceRequest = {
      id: 'srv-' + Date.now(),
      bookingId: 'book-current',
      roomNumber,
      guestName,
      type,
      title,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setServiceRequests((prev) => [newReq, ...prev]);
    addLog('SERVICE_REQUESTED', `Room ${roomNumber} (${guestName}) requested: ${title}`);
    notify('Service Request', `Room ${roomNumber} requested: ${title}`, 'service', 'staff');
  };

  const updateServiceStatus = (serviceId: string, status: ServiceRequest['status']) => {
    setServiceRequests((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, status } : s))
    );
    addLog('SERVICE_STATUS_CHANGE', `Service request ${serviceId} marked ${status}`);
  };

  const addReview = (
    roomId: string,
    bookingId: string,
    guestName: string,
    rating: number,
    comment: string
  ) => {
    const room = rooms.find((r) => r.id === roomId);
    const newReview: Review = {
      id: 'rev-' + Date.now(),
      roomId,
      roomName: room ? room.category : 'Deluxe Room',
      bookingId,
      guestName,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      stayDate: 'Recent Stay',
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate room rating
    if (room) {
      const roomReviews = [...reviews.filter((rv) => rv.roomId === roomId), newReview];
      const avgRating =
        Math.round(
          (roomReviews.reduce((sum, rv) => sum + rv.rating, 0) / roomReviews.length) * 100
        ) / 100;

      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, rating: avgRating, reviewCount: roomReviews.length }
            : r
        )
      );
    }

    addLog('REVIEW_SUBMITTED', `New review (${rating} stars) submitted by ${guestName} for Room ${roomId}`);
    notify('New Guest Review', `${guestName} left a ${rating}-star review: "${comment.substring(0, 45)}..."`, 'system', 'all');
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((rv) =>
        rv.id === reviewId
          ? {
              ...rv,
              reply: {
                text: replyText,
                repliedAt: new Date().toISOString().split('T')[0],
                replierName: `${currentUser.name} (${currentUser.role === 'admin' ? 'Hotel Director' : 'Management'})`,
              },
            }
          : rv
      )
    );
    addLog('REVIEW_REPLIED', `Management replied to review ${reviewId}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToInitialDemo = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setConfig(INITIAL_CONFIG);
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setHousekeepingTasks(INITIAL_HOUSEKEEPING);
    setServiceRequests(INITIAL_SERVICES);
    setReviews(INITIAL_REVIEWS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setLogs(INITIAL_LOGS);
    setSelectedRoom(null);
    setSelectedBookingForInvoice(null);
  };

  // Compute live hospitality metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'inspected').length;
  const dirtyRooms = rooms.filter((r) => r.status === 'dirty' || r.status === 'cleaning').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const validBookings = bookings.filter((b) => b.bookingStatus !== 'cancelled');
  const totalRevenue = validBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Average Daily Rate (ADR) = Room Revenue / Sold Room Nights
  const totalNights = validBookings.reduce((sum, b) => sum + b.nights, 0);
  const totalRoomRevenue = validBookings.reduce((sum, b) => sum + b.roomCharges, 0);
  const adr = totalNights > 0 ? Math.round(totalRoomRevenue / totalNights) : 340;

  // RevPAR = Total Room Revenue / (Total Available Rooms * Period)
  const revpar = totalRooms > 0 ? Math.round(adr * (occupancyRate / 100)) : 255;

  const pendingArrivals = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const pendingDepartures = bookings.filter((b) => b.bookingStatus === 'checked_in').length;

  return (
    <HotelContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUserRole,
        switchUser,
        updateUserStatus,
        updateUserRole,
        config,
        updateConfig,
        rooms,
        selectedRoom,
        setSelectedRoom,
        updateRoomStatus,
        updateRoomPricing,
        addNewRoom,
        bookings,
        createBooking,
        checkInGuest,
        checkOutGuest,
        cancelBooking,
        selectedBookingForInvoice,
        setSelectedBookingForInvoice,
        housekeepingTasks,
        updateTaskStatus,
        toggleChecklistItem,
        assignHousekeeping,
        serviceRequests,
        createServiceRequest,
        updateServiceStatus,
        reviews,
        addReview,
        replyToReview,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        logs,
        addLog,
        metrics: {
          totalRooms,
          occupiedRooms,
          occupancyRate,
          availableRooms,
          dirtyRooms,
          maintenanceRooms,
          totalRevenue,
          adr,
          revpar,
          pendingArrivals,
          pendingDepartures,
        },
        resetToInitialDemo,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within a HotelProvider');
  return context;
};
