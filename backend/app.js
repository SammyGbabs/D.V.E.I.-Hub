import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/user.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Unified CORS configuration
app.use(cors({
    origin: 'http://127.0.0.1:5501',
    credentials: true
}));

app.use(express.json());

// Use client app
app.use(express.static(path.join(__dirname, '/client/build')));

// Render client for any path
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://sbabalola:Samuel2006@cluster0.xpc6u25.mongodb.net/dvei', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({ error: "Email already in use." });
        }

        // Create a new user in the database with the hashed password
        const user = new User({
            email: email.toLowerCase(),
            password: password,
            name,
            role
        });
        await user.save();

        res.setHeader('Content-Type', 'text/html');
        res.json({ message: 'Registration successful, please login'});
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email exists in the database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid email or password. Please try again.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));