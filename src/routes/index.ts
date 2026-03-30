import { Router } from 'express';
import { UserRoutes } from '../modules/Users/user.router';
import { TutorRoutes } from '../modules/Tutors/tutor.router';
import { BookingRoutes } from '../modules/Bookings/booking.router'; 
import { ReviewRoutes } from '../modules/Reviews/review.router';  
import { AdminRoutes } from '../modules/Admin/admin.router'; 

const router = Router();

router.use('/users', UserRoutes);
router.use('/tutors', TutorRoutes);
router.use('/bookings', BookingRoutes); 
router.use('/reviews', ReviewRoutes);   
router.use('/admin', AdminRoutes);

export default router;