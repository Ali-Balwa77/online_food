import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "../dto";
import { validateSignature } from "../utility";

declare global {
    namespace Express {
        interface Request{
            user?: AuthPayload;
        }
    }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const validate = await validateSignature(req);

    if(validate) {
        next();
    }else{
        return res.json({'message': 'User not Authorized.'});
    }
}