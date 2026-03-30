import express from 'express';
import { AdminController } from './admin.controller';

const router = express.Router();


router.get('/users', AdminController.getAllUsers);


router.patch('/users/:userId/status', AdminController.toggleUserStatus);

router.post('/categories', AdminController.createCategory);
router.get('/categories', AdminController.getAllCategories); 


router.get('/bookings', AdminController.getAllBookings);


router.get('/stats', AdminController.getStats);

export const AdminRoutes = router;