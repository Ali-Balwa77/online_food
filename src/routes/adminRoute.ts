import express, { Request, Response, NextFunction } from 'express';
import {createVandor, getDeliveryUsers, getTransactionById, getTransactions, getVandorById, getVandors, verifyDeliveryUser } from '../controllers';


const router = express.Router();

router.post('/vandor', createVandor)
router.get('/vandors', getVandors)
router.get('/vandor/:id', getVandorById)


router.get('/transactions', getTransactions)
router.get('/transaction/:id', getTransactionById)

router.put('/delivery-verify', verifyDeliveryUser)
router.get('/delivery/users', getDeliveryUsers)

router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({ message: "Hello from  Admin"})

})


export { router as adminRoute };