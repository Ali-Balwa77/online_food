import express, { Request, Response, NextFunction } from 'express';
import { cutomerLogin, customerSignUp, customerVerify, editcustomerProfile, getcustomerProfile, requestOtp } from '../controllers';
import { Authenticate } from '../middleware';

const router = express.Router();

/* ------------------- Suignup / Create Customer --------------------- */
router.post('/signup', customerSignUp)

/* ------------------- Login --------------------- */
router.post('/login', cutomerLogin)

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Verify Customer Account --------------------- */
router.patch('/verify', customerVerify)


/* ------------------- OTP / request OTP --------------------- */
router.get('/otp', requestOtp)

/* ------------------- Profile --------------------- */
router.get('/profile', getcustomerProfile)
router.patch('/profile', editcustomerProfile)

//Cart

//Apply Offers

//Payment

//Order

export { router as customerRoute}
