"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const countries_controller_1 = require("../controllers/countries.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cloudinary_service_1 = require("../services/cloudinary.service");
const router = (0, express_1.Router)();
router.get('/', countries_controller_1.getCountries);
router.get('/:slug', countries_controller_1.getCountryBySlug);
router.post('/', auth_middleware_1.requireAuth, cloudinary_service_1.uploadImage.single('coverImage'), countries_controller_1.createCountry);
router.put('/:id', auth_middleware_1.requireAuth, cloudinary_service_1.uploadImage.single('coverImage'), countries_controller_1.updateCountry);
router.delete('/:id', auth_middleware_1.requireAuth, countries_controller_1.deleteCountry);
exports.default = router;
//# sourceMappingURL=countries.routes.js.map