import { NextFunction, Request, Response } from "express";
import { CreateFoodInput, CreateOfferInputs, EditVendorInput, VendorLoginInput } from "../dto";
import { findVandor } from "./adminController";
import { generateSignature, validatePassword } from "../utility";
import { Food, Offer, Order } from "../model";

export const loginVandor = async (req: Request, res: Response, next: NextFunction) => {
    
    const { email, password } = <VendorLoginInput>req.body;

    const existingVandor = await findVandor('', email);

    if(existingVandor !== null) {
        
        const validate = await validatePassword(password, existingVandor.password, existingVandor.salt);

        if(validate) {
            const signature = generateSignature({
                _id: existingVandor.id,
                name: existingVandor.name,
                email: existingVandor.email,
            });
            
            return res.json({'data': existingVandor, 'token': signature})
        }else{
            return res.json({'message': 'Password not valid.'})
        }

    }

    return res.json({'message': 'login credential not valid.'})
}

export const getVandorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user) {
        const existingVandor = await findVandor(user._id);

        return res.json(existingVandor);
    }

    return res.json({'message': 'Vandor information not found.'})
}

export const updateVandorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const {foodTypes, name, address, phone} = <EditVendorInput>req.body
    const user = req.user;

    if(user) {
        const existingVandor = await findVandor(user._id);

        if(existingVandor !== null) {
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodTypes;

            const saveResult = await existingVandor.save();
            return res.json(saveResult);
        }

        return res.json(existingVandor);
    }

    return res.json({'message': 'Vandor information not found.'})
}

export const updateVandorCoverIamge = async (req: Request, res: Response, next: NextFunction) => {
    
    const user = req.user;

    if(user) {
        
        const vandor = await findVandor(user._id); 

        if(vandor !== null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename);

            vandor.coverImage.push(...images);
            
            const result = await vandor.save();

            return res.json(result);
        }
    }

    return res.json({'message': 'Something went wrong with add food.'})
}


export const updateVandorService = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const { lat, lng } = req.body;

    if(user) {
        const existingVandor = await findVandor(user._id);

        if(existingVandor !== null) {
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;

            if(lat && lng) {
                existingVandor.lat = lat;
                existingVandor.lng = lng;
            }

            const saveResult = await existingVandor.save();
            return res.json(saveResult);
        }

        return res.json(existingVandor);
    }

    return res.json({'message': 'Vandor information not found.'})
}

export const addFood = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user) {
        
        const { name, description, foodType, category, readyTime, price } = <CreateFoodInput>req.body;
        const vandor = await findVandor(user._id); 

        if(vandor !== null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename);

            console.log(files, images);
            

            const createFoood = await Food.create({
                vandorId: user._id,
                name: name,
                description: description,
                foodType: foodType,
                category: category,
                readyTime: readyTime,
                price: price,
                images: images,
                rating: 0
            })
            vandor.foods.push(createFoood);
            const result = await vandor.save();

            return res.json(result);
        }
    }

    return res.json({'message': 'Something went wrong with add food.'})
}

export const getFoods = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if(user) {
        const foods = await Food.find({ vandorId: user._id });
        
        return res.json(foods);
    }

    return res.json({'message': 'Foods information not found.'})
}

export const getCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    
    if(user) {

        const orders = await Order.find({vandorId: user._id}).populate('items.food');
        
        if(orders != null) { 

            return res.status(200).json(orders);

        }
    }

    return res.json({'message': 'Order not found.'})
}

export const processOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    const { status, remarks, time} = req.body;

    if(orderId) {

        const order = await Order.findById(orderId).populate('items.food');

        order.orderStatus = status;
        order.remarks = remarks;

        if(time) {
            order.readyTime = time;
        }

        const orderResult = await order.save();

        if(orderResult != null) {

            return res.status(200).json(orderResult);

        }

    }

    return res.json({'message': 'Unable to process Order.'})
}

export const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const orederId = req.params.id;
    
    if(orederId ) {

        const order = await Order.findById(orederId).populate('items.food');
        
        if(order != null) { 

            return res.status(200).json(order);

        }
    }

    return res.json({'message': 'Order not found.'})
}

export const addOffer = async (req: Request, res: Response, next: NextFunction) => {
   
    const user = req.user;

    if(user) {

        const { offerType, title, description, offerAmount, promoCode, promoType, startValidity, endValidity,
        minValue, bank, bins, pincode, isActive } = <CreateOfferInputs>req.body;

        const vandor = await findVandor(user._id);

        if(vandor) {

            const offer = await Offer.create({
                title,
                offerType,
                description,
                offerAmount,
                promoCode, 
                promoType,
                startValidity,
                endValidity,
                minValue, 
                bank, 
                bins,
                pincode,
                isActive,
                vandors: [vandor]
            })

            return res.status(201).json(offer);
            
        }

    }

    return res.json({'message': 'Unable to Add Offer!'});
}

export const getOffers = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if(user) {
            
        let currentOffers = Array();

        const offers = await Offer.find().populate('vandors');

        if(offers) {

            offers.map(item => {
                if(item.vandors) {
                    item.vandors.map(vandor => {
                        if(vandor._id.toString() === user._id) {
                            currentOffers.push(item);
                        }
                    })
                }

                if(item.offerType === 'GENERIC') {
                    currentOffers.push(item);
                }
            })
        }

        return res.status(200).json(currentOffers);

    }
    
    return res.json({'message': 'Offer not available!'})
}

export const editOffer = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    const offerId = req.params.id; 

    if(user) {

        const { offerType, title, description, offerAmount, promoCode, promoType, startValidity, endValidity,
        minValue, bank, bins, pincode, isActive } = <CreateOfferInputs>req.body;

        const currentOffer = await Offer.findById(offerId);

        if(currentOffer) {

            const vandor = await findVandor(user._id);
    
            if(vandor) {
                currentOffer.title = title,
                currentOffer.offerType = offerType,
                currentOffer.description = description,
                currentOffer.offerAmount = offerAmount,
                currentOffer.promoCode = promoCode, 
                currentOffer.promoType = promoType,
                currentOffer.startValidity = startValidity,
                currentOffer.endValidity = endValidity,
                currentOffer.minValue = minValue, 
                currentOffer.bank = bank, 
                currentOffer.bins = bins,
                currentOffer.pincode = pincode,
                currentOffer.isActive = isActive

                const result = await currentOffer.save();

                return res.status(201).json(result);

            }

        }

    }

    return res.json({'message': 'Unable to Add Offer!'});
}
