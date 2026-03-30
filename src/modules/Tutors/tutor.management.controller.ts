// backend/src/controllers/tutor.management.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const updateProfile = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const { bio, hourlyRate, availability } = req.body;

    
    const updated = await prisma.tutorProfile.update({
      where: { userId: session.user.id },
      data: {
        bio,
        hourlyRate: parseFloat(hourlyRate),
        availability
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const TutorManagementController = {
  updateProfile
};