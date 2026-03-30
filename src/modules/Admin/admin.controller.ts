import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";


const checkAdmin = async (req: Request) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
   
    if (!session || (session.user as any).role !== "admin") return null;
    return session;
};



const getAllUsers = async (req: Request, res: Response) => {
    if (!(await checkAdmin(req))) return res.status(403).json({ message: "Forbidden: Admins only" });

    try {
        const users = await prisma.user.findMany({
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
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

const toggleUserStatus = async (req: Request, res: Response) => {
    if (!(await checkAdmin(req))) return res.status(403).json({ message: "Forbidden" });

    const { userId } = req.params;
    const { status } = req.body; 

    if (typeof userId !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID" 
            });
        }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status }
        });
        res.status(200).json({ success: true, message: "User status updated", data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating user" });
    }
};



const createCategory = async (req: Request, res: Response) => {
    if (!(await checkAdmin(req))) return res.status(403).json({ message: "Forbidden" });

    try {
        const { name } = req.body;
        const category = await prisma.category.create({ data: { name } });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating category" });
    }
};

const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching categories" });
    }
};



const getAllBookings = async (req: Request, res: Response) => {
    if (!(await checkAdmin(req))) return res.status(403).json({ message: "Forbidden" });

    try {
        const bookings = await prisma.booking.findMany({
            include: {
                student: { select: { name: true, email: true } },
                tutor: { include: { user: { select: { name: true, email: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching all bookings" });
    }
};

const getStats = async (req: Request, res: Response) => {
    if (!(await checkAdmin(req))) return res.status(403).json({ message: "Forbidden" });

    try {
        const [totalUsers, totalTutors, totalBookings, totalCategories] = await Promise.all([
            prisma.user.count(),
            prisma.tutorProfile.count(),
            prisma.booking.count(),
            prisma.category.count(),
        ]);

        res.status(200).json({
            success: true,
            data: { totalUsers, totalTutors, totalBookings, totalCategories }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};

export const AdminController = {
    getAllUsers,
    toggleUserStatus,
    createCategory,
    getAllCategories,
    getAllBookings,
    getStats
};