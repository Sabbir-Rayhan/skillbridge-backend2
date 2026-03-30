import { Request, Response } from "express";
import { UserService } from "./user.service";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import {prisma} from '../../lib/prisma'

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
   
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await UserService.getMe(session.user.email);
    res.status(200).json({
      success: true,
      message: "User profile retrieved",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateMyProfile = async (req: Request, res: Response) => {
    try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session) return res.status(401).json({ message: "Unauthorized" });

        const { name, image } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { name, image }
        });

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
}

export const UserController = {
  getAllUsers,
  getMe,
  updateMyProfile
};