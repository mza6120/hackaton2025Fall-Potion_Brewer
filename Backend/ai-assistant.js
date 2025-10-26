// AI Assistant for generating buyer requests in the Sell tab

const buyerMessages = {
    health: [
        "I need a health potion! My wounds won't stop bleeding!",
        "Looking for something to heal my injuries, got any health potions?",
        "A health potion would really help right now!",
        "Can you help me? I need a potion for healing!",
        "I'm hurt! Do you have a health potion to spare?",
        "This adventuring is tough! I need a healing potion!",
        "Seeking a health potion for my injured friend!",
        "The dungeon was harsh! Got a healing potion?",
        "My health is low, need a health potion badly!",
        "Please, I need a health potion urgently!"
    ],
    
    mana: [
        "I'm out of magic! Need a mana potion!",
        "Seeking a mana potion to restore my magical energy!",
        "My spells are drained! Got a mana potion?",
        "I need to cast spells but have no mana! Help!",
        "Looking to buy a mana potion!",
        "Can you spare a mana potion for this weary mage?",
        "Magic flows through me but my reserves are empty! Mana potion please!",
        "Need a mana potion to continue my magical studies!",
        "I've been studying spells all day! Need a mana potion!",
        "My magical energy is depleted! Mana potion needed!"
    ],
    
    energy: [
        "I'm exhausted! Need an energy potion!",
        "This quest has drained me! Looking for an energy potion!",
        "Can I get an energy potion? I'm running on fumes!",
        "Need an energy boost! Got any energy potions?",
        "I'm so tired! An energy potion would be amazing!",
        "Seeking an energy potion to continue my journey!",
        "My stamina is gone! Need an energy potion badly!",
        "This adventuring life is exhausting! Energy potion please!",
        "I've been traveling for days! Need an energy potion!",
        "Looking for an energy potion to keep going!"
    ]
};

function getBuyerMessage(potionType) {
    const messages = buyerMessages[potionType] || buyerMessages.health;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

function getRandomBuyerRequest() {
    const potionTypes = ['health', 'mana', 'energy'];
    const randomType = potionTypes[Math.floor(Math.random() * potionTypes.length)];
    
    return {
        type: randomType,
        message: getBuyerMessage(randomType)
    };
}

module.exports = {
    getBuyerMessage,
    getRandomBuyerRequest
};
