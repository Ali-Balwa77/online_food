import express, { Request, Response, NextFunction } from 'express';
import { addFood, getFoods, getVandorProfile, updateVandorProfile, updateVandorCoverIamge, updateVandorService, loginVandor } from '../controllers';
import { Authenticate } from '../middleware';
import multer from 'multer';

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: function(req,file, cb){
        cb(null, 'images')
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString()+'_'+file.originalname);
    }
})

const images = multer({ storage: imageStorage}).array('images', 10);


router.post('/login', loginVandor);

router.use(Authenticate)
router.get('/profile', getVandorProfile);
router.patch('/profile', updateVandorProfile);
router.patch('/coverimage', images, updateVandorCoverIamge);
router.patch('/service', updateVandorService);

router.post('/food', images, addFood);
router.get('/food', getFoods)


router.get('/', (req: Request, res: Response, next: NextFunction) => {
 
res.json({ message: "Hello from Vandor"})

})



export { router as vandorRoute };
