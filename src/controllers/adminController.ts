import { NextFunction, Request, Response } from "express";
import { CreateVandorInput } from "../dto";
import { vandor } from "../model";
import { generatePassword, generateSalt } from "../utility";

export const findVandor = async (id: string | undefined, email?: string) => {
    if(email) {
        return await vandor.findOne({email: email});
    }else{
        return await vandor.findById(id);
    }
}


export const createVandor = async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVandorInput>req.body; 

    const existingVandor = await findVandor('', email);
    if(existingVandor !== null) {
        return res.json({"message": "A vandor is exist with this email."}); 
    }

    const salt = await generateSalt();
    const userPassword = await generatePassword(password, salt);

    const createVandor = await vandor.create({
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
    })

    return res.json(createVandor);
} 

export const getVandors = async (req: Request, res: Response, next: NextFunction) => {
    const vandors = await vandor.find()

    if(vandors !== null) {
        return res.json({'data': vandors}) ;
    }

    return res.json({'message': 'vandor data not avalaible.'})
}

export const getVandorById = async (req: Request, res: Response, next: NextFunction) => {
    const vandorId = req.params.id;
    const vandors = await findVandor(vandorId);

    if(vandors !== null) {
        return res.json({'data': vandors}) ;
    }
    
    return res.json({'message': 'vandor data not avalaible.'})
}