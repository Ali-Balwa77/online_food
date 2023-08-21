"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shoppingRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
exports.shoppingRoute = router;
/** ------------------ Food Availability ----------------- */
router.get('/:pincode', controllers_1.getFoodAvailability);
/** ------------------ Top Restuarants ------------------- */
router.get('/top-restuarants/:pincode', controllers_1.getTopRestuarants);
/** ------------------ Foods Available in 30 Minutes ------------------- */
router.get('/foods-in-30-min/:pincode', controllers_1.getFoodsIn30Min);
/** ------------------ Search Foods ------------------- */
router.get('/search/:pincode', controllers_1.searchFoods);
/** ------------------ Find Restuarant by ID ------------------- */
router.get('/restuarant/:id', controllers_1.restuarantById);
//# sourceMappingURL=shoppingRoute.js.map