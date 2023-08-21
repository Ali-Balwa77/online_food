import express, { Request, Response, NextFunction } from 'express';
import {createVandor, getVandorById, getVandors } from '../controllers';


const router = express.Router();

router.post('/vendor', createVandor)

router.get('/vendors', getVandors)
router.get('/vendor/:id', getVandorById)


router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({ message: "Hello from  Admin"})

})


export { router as adminRoute };