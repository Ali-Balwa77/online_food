import { plainToClass } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { CreateCustomerInput, CustomerLoginInput, EditCustomerProfileInput, OrderInputs } from "../dto";
import { validate } from "class-validator";
import { generateOtp, generatePassword, generateSalt, generateSignature, onRequestOtp, validatePassword } from "../utility";
import { customer, food, order } from "../model";

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
        orders: [],
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

/* ------------------- Cart Section --------------------- */

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {

    const Customer = req.user;
    
    if(Customer) {
        const profile = await customer.findById(Customer._id).populate('cart.food');
        let cartItems = Array();
        
        const { _id, unit } = <OrderInputs>req.body;
        
        const Food = await food.findById(_id);
        
        if(Food) {
            
            if(profile != null) {
                // check for cart items
                cartItems = profile.cart;
                
                if(cartItems.length > 0) {
                    // check and update unit
                    let existFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);

                    if(existFoodItem.length > 0) {
                        const index = cartItems.indexOf(existFoodItem[0]);

                        if(unit > 0) {
                            cartItems[index] = {Food, unit};
                        }else {
                            cartItems.splice(index, 1);
                        }

                    }else {
                        cartItems.push({Food, unit})
                    }
                     
                }else{ 
                    // add new item to cart
                    console.log(Food,'strt');

                    cartItems.push({Food, unit})
                }

                if(cartItems) {
                    profile.cart = cartItems as any;
                    const cartResult = await profile.save();
                    return res.status(200).json(cartResult.cart);    
                }
            }
    
        }

    }

    return res.status(400).json({ message: 'Error with Add to Cart!' });

}

export const getCart = async (req: Request, res: Response, next: NextFunction) => {}

export const deleteCart = async (req: Request, res: Response, next: NextFunction) => {}

/* -------------------- Order section --------------------- */

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {

    // grab current login customer
    const Customer = req.user;

    if(Customer) {
        // create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

        const profile = await customer.findById(Customer._id);

        // grab order items from request [{ id: xx, unit: xx }]
        const cart = <[OrderInputs]>req.body; 

        let cartItems = Array();
        
        let netAmount = 0.0;

        // claculate order amount 
        const foods = await food.find().where('_id').in(cart.map(item => item._id)).exec();

        foods.map(food => {
            cart.map(({_id, unit}) => {

                if(food._id == _id) {
                    netAmount += (food.price * unit);
                    cartItems.push({food, unit});
                }
            })
        })
        // create order with item decriptions
        if(cartItems) {
            // craete order 

            const currentOrder = await order.create({
                orderID: orderId,
                items: cartItems,
                totalAmount: netAmount,
                orderDate: new Date(),
                paidThrogh: 'COD',
                paymentResponse: '',
                orderStatus: 'Waiting',
            })

            if(currentOrder) {

                profile.orders.push(currentOrder);
                await profile.save();

                return res.status(201).json(currentOrder);
            }
        }
                
    }

    return res.status(400).json({ message: 'Error with Create Order!' });

}
    
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {

    const Customer = req.user;

    if(Customer) {

        const profile = await customer.findById(Customer._id).populate('orders');

        if(profile) {
             
            return res.status(200).json(profile.orders);

        }
    
    }

    return res.status(400).json({ message: 'Error with Fetch Order!' });

}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    if(orderId) {

        const Order = await order.findById(orderId).populate('items.food');

        if(Order) {
             
            return res.status(200).json(Order);

        }

    }

    return res.status(400).json({ message: 'Error with Fetch Order!' });

}
