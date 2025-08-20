
import { Pool } from 'pg';

// Create a connection pool to Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // Enable CORS for your frontend domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all tasks
      const result = await pool.query(
        'SELECT taskid, taskname, datetimecreated FROM tasks ORDER BY datetimecreated DESC'
      );
      
      res.status(200).json(result.rows);
      
    } else if (req.method === 'POST') {
      // Create new task
      const { taskname } = req.body;
      
      if (!taskname || taskname.trim() === '') {
        return res.status(400).json({ error: 'Task name is required' });
      }
      
      const result = await pool.query(
        'INSERT INTO tasks (taskname, datetimecreated) VALUES ($1, NOW()) RETURNING *',
        [taskname.trim()]
      );
      
      res.status(201).json(result.rows[0]);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}