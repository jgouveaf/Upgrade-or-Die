export const CHARACTERS = [
    {
        id: 'player',
        name: 'O CLÁSSICO',
        desc: 'O herói padrão.\nEquilibrado.',
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
        desc: 'O Bom Dinossauro Humano\n+25 Vida Máxima.',
        unlockWave: null,
        unlockDeaths: 1,
        color: '#4caf50',
        skin: 'gustavo_dino',
        buffs: { maxHealthBonus: 25 },
        gadgets: {}
    },

    // --- Skins de Abates Totais ---
    {
        id: 'skin_1',
        name: 'APRENDIZ',
        desc: 'Primeiros passos.\n+5% de dano.',
        color: '#aaffaa',
        skin: 'skin_1',
        unlockTotalKills: 100,
        buffs: { damageMult: 1.05 },
        gadgets: {}
    },
    {
        id: 'skin_2',
        name: 'GLADIADOR',
        desc: 'Batalhador nato.\n+10% dano e +10HP.',
        color: '#ffaaaa',
        skin: 'skin_2',
        unlockTotalKills: 500,
        buffs: { damageMult: 1.10, maxHealthBonus: 10 },
        gadgets: {}
    },
    {
        id: 'skin_3',
        name: 'EXTERMINADOR',
        desc: 'Semeia o caos.\n+15% dano e Torreta de Fogo.',
        color: '#ff0000',
        skin: 'player',
        unlockTotalKills: 1000,
        buffs: { damageMult: 1.15 },
        gadgets: { turrets: { fire: 1 } }
    },
    {
        id: 'skin_4',
        name: 'MÁQUINA DE MATAR',
        desc: 'Sem misericórdia.\n+20% dano e Campo Elétrico.',
        color: '#880000',
        skin: 'player',
        unlockTotalKills: 5000,
        buffs: { damageMult: 1.20 },
        gadgets: { forceFields: { electric: 1 } }
    },

    // --- Skins de Dificuldade Difícil ---
    {
        id: 'skin_5',
        name: 'SOBREVIVENTE',
        desc: 'Resistiu ao caos.\n+20HP máximo.',
        color: '#ffaa00',
        skin: 'player',
        unlockDifficulty: 'hard',
        unlockWaveCond: 5,
        buffs: { maxHealthBonus: 20 },
        gadgets: {}
    },
    {
        id: 'skin_6',
        name: 'VETERANO',
        desc: 'Guerra é seu lar.\n+30HP e Tiro Elétrico.',
        color: '#ffaa00',
        skin: 'player',
        unlockDifficulty: 'hard',
        unlockWaveCond: 10,
        buffs: { maxHealthBonus: 30 },
        gadgets: { specialShots: { electric: 1 } }
    },
    {
        id: 'skin_7',
        name: 'IMPARÁVEL',
        desc: 'Força bruta.\n+15% velocidade e +20% dano.',
        color: '#ffaa00',
        skin: 'player',
        unlockDifficulty: 'hard',
        unlockWaveCond: 15,
        buffs: { speedMult: 1.15, damageMult: 1.20 },
        gadgets: {}
    },
    {
        id: 'skin_8',
        name: 'LENDA VIVA',
        desc: 'Atingiu o impossível.\n+25% tudo e Torreta de Veneno.',
        color: '#ffaa00',
        skin: 'player',
        unlockDifficulty: 'hard',
        unlockWaveCond: 20,
        buffs: { speedMult: 1.15, damageMult: 1.25, maxHealthBonus: 40 },
        gadgets: { turrets: { poison: 1 } }
    },

    // --- Skins de Mortes ---
    {
        id: 'skin_9',
        name: 'KAMIKAZE',
        desc: 'Vive perigosamente.\n+25% dano, -20HP.',
        color: '#aaaaaa',
        skin: 'player',
        unlockDeaths: 10,
        buffs: { damageMult: 1.25, maxHealthBonus: -20 },
        gadgets: {}
    },
    {
        id: 'skin_10',
        name: 'FÊNIX',
        desc: 'Renasce das cinzas.\n+30HP e Tiro de Fogo.',
        color: '#ccccaa',
        skin: 'player',
        unlockDeaths: 25,
        buffs: { maxHealthBonus: 30 },
        gadgets: { specialShots: { fire: 1 } }
    },
    {
        id: 'skin_11',
        name: 'IMORTAL (?)',
        desc: 'Não aprende a morrer.\n+50HP e Campo de Veneno.',
        color: '#aaaacc',
        skin: 'player',
        unlockDeaths: 50,
        buffs: { maxHealthBonus: 50 },
        gadgets: { forceFields: { poison: 1 } }
    },

    // --- Skins de Abates por Partida ---
    {
        id: 'skin_12',
        name: 'MATADOR RÁPIDO',
        desc: 'Velocidade é poder.\n+20% velocidade.',
        color: '#00ccff',
        skin: 'player',
        unlockMatchKills: 200,
        buffs: { speedMult: 1.20 },
        gadgets: {}
    },
    {
        id: 'skin_13',
        name: 'MATADOR FUROR',
        desc: 'Implacável.\n+20% velocidade e Tiro Empurrão.',
        color: '#00aaff',
        skin: 'player',
        unlockMatchKills: 500,
        buffs: { speedMult: 1.20, damageMult: 1.10 },
        gadgets: { specialShots: { push: 1 } }
    },
    {
        id: 'skin_14',
        name: 'ASSASSINO EM SÉRIE',
        desc: 'Lenda da batalha.\n+30% dano e +25% velocidade.',
        color: '#0055ff',
        skin: 'player',
        unlockMatchKills: 1000,
        buffs: { speedMult: 1.25, damageMult: 1.30 },
        gadgets: { turrets: { electric: 1 } }
    },

    // --- Skins de Dificuldade Normal ---
    {
        id: 'skin_15',
        name: 'INICIANTE',
        desc: 'Está pegando o jeito.\n+10HP e +5% dano.',
        color: '#aaffaa',
        skin: 'player',
        unlockDifficulty: 'normal',
        unlockWaveCond: 10,
        buffs: { maxHealthBonus: 10, damageMult: 1.05 },
        gadgets: {}
    },
    {
        id: 'skin_16',
        name: 'EXPERIENTE',
        desc: 'Já viu de tudo.\n+20HP e Torreta Elétrica.',
        color: '#88ff88',
        skin: 'player',
        unlockDifficulty: 'normal',
        unlockWaveCond: 20,
        buffs: { maxHealthBonus: 20 },
        gadgets: { turrets: { electric: 1 } }
    },

    // --- Skin de Dificuldade Fácil ---
    {
        id: 'skin_17',
        name: 'MUITO FÁCIL',
        desc: 'Passeio no parque.\n+10% velocidade e +10HP.',
        color: '#ffffff',
        skin: 'player',
        unlockDifficulty: 'easy',
        unlockWaveCond: 30,
        buffs: { speedMult: 1.10, maxHealthBonus: 10 },
        gadgets: {}
    },

    // --- Mais skins de morte ---
    {
        id: 'skin_18',
        name: 'APENAS UM ARRANHÃO',
        desc: 'Dói um pouquinho.\n+5% velocidade.',
        color: '#bbbbbb',
        skin: 'player',
        unlockDeaths: 5,
        buffs: { speedMult: 1.05 },
        gadgets: {}
    },
    {
        id: 'skin_19',
        name: 'DORMINHOCO',
        desc: 'Começa cansado.\n+60HP mas -10% velocidade.',
        color: '#444444',
        skin: 'player',
        unlockDeaths: 100,
        buffs: { maxHealthBonus: 60, speedMult: 0.90 },
        gadgets: {}
    },
    {
        id: 'skin_20',
        name: 'DEUS DA MORTE',
        desc: 'Onipotente.\n+30% dano, Campo de Fogo e Tiro Elétrico.',
        color: '#111111',
        skin: 'player',
        unlockTotalKills: 10000,
        buffs: { damageMult: 1.30, maxHealthBonus: 30 },
        gadgets: { forceFields: { fire: 1 }, specialShots: { electric: 1 } }
    }
];
