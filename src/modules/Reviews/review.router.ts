import express from 'express';
import { ReviewController } from './review.controller';

const router = express.Router();

router.post('/', ReviewController.addReview);
router.get('/:tutorId', ReviewController.getTutorReviews);


export const ReviewRoutes = router;