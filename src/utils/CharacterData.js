export const CHARACTERS = [
    {
        id: 'player',
        name: 'O CLÁSSICO',
        desc: 'O herói padrão.\nNenhum bônus.',
        unlockWave: 1,
        color: '#00f2ff',
        skin: 'player',
        buffs: {},
        gadgets: {}
    },
    {
        id: 'brotato_pav',
        name: 'PAV BATATA',
        desc: '+Velocidade\nComeça c/ Tiro Empurrão.',
        unlockWave: 3,
        color: '#00ff00',
        skin: 'brotato_pav',
        buffs: { speedMult: 1.2 },
        gadgets: { specialShots: { push: 1 } }
    },
    {
        id: 'brotato_rosseti',
        name: 'ROSSETI BATATA',
        desc: '+Dano\nComeça c/ Torreta de Fogo.',
        unlockWave: 6,
        color: '#ffaa00',
        skin: 'brotato_rosseti',
        buffs: { damageMult: 1.3 },
        gadgets: { turrets: { fire: 1 } }
    },
    {
        id: 'brotato_porquinho',
        name: 'PORQUINHO',
        desc: '+Vida Máxima\nComeça c/ Campo Elétrico.',
        unlockWave: 10,
        color: '#ff0055',
        skin: 'brotato_porquinho',
        buffs: { maxHealthBonus: 50 },
        gadgets: { forceFields: { electric: 1 } }
    },
    {
        id: 'brotato_mage',
        name: 'MAGO TÓXICO',
        desc: '+Velocidade\nComeça c/ Torreta\ne Tiro de Veneno.',
        unlockWave: 15,
        color: '#8a2be2',
        skin: 'brotato_mage',
        buffs: { speedMult: 1.1 },
        gadgets: { turrets: { poison: 1 }, specialShots: { poison: 1 } }
    },
    {
        id: 'gustavo_dino',
        name: 'GUSTAVO DINO',
        desc: 'O Bom Dinossauro Humano\n+Super Vida\nComeça c/ Campo de Força\ne Tiro de Fogo.',
        unlockWave: null,
        unlockDeaths: 1,
        color: '#4caf50',
        skin: 'gustavo_dino',
        buffs: { maxHealthBonus: 100 },
        gadgets: { specialShots: { fire: 1 }, forceFields: { fire: 1 } }
    }
];
