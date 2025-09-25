import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({

  connectionString: process.env.DATABASE_URL 
  

});

const db = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(), 
};

export default db;
