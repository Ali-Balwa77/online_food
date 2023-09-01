import { NextFunction, Request, Response } from "express";
import { CreateVandorInput } from "../dto";
import { DeliveryUser, Transaction, Vandor } from "../model";
import { generatePassword, generateSalt } from "../utility";

export const findVandor = async (id: string | undefined, email?: string) => {
    if(email) {
        return await Vandor.findOne({email: email});
    }else{
        return await Vandor.findById(id);
    }
}


export const createVandor = async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVandorInput>req.body; 

    const existingVandor = await findVandor('', email);
    if(existingVandor !== null) {
        return res.status(200).json({"message": "A vandor is exist with this email."}); 
    }

    const salt = await generateSalt();
    const userPassword = await generatePassword(password, salt);

    const createVandor = await Vandor.create({
        name: name,
        address: address, 
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        ownerName: ownerName,
        phone: phone,
        salt: salt,
        serviceAvailable: false,
        coverImage: [],
        foods: [],
        rating: 0,
        lat: 0,
        lng: 0,
    })

    if(createVandor) {

        return res.status(201).json(createVandor);
    }

    return res.status(400).json({'message': 'Error with create vandor.'})
} 

export const getVandors = async (req: Request, res: Response, next: NextFunction) => {
    const vandors = await Vandor.find()

    if(vandors !== null) {
        return res.status(200).json({'data': vandors}) ;
    }

    return res.status(400).json({'message': 'vandor data not avalaible.'})
}

export const getVandorById = async (req: Request, res: Response, next: NextFunction) => {
    const vandorId = req.params.id;
    const vandors = await findVandor(vandorId);

    if(vandors !== null) {
        return res.status(200).json({'data': vandors}) ;
    }
    
    return res.status(400).json({'message': 'vandor data not avalaible.'})
}

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
   
    const transactions = await Transaction.find();

    if(transactions) {

        return res.status(200).json(transactions) ;
    }
    
    return res.status(400).json({'message': 'Transaction not avalaible.'})
}

export const getTransactionById = async (req: Request, res: Response, next: NextFunction) => {

    const Id = req.params.id;
    const transacrtion = await Transaction.findById(Id);

    if(transacrtion) {

        return res.status(200).json(transacrtion);
    }
    
    return res.status(400).json({'message': 'Transaction not avalaible.'})
}

export const verifyDeliveryUser = async (req: Request, res: Response, next: NextFunction) => {

    const { _id, status } = req.body;

    if(_id) {
         
        const profile = await DeliveryUser.findById(_id);

        if(profile) {

            profile.verified = status;

            const result = await profile.save();

            return res.status(200).json(result);    
        }
    }

    return res.status(400).json({'message': 'Unable to verify Delivery User.'})
}

export const getDeliveryUsers = async (req: Request, res: Response, next: NextFunction) => {
         
        const deliveryUser = await DeliveryUser.find();

        if(deliveryUser) {

            return res.status(200).json(deliveryUser);    
        }

    return res.status(400).json({'message': 'Unable to get Delivery User.'})
}