import { prisma } from '../../lib/prisma';

const createBooking = async (studentId: string, data: { tutorId: string; startTime: string; endTime: string }) => {
  const tutor = await prisma.tutorProfile.findUnique({ where: { id: data.tutorId } });
  if (!tutor) throw new Error("Tutor not found");

  // Check for conflicting bookings on this tutor at this time
  const conflict = await prisma.booking.findFirst({
    where: {
      tutorId: data.tutorId,
      status: { in: ["pending", "confirmed"] },
      AND: [
        { startTime: { lt: new Date(data.endTime) } },
        { endTime: { gt: new Date(data.startTime) } },
      ],
    },
  });

  if (conflict) throw new Error("This time slot is already booked");

  return await prisma.booking.create({
    data: {
      studentId,
      tutorId: data.tutorId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      status: "pending",
    },
  });
};


const getStudentBookings = async (studentId: string) => {
  return await prisma.booking.findMany({
    where: { studentId },
    include: {
      tutor: {
        include: { user: { select: { name: true, image: true, email: true } } }
      }
    },
    orderBy: { startTime: 'desc' }
  });
};


const getTutorBookings = async (userId: string) => {
  
  const profile = await prisma.tutorProfile.findUnique({ 
    where: { userId } 
  });

  if (!profile) throw new Error("Tutor profile not found");

 
  return await prisma.booking.findMany({
    where: { tutorId: profile.id },
    include: {
      student: { select: { name: true, image: true, email: true } }
    },
    orderBy: { startTime: 'desc' }
  });
};


const updateBookingStatus = async (bookingId: string, status: "confirmed" | "cancelled" | "completed") => {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  });
};

export const BookingService = {
  createBooking,
  getStudentBookings,
  getTutorBookings,
  updateBookingStatus
};