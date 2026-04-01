"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posts_controller_1 = require("../controllers/posts.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cloudinary_service_1 = require("../services/cloudinary.service");
const router = (0, express_1.Router)();
router.get('/', posts_controller_1.getPosts);
router.get('/featured', posts_controller_1.getFeaturedPosts);
router.get('/:slug', posts_controller_1.getPostBySlug);
router.post('/', auth_middleware_1.requireAuth, cloudinary_service_1.uploadImage.single('coverImage'), posts_controller_1.createPost);
router.put('/:id', auth_middleware_1.requireAuth, cloudinary_service_1.uploadImage.single('coverImage'), posts_controller_1.updatePost);
router.delete('/:id', auth_middleware_1.requireAuth, posts_controller_1.deletePost);
router.post('/:id/media', auth_middleware_1.requireAuth, cloudinary_service_1.uploadMedia.array('files', 20), posts_controller_1.addPostMedia);
router.delete('/:id/media/:mediaId', auth_middleware_1.requireAuth, posts_controller_1.deletePostMedia);
exports.default = router;
//# sourceMappingURL=posts.routes.js.map