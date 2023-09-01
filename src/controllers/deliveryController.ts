import { plainToClass } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { CreateDeliveryInput, EditCustomerProfileInput, UserLoginInput } from "../dto";
import { validate } from "class-validator";
import { generatePassword, generateSalt, generateSignature, validatePassword } from "../utility";
import { DeliveryUser } from "../model";

export const deliverySignUp = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUserInput = plainToClass(CreateDeliveryInput, req.body);

    const inputError = await validate(deliveryUserInput, { validationError: { target: true } });

    if(inputError.length > 0) {
        return res.status(400).json(inputError);
    }

    const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInput;

    const salt = await generateSalt();
    const userPassword = await generatePassword(password, salt);

    const existDeliveryUser = await DeliveryUser.findOne({email: email});

    if(existDeliveryUser !== null) {
        return res.status(409).json({ message: 'A Delivery user exist with the provided email ID.' })
    }

    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        address: address,
        pincode: pincode,
        verified: false,
        lat: 0,
        lng: 0,
        isAvailable: false,
    })

    if(result) {

        // generate the signature 
        const signature = generateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified  
        })

        // send the result to client 
        return res.status(201).json({signature: signature, verified: result.verified, email: result.email})
    }

    return res.status(400).json({ message: 'Error with Signup' });
}

export const deliveryLogin = async (req: Request, res: Response, next: NextFunction) => {

    const loginInputs = plainToClass(UserLoginInput, req.body);

    const loginError = await validate(loginInputs, { validationError: { target: true } } )

    if(loginError.length > 0) {
        return res.status(400).json(loginError);
    }

    const { email, password } = loginInputs;

    const deliveryUser = await DeliveryUser.findOne({ email: email });

    if(deliveryUser) {

        const validation =  await validatePassword(password, deliveryUser.password, deliveryUser.salt);

        if(validation) {

             // generate the signature 
            const signature = generateSignature({
                _id: deliveryUser._id,
                email: deliveryUser.email,
                verified: deliveryUser.verified  
            })

            // send the result to client 
            return res.status(201).json({signature: signature, verified: deliveryUser.verified, email: deliveryUser.email})
        
        }
    }

    return res.status(404).json({ message: 'Login error' });

}

export const getDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    if(deliveryUser) {

        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile) {

            return res.status(200).json(profile);

        }
    }

    return res.status(400).json({ message: 'Error with Fetch Profile!' });
    
}

export const editDeliveryuProfile = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInput, req.body);

    const profileError = await validate(profileInputs, {validationError: { target: true } });

    if(profileError.length > 0) {
        return res.status(400).json(profileError)
    }

    const { firstName, lastName , address } = profileInputs;

    if(deliveryUser) {

        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile) {
             
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
          
            const result = await profile.save(); 

            return res.status(200).json(result);
        }
    }

    return res.status(400).json({ message: 'Error with Update Profile.' });

}

export const updateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    if(deliveryUser) {

        const { lat, lng } = req.body;

        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile) {

            if(lat && lng) {
                profile.lat = lat;
                profile.lng = lng;
            }

            profile.isAvailable = !profile.isAvailable;

            const result = await profile.save();

            return res.status(200).json(result);
        }
    }

    return res.status(400).json({ message: 'Error with Update status.' });

}