"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = parseInt(process.env.PORT || "5000");
db_1.default.query("SELECT NOW()")
    .then((res) => {
    console.log("DB connected:", res.rows[0].now);
})
    .catch((err) => {
    console.error("DB connection error:", err.message);
});
app_1.default.listen(PORT, () => {
    console.log(`Material King API running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map