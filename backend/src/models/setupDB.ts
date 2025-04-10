// src/models/setupDB.ts
import { pool } from "./db";

const createTables = async () => {
  try {
    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);

    // Create Seats Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        row_number INT NOT NULL,
        seat_number INT NOT NULL,
        booked_by INT REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Seed 80 seats (7 per row for 11 rows, 3 seats in row 12)
    let insertQuery = "";
    for (let i = 1; i <= 11; i++) {
      for (let j = 1; j <= 7; j++) {
        insertQuery += `INSERT INTO seats (row_number, seat_number) VALUES (${i}, ${j});\n`;
      }
    }
    for (let j = 1; j <= 3; j++) {
      insertQuery += `INSERT INTO seats (row_number, seat_number) VALUES (12, ${j});\n`;
    }
    await pool.query(insertQuery);

    console.log("✅ Tables created and seats seeded successfully.");
  } catch (err) {
    console.error("❌ Error setting up database:", err);
  } finally {
    await pool.end();
  }
};

createTables();
