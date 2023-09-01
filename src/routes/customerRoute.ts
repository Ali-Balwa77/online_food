import express, { Request, Response, NextFunction } from 'express';
import { cutomerLogin, customerSignUp, customerVerify, editcustomerProfile, getcustomerProfile, requestOtp, createOrder, getOrders, getOrderById, addToCart, getCart, deleteCart, verifyOffer, createPayment } from '../controllers';
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
router.post('/cart', addToCart)
router.get('/cart', getCart)
router.delete('/cart', deleteCart)

//Apply Offers
router.get('/offer/verify/:id', verifyOffer);

//Payment
router.post('/create-payment', createPayment);

//Order
router.post('/create-order', createOrder);
router.get('/orders', getOrders);
router.get('/order/:id', getOrderById)

export { router as customerRoute}
