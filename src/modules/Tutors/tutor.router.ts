import express from 'express';
import { TutorController } from './tutor.controller';

const router = express.Router();

router.get('/profile', TutorController.getProfile);
router.post('/profile', TutorController.createProfile); 
router.get('/', TutorController.getTutors);
router.get('/categories', TutorController.getCategories);
router.get("/:id", TutorController.getTutorById);
router.get("/:id/booked-slots", TutorController.getBookedSlots);
router.get("/dashboard-stats", TutorController.getDashboardStats);

export const TutorRoutes = router;