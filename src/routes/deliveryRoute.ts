import express, { Request, Response, NextFunction } from 'express';
import { deliverySignUp, deliveryLogin, getDeliveryProfile, editDeliveryuProfile, updateDeliveryUserStatus } from '../controllers';
import { Authenticate } from '../middleware';

const router = express.Router();

/* ------------------- Suignup / Create Customer --------------------- */
router.post('/signup', deliverySignUp)

/* ------------------- Login --------------------- */
router.post('/login', deliveryLogin)

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Change Service Status --------------------- */
router.put('/change-status', updateDeliveryUserStatus)

/* ------------------- Profile --------------------- */
router.get('/profile', getDeliveryProfile)
router.patch('/profile', editDeliveryuProfile)

export { router as deliveryRoute}
