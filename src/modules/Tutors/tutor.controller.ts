import { Request, Response } from "express";
import { TutorService } from "./tutor.service";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../../lib/prisma";
import { get } from "node:http";

const getProfile = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      include: { categories: true },
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

const createProfile = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    // Changed to upsert — safe to call on create AND update
    const result = await TutorService.upsertTutorProfile(
      session.user.id,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error saving profile", error });
  }
};

const getTutors = async (req: Request, res: Response) => {
  try {
    const { searchTerm, category } = req.query;

    const query: any = {};

    if (searchTerm) {
      query.OR = [
        { bio: { contains: String(searchTerm), mode: "insensitive" } },
        {
          user: { name: { contains: String(searchTerm), mode: "insensitive" } },
        },
      ];
    }

    if (category && category !== "All") {
      query.categories = {
        some: {
          name: { equals: String(category), mode: "insensitive" },
        },
      };
    }

    const tutors = await prisma.tutorProfile.findMany({
      where: query,
      include: {
        user: { select: { name: true, image: true, email: true } },
        categories: true,
        reviews: true,
      },
    });

    res.status(200).json({ success: true, data: tutors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching tutors" });
  }
};

const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories" });
  }
};

const getTutorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid Tutor ID",
      });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true, email: true } },
        categories: true,
        reviews: {
          include: {
            student: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Tutor not found" });
    }

    res.status(200).json({ success: true, data: tutor });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching tutor details" });
  }
};

const getBookedSlots = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date required" });

    const slots = await TutorService.getTutorBookedSlots(
      id as string,
      String(date),
    );
    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching slots" });
  }
};

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const data = await TutorService.getTutorDashboardStats(session.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};

export const TutorController = {
  getProfile,
  createProfile,
  getTutors,
  getCategories,
  getTutorById,
  getBookedSlots,
  getDashboardStats,
};
