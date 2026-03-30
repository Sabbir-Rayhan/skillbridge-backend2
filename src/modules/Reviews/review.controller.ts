import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const addReview = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ message: "Unauthorized" });


    const result = await ReviewService.createReview(session.user.id, {
        tutorId: req.body.tutorId, 
        rating: req.body.rating,
        comment: req.body.comment
    });
    
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error("Review Error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to add review" });
  }
};

const getTutorReviews = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    
    if (!tutorId) {
        return res.status(400).json({ success: false, message: "Tutor ID is required" });
    }
        
    const result = await ReviewService.getReviewsForTutor(tutorId as string);
 
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ success: false, message: "Error fetching reviews" });
  }
};

export const ReviewController = {
  addReview,
  getTutorReviews
};