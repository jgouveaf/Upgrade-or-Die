import { Player } from '../entities/Player.js?v=12';
import { Enemy } from '../entities/Enemy.js?v=12';
import { settingsManager } from '../utils/SettingsManager.js?v=12';
import * as GadgetData from '../utils/GadgetData.js?v=12';
import { CHARACTERS } from '../utils/CharacterData.js?v=12';
const { GADGET_TYPES, ELEMENTS, GADGET_DEFINITIONS } = GadgetData;

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene_v6');
        console.log("GameScene Loaded - Version 6");
    }

    init(data) {
        this.wave = data.wave || 1;
        this.difficulty = data.difficulty || 'normal';
        this.enemiesPerWave = 3 + (this.wave - 1) * 5;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.isWavePaused = false;

        // Difficulty Settings
        const config = {
            easy: { hpMult: 0.8, coinMult: 2.0 },
            normal: { hpMult: 1.0, coinMult: 1.0 },
            hard: { hpMult: 1.5, coinMult: 0.5 }
        };

        this.difficultyConfig = config[this.difficulty] || config.normal;
        this.characterId = data.character || 'player';
        this.characterTemplate = CHARACTERS.find(c => c.id === this.characterId) || CHARACTERS[0];
        
        console.log(`GameScene Init: Wave ${this.wave}, Difficulty: ${this.difficulty}, Character: ${this.characterTemplate.name}`);
        this.persistedPlayer = data.player || null;
        this.playerSkin = this.characterTemplate.skin;
    }

    preload() {
        this.graphics = this.add.graphics();

        // Pixel Player (Blocky Robot) - Legacy
        this.graphics.fillStyle(0x00f2ff, 1);
        this.graphics.fillRect(4, 4, 24, 24);
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(8, 8, 4, 4);
        this.graphics.fillRect(20, 8, 4, 4);
        this.graphics.generateTexture('player', 32, 32);

        // BROTATO INSPIRED SKINS
        // 1. Brotato Rosseti (Normal) - Bald and Goatee like the photo
        this.graphics.clear();
        this.graphics.fillStyle(0xffdbac, 1); // Peach skin tone
        this.graphics.fillRoundedRect(4, 4, 24, 24, 8); 
        
        // Bald shine
        this.graphics.fillStyle(0xffeedd, 1); 
        this.graphics.fillRoundedRect(6, 4, 20, 8, 4); 

        // White Eyes
        this.graphics.fillStyle(0xffffff, 1); 
        this.graphics.fillRect(10, 12, 4, 4);
        this.graphics.fillRect(18, 12, 4, 4);
        // Pupils
        this.graphics.fillStyle(0x000000, 1); 
        this.graphics.fillRect(11, 13, 2, 2);
        this.graphics.fillRect(19, 13, 2, 2);
        
        // Dark Eyebrows
        this.graphics.fillStyle(0x000000, 1); 
        this.graphics.fillRect(9, 10, 6, 2);
        this.graphics.fillRect(17, 10, 6, 2);
        
        // Thick Goatee/Beard (Full Circle Goatee)
        this.graphics.fillStyle(0x1a1a1a, 1); 
        this.graphics.fillRect(10, 18, 12, 2); // Mustache
        this.graphics.fillRect(14, 20, 4, 2); // Connect to chin
        this.graphics.fillRect(10, 22, 12, 4); // Chin beard
        this.graphics.generateTexture('brotato_rosseti', 32, 32);

        // 2. Brotato PAV (Easy) - Potato with Greenish accent and relaxed eyes
        this.graphics.clear();
        this.graphics.fillStyle(0xcdae79, 1); 
        this.graphics.fillRoundedRect(4, 4, 24, 24, 8); 
        this.graphics.fillStyle(0x00ff00, 1); // Green headband or cap!
        this.graphics.fillRoundedRect(4, 4, 24, 6, 2);
        this.graphics.fillStyle(0xffffff, 1); // Relaxed Eyes (half closed)
        this.graphics.fillRect(10, 12, 4, 2);
        this.graphics.fillRect(18, 12, 4, 2);
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(12, 12, 2, 2);
        this.graphics.fillRect(18, 12, 2, 2);
        this.graphics.fillStyle(0x000000, 1); // Smile
        this.graphics.fillRect(16, 20, 2, 2);
        this.graphics.fillRect(14, 18, 2, 2);
        this.graphics.fillRect(12, 16, 2, 2);
        this.graphics.generateTexture('brotato_pav', 32, 32);

        // 3. Brotato Porquinho da Sorte (Hard) - Pinkish Potato, angry eyes
        this.graphics.clear();
        this.graphics.fillStyle(0xffaaff, 1); // Pinkish potato
        this.graphics.fillRoundedRect(4, 4, 24, 24, 8); 
        this.graphics.fillStyle(0xffffff, 1); // Angry Eyes (slanted)
        this.graphics.fillRect(10, 10, 4, 4);
        this.graphics.fillRect(18, 10, 4, 4);
        this.graphics.fillStyle(0x000000, 1); // Pupils
        this.graphics.fillRect(12, 10, 2, 2);
        this.graphics.fillRect(18, 10, 2, 2);
        this.graphics.fillStyle(0xff0055, 1); // Angry eyebrows
        this.graphics.fillRect(8, 8, 4, 2);
        this.graphics.fillRect(20, 8, 4, 2);
        this.graphics.fillStyle(0xff55ff, 1); // Pig Snout
        this.graphics.fillRect(14, 16, 4, 4);
        this.graphics.fillStyle(0x000000, 1); // Nostrils
        this.graphics.fillRect(14, 18, 1, 1);
        this.graphics.fillRect(17, 18, 1, 1);
        this.graphics.generateTexture('brotato_porquinho', 32, 32);

        // 4. Brotato Mage (Toxic)
        this.graphics.clear();
        this.graphics.fillStyle(0x8a2be2, 1); // Purple potato
        this.graphics.fillRoundedRect(4, 4, 24, 24, 8); 
        this.graphics.fillStyle(0x00ff00, 1); // Toxic eyes
        this.graphics.fillRect(10, 10, 4, 4);
        this.graphics.fillRect(18, 10, 4, 4);
        this.graphics.fillStyle(0x000000, 1); // Pupils
        this.graphics.fillRect(12, 12, 2, 2);
        this.graphics.fillRect(18, 12, 2, 2);
        this.graphics.fillStyle(0x000000, 1); // Mouth
        this.graphics.fillRect(14, 20, 4, 2);
        this.graphics.generateTexture('brotato_mage', 32, 32);

        // 5. Gustavo Dino (O Bom Dinossauro Humano)
        this.graphics.clear();
        this.graphics.fillStyle(0x4caf50, 1); // Green Dino skin
        this.graphics.fillRoundedRect(6, 2, 20, 26, 8); // Taller, thinner face
        
        // Lighter green belly/lower face
        this.graphics.fillStyle(0x8bc34a, 1); 
        this.graphics.fillRoundedRect(8, 16, 16, 12, 4);
        
        // Big Dino Eyes
        this.graphics.fillStyle(0xffffff, 1); 
        this.graphics.fillCircle(11, 10, 4);
        this.graphics.fillCircle(21, 10, 4);
        // Pupils
        this.graphics.fillStyle(0x4a2e15, 1); // Brown pupils like Arlo
        this.graphics.fillCircle(11, 10, 2);
        this.graphics.fillCircle(21, 10, 2);
        
        // Dino Snout/Smile
        this.graphics.fillStyle(0x2e7d32, 1); 
        this.graphics.fillRect(10, 22, 12, 2); // Wide smile
        // Nostrils
        this.graphics.fillRect(13, 19, 1, 1);
        this.graphics.fillRect(18, 19, 1, 1);
        
        this.graphics.generateTexture('gustavo_dino', 32, 32);


        // Pixel Enemy (Blocky Invader)
        this.graphics.clear();
        this.graphics.fillStyle(0xff0055, 1);
        this.graphics.fillRect(0, 8, 32, 16);
        this.graphics.fillRect(8, 0, 16, 32);
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(8, 8, 4, 4);
        this.graphics.fillRect(20, 8, 4, 4);
        this.graphics.generateTexture('enemy', 32, 32);

        // Pixel Bullet (Realistic Metal Aesthetic) - 16x16
        this.graphics.clear();
        // Outline (Darker for contrast)
        this.graphics.fillStyle(0x331a00, 1);
        this.graphics.fillRect(4, 2, 8, 12);
        this.graphics.fillRect(5, 1, 6, 1); // Tip shadow
        this.graphics.fillRect(6, 0, 4, 1);
        // Shell Body (Golden/Brass Gradient feel)
        this.graphics.fillStyle(0xd4af37, 1);
        this.graphics.fillRect(5, 3, 6, 10);
        this.graphics.fillRect(7, 1, 2, 2);
        // Lighter Gold highlight
        this.graphics.fillStyle(0xffd700, 1);
        this.graphics.fillRect(5, 3, 2, 9);
        // Red Detail Ring (Lowered slightly like screenshot)
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillRect(4, 10, 8, 2);
        // Highlight/Reflection (White/Light Gold)
        this.graphics.fillStyle(0xffffff, 0.7);
        this.graphics.fillRect(6, 4, 1, 5);
        this.graphics.fillRect(7, 2, 1, 1);
        // Base (Copper/Darker)
        this.graphics.fillStyle(0x8b4513, 1);
        this.graphics.fillRect(5, 13, 6, 2);

        this.graphics.generateTexture('bullet', 16, 16);

        // Pixel Push Bullet (Purple Metal Aesthetic - Animated)
        ['push_bullet_1', 'push_bullet_2'].forEach(key => {
            if (this.textures.exists(key)) this.textures.remove(key);
        });

        const generatePushBullet = (key, frameIndex) => {
            const pbGraphics = this.add.graphics();
            // Same shape as normal bullet, but purple!

            // Outline (Dark Purple)
            pbGraphics.fillStyle(0x3a003a, 1);
            pbGraphics.fillRect(4, 2, 8, 12);
            pbGraphics.fillRect(6, 0, 4, 3);

            // Shell Body (Vibrant Purple)
            pbGraphics.fillStyle(0x8a2be2, 1); // Blue Violet
            pbGraphics.fillRect(5, 3, 6, 10);
            pbGraphics.fillRect(7, 1, 2, 2);

            // Neon Ring (Cyan/Pink Alternating)
            if (frameIndex === 0) {
                pbGraphics.fillStyle(0x00ffff, 1); // Cyan
            } else {
                pbGraphics.fillStyle(0xff00ff, 1); // Magenta
            }
            pbGraphics.fillRect(4, 9, 8, 2);

            // Highlight
            pbGraphics.fillStyle(0xffddff, 1);
            pbGraphics.fillRect(6, 4, 1, 5);
            pbGraphics.fillRect(7, 2, 1, 1);

            // Base/Thruster (Glows brighter on frame 2)
            if (frameIndex === 0) {
                pbGraphics.fillStyle(0x5500aa, 1);
            } else {
                pbGraphics.fillStyle(0x9900ff, 1); // Brighter thrust
            }
            pbGraphics.fillRect(5, 13, 6, 2);

            pbGraphics.generateTexture(key, 16, 16);
            pbGraphics.destroy();
        };

        generatePushBullet('push_bullet_1', 0);
        generatePushBullet('push_bullet_2', 1);

        if (this.anims.exists('push_anim')) this.anims.remove('push_anim');
        this.anims.create({
            key: 'push_anim',
            frames: [
                { key: 'push_bullet_1' },
                { key: 'push_bullet_2' }
            ],
            frameRate: 15,
            repeat: -1
        });

        // Fallback static texture if needed
        if (this.textures.exists('push_bullet')) this.textures.remove('push_bullet');
        generatePushBullet('push_bullet', 0);

        // Pixel Smoke Bolt (Impact Bolt Aesthetic - Animated White Puff)
        ['smoke_bolt_1', 'smoke_bolt_2'].forEach(key => {
            if (this.textures.exists(key)) this.textures.remove(key);
        });

        const generateSmokeBolt = (key, frameIndex) => {
            const pbGraphics = this.add.graphics();
            const fp = { w: 0xffffff, l: 0xeeeeee, d: 0xcccccc, g: 0x999999 }; // shades of white/gray

            // Shape: Irregular puffy smoke clouds based on SMOKE 1 image
            let pbData = [
                "  wwwww  ",
                " dwwwwwll",
                "lwwwwwwwg",
                "lwwwwwwwl",
                " dwwwwwl ",
                "  llll   ",
            ];

            if (frameIndex === 1) {
                pbData = [
                    "   www   ",
                    "  wwwww  ",
                    " lwwwwww ",
                    "lwwwwwwwl",
                    "lwwwwwwwl",
                    " dwwwwwd ",
                    "  llll   ",
                ];
            } else if (frameIndex === 2) {
                pbData = [
                    "    ww   ",
                    "   wwww  ",
                    "  wwwwww ",
                    " dwwwwwwl",
                    " lwwwwwwl",
                    "  lwwwd  ",
                ];
            }

            const pSize = 2; // Slightly larger pixels for smoke
            for (let y = 0; y < pbData.length; y++) {
                for (let x = 0; x < pbData[y].length; x++) {
                    const char = pbData[y][x];
                    if (fp[char]) {
                        pbGraphics.fillStyle(fp[char], 1);
                        pbGraphics.fillRect(x * pSize, y * pSize, pSize, pSize);
                    }
                }
            }
            pbGraphics.generateTexture(key, 24, 18);
            pbGraphics.destroy();
        };

        generateSmokeBolt('smoke_bolt_1', 0);
        generateSmokeBolt('smoke_bolt_2', 1);
        generateSmokeBolt('smoke_bolt_3', 2);

        if (this.anims.exists('smoke_anim')) this.anims.remove('smoke_anim');
        this.anims.create({
            key: 'smoke_anim',
            frames: [
                { key: 'smoke_bolt_1' },
                { key: 'smoke_bolt_2' },
                { key: 'smoke_bolt_3' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Pixel Coin
        this.graphics.clear();
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillRect(3, 0, 6, 12);
        this.graphics.fillRect(0, 3, 12, 6);
        this.graphics.generateTexture('coin', 12, 12);

        // NEW FIREBALL SPRITE - MUCH SMALLER & ACCURATE TO REFERENCE
        ['enemyFireball_1', 'enemyFireball_2', 'enemyFireball_3'].forEach(key => {
            if (this.textures.exists(key)) this.textures.remove(key);
        });

        const generateFireballFrame = (key, frameIndex) => {
            const fireGraphics = this.add.graphics();
            const fp = { r: 0xff0000, o: 0xff8800, y: 0xffff00, w: 0xffffff };

            // Base frame
            let fData = [
                "      rrrr  ",
                "   rroooorr ",
                "  rrooyyyyor",
                " rrooywwwyor",
                "rrooywwwwyor",
                "rrooywwwwyor",
                " rrooywwwyor",
                "  rrooyyyyor",
                "   rroooorr ",
                "      rrrr  "
            ];

            // Animate the tail based on the frame index
            if (frameIndex === 1) {
                fData[4] = " rrooywwwwyor";
                fData[5] = " rrooywwwwyor";
                fData[3] = "  rooywwwyor";
                fData[6] = "  rooywwwyor";
            } else if (frameIndex === 2) {
                fData[4] = "  rooywwwwyor";
                fData[5] = "  rooywwwwyor";
            }

            const pSize = 1; // 1x scale for very small visually tight projectile
            for (let y = 0; y < fData.length; y++) {
                for (let x = 0; x < fData[y].length; x++) {
                    const char = fData[y][x];
                    if (fp[char]) {
                        fireGraphics.fillStyle(fp[char], 1);
                        fireGraphics.fillRect(x * pSize, y * pSize, pSize, pSize);
                    }
                }
            }
            fireGraphics.generateTexture(key, 12, 10);
            fireGraphics.destroy();
        };

        generateFireballFrame('enemyFireball_1', 0);
        generateFireballFrame('enemyFireball_2', 1);
        generateFireballFrame('enemyFireball_3', 2);

        // Animation for Fireball
        if (this.anims.exists('fireball_burn')) this.anims.remove('fireball_burn');
        this.anims.create({
            key: 'fireball_burn',
            frames: [
                { key: 'enemyFireball_1' },
                { key: 'enemyFireball_2' },
                { key: 'enemyFireball_3' }
            ],
            frameRate: 15,
            repeat: -1
        });

        // Legacy fallback
        this.graphics.clear();
        this.graphics.fillStyle(0xff4400, 1);
        this.graphics.fillRect(0, 0, 8, 8);
        this.graphics.generateTexture('enemyBullet', 8, 8);

        // Synthwave Pixel Wall - 32x32 (Ultra Neon Version)
        if (this.textures.exists('wall')) this.textures.remove('wall');
        this.graphics.clear();
        this.graphics.lineStyle(6, 0xff00ff, 0.3); // Faint outer glow
        this.graphics.strokeRect(0, 0, 32, 32);
        this.graphics.lineStyle(2, 0xff00ff, 1);   // Sharp neon edge
        this.graphics.strokeRect(1, 1, 30, 30);
        this.graphics.fillStyle(0x0a0a1e, 1);
        this.graphics.fillRect(3, 3, 26, 26);
        this.graphics.lineStyle(1, 0x00f2ff, 0.4);
        this.graphics.lineBetween(16, 4, 16, 28);
        this.graphics.lineBetween(4, 16, 28, 16);
        this.graphics.fillStyle(0xff00ff, 1);
        this.graphics.fillRect(14, 14, 4, 4); // Bright neon core
        this.graphics.generateTexture('wall', 32, 32);

        // Pixel Portal (Square Neon Version)
        if (this.textures.exists('portal')) this.textures.remove('portal');
        this.graphics.clear();

        // 1. Outer Neon Glow
        this.graphics.lineStyle(6, 0x00f2ff, 0.3);
        this.graphics.strokeRect(0, 0, 48, 48);

        // 2. Thick Cyan Frame
        this.graphics.lineStyle(4, 0x00f2ff, 1);
        this.graphics.strokeRect(4, 4, 40, 40);

        // 3. Inner White Frame (Energy edge)
        this.graphics.lineStyle(2, 0xffffff, 0.8);
        this.graphics.strokeRect(8, 8, 32, 32);

        // 4. Energy Filling (Translucent)
        this.graphics.fillStyle(0x00f2ff, 0.2);
        this.graphics.fillRect(10, 10, 28, 28);

        // 5. Core Spark
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(22, 22, 4, 4);

        this.graphics.generateTexture('portal', 48, 48);

        console.log("TEXTURE GENERATION: WALL AND PORTAL UPDATED");

        // Synthwave Floor Tile - 64x64
        this.graphics.clear();
        // Base Dark
        this.graphics.fillStyle(0x0a0a0c, 1);
        this.graphics.fillRect(0, 0, 64, 64);
        // Grid Lines (Cyan)
        this.graphics.lineStyle(1, 0x00f2ff, 0.2);
        this.graphics.strokeRect(0, 0, 64, 64);
        // Decorative Neon Dots (from user's ref)
        this.graphics.fillStyle(0x00f2ff, 0.4);
        this.graphics.fillRect(0, 0, 2, 2);
        this.graphics.fillRect(62, 62, 2, 2);
        this.graphics.generateTexture('floor', 64, 64);

        // Pixel Boss (Rafael Rosseti) - FINAL VERSION (Bald, Beard, Light Sweater)
        this.graphics.clear();

        // Head / Face (Skin)
        this.graphics.fillStyle(0xffdbac, 1);
        this.graphics.fillRect(20, 4, 24, 24); // Full head block

        // Shading for bald head (top highlight)
        this.graphics.fillStyle(0xffe0bd, 1);
        this.graphics.fillRect(24, 4, 16, 4);
        this.graphics.fillRect(22, 6, 2, 2);
        this.graphics.fillRect(40, 6, 2, 2);

        // Beard / Goatee (More prominent dark area)
        this.graphics.fillStyle(0x1a1a1a, 1);
        this.graphics.fillRect(24, 18, 2, 10); // Left sideburn/beard line
        this.graphics.fillRect(38, 18, 2, 10); // Right sideburn/beard line
        this.graphics.fillRect(26, 24, 12, 6);  // Chin/Mouth area
        this.graphics.fillRect(28, 22, 8, 2);   // Mustache

        // Eyes (Small black dots)
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(26, 14, 3, 3);
        this.graphics.fillRect(35, 14, 3, 3);

        // Body (Light Grey / White Sweater)
        this.graphics.fillStyle(0xeeeeee, 1);
        this.graphics.fillRect(14, 28, 36, 36);

        // Rock Hand (Horns) - Better position
        this.graphics.fillStyle(0xffdbac, 1);
        this.graphics.fillRect(52, 20, 10, 12); // Hand base
        this.graphics.fillRect(52, 12, 2, 8);  // Index horn
        this.graphics.fillRect(60, 12, 2, 8);  // Pinky horn
        this.graphics.fillStyle(0x000000, 0.2);
        this.graphics.fillRect(54, 22, 6, 6);  // Palm shade

        this.graphics.generateTexture('boss', 64, 64);

        // Pixel Piggy Bank (Boss Bullet) - 32x32
        this.graphics.clear();

        // Shadow
        this.graphics.fillStyle(0x000000, 0.2);
        this.graphics.fillRect(4, 24, 24, 4);

        // Body (Pink)
        this.graphics.fillStyle(0xffaaff, 1);
        this.graphics.fillRect(6, 12, 20, 14); // Main body
        this.graphics.fillRect(8, 10, 16, 2);  // Top curve

        // Snout
        this.graphics.fillStyle(0xff88ff, 1);
        this.graphics.fillRect(26, 16, 4, 6);
        this.graphics.fillStyle(0xff55ff, 1);
        this.graphics.fillRect(28, 18, 2, 2); // Nostril

        // Ears
        this.graphics.fillStyle(0xffaaff, 1);
        this.graphics.fillRect(8, 8, 4, 4);
        this.graphics.fillRect(16, 8, 4, 4);

        // Eyes
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(20, 14, 2, 2);

        // Tail (Curly)
        this.graphics.fillStyle(0xff88ff, 1);
        this.graphics.fillRect(4, 16, 2, 2);

        // Legs
        this.graphics.fillStyle(0xffaaff, 1);
        this.graphics.fillRect(10, 26, 4, 4);
        this.graphics.fillRect(20, 26, 4, 4);

        // Coin Slot
        this.graphics.fillStyle(0x333333, 1);
        this.graphics.fillRect(14, 12, 6, 2);

        // Coin Pop
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillRect(16, 6, 2, 6);

        this.graphics.generateTexture('bossBullet', 32, 32);

        // ANIMATED FIRE BAT - 3 Frames
        ['fireBat_1', 'fireBat_2', 'fireBat_3'].forEach(key => {
            if (this.textures.exists(key)) this.textures.remove(key);
        });

        const generateBatFrame = (key, frameIndex) => {
            const mg = this.add.graphics();

            // Core Bat shape
            mg.fillStyle(0x330000, 1);
            mg.fillRect(12, 12, 8, 8); // Body

            // Molten Core (Pulses based on frame)
            mg.fillStyle(0xff4400, 1);
            mg.fillRect(14, 13, 4, 6);

            const coreColor = frameIndex === 1 ? 0xffffff : 0xffff00;
            mg.fillStyle(coreColor, 0.9);
            mg.fillRect(15, 14, 2, 2);

            // Glowing Eyes
            mg.fillStyle(0xffffff, 1);
            mg.fillRect(13, 13, 2, 2);
            mg.fillRect(17, 13, 2, 2);

            // True flame wings, shape changes per frame
            const drawWing = (xDir, flip) => {
                const dir = flip ? -1 : 1;
                mg.fillStyle(0xff0000, 1); // Red base
                if (frameIndex === 0) {
                    mg.fillRect(12 + (dir * 2), 10, dir * 10, 4);
                    mg.fillRect(12 + (dir * 6), 6, dir * 6, 4);
                    mg.fillStyle(0xff8800, 1); // Orange
                    mg.fillRect(12 + (dir * 4), 8, dir * 6, 4);
                    mg.fillStyle(0xffff00, 1); // Yellow
                    mg.fillRect(12 + (dir * 8), 4, dir * 2, 4);
                } else if (frameIndex === 1) {
                    mg.fillRect(12 + (dir * 2), 12, dir * 12, 4);
                    mg.fillRect(12 + (dir * 8), 8, dir * 4, 4);
                    mg.fillStyle(0xff8800, 1); // Orange
                    mg.fillRect(12 + (dir * 6), 10, dir * 6, 4);
                    mg.fillStyle(0xffff00, 1); // Yellow
                    mg.fillRect(12 + (dir * 10), 6, dir * 2, 4);
                } else {
                    mg.fillRect(12 + (dir * 2), 8, dir * 8, 4);
                    mg.fillRect(12 + (dir * 4), 4, dir * 4, 4);
                    mg.fillStyle(0xff8800, 1); // Orange
                    mg.fillRect(12 + (dir * 2), 6, dir * 6, 4);
                    mg.fillStyle(0xffff00, 1); // Yellow
                    mg.fillRect(12 + (dir * 6), 2, dir * 2, 4);
                }
            };

            drawWing(0, true);  // Left
            drawWing(0, false); // Right

            mg.generateTexture(key, 32, 32);
            mg.destroy();
        };

        generateBatFrame('fireBat_1', 0);
        generateBatFrame('fireBat_2', 1);
        generateBatFrame('fireBat_3', 2);

        if (this.anims.exists('enemy_burn_anim')) this.anims.remove('enemy_burn_anim');
        this.anims.create({
            key: 'enemy_burn_anim',
            frames: [
                { key: 'fireBat_1' },
                { key: 'fireBat_2' },
                { key: 'fireBat_3' }
            ],
            frameRate: 10,
            repeat: -1
        });

        // Set poisonBat (base enemy texture) to a proper toxic green graphic
        if (this.textures.exists('poisonBat')) this.textures.remove('poisonBat');
        this.graphics.clear();
        // Wings (Dark Green Base)
        this.graphics.fillStyle(0x004400, 1);
        this.graphics.fillRect(4, 12, 8, 4); // Left base
        this.graphics.fillRect(20, 12, 8, 4); // Right base
        // Wing membranes (Neon Green)
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillRect(2, 10, 4, 2);
        this.graphics.fillRect(26, 10, 4, 2);
        // Body (Toxic Green)
        this.graphics.fillStyle(0x00aa00, 1);
        this.graphics.fillRect(12, 8, 8, 12);
        this.graphics.fillRect(14, 20, 4, 4);
        // Eyes (Red Glow)
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillRect(12, 10, 2, 2);
        this.graphics.fillRect(18, 10, 2, 2);
        // Fangs
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(13, 13, 1, 2);
        this.graphics.fillRect(18, 13, 1, 2);
        this.graphics.generateTexture('poisonBat', 32, 32);

        // Pixel Yellow Enemy (New variant)
        this.graphics.clear();
        this.graphics.fillStyle(0xffff00, 1);
        this.graphics.fillRect(0, 8, 32, 16);
        this.graphics.fillRect(8, 0, 16, 32);
        this.graphics.fillStyle(0x000000, 0.1); // Eyes (faint to be seen better)
        this.graphics.fillRect(8, 8, 4, 4);
        this.graphics.fillRect(20, 8, 4, 4);
        this.graphics.generateTexture('yellowEnemy', 32, 32);

        // Pixel Bomb Indicator
        this.graphics.clear();
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillCircle(16, 16, 16);
        this.graphics.generateTexture('bombIndicator', 32, 32);

        // PIXEL BOLT (New Energy Bolt Design) - CYAN CORE, BLUE OUTLINE
        for (let i = 0; i < 4; i++) {
            this.graphics.clear();
            const outlineColor = 0x3b82f6; // Blue
            const coreColor = 0x67e8f9;    // Cyan

            // Draw a teardrop/bolt shape
            this.graphics.fillStyle(outlineColor, 1);
            this.graphics.fillRect(4, 12, 16, 8);  // Main body
            this.graphics.fillRect(8, 10, 8, 12);  // Vertical thickness
            this.graphics.fillRect(16, 14, 8, 4);  // Tip
            this.graphics.fillRect(0, 15, 4, 2);   // Tail

            this.graphics.fillStyle(coreColor, 1);
            this.graphics.fillRect(6, 13, 12, 6);  // Inner core
            this.graphics.fillRect(8, 12, 8, 8);   // Center thickness

            // Sparkles/Particles (Randomized per frame)
            if (i % 2 === 0) {
                this.graphics.fillRect(2, 6, 2, 2);
                this.graphics.fillRect(24, 20, 2, 2);
            } else {
                this.graphics.fillRect(4, 24, 2, 2);
                this.graphics.fillRect(20, 4, 2, 2);
            }

            this.graphics.generateTexture(`bolt_frame_${i}`, 32, 32);
        }

        // =============================================
        // UNLOCKABLE SKIN SPRITES (skin_1 to skin_20)
        // =============================================
        const g = this.add.graphics();

        const drawPixel = (gfx, x, y, color, size = 2) => {
            gfx.fillStyle(color, 1);
            gfx.fillRect(x * size, y * size, size, size);
        };

        // skin_1: APRENDIZ - Yellow helmet recruit
        g.clear();
        g.fillStyle(0xffff66, 1); g.fillRoundedRect(4, 2, 24, 22, 6); // Yellow head
        g.fillStyle(0xffaa00, 1); g.fillRect(4, 2, 24, 8); // Helmet top
        g.fillStyle(0xffffff, 1); g.fillRect(10, 12, 4, 4); g.fillRect(18, 12, 4, 4); // Eyes
        g.fillStyle(0x000000, 1); g.fillRect(11, 13, 2, 2); g.fillRect(19, 13, 2, 2); // Pupils
        g.fillStyle(0xffaa00, 1); g.fillRect(8, 24, 16, 8); // Body (uniform)
        g.generateTexture('skin_1', 32, 32);

        // skin_2: GLADIADOR - Full medieval knight helmet (no face visible, closed visor)
        g.clear();
        // Main helmet - full steel dome
        g.fillStyle(0x888888, 1); g.fillRoundedRect(4, 2, 24, 28, 6);
        // Darker steel shading (left side shadow)
        g.fillStyle(0x666666, 1); g.fillRect(4, 4, 8, 22);
        // Highlight (right side shine)
        g.fillStyle(0xaaaaaa, 1); g.fillRect(22, 4, 6, 18);
        // Visor area - dark recess
        g.fillStyle(0x222222, 1); g.fillRect(7, 12, 18, 10);
        // Visor grille bars (horizontal metal bars across the visor)
        g.fillStyle(0x555555, 1);
        g.fillRect(7, 13, 18, 2); // bar 1
        g.fillRect(7, 16, 18, 2); // bar 2
        g.fillRect(7, 19, 18, 2); // bar 3
        // Vertical visor divider
        g.fillStyle(0x555555, 1); g.fillRect(15, 12, 2, 10);
        // Helmet rim (thick bottom edge)
        g.fillStyle(0x777777, 1); g.fillRect(4, 28, 24, 4);
        // Cheek guards (wider sides)
        g.fillStyle(0x888888, 1); g.fillRect(2, 14, 4, 16); g.fillRect(26, 14, 4, 16);
        // Top crest ridge
        g.fillStyle(0x999999, 1); g.fillRect(14, 2, 4, 4);
        g.generateTexture('skin_2', 32, 32);


        // skin_3: EXTERMINADOR - Robot with red eye
        g.clear();
        g.fillStyle(0x333333, 1); g.fillRoundedRect(4, 2, 24, 24, 4); // Metal head
        g.fillStyle(0x555555, 1); g.fillRect(6, 4, 20, 10); // Top panel
        g.fillStyle(0xff0000, 1); g.fillCircle(12, 13, 4); // Red eye (left damaged)
        g.fillStyle(0xffffff, 1); g.fillRect(19, 11, 5, 5); // Normal right eye
        g.fillStyle(0x000000, 1); g.fillRect(20, 12, 3, 3); // Pupil
        g.fillStyle(0xff0000, 1); g.fillRect(14, 18, 6, 2); // Jaw line damaged
        g.fillStyle(0x444444, 1); g.fillRect(6, 26, 20, 6); // Body
        g.fillStyle(0xff4400, 1); g.fillRect(8, 27, 4, 2); g.fillRect(20, 27, 4, 2); // Chest lights
        g.generateTexture('skin_3', 32, 32);

        // skin_4: MÁQUINA DE MATAR - Full metal cyborg
        g.clear();
        g.fillStyle(0x222222, 1); g.fillRect(2, 2, 28, 28); // Dark metal body
        g.fillStyle(0x00f2ff, 1); g.fillRect(4, 4, 24, 4); // Cyan top stripe
        g.fillStyle(0x00f2ff, 1); g.fillCircle(11, 14, 4); g.fillCircle(21, 14, 4); // Glowing eyes
        g.fillStyle(0xffffff, 1); g.fillCircle(11, 14, 2); g.fillCircle(21, 14, 2); // Eye core
        g.fillStyle(0x00f2ff, 1); g.fillRect(10, 20, 12, 2); // Jaw glow
        g.fillStyle(0x00f2ff, 1); g.fillRect(4, 26, 24, 2); // Bottom stripe
        g.fillStyle(0x444444, 1); g.fillRect(6, 6, 4, 2); g.fillRect(22, 6, 4, 2); // Side bolts
        g.generateTexture('skin_4', 32, 32);

        // skin_5: SOBREVIVENTE - Worn armor with bandages
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 4, 20, 20, 5); // Face
        g.fillStyle(0x888888, 1); g.fillRect(4, 2, 24, 8); // Old helmet
        g.fillStyle(0xffffff, 1); g.fillRect(6, 14, 8, 2); // Bandage across eye
        g.fillStyle(0x000000, 1); g.fillRect(21, 13, 3, 3); // One eye (other covered)
        g.fillStyle(0x666666, 1); g.fillRect(6, 24, 20, 8); // Worn armor
        g.fillStyle(0xffffff, 1); g.fillRect(12, 26, 8, 2); g.fillRect(10, 28, 12, 2); // Bandage on chest
        g.generateTexture('skin_5', 32, 32);

        // skin_6: VETERANO - Soldier with medals
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 4, 18, 20, 5); // Face
        g.fillStyle(0x556655, 1); g.fillRect(4, 2, 24, 8); // Military cap
        g.fillStyle(0xffdd00, 1); g.fillRect(12, 4, 8, 2); // Gold cap stripe
        g.fillStyle(0x000000, 1); g.fillRect(10, 13, 3, 3); g.fillRect(19, 13, 3, 3); // Eyes
        g.fillStyle(0x999966, 1); g.fillRect(6, 24, 20, 8); // Military shirt
        g.fillStyle(0xffdd00, 1); g.fillRect(8, 26, 3, 3); g.fillRect(13, 26, 3, 3); g.fillRect(18, 26, 3, 3); // Medals
        g.fillStyle(0xff0000, 1); g.fillRect(9, 27, 1, 1); g.fillRect(14, 27, 1, 1); g.fillRect(19, 27, 1, 1); // Medal color
        g.generateTexture('skin_6', 32, 32);

        // skin_7: IMPARÁVEL - Muscled warrior with spiked shoulders
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 4, 20, 18, 5); // Face
        g.fillStyle(0x882200, 1); g.fillRect(4, 2, 24, 8); // Dark red warrior helmet
        g.fillStyle(0xffaa00, 1); g.fillRect(4, 2, 4, 4); g.fillRect(24, 2, 4, 4); // Shoulder spikes
        g.fillStyle(0x000000, 1); g.fillRect(10, 11, 4, 4); g.fillRect(18, 11, 4, 4); // Angry eyes
        g.fillStyle(0xff4400, 1); g.fillRect(10, 9, 4, 2); g.fillRect(18, 9, 4, 2); // Angry eyebrows
        g.fillStyle(0x882200, 1); g.fillRect(4, 22, 24, 10); // Red chest plate
        g.generateTexture('skin_7', 32, 32);

        // skin_8: LENDA VIVA - Golden glowing figure
        g.clear();
        g.fillStyle(0xffaa00, 1); g.fillRoundedRect(4, 2, 24, 24, 8); // Golden body
        g.fillStyle(0xffee00, 1); g.fillRoundedRect(6, 4, 20, 16, 6); // Bright gold face
        g.fillStyle(0xffffff, 1); g.fillRect(9, 10, 5, 5); g.fillRect(18, 10, 5, 5); // Glowing eyes
        g.fillStyle(0xffee00, 1); g.fillRect(10, 11, 3, 3); g.fillRect(19, 11, 3, 3); // Eye glow
        g.fillStyle(0xffdd00, 1); g.fillRect(12, 18, 8, 2); // Grin
        g.fillStyle(0xffaa00, 1); g.fillRect(4, 26, 24, 6); // Body
        g.fillStyle(0xffffff, 0.5); g.fillRect(6, 4, 4, 14); // Aura highlight left
        g.generateTexture('skin_8', 32, 32);

        // skin_9: KAMIKAZE - Explosive barrel with fuse
        g.clear();
        g.fillStyle(0x884400, 1); g.fillRoundedRect(6, 4, 20, 20, 4); // Brown barrel body
        g.fillStyle(0x553300, 1); g.fillRect(6, 8, 20, 2); g.fillRect(6, 14, 20, 2); g.fillRect(6, 20, 20, 2); // Barrel rings
        g.fillStyle(0xffff00, 1); g.fillRect(10, 10, 4, 4); g.fillRect(18, 10, 4, 4); // Crazy eyes
        g.fillStyle(0x000000, 1); g.fillRect(11, 11, 2, 2); g.fillRect(19, 11, 2, 2); // Pupils
        g.fillStyle(0xff4400, 1); g.fillRect(15, 2, 2, 4); // Fuse
        g.fillStyle(0xffff00, 1); g.fillCircle(15, 2, 2); // Spark
        g.fillStyle(0xcc3300, 1); g.fillRect(8, 24, 16, 8); // Bottom
        g.generateTexture('skin_9', 32, 32);

        // skin_10: FÊNIX - Fire bird face, orange/red flames
        g.clear();
        g.fillStyle(0xff6600, 1); g.fillRoundedRect(6, 6, 20, 18, 8); // Orange face
        g.fillStyle(0xff0000, 1); g.fillRect(4, 2, 6, 8); g.fillRect(22, 2, 6, 8); // Flame crest
        g.fillStyle(0xffff00, 1); g.fillRect(6, 4, 4, 6); g.fillRect(22, 4, 4, 6); // Yellow flame core
        g.fillStyle(0xffffff, 1); g.fillRect(10, 12, 4, 4); g.fillRect(18, 12, 4, 4); // Eyes
        g.fillStyle(0xff6600, 1); g.fillRect(11, 13, 2, 2); g.fillRect(19, 13, 2, 2); // Eye pupils (fire color)
        g.fillStyle(0xff4400, 1); g.fillRect(6, 24, 20, 8); // Body with fire
        g.generateTexture('skin_10', 32, 32);

        // skin_11: IMORTAL - Ghostly spectral figure
        g.clear();
        g.fillStyle(0x8888cc, 1); g.fillRoundedRect(4, 2, 24, 26, 10); // Ghost body (rounded)
        g.fillStyle(0x6666aa, 1); g.fillRect(4, 16, 24, 12); // Lower ghost body fades
        g.fillStyle(0xffffff, 1); g.fillCircle(12, 12, 5); g.fillCircle(20, 12, 5); // Hollow eyes (big)
        g.fillStyle(0x000000, 1); g.fillCircle(12, 12, 3); g.fillCircle(20, 12, 3); // Eye void
        g.fillStyle(0xaaaadd, 1); g.fillRect(10, 20, 12, 2); // Grim mouth
        g.generateTexture('skin_11', 32, 32);

        // skin_12: MATADOR RÁPIDO - Sleek speedster with visor
        g.clear();
        g.fillStyle(0x0044aa, 1); g.fillRoundedRect(4, 2, 24, 24, 6); // Blue streamlined helmet
        g.fillStyle(0x00aaff, 1); g.fillRect(6, 10, 20, 6); // Speed visor (cyan band)
        g.fillStyle(0xffffff, 1); g.fillRect(8, 11, 4, 4); g.fillRect(20, 11, 4, 4); // Eyes behind visor
        g.fillStyle(0x00aaff, 1); g.fillRect(11, 12, 2, 2); g.fillRect(21, 12, 2, 2); // Eye glow
        g.fillStyle(0x003388, 1); g.fillRect(6, 26, 20, 6); // Body
        g.fillStyle(0x00aaff, 1); g.fillRect(10, 28, 12, 2); // Speed stripe
        g.generateTexture('skin_12', 32, 32);

        // skin_13: MATADOR FUROR - Berserker with messy look
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 4, 20, 20, 5); // Face
        g.fillStyle(0x663300, 1); g.fillRect(6, 2, 20, 10); // Rough hair/mane
        g.fillStyle(0x884422, 1); g.fillRect(2, 4, 6, 4); g.fillRect(24, 4, 6, 4); // Side hair tufts
        g.fillStyle(0xff0000, 1); g.fillRect(9, 12, 5, 4); g.fillRect(18, 12, 5, 4); // Rage eyes (red)
        g.fillStyle(0xffaa00, 1); g.fillRect(9, 10, 5, 2); g.fillRect(18, 10, 5, 2); // Rage eyebrows
        g.fillStyle(0xcc3300, 1); g.fillRect(6, 24, 20, 8); // Battle-worn red body
        g.generateTexture('skin_13', 32, 32);

        // skin_14: ASSASSINO EM SÉRIE - Dark masked ninja
        g.clear();
        g.fillStyle(0x111111, 1); g.fillRoundedRect(4, 2, 24, 26, 6); // Black body
        g.fillStyle(0x222222, 1); g.fillRect(6, 4, 20, 20); // Slightly lighter face area
        g.fillStyle(0xff0055, 1); g.fillRect(8, 12, 6, 4); g.fillRect(18, 12, 6, 4); // Red assassin eyes
        g.fillStyle(0x000000, 1); g.fillRect(6, 18, 20, 2); // Mask band
        g.fillStyle(0x333333, 1); g.fillRect(4, 24, 24, 8); // Dark armor
        g.fillStyle(0xff0055, 1); g.fillRect(10, 26, 12, 2); // Chest emblem stripe
        g.generateTexture('skin_14', 32, 32);

        // skin_15: INICIANTE - Fresh recruit, clean uniform
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 5, 18, 18, 5); // Face
        g.fillStyle(0x00aaff, 1); g.fillRect(6, 3, 20, 8); // Blue cap
        g.fillStyle(0xffffff, 1); g.fillRect(6, 7, 20, 2); // Cap stripe
        g.fillStyle(0x000000, 1); g.fillRect(10, 14, 3, 3); g.fillRect(19, 14, 3, 3); // Eyes
        g.fillStyle(0x000000, 1); g.fillRect(14, 19, 4, 1); // Small smile
        g.fillStyle(0x00aaff, 1); g.fillRect(6, 23, 20, 9); // Blue uniform
        g.generateTexture('skin_15', 32, 32);

        // skin_16: EXPERIENTE - Battle-tested veteran look
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 5, 18, 18, 5); // Face
        g.fillStyle(0x445544, 1); g.fillRect(4, 3, 24, 9); // Camo helmet
        g.fillStyle(0x334433, 1); g.fillRect(6, 5, 8, 4); g.fillRect(18, 5, 6, 3); // Camo pattern
        g.fillStyle(0x000000, 1); g.fillRect(10, 14, 4, 3); g.fillRect(18, 14, 4, 3); // Eyes
        g.fillStyle(0xddaa88, 1); g.fillRect(12, 19, 5, 2); // Stubble
        g.fillStyle(0x445544, 1); g.fillRect(6, 23, 20, 9); // Camo body
        g.generateTexture('skin_16', 32, 32);

        // skin_17: MUITO FÁCIL - Casual, relaxed dude with sunglasses
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 5, 20, 20, 8); // Relaxed face
        g.fillStyle(0xffff00, 1); g.fillRect(6, 3, 20, 6); // Yellow cap flipped
        g.fillStyle(0x000000, 1); g.fillRect(8, 12, 16, 4); // Cool sunglasses
        g.fillStyle(0x333300, 1); g.fillRect(9, 13, 5, 2); g.fillRect(18, 13, 5, 2); // Sunglass lenses
        g.fillStyle(0x000000, 1); g.fillRect(13, 13, 5, 2); // Sunglass bridge
        g.fillStyle(0x000000, 1); g.fillRect(14, 19, 4, 2); // Smile
        g.fillStyle(0xffaa00, 1); g.fillRect(6, 25, 20, 7); // Casual shirt
        g.generateTexture('skin_17', 32, 32);

        // skin_18: APENAS UM ARRANHÃO - Bandaged/injured guy
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 5, 18, 20, 5); // Face
        g.fillStyle(0xffffff, 1); g.fillRect(6, 6, 10, 3); g.fillRect(8, 4, 6, 4); // Head bandage
        g.fillStyle(0xdddddd, 1); g.fillRect(7, 7, 8, 2); // Bandage detail
        g.fillStyle(0x000000, 1); g.fillRect(10, 14, 3, 3);  // One eye ok
        g.fillStyle(0xffffff, 1); g.fillRect(18, 12, 7, 3); // Eye patch
        g.fillStyle(0x000000, 1); g.fillRect(19, 13, 5, 1); // Patch strap
        g.fillStyle(0x000000, 1); g.fillRect(13, 20, 4, 1); // Slight frown
        g.fillStyle(0xaaaaaa, 1); g.fillRect(6, 25, 20, 7); // Bandaged chest
        g.fillStyle(0xffffff, 1); g.fillRect(8, 26, 16, 2); g.fillRect(8, 29, 16, 2); // Chest bandage stripes
        g.generateTexture('skin_18', 32, 32);

        // skin_19: DORMINHOCO - Sleepy guy with nightcap
        g.clear();
        g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 6, 20, 20, 8); // Drowsy face
        g.fillStyle(0x4444cc, 1); g.fillRect(6, 2, 20, 10); // Blue nightcap
        g.fillStyle(0xffffff, 1); g.fillRect(6, 10, 20, 2); // Cap band
        g.fillStyle(0x4444cc, 1); g.fillRect(22, 0, 4, 6); // Cap tip
        g.fillStyle(0x000000, 1); g.fillRect(9, 14, 5, 2); g.fillRect(18, 14, 5, 2); // Sleepy half-closed eyes
        g.fillStyle(0xffdbac, 1); g.fillRect(10, 14, 3, 1); g.fillRect(19, 14, 3, 1); // Eyelid drooping
        g.fillStyle(0x000000, 1); g.fillRect(14, 20, 4, 2); // Snoring mouth open
        g.fillStyle(0x4444cc, 1); g.fillRect(6, 26, 20, 6); // Pajama body
        g.fillStyle(0xffffff, 1); g.fillRect(6, 28, 4, 2); g.fillRect(14, 28, 4, 2); g.fillRect(22, 28, 4, 2); // Pajama dots
        g.generateTexture('skin_19', 32, 32);

        // skin_20: DEUS DA MORTE - Dark hooded figure, no face, animated black smoke
        // Frame 0 - base
        const generateDeathGod = (key, smokeOffset) => {
            const dg = this.add.graphics();
            // Dark cloak body
            dg.fillStyle(0x111111, 1); dg.fillRoundedRect(4, 8, 24, 24, 4);
            // Hood (expanded top)
            dg.fillStyle(0x0a0a0a, 1); dg.fillRoundedRect(2, 2, 28, 18, 10);
            // Inner void of hood - pure black, no face
            dg.fillStyle(0x000000, 1); dg.fillRoundedRect(7, 6, 18, 14, 6);
            // Subtle glowing eye slits (only hint of life)
            dg.fillStyle(0xff0000, 0.8); dg.fillRect(10, 11, 4, 1); dg.fillRect(18, 11, 4, 1);
            // Cloak folds
            dg.fillStyle(0x1a1a1a, 1); dg.fillRect(8, 18, 2, 12); dg.fillRect(22, 18, 2, 12); dg.fillRect(14, 20, 2, 10);
            // Smoke wisps (position changes per frame)
            dg.fillStyle(0x222222, 0.9);
            dg.fillRect(2 + smokeOffset, 4, 3, 3);
            dg.fillRect(26 - smokeOffset, 6, 2, 4);
            dg.fillRect(4, 8 + smokeOffset, 2, 2);
            dg.fillRect(26, 10 + smokeOffset, 3, 2);
            dg.fillStyle(0x333333, 0.7);
            dg.fillRect(0, 6 + smokeOffset, 2, 3);
            dg.fillRect(28 - smokeOffset, 4, 3, 2);
            dg.generateTexture(key, 32, 32);
            dg.destroy();
        };

        generateDeathGod('skin_20_f0', 0);
        generateDeathGod('skin_20_f1', 2);
        generateDeathGod('skin_20_f2', 1);

        if (this.anims.exists('skin_20_anim')) this.anims.remove('skin_20_anim');
        this.anims.create({
            key: 'skin_20_anim',
            frames: [{ key: 'skin_20_f0' }, { key: 'skin_20_f1' }, { key: 'skin_20_f2' }],
            frameRate: 4,
            repeat: -1
        });

        // Use first frame as static texture for skin_20
        generateDeathGod('skin_20', 0);

        g.destroy();
        this.graphics.destroy();
    }

    create() {
        console.log("GameScene: Create starting...");

        // FORÇAR debug desligado em todos os níveis possíveis
        this.physics.world.drawDebug = false;
        if (this.physics.world.debugGraphic) {
            this.physics.world.debugGraphic.clear();
            this.physics.world.debugGraphic.visible = false;
        }

        const { width, height } = this.scale;
        this.add.tileSprite(0, 0, width, height, 'floor').setOrigin(0).setScrollFactor(0).setAlpha(0.6);

        this.player = new Player(this, 400, 300);

        if (this.persistedPlayer) {
            this.player.health = this.persistedPlayer.health;
            this.player.maxHealth = this.persistedPlayer.maxHealth;
            this.player.coins = this.persistedPlayer.coins;
            this.player.damageMultiplier = this.persistedPlayer.damageMultiplier;
            this.player.speedMultiplier = this.persistedPlayer.speedMultiplier;
            this.player.gadgets = this.persistedPlayer.gadgets || this.player.gadgets;
        } else {
            // Apply Difficulty HP Mutliplier base
            this.player.health *= this.difficultyConfig.hpMult;
            this.player.maxHealth *= this.difficultyConfig.hpMult;

            // Apply Character Specific Buffs
            if (this.characterTemplate.buffs.damageMult) {
                this.player.damageMultiplier *= this.characterTemplate.buffs.damageMult;
            }
            if (this.characterTemplate.buffs.speedMult) {
                this.player.speedMultiplier *= this.characterTemplate.buffs.speedMult;
            }
            if (this.characterTemplate.buffs.maxHealthBonus) {
                this.player.maxHealth += this.characterTemplate.buffs.maxHealthBonus;
                this.player.health = this.player.maxHealth;
            }

            // Apply Character Gadgets
            if (this.characterTemplate.gadgets.turrets) {
                for (let el in this.characterTemplate.gadgets.turrets) {
                    this.player.gadgets.turrets[el] = this.characterTemplate.gadgets.turrets[el];
                }
            }
            if (this.characterTemplate.gadgets.forceFields) {
                for (let el in this.characterTemplate.gadgets.forceFields) {
                    this.player.gadgets.forceFields[el] = this.characterTemplate.gadgets.forceFields[el];
                }
            }
            if (this.characterTemplate.gadgets.specialShots) {
                for (let el in this.characterTemplate.gadgets.specialShots) {
                    this.player.gadgets.specialShots[el] = this.characterTemplate.gadgets.specialShots[el];
                }
            }
        }

        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        this.fireTrails = this.physics.add.group(); // rastro de fogo no chão
        this.fireParticles = this.add.particles(0, 0, 'icon_fire', {
            speed: { min: 20, max: 60 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            emitting: false
        });
        this.fireParticles.setDepth(15);

        this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, defaultKey: 'bullet', maxSize: 50 });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBullet', maxSize: 100 });
        this.coins = this.physics.add.group();
        this.walls = this.physics.add.staticGroup();
        this.spawners = this.physics.add.staticGroup();

        this.createMap();

        this.cursors = this.input.keyboard.createCursorKeys();

        // Dynamic Key Bindings
        this.keys = this.input.keyboard.addKeys({
            UP: settingsManager.getBinding('UP'),
            LEFT: settingsManager.getBinding('LEFT'),
            DOWN: settingsManager.getBinding('DOWN'),
            RIGHT: settingsManager.getBinding('RIGHT')
        });

        // Dynamic Shooting
        this.input.on('pointerdown', (pointer) => {
            const shootBinding = settingsManager.getBinding('SHOOT');
            let shouldShoot = false;

            if (shootBinding === 'LEFT_CLICK' && pointer.leftButtonDown()) shouldShoot = true;
            else if (shootBinding === 'RIGHT_CLICK' && pointer.rightButtonDown()) shouldShoot = true;
            else if (shootBinding === 'MIDDLE_CLICK' && pointer.middleButtonDown()) shouldShoot = true;
            else if (pointer.noButtonDown() === false) {
                // If it's a key, we handle it elsewhere or here? 
                // Actually, if someone binds a KEY to shoot, we should handle it.
                // But for now, user asked for mouse. Let's support keys too.
            }

            if (shouldShoot) this.shoot();
        });

        // Support for keyboard shooting if bound
        const shootKey = settingsManager.getBinding('SHOOT');
        if (!shootKey.includes('CLICK')) {
            this.shootKey = this.input.keyboard.addKey(shootKey);
            this.shootKey.on('down', () => this.shoot());
        }

        // Gadget Groups
        this.activeTurrets = this.add.group();
        this.gadgetGraphics = this.add.graphics();
        this.setupGadgets();

        // INITIALIZE HEALTH BAR EARLY
        this.healthBar = this.add.graphics();
        console.log("GameScene: HealthBar initialized:", !!this.healthBar);

        this.generatePixelIcons();

        this.spawnWave();

        // Debug Shop Setup
        this.debugShopOpen = false;
        this.debugShopIndex = 0;
        this.debugShopContainer = null;

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            this.handleBulletHit(bullet, enemy);
        });

        // Fire Trails (Overlap)
        this.physics.add.overlap(this.enemies, this.fireTrails, (enemy, trail) => {
            if (enemy.active && trail.active) {
                if (!enemy.lastFireTrailHurt || this.time.now > enemy.lastFireTrailHurt + 500) {
                    enemy.takeDamage(12 * this.player.damageMultiplier);
                    enemy.lastFireTrailHurt = this.time.now;
                    enemy.setTint(0xff4400);
                    this.time.delayedCall(100, () => { if (enemy.active && !enemy.isPoisoned) enemy.clearTint(); });
                }
            }
        });



        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            if (!player.isImmortal) {
                player.health -= enemy.damage / 60;
                if (enemy.isBat) player.applyPoison(this);
            }
            if (player.health <= 0) this.scene.start('GameOverScene_v6', { wave: this.wave, difficulty: this.difficulty, enemiesKilled: this.enemiesKilled });
        });

        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            player.coins += Math.floor(5 * (coin.coinMult || 1));
            this.updateUI();
            coin.destroy();
        });

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.bullets, this.walls, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.enemyBullets, this.walls, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.player, this.enemyBullets, (player, bullet) => {
            const isBossBullet = bullet.texture.key === 'bossBullet';

            if (!player.isImmortal) {
                player.health -= isBossBullet ? 25 : 10;
            }

            // Visual feedback for boss hit
            if (isBossBullet) {
                this.cameras.main.shake(100, 0.01);
            }

            bullet.destroy();
            this.updateUI();
            if (player.health <= 0) this.scene.start('GameOverScene_v6', { wave: this.wave, difficulty: this.difficulty, enemiesKilled: this.enemiesKilled });
        });
        this.physics.add.collider(this.enemies, this.enemies);

        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => this.togglePause());

        // DEBUG SHOP / IMMORTALITY TOGGLE
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.pKey.on('down', () => {
            this.toggleDebugShop();
        });

        this.setupUI();

        // ANIMAÇÃO DO RAIO ELÉTRICO
        this.anims.create({
            key: 'bolt_anim',
            frames: [
                { key: 'bolt_frame_0' },
                { key: 'bolt_frame_1' },
                { key: 'bolt_frame_2' },
                { key: 'bolt_frame_3' }
            ],
            frameRate: 20,
            repeat: -1
        });

        // POISON SKULL TEXTURE (Generated dynamically)
        if (!this.textures.exists('poison_skull')) {
            const canvas = this.textures.createCanvas('poison_skull', 16, 16);
            const ctx = canvas.getContext();
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(4, 2, 8, 5); // top head
            ctx.fillRect(3, 3, 10, 4); // mid head
            ctx.fillStyle = '#111111'; // background/eyes
            ctx.clearRect(5, 4, 2, 2); // left eye
            ctx.clearRect(9, 4, 2, 2); // right eye
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(5, 8, 6, 2); // teeth base
            ctx.clearRect(6, 8, 1, 2); // gap
            ctx.clearRect(9, 8, 1, 2); // gap
            // crossbones
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(2, 11, 2, 2);
            ctx.fillRect(12, 11, 2, 2);
            ctx.fillRect(4, 10, 8, 2);
            ctx.fillRect(2, 13, 2, 2);
            ctx.fillRect(12, 13, 2, 2);
            canvas.refresh();
        }

        // POISON SMOKE TEXTURE
        if (!this.textures.exists('poison_smoke')) {
            const smokeCanvas = this.textures.createCanvas('poison_smoke', 8, 8);
            const sCtx = smokeCanvas.getContext();
            sCtx.fillStyle = '#00ff00';
            sCtx.beginPath();
            sCtx.arc(4, 4, 4, 0, Math.PI * 2);
            sCtx.fill();
            smokeCanvas.refresh();
        }

        // Setup Poison Smoke Particle Manager
        this.poisonSmokeParticles = this.add.particles(0, 0, 'poison_smoke', {
            speed: 10,
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            emitting: false
        });
        this.poisonSmokeParticles.setDepth(10); // Above background, below player/bullets usually

        this.setupPauseUIListeners();
        this.events.on('shutdown', this.shutdown, this);
        console.log("GameScene: Create finished.");
    }

    setupPauseUIListeners() {
        const resumeBtn = document.getElementById('resume-btn');
        const controlsBtn = document.getElementById('controls-btn');
        const quitBtn = document.getElementById('quit-btn');
        const backToPauseBtn = document.getElementById('back-to-pause');

        if (resumeBtn) resumeBtn.onclick = () => this.togglePause();
        if (controlsBtn) controlsBtn.onclick = () => this.showControls(true);
        if (backToPauseBtn) backToPauseBtn.onclick = () => this.showControls(false);
        if (quitBtn) quitBtn.onclick = () => {
            this.togglePause();
            this.scene.start('StartScene_v6');
        };
    }

    togglePause() {
        this.isWavePaused = !this.isWavePaused;
        const overlay = document.getElementById('pause-overlay');
        const menu = document.getElementById('pause-menu');
        const controls = document.getElementById('controls-panel');

        if (this.isWavePaused) {
            this.physics.pause();
            this.tweens.pauseAll();
            if (overlay) overlay.style.display = 'flex';
            if (menu) menu.style.display = 'flex';
            if (controls) controls.style.display = 'none';
        } else {
            this.physics.resume();
            this.tweens.resumeAll();
            if (overlay) overlay.style.display = 'none';
        }
    }

    shutdown() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    showControls(show) {
        const menu = document.getElementById('pause-menu');
        const controls = document.getElementById('controls-panel');
        if (show) {
            if (menu) menu.style.display = 'none';
            if (controls) controls.style.display = 'block';
        } else {
            if (menu) menu.style.display = 'flex';
            if (controls) controls.style.display = 'none';
        }
    }

    update() {
        if (this.isWavePaused) {
            if (this.healthBar) this.healthBar.clear();
            return;
        }

        if (this.player) {
            const movement = {
                up: this.keys.UP,
                left: this.keys.LEFT,
                down: this.keys.DOWN,
                right: this.keys.RIGHT
            };
            this.player.update(movement, this.input.activePointer);
        }

        // Bullet effects (Trails and Smoke)
        if (this.bullets) {
            this.bullets.getChildren().forEach(b => {
                if (!b.active) return;

                // Poison effect
                if (b.element === 'poison' && this.poisonSmokeParticles) {
                    this.poisonSmokeParticles.emitParticleAt(
                        b.x + Phaser.Math.Between(-4, 4),
                        b.y + Phaser.Math.Between(-4, 4)
                    );
                }

                // Fire Trail effect (Ground embers)
                if (b.element === 'fire') {
                    // Partículas de cauda (Fumaça pequena)
                    if (this.fireParticles) {
                        this.fireParticles.emitParticleAt(b.x, b.y);
                    }

                    if (!b.lastTrailTime || this.time.now > b.lastTrailTime + 150) {
                        b.lastTrailTime = this.time.now;
                        const trail = this.fireTrails.create(b.x, b.y, 'trail_flame');
                        if (trail) {
                            trail.setDepth(5);
                            trail.setAlpha(0.6);
                            trail.setScale(Phaser.Math.FloatBetween(0.6, 0.9));
                            trail.body.setSize(8, 8);

                            this.tweens.add({
                                targets: trail,
                                alpha: 0,
                                scale: 0.1,
                                duration: 800,
                                onComplete: () => { if (trail.active) trail.destroy(); }
                            });
                        }
                    }
                }
            });
        }

        // Smoke for poisoned enemies
        if (this.poisonSmokeParticles && this.enemies) {
            this.enemies.getChildren().forEach(enemy => {
                if (enemy.active && enemy.isPoisoned) {
                    this.poisonSmokeParticles.emitParticleAt(
                        enemy.x + Phaser.Math.Between(-10, 10),
                        enemy.y + Phaser.Math.Between(-15, 5)
                    );
                }
            });
        }

        this.updateGadgets();
        this.updateHealthBar();

        if (this.enemiesKilled >= this.enemiesPerWave && !this.isWavePaused) {
            this.completeWave();
        }
    }

    updateHealthBar() {
        if (!this.healthBar) return;
        this.healthBar.clear();

        if (this.player) {
            const px = this.player.x - 20;
            const py = this.player.y - 30;
            this.healthBar.fillStyle(0x000000, 0.5);
            this.healthBar.fillRect(px, py, 40, 6);
            const pPct = Math.max(0, this.player.health / this.player.maxHealth);
            this.healthBar.fillStyle(pPct > 0.5 ? 0x00ff00 : (pPct > 0.25 ? 0xffff00 : 0xff0000), 1);
            this.healthBar.fillRect(px + 1, py + 1, 38 * pPct, 4);
        }

        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isBoss && enemy.active) {
                const bx = enemy.x - 40;
                const by = enemy.y - 75; // Adjusted to be closer to the boss
                const bWidth = 80;
                const bPct = Math.max(0, enemy.health / enemy.maxHealth);

                // Outer glow/border
                this.healthBar.lineStyle(2, 0x00f2ff, 0.3);
                this.healthBar.strokeRect(bx - 2, by - 2, bWidth + 4, 12);

                this.healthBar.fillStyle(0x000000, 0.7);
                this.healthBar.fillRect(bx, by, bWidth, 8);
                this.healthBar.fillStyle(0xff0055, 1);
                this.healthBar.fillRect(bx + 1, by + 1, (bWidth - 2) * bPct, 6);
            }
        });
    }

    spawnWave() {
        this.enemiesKilled = 0;
        this.isBossWave = (this.wave % 4 === 0);
        if (this.isBossWave) {
            this.enemiesPerWave = 1;
            this.time.delayedCall(1000, () => this.spawnBoss());
        } else {
            this.enemiesPerWave = 3 + (this.wave - 1) * 5;
            this.enemiesSpawned = 0;
            this.spawnEnemy();
            this.enemiesSpawned++;
            this.time.addEvent({
                delay: 1500,
                callback: () => {
                    if (this.enemiesSpawned < this.enemiesPerWave) {
                        this.spawnEnemy();
                        this.enemiesSpawned++;
                    }
                },
                callbackScope: this,
                repeat: this.enemiesPerWave - 2
            });
        }
    }

    spawnBoss() {
        const portalList = this.spawners.getChildren();
        if (portalList.length === 0) return;
        const portal = portalList[Phaser.Math.Between(0, portalList.length - 1)];
        const boss = new Enemy(this, portal.x, portal.y, this.wave);
        boss.setTexture('boss');
        boss.setScale(1.5);
        boss.health = 450 * (1 + (this.wave * 0.3));
        boss.maxHealth = boss.health;
        boss.isBoss = true;
        boss.clearTint();

        // Restricted Hitbox: Only the head (24x24)
        boss.body.setSize(24, 24);
        boss.body.setOffset(20, 6);

        this.enemies.add(boss);

        const nameTag = this.add.text(boss.x, boss.y - 88, 'Rafael Rosseti', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#00f2ff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.events.on('update', () => {
            if (boss.active) nameTag.setPosition(boss.x, boss.y - 88);
            else nameTag.destroy();
        });
    }

    spawnEnemy() {
        const portalList = this.spawners.getChildren();
        if (portalList.length === 0) return;
        const portal = portalList[Phaser.Math.Between(0, portalList.length - 1)];

        let texture = 'enemy';
        let isYellow = false;
        let isBat = false;

        if (this.wave === 7) {
            texture = 'yellowEnemy';
            isYellow = true;
        } else if (this.wave > 7) {
            const rand = Math.random();
            if (rand < 0.3) {
                texture = 'yellowEnemy';
                isYellow = true;
            } else if (rand < 0.6 && this.wave >= 5) {
                texture = 'poisonBat';
                isBat = true;
            }
        } else if (this.wave >= 5 && Math.random() < 0.3) {
            texture = 'poisonBat';
            isBat = true;
        }

        const enemy = new Enemy(this, portal.x, portal.y, this.wave);
        if (isYellow) {
            enemy.setTexture('yellowEnemy');
            enemy.isYellow = true;
            enemy.speed *= 0.8;
            enemy.clearTint();
            console.log("Spawned YELLOW ENEMY at wave", this.wave);
        } else if (isBat) {
            enemy.setTexture('poisonBat');
            enemy.isBat = true;
            enemy.clearTint();
            console.log("Spawned BAT ENEMY at wave", this.wave);
        } else {
            // Apply Fire variant (Red Enemy)
            enemy.play('enemy_burn_anim', true);
            console.log("Spawned FIRE ENEMY at wave", this.wave);
        }

        this.enemies.add(enemy);
    }

    spawnCoin(x, y) {
        const coin = this.coins.create(x, y, 'coin');
        coin.setBounce(0.5);
        coin.coinMult = this.difficultyConfig.coinMult;
    }

    toggleDebugShop() {
        this.debugShopOpen = !this.debugShopOpen;
        this.isWavePaused = this.debugShopOpen;

        if (this.debugShopOpen) {
            this.physics.pause();
            this.player.isImmortal = true;
            this.player.setTint(0xffff00);
            this.createDebugShopUI();
        } else {
            this.physics.resume();
            if (this.debugShopContainer) {
                this.debugShopContainer.destroy();
                this.debugShopContainer = null;
                this.debugShopItemsContainer = null;
            }
        }
    }

    createDebugShopUI() {
        if (this.debugShopContainer) this.debugShopContainer.destroy();

        const { width, height } = this.scale;
        this.debugShopContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);
        const title = this.add.text(width / 2, 80, "DEBUG SHOP (TEST MODE)", {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#00f2ff'
        }).setOrigin(0.5);

        const hint = this.add.text(width / 2, height - 60, "Press [P] to Resume Game", {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#ffffff',
            alpha: 0.7
        }).setOrigin(0.5);

        this.debugShopItemsContainer = this.add.container(0, 0);
        this.debugShopContainer.add([overlay, title, hint, this.debugShopItemsContainer]);
        this.renderDebugItems();
    }

    renderDebugItems() {
        if (!this.debugShopItemsContainer) return;
        this.debugShopItemsContainer.removeAll(true);

        const { width, height } = this.scale;
        const startX = width / 2 - 220;
        const itemWidth = 220;

        for (let i = 0; i < 3; i++) {
            const itemIdx = (this.debugShopIndex + i) % GADGET_DEFINITIONS.length;
            const gadget = GADGET_DEFINITIONS[itemIdx];
            const x = startX + (i * itemWidth);
            const y = height / 2;
            const element = ELEMENTS[gadget.element.toUpperCase()];

            const card = this.add.rectangle(x, y, 200, 240, 0x1a1a25).setStrokeStyle(2, element.color);
            const name = this.add.text(x, y - 80, gadget.name, {
                fontFamily: '"Press Start 2P"',
                fontSize: '10px',
                fill: '#ffffff', // changed to white
                align: 'center',
                wordWrap: { width: 180 }
            }).setOrigin(0.5);

            const icon = this.add.image(x, y - 40, 'icon_' + gadget.element).setScale(2);
            const desc = this.add.text(x, y + 20, gadget.desc, {
                fontFamily: '"Press Start 2P"',
                fontSize: '8px',
                fill: '#ddd',
                align: 'center',
                wordWrap: { width: 170 }
            }).setOrigin(0.5);

            const btn = this.add.text(x, y + 80, "[ ADD ]", {
                fontFamily: '"Press Start 2P"',
                fontSize: '12px',
                fill: '#00ff00'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                const typeKey = gadget.type === GADGET_TYPES.TURRET ? 'turrets' :
                    (gadget.type === GADGET_TYPES.FORCE_FIELD ? 'forceFields' : 'specialShots');

                if (!this.player.gadgets[typeKey][gadget.element]) {
                    this.player.gadgets[typeKey][gadget.element] = 1;
                } else {
                    this.player.gadgets[typeKey][gadget.element]++;
                }
                this.cameras.main.flash(200, 0, 255, 0);
                this.setupGadgets();
            });

            this.debugShopItemsContainer.add([card, name, icon, desc, btn]);
        }

        const leftArrow = this.add.text(40, height / 2, "<", { fontSize: '40px', fill: '#fff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.debugShopIndex = (this.debugShopIndex - 1 + GADGET_DEFINITIONS.length) % GADGET_DEFINITIONS.length;
                this.renderDebugItems();
            });

        const rightArrow = this.add.text(width - 40, height / 2, ">", { fontSize: '40px', fill: '#fff' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.debugShopIndex = (this.debugShopIndex + 1) % GADGET_DEFINITIONS.length;
                this.renderDebugItems();
            });

        this.debugShopItemsContainer.add([leftArrow, rightArrow]);
    }


    handleBulletHit(bullet, enemy) {
        if (!bullet || !bullet.active || !enemy || !enemy.active) return;

        // Se o tiro não for elétrico (que ricocheteia) ou se o elétrico já bateu no limite,
        // PARAR e ESCONDER a bala no exato momento do impacto para não voar pra longe.
        const isElectric = (bullet.element === 'electric');
        const canChain = isElectric && (bullet.chainCount || 0) < 2;

        if (!canChain) {
            // Isso mata a velocidade, desliga a física e esconde a bala INSTANTANEAMENTE
            bullet.disableBody(true, true);
        }

        // APLICAR DANO (Estava faltando!)
        enemy.takeDamage(10 * this.player.damageMultiplier);

        // Elemenal Shot Effects on hit
        if (bullet.element === 'poison') {
            enemy.applyPoison(this);
        } else if (bullet.element === 'push') {
            // APPLY KNOCKBACK EFFECT
            this.applyElementalEffect(enemy, 'push', 1, false);
        } else if (bullet.element === 'force') {
            // AREA OF EFFECT "IMPACT BOLT" EXPLOSION
            const blastRadius = 120;
            const splashDamage = 15 * this.player.damageMultiplier;

            // Visual Blast Indicator
            const blast = this.add.graphics();
            blast.fillStyle(0xffffff, 0.8);
            blast.fillCircle(enemy.x, enemy.y, 10);
            blast.setDepth(20);

            // Blast expansion animation
            this.tweens.add({
                targets: blast,
                scaleX: blastRadius / 10,
                scaleY: blastRadius / 10,
                alpha: 0,
                duration: 250,
                onComplete: () => blast.destroy()
            });

            // Apply Area Damage to nearby enemies
            this.enemies.getChildren().forEach(e => {
                if (e.active && e !== enemy) {
                    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, e.x, e.y);
                    if (dist <= blastRadius) {
                        e.takeDamage(splashDamage);
                        e.setTint(0xffffff);
                        this.time.delayedCall(100, () => { if (e.active && !e.isPoisoned) e.clearTint(); });
                    }
                }
            });
            // Bala já foi escondida e parada no topo; vamos destruí-la agora.
            bullet.destroy();
            return;
        }

        // Lógica de Ricochete Elétrico (Volt Shot)
        if (isElectric && canChain) {
            bullet.chainCount = (bullet.chainCount || 0) + 1;

            // Encontrar o próximo alvo mais próximo
            const nextTarget = this.enemies.getChildren().find(e =>
                e !== enemy && e.active &&
                Phaser.Math.Distance.Between(bullet.x, bullet.y, e.x, e.y) < 250
            );

            if (nextTarget) {
                this.gadgetGraphics.lineStyle(2, 0x00f2ff, 1);
                this.gadgetGraphics.lineBetween(enemy.x, enemy.y, nextTarget.x, nextTarget.y);
                this.time.delayedCall(50, () => { if (this.gadgetGraphics) this.gadgetGraphics.clear(); });

                this.physics.moveToObject(bullet, nextTarget, 400);
                bullet.setRotation(Phaser.Math.Angle.Between(bullet.x, bullet.y, nextTarget.x, nextTarget.y));
                return;
            }
        }

        // Se chegamos aqui e a bala ainda existe (não ricocheteou), mata ela de vez.
        bullet.destroy();
    }

    completeWave() {
        this.player.coins += 50;
        console.log("GameScene: Wave complete. Starting UpgradeScene_v6");
        this.scene.start('UpgradeScene_v6', {
            difficulty: this.difficulty,
            character: this.characterId,
            skin: this.playerSkin,
            player: {
                health: this.player.health,
                maxHealth: this.player.maxHealth,
                coins: this.player.coins,
                damageMultiplier: this.player.damageMultiplier,
                speedMultiplier: this.player.speedMultiplier,
                gadgets: this.player.gadgets
            },
            wave: this.wave
        });
    }

    setupUI() {
        const ui = document.getElementById('ui-layer');
        if (!ui) return;

        // Ensure Pause Overlay exists (prevents cache issues)
        if (!document.getElementById('pause-overlay')) {
            console.log("GameScene: Pause UI missing, injecting...");
            const pauseHTML = `
                <div id="pause-overlay" class="pause-overlay" style="display: none;">
                    <div id="pause-menu" class="pause-menu">
                        <h2 style="color: var(--primary); text-align: center; margin-bottom: 2rem;">PAUSA</h2>
                        <button class="pause-btn" id="resume-btn">Voltar</button>
                        <button class="pause-btn" id="controls-btn">Controles</button>
                        <button class="pause-btn exit" id="quit-btn">Sair</button>
                    </div>
                    <div id="controls-panel" class="controls-panel"></div>
                </div>
            `;
            ui.insertAdjacentHTML('afterbegin', pauseHTML);
        }

        // Update instructions panel content dynamically
        const controlsContent = `
            <h3 style="color: var(--secondary); text-align: center;">CONTROLES</h3>
            <div class="controls-grid">
                <div class="control-item">
                    <div style="display: flex; flex-direction: column; gap: 5px; align-items: center;">
                        <div class="key-box">${settingsManager.getBinding('UP')}</div>
                        <div style="display: flex; gap: 5px;">
                            <div class="key-box">${settingsManager.getBinding('LEFT')}</div>
                            <div class="key-box">${settingsManager.getBinding('DOWN')}</div>
                            <div class="key-box">${settingsManager.getBinding('RIGHT')}</div>
                        </div>
                    </div>
                    <span>MOVER</span>
                </div>
                <div class="control-item">
                    <div class="mouse-icon"></div>
                    <span>${settingsManager.getBinding('SHOOT').replace('_', ' ')}</span>
                </div>
            </div>
            <button class="pause-btn" id="back-to-pause" style="margin-top: 2rem; width: 100%;">Voltar</button>
        `;
        const controlsPanel = document.getElementById('controls-panel');
        if (controlsPanel) controlsPanel.innerHTML = controlsContent;

        // HUD - Wave and Coins (Ensure only one instance exists)
        if (!document.getElementById('wave-container')) {
            ui.insertAdjacentHTML('beforeend', `
                <div id="wave-container" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); text-align: center; pointer-events: none;">
                    <div style="font-family: 'Press Start 2P', cursive; font-size: 18px; color: var(--secondary);">WAVE <span id="wave-count">1</span></div>
                </div>
                <div id="game-stats" style="position: absolute; top: 20px; right: 20px; font-family: 'Press Start 2P', cursive; font-size: 14px; color: #ffda00;">
                    <div>$ <span id="coin-count">0</span></div>
                </div>
            `);
        }
    }

    updateUI() {
        const waveCount = document.getElementById('wave-count');
        const coinCount = document.getElementById('coin-count');
        if (waveCount) waveCount.innerText = this.wave;
        if (coinCount) coinCount.innerText = this.player.coins;
    }

    createMap() {
        // Clear previous walls if any
        if (this.walls) {
            this.walls.clear(true, true);
        } else {
            this.walls = this.physics.add.staticGroup();
        }

        const { width, height } = this.scale;
        const tileSize = 32;
        const gridW = Math.floor(width / tileSize);
        const gridH = Math.floor(height / tileSize);

        // Areas to keep clear (Player start and Portals)
        const clearZones = [
            { x: 400, y: 300, radius: 100 }, // Player start
            { x: 100, y: 100, radius: 80 },  // Top-left portal
            { x: 700, y: 100, radius: 80 },  // Top-right portal
            { x: 100, y: 500, radius: 80 },  // Bottom-left portal
            { x: 700, y: 500, radius: 80 }   // Bottom-right portal
        ];

        const isClear = (x, y) => {
            return !clearZones.some(zone => {
                const dist = Phaser.Math.Distance.Between(x, y, zone.x, zone.y);
                return dist < zone.radius;
            });
        };

        // Number of wall clusters scales slightly with wave
        const numClusters = 5 + Math.min(10, Math.floor(this.wave / 2));
        for (let i = 0; i < numClusters; i++) {
            let startX = Phaser.Math.Between(1, gridW - 2) * tileSize;
            let startY = Phaser.Math.Between(1, gridH - 2) * tileSize;

            if (isClear(startX, startY)) {
                const clusterSize = Phaser.Math.Between(2, 6);
                const horizontal = Math.random() > 0.5;

                for (let j = 0; j < clusterSize; j++) {
                    const wx = horizontal ? startX + (j * tileSize) : startX;
                    const wy = horizontal ? startY : startY + (j * tileSize);

                    // Check boundaries and clear zones for each block
                    if (wx > 32 && wx < width - 32 && wy > 32 && wy < height - 32 && isClear(wx, wy)) {
                        this.walls.create(wx, wy, 'wall').refreshBody();
                    }
                }
            }
        }

        // Portals (Visuals only, logic is in spawners group)
        if (this.spawners) this.spawners.clear(true, true);
        else this.spawners = this.physics.add.staticGroup();

        const portalPositions = [{ x: 100, y: 100 }, { x: 700, y: 100 }, { x: 100, y: 500 }, { x: 700, y: 500 }];
        portalPositions.forEach(pos => {
            const portal = this.add.sprite(pos.x, pos.y, 'portal');
            this.spawners.add(portal);
            this.tweens.add({ targets: portal, angle: 360, duration: 3000, repeat: -1 });
        });
    }

    setupGadgets() {
        // Clear existing turrets to prevent duplicates when re-setting up (e.g., from Debug Shop)
        if (this.activeTurrets) this.activeTurrets.clear(true, true);

        // Initialize Turrets based on player stats
        Object.keys(this.player.gadgets.turrets).forEach((element, index) => {
            const level = this.player.gadgets.turrets[element];
            const angle = (index / Object.keys(this.player.gadgets.turrets).length) * Math.PI * 2;
            const dist = 60;
            const turret = this.add.container(this.player.x + Math.cos(angle) * dist, this.player.y + Math.sin(angle) * dist);

            const elementData = ELEMENTS[element.toUpperCase()];
            const elementColor = elementData.color;

            // 1. Base pedestal (Gray/Metal)
            const baseCircle = this.add.circle(0, 0, 12, 0x444444).setStrokeStyle(2, 0x222222);
            const baseTop = this.add.circle(0, 0, 8, 0x666666);
            const pedestal = this.add.container(0, 0, [baseCircle, baseTop]);

            // 2. Body (Replaces the Orange with Element Color)
            const bodyMain = this.add.rectangle(2, 0, 16, 14, elementColor).setStrokeStyle(2, 0x222222);
            const bodyDetail = this.add.rectangle(-4, 0, 8, 10, 0x333333); // dark engine/core part at the back

            // 3. Barrels (Gatling style)
            const barrel1 = this.add.rectangle(16, -4, 14, 3, 0x222222);
            const barrel2 = this.add.rectangle(18, 0, 14, 4, 0x222222);
            const barrel3 = this.add.rectangle(16, 4, 14, 3, 0x222222);

            // 4. Element Glow / Details on Barrels
            const glow1 = this.add.rectangle(22, -4, 4, 3, elementColor);
            const glow2 = this.add.rectangle(24, 0, 4, 4, elementColor);
            const glow3 = this.add.rectangle(22, 4, 4, 3, elementColor);

            // 5. Element Icon (Damage Element Indicator)
            const icon = this.add.image(2, 0, 'icon_' + element).setOrigin(0.5);

            // Grouping the rotating part (Body + Barrels)
            const gunGroup = this.add.container(0, 0, [
                bodyMain, bodyDetail,
                barrel1, barrel2, barrel3,
                glow1, glow2, glow3,
                icon
            ]);

            turret.add([pedestal, gunGroup]);
            turret.element = element;
            turret.level = level;
            turret.nextFire = 0;
            this.activeTurrets.add(turret);
        });
    }

    updateGadgets() {
        if (this.isWavePaused) return;

        this.gadgetGraphics.clear();

        // 1. Force Fields
        Object.keys(this.player.gadgets.forceFields).forEach(element => {
            const level = this.player.gadgets.forceFields[element];
            const elementData = ELEMENTS[element.toUpperCase()];
            const radius = 60 + (level * 10);

            // Visual Aura
            this.gadgetGraphics.lineStyle(2, elementData.color, 0.4);
            this.gadgetGraphics.strokeCircle(this.player.x, this.player.y, radius);

            // Particle effect simulation (Increases with level)
            const particleCount = 2 + level;
            for (let i = 0; i < particleCount; i++) {
                const ang = this.time.now * (0.005 + (level * 0.001)) + (i * (Math.PI * 2 / particleCount));
                this.gadgetGraphics.fillStyle(elementData.color, 0.6 + (level * 0.05));
                this.gadgetGraphics.fillCircle(
                    this.player.x + Math.cos(ang) * radius,
                    this.player.y + Math.sin(ang) * radius,
                    2 + (level * 0.5)
                );
            }

            // Damage logic
            this.enemies.getChildren().forEach(enemy => {
                if (!enemy.active) return;
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                if (dist < radius) {
                    this.applyElementalEffect(enemy, element, level, true);
                }
            });
        });

        // 2. Turrets
        const totalTurrets = this.activeTurrets.getChildren().length;
        this.activeTurrets.getChildren().forEach((turret, index) => {
            // Orbit player - Uniform spacing
            const orbitAngle = (this.time.now * 0.001) + (index * (Math.PI * 2 / totalTurrets));
            const dist = 70;
            turret.x = this.player.x + Math.cos(orbitAngle) * dist;
            turret.y = this.player.y + Math.sin(orbitAngle) * dist;

            // Target strongest
            let strongest = null;
            let maxHP = -1;
            this.enemies.getChildren().forEach(enemy => {
                if (enemy.active && enemy.health > maxHP) {
                    const d = Phaser.Math.Distance.Between(turret.x, turret.y, enemy.x, enemy.y);
                    if (d < 300) {
                        maxHP = enemy.health;
                        strongest = enemy;
                    }
                }
            });

            if (strongest) {
                const angle = Phaser.Math.Angle.Between(turret.x, turret.y, strongest.x, strongest.y);
                turret.getAt(1).setRotation(angle); // Rotate gun

                if (this.time.now > turret.nextFire) {
                    this.fireTurret(turret, strongest);
                    turret.nextFire = this.time.now + (1000 / turret.level);
                }
            }
        });
    }

    fireTurret(turret, target) {
        const thickness = 1 + turret.level;
        const color = ELEMENTS[turret.element.toUpperCase()].color;

        // Use a separate graphics object for the shot effect so we don't clear the force fields
        const trace = this.add.graphics();
        trace.lineStyle(thickness, color, 1);

        // Tracer line
        trace.lineBetween(turret.x, turret.y, target.x, target.y);

        // Muzzle flash
        const angle = Phaser.Math.Angle.Between(turret.x, turret.y, target.x, target.y);
        const barrelTipX = turret.x + Math.cos(angle) * 24;
        const barrelTipY = turret.y + Math.sin(angle) * 24;

        trace.fillStyle(0xffffff, 0.9);
        trace.fillCircle(barrelTipX, barrelTipY, 5);
        trace.fillStyle(color, 0.6);
        trace.fillCircle(barrelTipX, barrelTipY, 9);

        // Fade out quickly for a snappy minigun feel
        this.tweens.add({
            targets: trace,
            alpha: 0,
            duration: 80,
            onComplete: () => trace.destroy()
        });

        // Safety check: target might be destroyed by takeDamage
        if (target && target.active) {
            this.applyElementalEffect(target, turret.element, turret.level, false);
        }
    }

    applyElementalEffect(enemy, element, level, isAura) {
        if (!enemy || !enemy.active) return;

        const damage = (isAura ? 0.2 : 5) * level;
        enemy.takeDamage(damage);

        if (!enemy.active) return; // Died from damage

        switch (element) {
            case 'electric':
                if (Math.random() < 0.1) {
                    enemy.speed *= 0.5; // Stun-like slow
                    this.time.delayedCall(500, () => { if (enemy.active) enemy.speed *= 2; });
                }
                break;
            case 'fire':
                enemy.setTint(0xffaa00);
                this.time.delayedCall(100, () => { if (enemy.active) enemy.clearTint(); });
                break;
            case 'push':
                const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                const knockback = isAura ? 5 : 50; // Increased massively for the bullet hit
                enemy.x += Math.cos(ang) * knockback;
                enemy.y += Math.sin(ang) * knockback;
                break;
            case 'poison':
                enemy.applyPoison(this);
                break;
        }
    }

    shoot() {
        if (this.isWavePaused) return;

        // Cooldown para evitar múltiplos disparos por clique
        const now = this.time.now;
        if (this.lastShootTime && now - this.lastShootTime < 200) return;
        this.lastShootTime = now;

        // Determina o elemento do tiro — cicla pelos disponíveis a cada tiro
        const specials = Object.keys(this.player.gadgets.specialShots);
        let element = null;
        if (specials.length > 0) {
            if (this._lastElementIndex === undefined) this._lastElementIndex = 0;
            element = specials[this._lastElementIndex % specials.length];
            this._lastElementIndex++;
        }

        const bullet = this.bullets.get(this.player.x, this.player.y);
        if (!bullet) return;

        // Mata todos os tweens e animações anteriores desta bala (piscina reutilizável)
        this.tweens.killTweensOf(bullet);
        if (bullet.anims) bullet.stop();

        bullet.setActive(true).setVisible(true);
        bullet.setAlpha(1);
        bullet.element = element;
        bullet.chainCount = 0;

        const targetX = this.input.x + this.cameras.main.scrollX;
        const targetY = this.input.y + this.cameras.main.scrollY;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);
        const speed = 400;
        bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        if (bullet.body) {
            bullet.body.setSize(12, 12);
            bullet.body.setOffset(2, 2);
        }

        if (element === 'electric') {
            // Usa bolt_frame_0 como textura base — bolt_anim alterna entre bolt_frame_0..3
            bullet.setTexture('bolt_frame_0');
            bullet.clearTint();
            bullet.setScale(1.2);
            bullet.setRotation(angle);
            if (bullet.anims) bullet.play('bolt_anim', true);

        } else if (element === 'poison') {
            bullet.setTexture('poison_skull');
            bullet.clearTint();
            bullet.setScale(1.2);
            bullet.setRotation(0);
            // Pulsação visual
            this.tweens.add({
                targets: bullet,
                scaleX: { from: 1.2, to: 1.6 },
                scaleY: { from: 1.2, to: 1.6 },
                yoyo: true,
                repeat: -1,
                duration: 250
            });

        } else if (element === 'fire') {
            bullet.setTexture('fireball_img');
            bullet.clearTint();
            bullet.setScale(1.8);
            bullet.setRotation(angle);
            // Rotação contínua da bola de fogo
            this.tweens.add({
                targets: bullet,
                angle: '+=360',
                duration: 500,
                repeat: -1
            });

        } else if (element === 'push') {
            bullet.setTexture('push_bullet_1');
            bullet.clearTint();
            bullet.setScale(1.2);
            bullet.setRotation(angle + Math.PI / 2); // Same rotation as normal metal bullet
            if (bullet.anims) bullet.play('push_anim', true);
        } else if (element === 'force') {
            // IMPACT BOLT (Smoke puff)
            bullet.setTexture('smoke_bolt_1');
            bullet.clearTint();
            bullet.setScale(1.5);
            bullet.setRotation(angle);
            if (bullet.anims) bullet.play('smoke_anim', true);
        } else {
            // Bala normal metálica
            bullet.setTexture('bullet');
            bullet.clearTint();
            bullet.setScale(1);
            bullet.setRotation(angle + Math.PI / 2);
        }

        this.time.delayedCall(2000, () => { if (bullet && bullet.active) bullet.destroy(); });
    }

    generatePixelIcons() {
        const drawIcon = (key, data, palette) => {
            if (this.textures.exists(key)) return;
            const g = this.add.graphics();
            for (let y = 0; y < data.length; y++) {
                for (let x = 0; x < data[y].length; x++) {
                    const char = data[y][x];
                    if (char !== ' ') {
                        g.fillStyle(palette[char], 1);
                        g.fillRect(x * 2, y * 2, 2, 2); // 2x2 pixels per block
                    }
                }
            }
            g.generateTexture(key, data[0].length * 2, data.length * 2);
            g.destroy();
        };

        drawIcon('icon_electric', [
            "  w  ",
            " wcw ",
            "wwc  ",
            " wcw ",
            "  cww",
            "  w  ",
            "  w  "
        ], { 'w': 0xffffff, 'c': 0x00f2ff });

        drawIcon('icon_fire', [
            "  r  ",
            " yrr ",
            " yry ",
            "rory ",
            "ryyr ",
            " yr  "
        ], { 'y': 0xffff00, 'o': 0xffaa00, 'r': 0xff4400 });

        drawIcon('fireball_img', [
            "  yyyy  ",
            " yyorrr ",
            "yyorrrw ",
            "yyorrrw ",
            " yyorrr ",
            "  yyyy  "
        ], { 'y': 0xffff00, 'r': 0xff4400, 'o': 0xffaa00, 'w': 0xffffff });

        drawIcon('trail_flame', [
            "   r   ",
            "  ror  ",
            " rorrw ",
            "  ror  ",
            "   r   "
        ], { 'w': 0xffffff, 'r': 0xff4400, 'o': 0xffaa00 });

        drawIcon('icon_poison', [
            " www ",
            " wgw ",
            "w   w",
            "wgggw",
            "wgggg",
            "wwwww"
        ], { 'w': 0xffffff, 'g': 0x00ff00 });

        drawIcon('icon_force', [
            "  ww ",
            " www ",
            " wwww",
            " www ",
            "  w  "
        ], { 'w': 0xffffff });

        drawIcon('icon_push', [
            " wwww ",
            "w    w",
            " wwww "
        ], { 'w': 0xff00ff });

        drawIcon('fireBat', [
            "r   r   r",
            " r r r r ",
            "  rrrrr  ",
            " rrrrrrr ",
            " rwr rwr ",
            " rrrrrrr ",
            "  rrrrr  ",
            "   rrr   "
        ], { 'r': 0xff0000, 'w': 0xffffff });
    }
}

