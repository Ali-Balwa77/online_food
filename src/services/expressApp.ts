import express, { Application }  from "express";
import { adminRoute, customerRoute, deliveryRoute, shoppingRoute, vandorRoute } from "../routes";
import path from 'path';


export default async (app: Application) => {

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use(express.json());
        
    app.use('/images', express.static(path.join(__dirname,'../images')));
    
    app.use('/admin', adminRoute);
    app.use('/vandor', vandorRoute);
    app.use('/customer', customerRoute);
    app.use('/delivery', deliveryRoute);
    app.use(shoppingRoute);

    return app; 

}
