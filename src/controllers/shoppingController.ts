import express, { Request, Response, NextFunction } from 'express';
import { foodDoc, Offer, Vandor } from '../model';

export const getFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;

    const result = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .sort([['rating', 'descending']])
    .populate('foods')

    if(result.length > 0) {
        return res.status(200).json(result);
    }
    

    return res.status(400).json({ message: 'Data not found.'})
}

export const getTopRestuarants = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;

    const result = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .sort([['rating', 'descending']])
    .limit(10)

    if(result.length > 0) {
        return res.status(200).json(result);
    }
    

    return res.status(400).json({ message: 'Data not found.'})
}

export const getFoodsIn30Min = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;

    const result = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .populate('foods')

    if(result.length > 0) {

        let foodResult: any = [];

        result.map(vandor => {
            const foods = vandor.foods as [foodDoc];

            foodResult.push(...foods.filter(food => food.readyTime <= 30));

        })

        return res.status(200).json(foodResult);
    }
    

    return res.status(400).json({ message: 'Data not found.'})
}

export const searchFoods = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;

    const result = await Vandor.find({pincode: pincode, serviceAvailable: false})
    .populate('foods')

    if(result.length > 0) {

        let foodResult: any = [];

        result.map(item => {
            foodResult.push(...item.foods);
        })

        return res.status(200).json(foodResult);
    }
    

    return res.status(400).json({ message: 'Data not found.'})
}

export const restuarantById = async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id;

    const result = await Vandor.findById(id)
    .populate('foods')

    if(result) {
        return res.status(200).json(result);
    }
    

    return res.status(400).json({ message: 'Data not found.'})
}

export const getAvailableOffers = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;

        const offers = await Offer.find({pincode: pincode, isActive: true});

        if(offers) {
            return res.status(200).json(offers);
        }


    return res.status(400).json({ message: 'Offers not found.'})
}
