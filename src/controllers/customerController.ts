import { plainToClass } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { CreateCustomerInput, CustomerLoginInput, EditCustomerProfileInput } from "../dto";
import { validate } from "class-validator";
import { generateOtp, generatePassword, generateSalt, generateSignature, onRequestOtp, validatePassword } from "../utility";
import { customer } from "../model";


export const customerSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const customerInput = plainToClass(CreateCustomerInput, req.body);

    const inputError = await validate(customerInput, { validationError: { target: true } });

    if(inputError.length > 0) {
        return res.status(400).json(inputError);
    }

    const { email, phone, password } = customerInput;

    const salt = await generateSalt();
    const userPassword = await generatePassword(password, salt);

    const { otp, expiry } = generateOtp();

    const existCustomer = await customer.findOne({email: email});

    if(existCustomer !== null) {
        return res.status(409).json({ message: 'An user exist with the provided email ID.' })
    }

    const result = await customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0,
    })

    if(result) {

        // send the otp to customer
        await onRequestOtp(otp, phone)

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

export const cutomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    const loginInputs = plainToClass(CustomerLoginInput, req.body);

    const loginError = await validate(loginInputs, { validationError: { target: true } } )

    if(loginError.length > 0) {
        return res.status(400).json(loginError);
    }

    const { email, password } = loginInputs;

    const Customer = await customer.findOne({ email: email });

    if(Customer) {

        const validation =  await validatePassword(password, Customer.password, Customer.salt);

        if(validation) {

             // generate the signature 
            const signature = generateSignature({
                _id: Customer._id,
                email: Customer.email,
                verified: Customer.verified  
            })

            // send the result to client 
            return res.status(201).json({signature: signature, verified: Customer.verified, email: Customer.email})
        
        }
    }

    return res.status(404).json({ message: 'Login error' });

}

export const customerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const { otp } = req.body;
    const Customer = req.user;
    
    if(Customer) {
        
        const profile = await customer.findById(Customer._id);

        if(profile) {
            
            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;

                const updateCustomerResponse = await profile.save();

                // generate the signature 
                const signature = generateSignature({
                    _id: updateCustomerResponse._id,
                    email: updateCustomerResponse.email,
                    verified: updateCustomerResponse.verified  
                });

                return res.status(201).json({signature: signature, verified: updateCustomerResponse.verified, email: updateCustomerResponse.email})
            }
        }    
    }

    return res.status(400).json({ message: 'Error with OTP Verification.' });

}

export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {

    const Customer = req.user;

    if(Customer) {

        const profile = await customer.findById(Customer._id);

        if(profile) {
             
            const { otp, expiry } = generateOtp();

            profile.otp = otp;
            profile.otp_expiry = expiry;

            await profile.save(); 
            await onRequestOtp(otp, profile.phone);

            return res.status(201).json({ message: 'OTP sent your registred phone number!' })
        }
    }

    return res.status(400).json({ message: 'Error with Request OTP.' });

}

export const getcustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const Customer = req.user;

    if(Customer) {

        const profile = await customer.findById(Customer._id);

        if(profile) {

            return res.status(200).json(profile);

        }
    }

    return res.status(400).json({ message: 'Error with Fetch Profile!' });
    
}

export const editcustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const Customer = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInput, req.body);

    const profileError = await validate(profileInputs, {validationError: { target: true } });

    if(profileError.length > 0) {
        return res.status(400).json(profileError)
    }

    const { firstName, lastName , address } = profileInputs;

    if(Customer) {

        const profile = await customer.findById(Customer._id);

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
