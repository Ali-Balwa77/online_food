import { plainToClass } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { CreateCustomerInput, EditCustomerProfileInput, OrderInputs, UserLoginInput, cartItem } from "../dto";
import { validate } from "class-validator";
import { generateOtp, generatePassword, generateSalt, generateSignature, onRequestOtp, validatePassword } from "../utility";
import { Customer, DeliveryUser, Food, Offer, Order, Transaction, Vandor } from "../model";

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

    const existCustomer = await Customer.findOne({email: email});

    if(existCustomer !== null) {
        return res.status(409).json({ message: 'An user exist with the provided email ID.' })
    }

    const result = await Customer.create({
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

    const loginInputs = plainToClass(UserLoginInput, req.body);

    const loginError = await validate(loginInputs, { validationError: { target: true } } )

    if(loginError.length > 0) {
        return res.status(400).json(loginError);
    }

    const { email, password } = loginInputs;

    const customer = await Customer.findOne({ email: email });

    if(customer) {

        const validation =  await validatePassword(password, customer.password, customer.salt);

        if(validation) {

             // generate the signature 
            const signature = generateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified  
            })

            // send the result to client 
            return res.status(201).json({signature: signature, verified: customer.verified, email: customer.email})
        
        }
    }

    return res.status(404).json({ message: 'Login error' });

}

export const customerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const { otp } = req.body;
    const customer = req.user;
    
    if(customer) {
        
        const profile = await Customer.findById(customer._id);

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

    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id);

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

    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id);

        if(profile) {

            return res.status(200).json(profile);

        }
    }

    return res.status(400).json({ message: 'Error with Fetch Profile!' });
    
}

export const editcustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInput, req.body);

    const profileError = await validate(profileInputs, {validationError: { target: true } });

    if(profileError.length > 0) {
        return res.status(400).json(profileError)
    }

    const { firstName, lastName , address } = profileInputs;

    if(customer) {

        const profile = await Customer.findById(customer._id);

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

    const customer = req.user;
    
    if(customer) {
        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();
        
        const { _id, unit } = <cartItem>req.body;
        
        const food = await Food.findById(_id);
        
        if(food) {
            
            if(profile != null) {
                // check for cart items
                cartItems = profile.cart;
                
                if(cartItems.length > 0) {
                    let existFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);

                    if(existFoodItem.length > 0) {
                        const index = cartItems.indexOf(existFoodItem[0]);

                        if(unit > 0) {
                            cartItems[index] = {food, unit};
                        }else {
                            cartItems.splice(index, 1);
                        }

                    }else {
                        cartItems.push({food, unit})
                    }
                     
                }else{ 
                    // add new item to cart
                    cartItems.push({food, unit})
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

export const getCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id).populate('cart.food');

        if(profile) {

            return res.status(200).json(profile.cart)

        }

    }

    return res.status(400).json({ message: 'Cart is Empty!' });

}

export const deleteCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id).populate('cart.food');

        if(profile != null) {

            profile.cart = [] as any;
            const cartResult = await profile.save();

            return res.status(200).json(cartResult)

        }

    }

    return res.status(400).json({ message: 'Cart is already Empty!' });

}

/* -------------------- create payment --------------------- */

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const { amount, paymentMode, offerId } = req.body;

    let payableAmount = Number(amount);

    if(offerId) {

        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer) {

            if(appliedOffer.isActive) {

                payableAmount = (payableAmount - appliedOffer.offerAmount);
            }
        }
    }

    // Perform Payment getway charge API call

    // right after paymet getway success / failure response

    // Create recored on transaction
    const transaction = await Transaction.create({
        customer: customer._id,
        vandorId: '',
        orderId: '',
        orderValue: payableAmount,
        offerUsed: offerId || 'NA',
        status: 'OPEN',
        paymentMode: paymentMode,
        paymentResponse: 'Payment is Cash on Delivery',
    })

    // return transacrtion ID
    return res.status(200).json(transaction);

}

