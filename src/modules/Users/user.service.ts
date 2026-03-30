import {prisma} from '../../lib/prisma'

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const getMe = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    include: { tutorProfile: true },
  });
};

const updateUserStatus = async (id: string, action: 'ban' | 'activate') => {
 
  return await prisma.user.findUnique({ where: { id } });
};

export const UserService = {
  getAllUsers,
  getMe,
  updateUserStatus
};