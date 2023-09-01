import express, { Request, Response, NextFunction } from 'express';
import { addFood, getFoods, getVandorProfile, updateVandorProfile, updateVandorCoverIamge, updateVandorService, loginVandor, processOrder, getOrderDetails, getCurrentOrders, getOffers, addOffer, editOffer } from '../controllers';
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


// Orders 
router.get("/orders", getCurrentOrders);
router.put('/order/:id/process', processOrder);
router.get('/order/:id', getOrderDetails);


// Offers
router.post('/offer', addOffer);
router.get('/offers', getOffers);
router.put('/offer/:id', editOffer);
// delete Offers


router.get('/', (req: Request, res: Response, next: NextFunction) => {
 
res.json({ message: "Hello from Vandor"})

})



export { router as vandorRoute };