/* -------------------- Order section --------------------- */

const assignOrderForDelivery = async (orderId: string, vandorId: string) => {

    // find the vandor
    const vandor = await Vandor.findById(vandorId);

    if(vandor) {

        const areaCode = vandor.pincode;
        const vandorLat = vandor.lat; 
        const vandorLng = vandor.lng;

        // find the available Delivery Person
        const deliveryPerson  = await DeliveryUser.find({ pincode: areaCode, verified:true, isAvailable:true });

        if(deliveryPerson) {

            // check the nearest delivery person and assign the order
            const currentOrder = await Order.findById(orderId)

            if(currentOrder) {

                // update deliveryID
                currentOrder.deliveryId = deliveryPerson[0]._id

                await currentOrder.save();
                
                // Notify to vandor for received new Order usinf firebase push notification  
            }
        }
    }

}

/* -------------------- Order section --------------------- */

const validateTransaction = async (txnId: string) => {

    const currentTransaction = await Transaction.findById(txnId);

    if(currentTransaction) {

        if(currentTransaction.status.toLowerCase() !== 'failed') {
            return { status: true, currentTransaction }
        }
    }

    return { status: false, currentTransaction }

}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {

    // grab current login customer
    const customer = req.user;

    const { txnId, amount, items } = <OrderInputs>req.body;

    if(customer) {

        // validate transaction
        const { status, currentTransaction } = await validateTransaction(txnId)

        if(!status) {
            return res.status(400).json({message: "Error with Create Order!"})
        }

        // create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

        const profile = await Customer.findById(customer._id);

        // grab order items from request [{ id: xx, unit: xx }]

        let cartItems = Array();
        
        let netAmount = 0.0;

        let vandorId;

        // claculate order amount 
        const foods = await Food.find().where('_id').in(items.map(item => item._id)).exec();

        foods.map(food => {
            items.map(({_id, unit}) => {

                if(food._id == _id) {
                    vandorId = food._id,
                    netAmount += (food.price * unit);
                    cartItems.push({food, unit: unit});
                }else {
                    console.log(`${food._id} / ${_id}`);
                }
            })
        })
        // create order with item decriptions
        if(cartItems) {
            // craete order 

            const currentOrder = await Order.create({
                orderID: orderId,
                vandorId: vandorId,
                items: cartItems,
                totalAmount: netAmount,
                orderDate: new Date(),
                paidAmount: amount,
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',
                readyTime: 45,
            })

            profile.cart = [] as any;
            profile.orders.push(currentOrder);

            currentTransaction.vandorId = vandorId;
            currentTransaction.orderId = orderId;
            currentTransaction.status = 'CONFIRMED';

            await currentTransaction.save();

            assignOrderForDelivery(currentOrder._id, vandorId);

            const profileSaveResponse = await profile.save();

            return res.status(201).json(profileSaveResponse);
        }
                
    }

    return res.status(400).json({ message: 'Error with Create Order!' });

}
    
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer) {

        const profile = await Customer.findById(customer._id).populate('orders');

        if(profile) {
             
            return res.status(200).json(profile.orders);

        }
    
    }

    return res.status(400).json({ message: 'Error with Fetch Order!' });

}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    if(orderId) {

        const order = await Order.findById(orderId).populate('items.food');

        if(order) {
             
            return res.status(200).json(order);

        }

    }

    return res.status(400).json({ message: 'Error with Fetch Order!' });

}

export const verifyOffer = async (req: Request, res: Response, next: NextFunction) => {

    const offerId = req.params.id;
    const customer = req.user;

    if(customer) {

        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer) {

            if(appliedOffer.promoType === 'USER') {

                // only can apply once per user 

            }else{

                if(appliedOffer.isActive) {
    
                    return res.status(200).json({message: 'Offer is valid', offer: appliedOffer})
                }
            }
        }
    } 

    return res.status(400).json({ message: 'Offer is not valid!' });

}

