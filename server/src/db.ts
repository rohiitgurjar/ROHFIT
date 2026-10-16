import { Pool } from "pg"; // imports PostgreSQL connection pool

const pool = new Pool({
    host : "localhost",
    port: 5432,
    database: "rohfit_dev",
    user: process.env.USER,
});

export default pool;
