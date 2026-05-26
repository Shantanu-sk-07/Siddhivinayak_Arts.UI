// src/store/bookingStore.ts
import { create } from 'zustand';
import { Booking } from '@/types';

interface BookingState {
  currentBooking: Booking | null;
  bookings: Booking[];
  setCurrentBooking: (booking: Booking | null) => void;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentBooking: null,
  bookings: [],
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
}));