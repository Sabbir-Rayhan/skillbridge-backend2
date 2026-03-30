import { UserStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";


const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true, 
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status }
  });
};


const createCategory = async (name: string) => {
  return await prisma.category.create({
    data: { name }
  });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
};


const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      student: { select: { name: true, email: true } },
      tutor: { include: { user: { select: { name: true, email: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getStats = async () => {
  const [totalUsers, totalTutors, totalBookings, totalCategories] = await Promise.all([
    prisma.user.count(),
    prisma.tutorProfile.count(),
    prisma.booking.count(),
    prisma.category.count(),
  ]);

  return { totalUsers, totalTutors, totalBookings, totalCategories };
};

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  createCategory,
  getAllCategories,
  getAllBookings,
  getStats
};