import bcrypt from 'bcrypt';
import  jwt  from 'jsonwebtoken';
import { App_SECRET } from '../config';
import { Request } from 'express';
import { AuthPayload } from '../dto';

export const generateSalt = async () => {
    return await bcrypt.genSalt()
}

export const generatePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt);
}

export const validatePassword = async (enteredPassword: string, savePassword: string, salt: string) => {
    return await generatePassword(enteredPassword, salt) === savePassword;
}

export const generateSignature = (payload: AuthPayload) => {
    return jwt.sign(payload, App_SECRET,{
        expiresIn : "1d",
    }) 
}

export const validateSignature = async (req: Request) => {
    const signature = req.get('Authorization')

    if(signature) {
        
        const payload = await jwt.verify(signature.split(' ')[1], App_SECRET) as AuthPayload;

        req.user = payload;
    
        return true;
    }
    return false;
}