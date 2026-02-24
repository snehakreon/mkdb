import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: "postgres",
  password: process.env.DB_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "material_king",
});

pool.on("connect", () => {
  console.log("PostgreSQL Connected");
});

export default pool;
