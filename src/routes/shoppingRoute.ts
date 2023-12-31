import express, { Request, Response, NextFunction } from 'express';
import { getAvailableOffers, getFoodAvailability, getFoodsIn30Min, getTopRestuarants, restuarantById, searchFoods } from '../controllers';

const router = express.Router();

/** ------------------ Food Availability ----------------- */
router.get('/:pincode', getFoodAvailability)

/** ------------------ Top Restuarants ------------------- */
router.get('/top-restuarants/:pincode', getTopRestuarants)

/** ------------------ Foods Available in 30 Minutes ------------------- */
router.get('/foods-in-30-min/:pincode', getFoodsIn30Min)

/** ------------------ Search Foods ------------------- */
router.get('/search/:pincode', searchFoods)

/** ------------------ Find Offers ------------------- */
router.get('/offers/:pincode', getAvailableOffers)

/** ------------------ Find Restuarant by ID ------------------- */
router.get('/restuarant/:id', restuarantById)

export { router as shoppingRoute };