"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editcustomerProfile = exports.getcustomerProfile = exports.requestOtp = exports.customerVerify = exports.cutomerLogin = exports.customerSignUp = void 0;
const class_transformer_1 = require("class-transformer");
const dto_1 = require("../dto");
const class_validator_1 = require("class-validator");
const utility_1 = require("../utility");
const model_1 = require("../model");
const customerSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInput = (0, class_transformer_1.plainToClass)(dto_1.CreateCustomerInput, req.body);
    const inputError = yield (0, class_validator_1.validate)(customerInput, { validationError: { target: true } });
    if (inputError.length > 0) {
        return res.status(400).json(inputError);
    }
    const { email, phone, password } = customerInput;
    const salt = yield (0, utility_1.generateSalt)();
    const userPassword = yield (0, utility_1.generatePassword)(password, salt);
    const { otp, expiry } = (0, utility_1.generateOtp)();
    const existCustomer = yield model_1.customer.findOne({ email: email });
    if (existCustomer !== null) {
        return res.status(409).json({ message: 'An user exist with the provided email ID.' });
    }
    const result = yield model_1.customer.create({
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
    });
    if (result) {
        // send the otp to customer
        yield (0, utility_1.onRequestOtp)(otp, phone);
        // generate the signature 
        const signature = (0, utility_1.generateSignature)({
            _id: result._id,
            email: result.email,
            verified: result.verified
        });
        // send the result to client 
        return res.status(201).json({ signature: signature, verified: result.verified, email: result.email });
    }
    return res.status(400).json({ message: 'Error with Signup' });
});
exports.customerSignUp = customerSignUp;
const cutomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInputs = (0, class_transformer_1.plainToClass)(dto_1.CustomerLoginInput, req.body);
    const loginError = yield (0, class_validator_1.validate)(loginInputs, { validationError: { target: true } });
    if (loginError.length > 0) {
        return res.status(400).json(loginError);
    }
    const { email, password } = loginInputs;
    const Customer = yield model_1.customer.findOne({ email: email });
    if (Customer) {
        const validation = yield (0, utility_1.validatePassword)(password, Customer.password, Customer.salt);
        if (validation) {
            // generate the signature 
            const signature = (0, utility_1.generateSignature)({
                _id: Customer._id,
                email: Customer.email,
                verified: Customer.verified
            });
            // send the result to client 
            return res.status(201).json({ signature: signature, verified: Customer.verified, email: Customer.email });
        }
    }
    return res.status(404).json({ message: 'Login error' });
});
exports.cutomerLogin = cutomerLogin;
const customerVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const Customer = req.user;
    if (Customer) {
        const profile = yield model_1.customer.findById(Customer._id);
        if (profile) {
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;
                const updateCustomerResponse = yield profile.save();
                // generate the signature 
                const signature = (0, utility_1.generateSignature)({
                    _id: updateCustomerResponse._id,
                    email: updateCustomerResponse.email,
                    verified: updateCustomerResponse.verified
                });
                return res.status(201).json({ signature: signature, verified: updateCustomerResponse.verified, email: updateCustomerResponse.email });
            }
        }
    }
    return res.status(400).json({ message: 'Error with OTP Verification.' });
});
exports.customerVerify = customerVerify;
const requestOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Customer = req.user;
    if (Customer) {
        const profile = yield model_1.customer.findById(Customer._id);
        if (profile) {
            const { otp, expiry } = (0, utility_1.generateOtp)();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            yield profile.save();
            yield (0, utility_1.onRequestOtp)(otp, profile.phone);
            return res.status(201).json({ message: 'OTP sent your registred phone number!' });
        }
    }
    return res.status(400).json({ message: 'Error with Request OTP.' });
});
exports.requestOtp = requestOtp;
const getcustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Customer = req.user;
    if (Customer) {
        const profile = yield model_1.customer.findById(Customer._id);
        if (profile) {
            return res.status(200).json(profile);
        }
    }
    return res.status(400).json({ message: 'Error with Fetch Profile!' });
});
exports.getcustomerProfile = getcustomerProfile;
const editcustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Customer = req.user;
    const profileInputs = (0, class_transformer_1.plainToClass)(dto_1.EditCustomerProfileInput, req.body);
    const profileError = yield (0, class_validator_1.validate)(profileInputs, { validationError: { target: true } });
    if (profileError.length > 0) {
        return res.status(400).json(profileError);
    }
    const { firstName, lastName, address } = profileInputs;
    if (Customer) {
        const profile = yield model_1.customer.findById(Customer._id);
        if (profile) {
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = yield profile.save();
            return res.status(200).json(result);
        }
    }
    return res.status(400).json({ message: 'Error with Update Profile.' });
});
exports.editcustomerProfile = editcustomerProfile;
//# sourceMappingURL=customerController.js.map