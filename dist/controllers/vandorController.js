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
exports.getFoods = exports.addFood = exports.updateVandorService = exports.updateVandorCoverIamge = exports.updateVandorProfile = exports.getVandorProfile = exports.loginVandor = void 0;
const adminController_1 = require("./adminController");
const utility_1 = require("../utility");
const model_1 = require("../model");
const loginVandor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingVandor = yield (0, adminController_1.findVandor)('', email);
    if (existingVandor !== null) {
        const validate = yield (0, utility_1.validatePassword)(password, existingVandor.password, existingVandor.salt);
        if (validate) {
            const signature = (0, utility_1.generateSignature)({
                _id: existingVandor.id,
                name: existingVandor.name,
                email: existingVandor.email,
            });
            return res.json({ 'data': existingVandor, 'token': signature });
        }
        else {
            return res.json({ 'message': 'Password not valid.' });
        }
    }
    return res.json({ 'message': 'login credential not valid.' });
});
exports.loginVandor = loginVandor;
const getVandorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVandor = yield (0, adminController_1.findVandor)(user._id);
        return res.json(existingVandor);
    }
    return res.json({ 'message': 'Vandor information not found.' });
});
exports.getVandorProfile = getVandorProfile;
const updateVandorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { foodTypes, name, address, phone } = req.body;
    const user = req.user;
    if (user) {
        const existingVandor = yield (0, adminController_1.findVandor)(user._id);
        if (existingVandor !== null) {
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodTypes;
            const saveResult = yield existingVandor.save();
            return res.json(saveResult);
        }
        return res.json(existingVandor);
    }
    return res.json({ 'message': 'Vandor information not found.' });
});
exports.updateVandorProfile = updateVandorProfile;
const updateVandorCoverIamge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const vandor = yield (0, adminController_1.findVandor)(user._id);
        if (vandor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            vandor.coverImage.push(...images);
            const result = yield vandor.save();
            return res.json(result);
        }
    }
    return res.json({ 'message': 'Something went wrong with add food.' });
});
exports.updateVandorCoverIamge = updateVandorCoverIamge;
const updateVandorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVandor = yield (0, adminController_1.findVandor)(user._id);
        if (existingVandor !== null) {
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
            const saveResult = yield existingVandor.save();
            return res.json(saveResult);
        }
        return res.json(existingVandor);
    }
    return res.json({ 'message': 'Vandor information not found.' });
});
exports.updateVandorService = updateVandorService;
const addFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('srtart');
    const user = req.user;
    if (user) {
        const { name, description, foodType, category, readyTime, price } = req.body;
        const vandor = yield (0, adminController_1.findVandor)(user._id);
        if (vandor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            console.log(files, images);
            const createFoood = yield model_1.food.create({
                vandorId: user._id,
                name: name,
                description: description,
                foodType: foodType,
                category: category,
                readyTime: readyTime,
                price: price,
                images: images,
                rating: 0
            });
            vandor.foods.push(createFoood);
            const result = yield vandor.save();
            return res.json(result);
        }
    }
    return res.json({ 'message': 'Something went wrong with add food.' });
});
exports.addFood = addFood;
const getFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const foods = yield model_1.food.find({ vandorId: user._id });
        return res.json(foods);
    }
    return res.json({ 'message': 'Foods information not found.' });
});
exports.getFoods = getFoods;
//# sourceMappingURL=vandorController.js.map