import {prisma} from '../../lib/prisma'

const createReview = async (studentId: string, data: { tutorProfileId: string; rating: number; comment: string }) => {
  
  const hasBooking = await prisma.booking.findFirst({
    where: {
        studentId: studentId,
        tutorId: data.tutorProfileId,
        status: "completed"
    }
  });

  if (!hasBooking) {
    throw new Error("You can only review tutors after a completed session.");
  }

  
  return await prisma.review.create({
    data: {
      studentId,
      tutorId: data.tutorProfileId,
      rating: data.rating,
      comment: data.comment
    }
  });
};

const getReviewsForTutor = async (tutorProfileId: string) => {
  return await prisma.review.findMany({
    where: { tutorId: tutorProfileId },
    include: {
        student: { select: { name: true, image: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const ReviewService = {
  createReview,
  getReviewsForTutor
};


const upsertTutorProfile = async (userId: string, data: any) => {
  const categories = data.categories || [];
  
  return await prisma.tutorProfile.upsert({
    where: { userId },
    update: {
      bio: data.bio,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      categories: {
        set: [],  // clear existing connections first
        connectOrCreate: categories.map((categoryName: string) => ({
          where: { name: categoryName },
          create: { name: categoryName },
        })),
      },
    },
    create: {
      userId,
      bio: data.bio,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      categories: {
        connectOrCreate: categories.map((categoryName: string) => ({
          where: { name: categoryName },
          create: { name: categoryName },
        })),
      },
    },
  });
};



const getAllTutors = async (query: any) => {
 
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  
  const { searchTerm, minPrice, maxPrice, category } = query;
  
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { bio: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { categories: { some: { name: { contains: searchTerm, mode: 'insensitive' } } } }
      ]
    });
  }

  
  if (category) {
    andConditions.push({ categories: { some: { name: { equals: category, mode: 'insensitive' } } } });
  }

 
  if (minPrice) {
    andConditions.push({ hourlyRate: { gte: Number(minPrice) } });
  }
  if (maxPrice) {
    andConditions.push({ hourlyRate: { lte: Number(maxPrice) } });
  }

  const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};

 
  const result = await prisma.tutorProfile.findMany({
    where: whereCondition,
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
      categories: true,
      reviews: { select: { rating: true } } 
    },
    skip,
    take: limit,
  });

  const total = await prisma.tutorProfile.count({ where: whereCondition });

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result
  };
};


const getTutorBookedSlots = async (tutorId: string, date: string) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      tutorId,
      status: { in: ["pending", "confirmed"] },
      startTime: { gte: dayStart, lte: dayEnd },
    },
    select: { startTime: true },
  });

  return bookings.map((b) => b.startTime.getHours());
};



const getTutorDashboardStats = async (userId: string) => {
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, image: true, email: true } }, // THIS WAS MISSING
      categories: true,
      bookings: {
        include: {
          student: { select: { name: true, image: true, email: true } },
        },
        orderBy: { startTime: "desc" },
      },
      reviews: {
        include: {
          student: { select: { name: true } },
        },
      },
    },
  });

  if (!profile) return null;

  const total = profile.bookings.length;
  const confirmed = profile.bookings.filter(b => b.status === "confirmed").length;
  const completed = profile.bookings.filter(b => b.status === "completed").length;
  const pending = profile.bookings.filter(b => b.status === "pending").length;
  const avgRating = profile.reviews.length > 0
    ? (profile.reviews.reduce((a, r) => a + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  return { profile, total, confirmed, completed, pending, avgRating };
};


export const TutorService = {
  upsertTutorProfile,
  getAllTutors,
  getTutorBookedSlots,
  getTutorDashboardStats,
};


