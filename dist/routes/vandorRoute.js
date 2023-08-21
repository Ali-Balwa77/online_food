"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vandorRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
exports.vandorRoute = router;
const imageStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '_' + file.originalname);
    }
});
const images = (0, multer_1.default)({ storage: imageStorage }).array('images', 10);
router.post('/login', controllers_1.loginVandor);
router.use(middleware_1.Authenticate);
router.get('/profile', controllers_1.getVandorProfile);
router.patch('/profile', controllers_1.updateVandorProfile);
router.patch('/coverimage', images, controllers_1.updateVandorCoverIamge);
router.patch('/service', controllers_1.updateVandorService);
router.post('/food', images, controllers_1.addFood);
router.get('/food', controllers_1.getFoods);
router.get('/', (req, res, next) => {
    res.json({ message: "Hello from Vandor" });
});
//# sourceMappingURL=vandorRoute.js.map