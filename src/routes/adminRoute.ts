import express, { Request, Response, NextFunction } from 'express';
import {createVandor, getVandorById, getVandors } from '../controllers';


const router = express.Router();

router.post('/vandor', createVandor)

router.get('/vandors', getVandors)
router.get('/vandor/:id', getVandorById)


router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({ message: "Hello from  Admin"})

})


export { router as adminRoute };