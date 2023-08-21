import express, { Application }  from "express";
import { adminRoute, customerRoute, shoppingRoute, vandorRoute } from "../routes";
import path from 'path';


export default async (app: Application) => {

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use(express.json());
    
    const imagePath = path.join(__dirname,'../images');
    
    app.use('/images', express.static(imagePath));
    
    app.use('/admin', adminRoute);
    app.use('/vandor', vandorRoute);
    app.use('/customer', customerRoute)
    app.use(shoppingRoute)

    return app; 

}
