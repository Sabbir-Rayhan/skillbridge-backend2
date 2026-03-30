import express from 'express';
import { UserController } from './user.controller';

const router = express.Router();

router.get('/', UserController.getAllUsers); 
router.get('/me', UserController.getMe);
router.patch('/me', UserController.updateMyProfile);

export const UserRoutes = router;