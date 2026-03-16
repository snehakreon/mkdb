import app from "./app";
import pool from "./config/db";

const PORT = parseInt(process.env.PORT || "5000");

pool.query("SELECT NOW()")
  .then((res) => {
    console.log("DB connected:", res.rows[0].now);
  })
  .catch((err) => {
    console.error("DB connection error:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Material King API running on port ${PORT}`);
});
