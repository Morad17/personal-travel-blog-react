"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const countries_routes_1 = __importDefault(require("./countries.routes"));
const posts_routes_1 = __importDefault(require("./posts.routes"));
const gallery_routes_1 = __importDefault(require("./gallery.routes"));
const contact_routes_1 = __importDefault(require("./contact.routes"));
const map_routes_1 = __importDefault(require("./map.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/countries', countries_routes_1.default);
router.use('/posts', posts_routes_1.default);
router.use('/gallery', gallery_routes_1.default);
router.use('/contact', contact_routes_1.default);
router.use('/map', map_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map