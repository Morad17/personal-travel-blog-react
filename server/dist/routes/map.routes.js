"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const map_controller_1 = require("../controllers/map.controller");
const router = (0, express_1.Router)();
router.get('/visited', map_controller_1.getVisitedCountries);
exports.default = router;
//# sourceMappingURL=map.routes.js.map