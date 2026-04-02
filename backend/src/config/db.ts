import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool(
  process.env.DATABASE_URL
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
        connectionTimeoutMillis: 5000,
        query_timeout: 10000,
        statement_timeout: 10000,
      }
);

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});

export default pool;
