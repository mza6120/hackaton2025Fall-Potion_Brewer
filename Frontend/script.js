// ===== Potion Craft Garden - Game Logic =====

class PotionCraftGame {
    constructor() {
        // Game State
        this.plants = [];
        this.harvestedIngredients = [];
        this.preparedIngredients = [];
        this.craftedPotions = [];
        
        // UI State
        this.currentTab = 'garden';
        this.harvestMode = false;
        this.currentChopIngredient = null;
        this.currentGrindIngredient = null;
        this.currentDehydrateIngredient = null;
        this.cauldronIngredients = [];
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupTabs();
        this.setupGarden();
        this.setupPreparation();
        this.setupPotionCraft();
        this.setupSell();
    }
    
    // ===== TAB NAVIGATION =====
    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }
    
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
        
        this.currentTab = tabId;
        
        // If switching to potion craft tab, render prepared ingredients
        if (tabId === 'potion-craft') {
            this.renderPreparedForCraft();
        }
        
        // If switching to sell tab, update inventory
        if (tabId === 'sell') {
            this.updateSellInventory();
        }
    }
    
    // ===== GARDEN TAB =====
    setupGarden() {
        const seeds = document.querySelectorAll('.seed');
        const garden = document.getElementById('garden');
        const plantsLayer = garden.querySelector('.plants-layer');
        const harvestTool = document.getElementById('harvest-tool');
        
        // Plant drag and drop
        seeds.forEach(seed => {
            seed.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('plant-type', e.target.dataset.plant);
                e.target.style.opacity = '0.5';
            });
            
            seed.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });
        
        // Garden drop zone
        garden.addEventListener('dragover', (e) => e.preventDefault());
        garden.addEventListener('drop', (e) => {
            e.preventDefault();
            const plantType = e.dataTransfer.getData('plant-type');
            const rect = garden.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.plantSeed(plantType, x, y);
        });
        
        // Harvest tool toggle
        harvestTool.addEventListener('click', () => {
            this.harvestMode = !this.harvestMode;
            harvestTool.classList.toggle('active', this.harvestMode);
            
            if (this.harvestMode) {
                harvestTool.style.cursor = 'crosshair';
                this.highlightReadyPlants();
            } else {
                harvestTool.style.cursor = 'pointer';
                this.clearHighlights();
            }
        });
        
        // Harvest on plant click
        document.addEventListener('click', (e) => {
            if (this.harvestMode && e.target.closest('.planted-item.ready')) {
                const plant = e.target.closest('.planted-item');
                this.harvestPlant(plant);
            }
        });
        
        // Update stats every second
        setInterval(() => this.updateStats(), 1000);
    }
    
    plantSeed(type, x, y) {
        const plant = {
            id: Date.now(),
            type: type,
            x: x,
            y: y,
            plantedAt: Date.now(),
            growthTime: 15000, // 15 seconds
            state: 'growing'
        };
        
        this.plants.push(plant);
        this.renderPlant(plant);
    }
    
    renderPlant(plant) {
        const plantsLayer = document.querySelector('.plants-layer');
        const plantDiv = document.createElement('div');
        plantDiv.className = 'planted-item';
        plantDiv.dataset.id = plant.id;
        plantDiv.style.left = `${plant.x}px`;
        plantDiv.style.top = `${plant.y}px`;
        
        const emoji = this.getPlantEmoji(plant.type);
        plantDiv.innerHTML = emoji;
        
        plantsLayer.appendChild(plantDiv);
    }
    
    getPlantEmoji(type) {
        const emojis = {
            lavender: '🌺',
            ginseng: '🌿',
            mint: '🌿',
            mushroom: '🍄',
            thyme: '🌿',
            sage: '🌿'
        };
        return emojis[type] || '🌱';
    }
    
    highlightReadyPlants() {
        document.querySelectorAll('.planted-item.ready').forEach(plant => {
            plant.classList.add('harvestable');
        });
    }
    
    clearHighlights() {
        document.querySelectorAll('.planted-item').forEach(plant => {
            plant.classList.remove('harvestable');
        });
    }
    
    harvestPlant(plantElement) {
        const plantId = parseInt(plantElement.dataset.id);
        const plant = this.plants.find(p => p.id === plantId);
        
        if (plant && plant.state === 'ready') {
            // Add to harvested ingredients
            this.harvestedIngredients.push(plant.type);
            
            // Remove from garden
            plantElement.remove();
            this.plants = this.plants.filter(p => p.id !== plantId);
            
            // Update UI
            this.renderHarvestedIngredients();
            this.updateStats();
            
            // Turn off harvest mode
            this.harvestMode = false;
            document.getElementById('harvest-tool').classList.remove('active');
            this.clearHighlights();
        }
    }
    
    renderHarvestedIngredients() {
        const container = document.getElementById('ingredients-list');
        container.innerHTML = '';
        
        this.harvestedIngredients.forEach((ingredient, index) => {
            const item = document.createElement('div');
            item.className = 'ingredient-item';
            item.draggable = true;
            item.dataset.ingredient = ingredient;
            item.dataset.index = index;
            item.innerHTML = `
                <span>${this.getPlantEmoji(ingredient)}</span>
                <span>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</span>
            `;
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('ingredient-type', ingredient);
                e.dataTransfer.setData('source', 'harvested');
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });
            
            container.appendChild(item);
        });
    }
    
    updateStats() {
        const now = Date.now();
        let growing = 0;
        let ready = 0;
        let harvested = this.harvestedIngredients.length;
        
        // Check plant states
        document.querySelectorAll('.planted-item').forEach(plantEl => {
            const plantId = parseInt(plantEl.dataset.id);
            const plant = this.plants.find(p => p.id === plantId);
            
            if (plant) {
                const age = now - plant.plantedAt;
                
                if (age >= plant.growthTime && plant.state !== 'ready') {
                    plant.state = 'ready';
                    plantEl.classList.add('ready');
                    plantEl.classList.remove('growing');
                } else if (age < plant.growthTime && plant.state === 'growing') {
                    plantEl.classList.add('growing');
                }
                
                if (plant.state === 'growing') growing++;
                if (plant.state === 'ready') ready++;
            }
        });
        
        // Update display
        document.getElementById('growing-count').textContent = growing;
        document.getElementById('ready-count').textContent = ready;
        document.getElementById('harvested-count').textContent = harvested;
    }
    
    // ===== PREPARATION TAB =====
    setupPreparation() {
        this.setupTool('chop', 'chop-slot', 'tool-board', 'chopping');
        this.setupTool('grind', 'grind-slot', 'tool-mortar', 'grinding');
        this.setupTool('dehydrate', 'dehydrate-slot', 'tool-dehydrator', 'dehydrating');
    }
    
    setupTool(action, slotId, toolClass, animClass) {
        const slot = document.getElementById(slotId);
        const tool = document.querySelector(`.${toolClass}`);
        const button = tool.querySelector('.action-btn');
        
        // Drop zone
        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            const ingredientType = e.dataTransfer.getData('ingredient-type');
            
            if (ingredientType && slot.textContent === this.getSlotHint(action)) {
                this.addIngredientToTool(action, ingredientType, slot);
            }
        });
        
        // Action button
        button.addEventListener('click', () => {
            if (this[`current${action.charAt(0).toUpperCase() + action.slice(1)}Ingredient`]) {
                this.processIngredient(action, tool, animClass);
            }
        });
    }
    
    getSlotHint(action) {
        const hints = {
            chop: 'Drop ingredient to chop',
            grind: 'Drop ingredient to grind',
            dehydrate: 'Drop ingredient to dehydrate'
        };
        return hints[action];
    }
    
    addIngredientToTool(action, ingredientType, slot) {
        this[`current${action.charAt(0).toUpperCase() + action.slice(1)}Ingredient`] = ingredientType;
        slot.innerHTML = `
            <span>${this.getPlantEmoji(ingredientType)}</span>
            <span>${ingredientType.charAt(0).toUpperCase() + ingredientType.slice(1)}</span>
        `;
        slot.classList.add('has-ingredient');
    }
    
    processIngredient(action, tool, animClass) {
        const ingredient = this[`current${action.charAt(0).toUpperCase() + action.slice(1)}Ingredient`];
        
        // Add animation
        tool.classList.add(animClass);
        
        // Process after animation
        setTimeout(() => {
            const preparedType = this.createPreparedIngredient(ingredient, action);
            this.preparedIngredients.push(preparedType);
            
            // Clear tool
            const slotId = `${action}-slot`;
            const slot = document.getElementById(slotId);
            slot.textContent = this.getSlotHint(action);
            slot.classList.remove('has-ingredient');
            this[`current${action.charAt(0).toUpperCase() + action.slice(1)}Ingredient`] = null;
            
            // Remove from harvested
            const index = this.harvestedIngredients.indexOf(ingredient);
            if (index > -1) {
                this.harvestedIngredients.splice(index, 1);
            }
            
            // Update UI
            this.renderHarvestedIngredients();
            this.renderPreparedIngredients();
            this.renderPreparedForCraft();
            
            // Remove animation
            tool.classList.remove(animClass);
        }, 1500);
    }
    
    createPreparedIngredient(ingredient, method) {
        // Handle irregular verbs
        const verbMap = {
            chop: 'chopped',
            grind: 'ground',
            dehydrate: 'dehydrated'
        };
        
        const pastTense = verbMap[method] || `${method}ed`;
        return `${pastTense}-${ingredient}`;
    }
    
    renderPreparedIngredients() {
        const container = document.getElementById('prepared-list');
        container.innerHTML = '';
        
        this.preparedIngredients.forEach((ingredient, index) => {
            const item = document.createElement('div');
            item.className = 'prepared-item';
            item.draggable = true;
            item.dataset.ingredient = ingredient;
            item.dataset.index = index;
            
            const [method, type] = ingredient.split('-');
            item.innerHTML = `
                <span>${this.getPreparedEmoji(method)}</span>
                <span>${method.charAt(0).toUpperCase() + method.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            `;
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('ingredient-type', ingredient);
                e.dataTransfer.setData('source', 'prepared');
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });
            
            container.appendChild(item);
        });
    }
    
    renderPreparedForCraft() {
        const container = document.getElementById('prepared-inventory-for-craft');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.preparedIngredients.forEach((ingredient, index) => {
            const item = document.createElement('div');
            item.className = 'prepared-item';
            item.draggable = true;
            item.dataset.ingredient = ingredient;
            item.dataset.index = index;
            
            const [method, type] = ingredient.split('-');
            item.innerHTML = `
                <span>${this.getPreparedEmoji(method)}</span>
                <span>${method.charAt(0).toUpperCase() + method.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            `;
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('ingredient-type', ingredient);
                e.dataTransfer.setData('source', 'prepared');
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });
            
            container.appendChild(item);
        });
    }
    
    getPreparedEmoji(method) {
        const emojis = {
            chopped: '🪓',
            ground: '⚱️',
            dehydrated: '🔥'
        };
        return emojis[method] || '🍃';
    }
    
    // ===== POTION CRAFT TAB =====
    setupPotionCraft() {
        const slots = ['slot-1', 'slot-2'];
        const brewBtn = document.getElementById('brew-btn');
        
        slots.forEach(slotId => {
            const slot = document.getElementById(slotId);
            
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const ingredient = e.dataTransfer.getData('ingredient-type');
                const source = e.dataTransfer.getData('source');
                
                if (ingredient && source === 'prepared' && !slot.classList.contains('has-ingredient')) {
                    this.addToCauldron(slotId, ingredient, slot);
                }
            });
        });
        
        brewBtn.addEventListener('click', () => {
            this.brewPotion();
        });
    }
    
    addToCauldron(slotId, ingredient, slotElement) {
        const [method, type] = ingredient.split('-');
        
        this.cauldronIngredients.push(ingredient);
        slotElement.innerHTML = `
            <span>${this.getPreparedEmoji(method)}</span>
            <span>${method.charAt(0).toUpperCase() + method.slice(1)} ${type}</span>
        `;
        slotElement.classList.add('has-ingredient');
        
        // Remove ingredient from prepared ingredients list
        const index = this.preparedIngredients.indexOf(ingredient);
        if (index > -1) {
            this.preparedIngredients.splice(index, 1);
        }
        
        // Update UI to reflect the removal
        this.renderPreparedIngredients();
        this.renderPreparedForCraft();
    }
    
    brewPotion() {
        if (this.cauldronIngredients.length !== 2) {
            alert('Add 2 prepared ingredients to brew a potion!');
            return;
        }
        
        const potion = this.findPotionRecipe(this.cauldronIngredients);
        
        if (potion) {
            this.craftedPotions.push(potion);
            this.renderPotions();
            this.clearCauldron();
            alert(`Successfully crafted: ${potion}!`);
        } else {
            alert('That combination doesn\'t create any known potion!');
        }
    }
    
    findPotionRecipe(ingredients) {
        const recipes = {
            'chopped-lavender,ground-ginseng': '💚 Health Potion',
            'ground-ginseng,chopped-lavender': '💚 Health Potion',
            'ground-mint,dehydrated-mushroom': '🔮 Mana Potion',
            'dehydrated-mushroom,ground-mint': '🔮 Mana Potion',
            'chopped-thyme,dehydrated-sage': '⚡ Energy Potion',
            'dehydrated-sage,chopped-thyme': '⚡ Energy Potion'
        };
        
        const key = ingredients.join(',');
        return recipes[key] || null;
    }
    
    clearCauldron() {
        this.cauldronIngredients = [];
        document.getElementById('slot-1').innerHTML = 'Ingredient 1';
        document.getElementById('slot-1').classList.remove('has-ingredient');
        document.getElementById('slot-2').innerHTML = 'Ingredient 2';
        document.getElementById('slot-2').classList.remove('has-ingredient');
    }
    
    renderPotions() {
        const container = document.getElementById('potions-list');
        container.innerHTML = '';
        
        this.craftedPotions.forEach(potion => {
            const item = document.createElement('div');
            item.className = 'potion-item';
            item.textContent = potion;
            container.appendChild(item);
        });
        
        // Also update sell tab inventory
        this.updateSellInventory();
    }
    
    // ===== SELL TAB =====
    setupSell() {
        const newBuyerBtn = document.getElementById('new-buyer-btn');
        const sellInventory = document.getElementById('potions-to-sell');
        
        // Load initial buyer
        this.loadNewBuyer();
        
        // New buyer button
        newBuyerBtn.addEventListener('click', () => {
            this.loadNewBuyer();
        });
        
        // Setup sell inventory rendering
        this.updateSellInventory();
    }
    
    loadNewBuyer() {
        fetch('/api/buyer')
            .then(res => res.json())
            .then(data => {
                document.getElementById('buyer-message').textContent = data.message;
                this.currentBuyerType = data.type;
            })
            .catch(err => console.error('Error loading buyer:', err));
    }
    
    updateSellInventory() {
        const container = document.getElementById('potions-to-sell');
        container.innerHTML = '';
        
        // Count potions
        const potionCount = {
            'health': 0,
            'mana': 0,
            'energy': 0
        };
        
        this.craftedPotions.forEach(potion => {
            const lower = potion.toLowerCase();
            if (lower.includes('health')) potionCount.health++;
            if (lower.includes('mana')) potionCount.mana++;
            if (lower.includes('energy')) potionCount.energy++;
        });
        
        // Create sellable potions
        Object.keys(potionCount).forEach(type => {
            const count = potionCount[type];
            if (count > 0) {
                const item = document.createElement('div');
                item.className = 'potion-for-sale';
                item.textContent = `${count}x ${type.charAt(0).toUpperCase() + type.slice(1)} Potion`;
                item.dataset.potionType = type;
                
                item.addEventListener('click', () => this.sellPotion(type));
                container.appendChild(item);
            }
        });
        
        if (this.craftedPotions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; font-style: italic;">No potions to sell yet!</p>';
        }
    }
    
    sellPotion(potionType) {
        fetch('/api/sell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ potionType })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Remove sold potion from local inventory
                const index = this.craftedPotions.findIndex(p => 
                    p.toLowerCase().includes(potionType)
                );
                if (index > -1) {
                    this.craftedPotions.splice(index, 1);
                }
                
                // Update UI
                this.updateSellInventory();
                document.getElementById('score-display').textContent = data.score;
                
                // Load new buyer after sale
                this.loadNewBuyer();
                
                // Show success message
                alert(data.message);
            } else {
                alert(data.message);
            }
        })
        .catch(err => console.error('Error selling potion:', err));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PotionCraftGame();
});
