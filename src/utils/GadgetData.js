export const GADGET_TYPES = {
    TURRET: 'turret',
    FORCE_FIELD: 'force_field',
    SPECIAL_SHOT: 'special_shot'
};

export const ELEMENTS = {
    ELECTRIC: { id: 'electric', name: 'ELECTRIC', color: 0x00f2ff, icon: '⚡' },
    FORCE: { id: 'force', name: 'FORCE', color: 0xffffff, icon: '💪' },
    FIRE: { id: 'fire', name: 'FIRE', color: 0xff4400, icon: '🔥' },
    POISON: { id: 'poison', name: 'POISON', color: 0x00ff00, icon: '🧪' },
    PUSH: { id: 'push', name: 'PUSH', color: 0xff00ff, icon: '💨' }
};

export const GADGET_DEFINITIONS = [
    // Turrets
    { type: GADGET_TYPES.TURRET, element: 'electric', name: 'TESLA COIL', desc: 'Arcs lightning between enemies.' },
    { type: GADGET_TYPES.TURRET, element: 'force', name: 'KINETIC SENTRY', desc: 'Ultra-fast physical rounds.' },
    { type: GADGET_TYPES.TURRET, element: 'fire', name: 'FLAME TURRET', desc: 'Incinerates nearby foes.' },
    { type: GADGET_TYPES.TURRET, element: 'poison', name: 'TOXIC SPITTER', desc: 'Slows and drains life.' },
    { type: GADGET_TYPES.TURRET, element: 'push', name: 'AIR BLAST STATION', desc: 'Repels enemies with force.' },

    // Force Fields
    { type: GADGET_TYPES.FORCE_FIELD, element: 'electric', name: 'STATIC AURA', desc: 'Shocks anything that touches you.' },
    { type: GADGET_TYPES.FORCE_FIELD, element: 'force', name: 'GRAVITY WELL', desc: 'Crushes enemies in range.' },
    { type: GADGET_TYPES.FORCE_FIELD, element: 'fire', name: 'HELLFIRE RING', desc: 'Burning circle of protection.' },
    { type: GADGET_TYPES.FORCE_FIELD, element: 'poison', name: 'MIASMA BUBBLE', desc: 'Toxic cloud surrounds you.' },
    { type: GADGET_TYPES.FORCE_FIELD, element: 'push', name: 'REPULSOR SHIELD', desc: 'Keeps enemies at distance.' },

    // Special Shots
    { type: GADGET_TYPES.SPECIAL_SHOT, element: 'electric', name: 'VOLT SHOT', desc: 'Bullets chain to 3 targets.' },
    { type: GADGET_TYPES.SPECIAL_SHOT, element: 'force', name: 'IMPACT BOLT', desc: 'Small explosions on impact.' },
    { type: GADGET_TYPES.SPECIAL_SHOT, element: 'fire', name: 'BLAZE ROUNDS', desc: 'Leave trails of fire.' },
    { type: GADGET_TYPES.SPECIAL_SHOT, element: 'poison', name: 'VENOM DART', desc: 'Infects targets with rot.' },
    { type: GADGET_TYPES.SPECIAL_SHOT, element: 'push', name: 'GUST PELLET', desc: 'Massive knockback on hit.' }
];
