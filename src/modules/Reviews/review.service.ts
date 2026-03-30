import { prisma } from '../../lib/prisma';


const getReviewStats = async (tutorId: string) => {
    const reviews = await prisma.review.findMany({ where: { tutorId } });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    return { average, total: reviews.length };
};

const createReview = async (studentId: string, data: { tutorId: string; rating: number; comment: string }) => {
  
  const hasBooking = await prisma.booking.findFirst({
    where: {
        studentId: studentId,
        tutorId: data.tutorId,
       
    }
  });

  if (!hasBooking) {
    
  }

  
  return await prisma.review.create({
    data: {
      studentId,
      tutorId: data.tutorId, 
      rating: data.rating,
      comment: data.comment
    }
  });
};

const getReviewsForTutor = async (tutorId: string) => {
  const reviews = await prisma.review.findMany({
    where: { tutorId },
    include: {
        student: { select: { name: true, image: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "New";

  return { reviews, average, total: reviews.length };
};

export const ReviewService = {
  createReview,
  getReviewsForTutor
};