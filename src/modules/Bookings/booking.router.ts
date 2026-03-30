import { Router } from "express";
import { BookingController } from "./booking.controller";

const router = Router();


router.post("/", BookingController.createBooking);


router.get("/my-bookings", BookingController.getMyBookings);

router.get("/tutor", BookingController.getTutorBookings);


router.patch("/:id", BookingController.updateBookingStatus);


export const BookingRoutes =  router;