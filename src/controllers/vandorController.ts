import { NextFunction, Request, Response } from "express";
import { CreateFoodInput, EditVendorInput, VendorLoginInput } from "../dto";
import { findVandor } from "./adminController";
import { generateSignature, validatePassword } from "../utility";
import { food } from "../model";

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

    if(user) {
        const existingVandor = await findVandor(user._id);

        if(existingVandor !== null) {
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
            const saveResult = await existingVandor.save();
            return res.json(saveResult);
        }

        return res.json(existingVandor);
    }

    return res.json({'message': 'Vandor information not found.'})
}

export const addFood = async (req: Request, res: Response, next: NextFunction) => {
    console.log('srtart');
    
    const user = req.user;

    if(user) {
        
        const { name, description, foodType, category, readyTime, price } = <CreateFoodInput>req.body;
        const vandor = await findVandor(user._id); 

        if(vandor !== null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename);

            console.log(files, images);
            

            const createFoood = await food.create({
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
        const foods = await food.find({ vandorId: user._id });
        
        return res.json(foods);
    }

    return res.json({'message': 'Foods information not found.'})
}