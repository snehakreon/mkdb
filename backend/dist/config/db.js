"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool(process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
        query_timeout: 10000,
        statement_timeout: 10000,
    }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "material_king",
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
        query_timeout: 10000,
        statement_timeout: 10000,
    });
pool.on("connect", () => {
    console.log("PostgreSQL connected");
});
pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err.message);
});
exports.default = pool;
//# sourceMappingURL=db.js.map