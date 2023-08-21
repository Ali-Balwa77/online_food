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
exports.getVandorById = exports.getVandors = exports.createVandor = exports.findVandor = void 0;
const model_1 = require("../model");
const utility_1 = require("../utility");
const findVandor = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        return yield model_1.vandor.findOne({ email: email });
    }
    else {
        return yield model_1.vandor.findById(id);
    }
});
exports.findVandor = findVandor;
const createVandor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, pincode, foodType, email, password, ownerName, phone } = req.body;
    const existingVandor = yield (0, exports.findVandor)('', email);
    if (existingVandor !== null) {
        return res.json({ "message": "A vandor is exist with this email." });
    }
    const salt = yield (0, utility_1.generateSalt)();
    const userPassword = yield (0, utility_1.generatePassword)(password, salt);
    const createVandor = yield model_1.vandor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        ownerName: ownerName,
        phone: phone,
        salt: salt,
        serviceAvailable: false,
        coverImage: [],
        foods: [],
        rating: 0,
    });
    return res.json(createVandor);
});
exports.createVandor = createVandor;
const getVandors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vandors = yield model_1.vandor.find();
    if (vandors !== null) {
        return res.json({ 'data': vandors });
    }
    return res.json({ 'message': 'vandor data not avalaible.' });
});
exports.getVandors = getVandors;
const getVandorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vandorId = req.params.id;
    const vandors = yield (0, exports.findVandor)(vandorId);
    if (vandors !== null) {
        return res.json({ 'data': vandors });
    }
    return res.json({ 'message': 'vandor data not avalaible.' });
});
exports.getVandorById = getVandorById;
//# sourceMappingURL=adminController.js.map