"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', contact_controller_1.submitContact);
router.get('/', auth_middleware_1.requireAuth, contact_controller_1.getMessages);
router.patch('/:id/read', auth_middleware_1.requireAuth, contact_controller_1.markRead);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map