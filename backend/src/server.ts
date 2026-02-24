import app from "./app";
import pool from "./config/db";

const PORT = 5000;

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("DB Connection Error:", err);
  } else {
    console.log("DB Connected:", res.rows[0]);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
