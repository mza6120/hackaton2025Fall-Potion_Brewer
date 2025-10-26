const express = require('express');
const cors = require('cors');
const path = require('path');
const { getRandomBuyerRequest } = require('./ai-assistant');

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
    craftedPotions: [],
    score: 0 // Points from selling potions
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
        craftedPotions: [],
        score: 0
    };
    res.json({ success: true, gameState });
});

// Get random buyer request
app.get('/api/buyer', (req, res) => {
    const buyerRequest = getRandomBuyerRequest();
    res.json(buyerRequest);
});

// Sell potion
app.post('/api/sell', (req, res) => {
    const { potionType } = req.body;
    
    // Remove one potion of this type from crafted potions
    const potionIndex = gameState.craftedPotions.findIndex(p => p.toLowerCase().includes(potionType));
    
    if (potionIndex !== -1) {
        gameState.craftedPotions.splice(potionIndex, 1);
        gameState.score += 1;
        res.json({ success: true, score: gameState.score, message: 'Potion sold! +1 point' });
    } else {
        res.json({ success: false, message: 'You don\'t have that potion to sell!' });
    }
});

// Serve frontend - must be last after all other routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open your browser and go to: http://localhost:${PORT}`);
});
