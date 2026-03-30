import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";


const createBooking = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

   
    const { tutorId, startTime, endTime } = req.body;
    if (!tutorId || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const booking = await BookingService.createBooking(session.user.id, {
        tutorId, 
        startTime, 
        endTime
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create booking" });
  }
};


const getMyBookings = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const bookings = await BookingService.getStudentBookings(session.user.id);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
};


const getTutorBookings = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const bookings = await BookingService.getTutorBookings(session.user.id);
    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error fetching schedule" });
  }
};


const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id: bookingId } = req.params;
    const { status } = req.body;

    if (typeof bookingId !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID" 
            });
        }

    if (!bookingId) return res.status(400).json({ message: "Booking ID required" });

    const updated = await BookingService.updateBookingStatus(bookingId, status);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const BookingController = {
  createBooking,
  getMyBookings,
  getTutorBookings,
  updateBookingStatus
};