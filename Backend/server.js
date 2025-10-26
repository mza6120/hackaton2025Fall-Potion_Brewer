const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// In-memory game state (in production, you'd use a database)
let gameState = {
    plants: [],
    harvestedIngredients: [],
    preparedIngredients: [],
    craftedPotions: []
};

// API Routes
// Get game state
app.get('/api/game', (req, res) => {
    res.json(gameState);
});

// Update game state
app.post('/api/game', (req, res) => {
    gameState = { ...gameState, ...req.body };
    res.json({ success: true, gameState });
});

// Save game state
app.post('/api/save', (req, res) => {
    // In a real app, you'd save to a database
    gameState = req.body;
    res.json({ success: true, message: 'Game saved successfully' });
});

// Reset game
app.post('/api/reset', (req, res) => {
    gameState = {
        plants: [],
        harvestedIngredients: [],
        preparedIngredients: [],
        craftedPotions: []
    };
    res.json({ success: true, gameState });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
