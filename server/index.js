require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 8080;
const secretKey = process.env.SECRET_KEY; 
const clientDomain = 'http://localhost:5173';

//const secret = crypto.randomBytes(32).toString('hex'); // Generate a 32-byte (256-bit) random key
app.use(bodyParser.json()); 

app.use(cors({
    origin: clientDomain, 
    credentials: true 
  }));

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
  });


//   REGISTER  NEW USERS
app.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      if(!password) {
        return res.status(400).json({ error: 'Password is required' })
      }  

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(406).json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }
      
    const existingUser = await pool.query(
      'SELECT * FROM cander_apps_users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      res.setHeader('Content-Type', 'application/json')
      return res.status(403).json({ error: 'E-mail already in use' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
  
      await pool.query(
        'INSERT INTO cander_apps_users (email, password) VALUES ($1, $2)',
        [email, hashedPassword]
      );
      res.setHeader('Content-Type', 'application/json')
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  });




// LOGIN ROUTE
app.post('/login', async (req, res) => {
    try {
    const { email, password } = req.body;
    const user = await pool.query (
        'SELECT * FROM cander_apps_users where email = $1',
        [email]
    );
    if (user.rows.length === 0) {
        return res.status(401).json('Invalid credentials');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
  
      if (!isPasswordValid) {
        return res.status(401).json('Invalid credentials');
      }
      
      const token = jwt.sign({ user: user.rows[0].user_id }, secretKey);      
      
      res.json({ token, email });

    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Retrieve all tiles
app.get('/tiles', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tiles ORDER BY tile_order');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving tiles');
    }
  });

// Add a new tile
app.post('/tiles', async (req, res) => {
    const { content, url, favicon } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO tiles (content, url, favicon, tile_order) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(tile_order), 0) + 1 FROM tiles)) RETURNING *',
        [content, url, favicon]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding tile');
    }
  });
  
  // Update the order of tiles
  app.put('/tiles/order', async (req, res) => {
    const { orderedTiles } = req.body;
    try {
      await pool.query('BEGIN');
      for (let i = 0; i < orderedTiles.length; i++) {
        await pool.query(
          'UPDATE tiles SET tile_order = $1 WHERE id = $2',
          [i + 1, orderedTiles[i].id]
        );
      }
      await pool.query('COMMIT');
      res.send('Tile order updated');
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(error);
      res.status(500).send('Error updating tile order');
    }
  });
  
  // Remove a tile
  app.delete('/tiles/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM tiles WHERE id = $1', [id]);
      res.send('Tile removed');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error removing tile');
    }
  });



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});