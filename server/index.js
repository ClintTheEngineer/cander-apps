require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 8080;
const secretKey = process.env.SECRET_KEY; 
const { encrypt, decrypt } = require('./encryption');
const { passwordGenerator, generatedPassword } = require('./passwordgenerator');
const clientDomain = process.env.CLIENT_DOMAIN;
const nodemailer = require('nodemailer');
const crypto = require('crypto');

app.use(bodyParser.json()); 

app.use(cors({
    origin: `${clientDomain}/login`, 
    credentials: true 
  }));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
  });


  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; 

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.sendStatus(403); 
        }
        req.user = user; 
        next(); 
    });
};


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
      
      const token = jwt.sign({ userId: user.rows[0].id }, secretKey);      
     
      
      res.json({ token, email });

    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Retrieve all tiles
app.get('/tiles', authenticateToken, async (req, res) => {
  const userId = req.user.userId; 
  try {
      const result = await pool.query('SELECT * FROM tiles WHERE user_id = $1 ORDER BY tile_order', [userId]);
      res.json(result.rows);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving tiles');
  }
});


// Add a new tile
app.post('/tiles', authenticateToken, async (req, res) => {
  const { content, url, favicon } = req.body;
  const userId = req.user.userId;

  try {
      const result = await pool.query(
          'INSERT INTO tiles (content, url, favicon, tile_order, user_id) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(tile_order), 0) + 1 FROM tiles WHERE user_id = $4), $4) RETURNING *',
          [content, url, favicon, userId] 
      );
      res.json(result.rows[0]);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error adding tile');
  }
});

  
  // Update the order of tiles
  app.put('/tiles/order', authenticateToken, async (req, res) => {
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
  app.delete('/tiles/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM tiles WHERE id = $1', [id]);
      res.send('Tile removed');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error removing tile');
    }
  });

  app.get('/entries', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query('SELECT id, siteName, url, username FROM entries WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/entries/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
      const result = await pool.query('SELECT * FROM entries WHERE id = $1 AND user_id = $2', [id, userId]);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Entry not found' });
      }

      const entry = result.rows[0];
      const decryptedPassword = decrypt(entry.password, entry.iv);
      res.json({ ...entry, password: decryptedPassword });
  } catch (error) {
      console.error('Error fetching entry:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/entries', authenticateToken, async (req, res) => {
  const { siteName, url, username, password } = req.body;
  const userId = req.user.userId;

  if (!siteName || !url || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  try {
      const { iv, encryptedData } = encrypt(password);
      const result = await pool.query(
          'INSERT INTO entries (siteName, url, username, password, iv, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [siteName, url, username, encryptedData, iv, userId]
      );
      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error inserting entry:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT route to update an existing entry
app.put('/entries/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { siteName, url, username, password } = req.body;
  const userId = req.user.userId;

  if (!siteName || !url || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  try {
      const { iv, encryptedData } = encrypt(password);
      const result = await pool.query(
          'UPDATE entries SET siteName = $1, url = $2, username = $3, password = $4, iv = $5, id = $6 WHERE user_id = $6 RETURNING *',
          [siteName, url, username, encryptedData, iv, id]
      );
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Entry not found' });
      }
      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error updating entry:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE route to delete an existing entry
app.delete('/entries/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const result = await pool.query('DELETE FROM entries WHERE id = $1 AND user_id = $3 RETURNING *', [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const randomLength =()=>{
  return Math.floor(Math.random() * (34 - 12 + 1)+ 12) 
}

app.get('/test-password', (req, res) => {
  try {
  const password = passwordGenerator('yes', 'yes');
  res.json({ password });
  } catch (error) {
      res.status(400).send(error)
      console.log(error)
  }    
})


app.post('/generate-password', async (req, res) => {
  try {
      const randomLengthChoice = 'Y'
      const specialCharsChoice = 'Y'
      const userPasswordLength = randomLength();
      const generatedPassword = passwordGenerator(randomLengthChoice, specialCharsChoice, userPasswordLength);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ generatedPassword });
  } catch (error) {
      res.status(401).json({ error: error.message })
  }
})


// Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD  
  }
});

// Forgot Password Route
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
      const user = await pool.query('SELECT * FROM cander_apps_users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Generate a reset token
      const token = crypto.randomBytes(20).toString('hex');
      const expiryDate = new Date(Date.now() + 3600000); // Token valid for 1 hour

      // Update or insert the token in the reset_tokens table
      await pool.query(
          'INSERT INTO cander_apps_reset_tokens (token, email, expiration_time) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET token = $1, expiration_time = $3',
          [token, email, expiryDate]
      );

      // Send email with the token
      const resetUrl = `${clientDomain}/reset-password/?token=${token}`;
      await transporter.sendMail({
          to: email,
          subject: 'Password Reset',
          text: `You are receiving this email because you (or someone else) have requested the reset of a password.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `${resetUrl}\n\n` +
                `If you did not request this, please ignore this email.`
      });

      res.status(200).json({ message: 'Password reset link sent to email' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Reset Password Route
app.post('/reset-password/:token', async (req, res) => {
  
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
      const user = await pool.query('SELECT * FROM cander_apps_reset_tokens WHERE token = $1 AND expiration_time > $2', [token, new Date(Date.now())]);

      if (user.rows.length === 0) {
          return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const email = user.rows[0].email;

      // Validate new password 
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
          return res.status(406).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the cander_apps_users table
      await pool.query('UPDATE cander_apps_users SET password = $1 WHERE email = $2', [hashedPassword, email]);

      await pool.query('DELETE FROM cander_apps_reset_tokens WHERE token = $1', [token]);

      res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/validate-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
      const tokenResult = await pool.query('SELECT * FROM cander_apps_reset_tokens WHERE token = $1 AND expiration_time > $2', [token, new Date(Date.now())]);

      if (tokenResult.rows.length === 0) {
          return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
      }

      res.status(200).json({ valid: true, email: tokenResult.rows[0].email });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});