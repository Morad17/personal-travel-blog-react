"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gallery_controller_1 = require("../controllers/gallery.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cloudinary_service_1 = require("../services/cloudinary.service");
const router = (0, express_1.Router)();
router.get('/', gallery_controller_1.getGallery);
router.post('/', auth_middleware_1.requireAuth, cloudinary_service_1.uploadGallery.array('files', 50), gallery_controller_1.createGalleryItems);
router.put('/:id', auth_middleware_1.requireAuth, gallery_controller_1.updateGalleryItem);
router.delete('/:id', auth_middleware_1.requireAuth, gallery_controller_1.deleteGalleryItem);
exports.default = router;
//# sourceMappingURL=gallery.routes.js.map