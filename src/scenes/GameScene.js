import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
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

        console.log(`GameScene Init: Wave ${this.wave}, Difficulty: ${this.difficulty}`);

        // If data.player exists, it's a transition from UpgradeScene
        this.persistedPlayer = data.player || null;
    }

    preload() {
        this.graphics = this.add.graphics();

        // Pixel Player (Blocky Robot)
        this.graphics.fillStyle(0x00f2ff, 1);
        this.graphics.fillRect(4, 4, 24, 24);
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(8, 8, 4, 4); // Eye 1
        this.graphics.fillRect(20, 8, 4, 4); // Eye 2
        this.graphics.generateTexture('player', 32, 32);

        // Pixel Enemy (Blocky Invader)
        this.graphics.clear();
        this.graphics.fillStyle(0xff0055, 1);
        this.graphics.fillRect(0, 8, 32, 16);
        this.graphics.fillRect(8, 0, 16, 32);
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(8, 8, 4, 4); // Eye 1
        this.graphics.fillRect(20, 8, 4, 4); // Eye 2
        this.graphics.generateTexture('enemy', 32, 32);

        // Pixel Bullet (Square)
        this.graphics.clear();
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillRect(0, 0, 8, 8);
        this.graphics.generateTexture('bullet', 8, 8);

        // Pixel Coin (Diamond)
        this.graphics.clear();
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillRect(3, 0, 6, 12);
        this.graphics.fillRect(0, 3, 12, 6);
        this.graphics.generateTexture('coin', 12, 12);

        // Pixel Enemy Bullet (Square)
        this.graphics.clear();
        this.graphics.fillStyle(0xff4400, 1);
        this.graphics.fillRect(0, 0, 8, 8);
        this.graphics.generateTexture('enemyBullet', 8, 8);

        // Pixel Wall (Brick-like)
        this.graphics.clear();
        this.graphics.fillStyle(0x444444, 1);
        this.graphics.fillRect(0, 0, 32, 32);
        this.graphics.fillStyle(0x666666, 1);
        this.graphics.fillRect(2, 2, 28, 12);
        this.graphics.fillRect(2, 16, 28, 14);
        this.graphics.generateTexture('wall', 32, 32);

        // Pixel Portal (Rotating Square)
        this.graphics.clear();
        this.graphics.lineStyle(4, 0x00ffff, 1);
        this.graphics.strokeRect(4, 4, 40, 40);
        this.graphics.lineStyle(2, 0xff00ff, 1);
        this.graphics.strokeRect(12, 12, 24, 24);
        this.graphics.generateTexture('portal', 48, 48);

        // Pixel Boss (Rafael Rosseti) - 64x64
        this.graphics.clear();
        // Body (White Shirt)
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(16, 32, 32, 32);
        // Head (Skin)
        this.graphics.fillStyle(0xffdbac, 1);
        this.graphics.fillRect(20, 8, 24, 24);
        // Beard/Goatee
        this.graphics.fillStyle(0x331a00, 1);
        this.graphics.fillRect(24, 24, 16, 8);
        this.graphics.fillRect(28, 20, 8, 4);
        // Eyes
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(26, 14, 4, 4);
        this.graphics.fillRect(34, 14, 4, 4);
        // Hand (Rock Sign)
        this.graphics.fillStyle(0xffdbac, 1);
        this.graphics.fillRect(8, 28, 8, 12);
        this.graphics.generateTexture('boss', 64, 64);

        // Pixel Piggy Bank (Boss Bullet) - 24x24
        this.graphics.clear();
        this.graphics.fillStyle(0xffaaff, 1); // Pink body
        this.graphics.fillRect(4, 8, 16, 12);
        this.graphics.fillRect(6, 6, 12, 16);
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(14, 10, 2, 2); // Eye
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(15, 11, 1, 1); // Pupil
        this.graphics.fillStyle(0xffda00, 1); // Coin on top
        this.graphics.fillRect(10, 2, 4, 6);
        this.graphics.generateTexture('bossBullet', 24, 24);

        this.graphics.destroy();
    }

    create() {
        console.log("GameScene: Creating 2D Pixel Art...");
        this.player = new Player(this, 400, 300);

        // Apply difficulty to base stats if starting fresh
        if (!this.persistedPlayer) {
            this.player.health *= this.difficultyConfig.hpMult;
            this.player.maxHealth *= this.difficultyConfig.hpMult;
        }

        // Apply persisted stats
        if (this.persistedPlayer) {
            this.player.health = this.persistedPlayer.health;
            this.player.maxHealth = this.persistedPlayer.maxHealth;
            this.player.coins = this.persistedPlayer.coins;
            this.player.damageMultiplier = this.persistedPlayer.damageMultiplier;
            this.player.speedMultiplier = this.persistedPlayer.speedMultiplier;
        }

        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 50
        });

        this.enemyBullets = this.physics.add.group({
            defaultKey: 'enemyBullet',
            maxSize: 100
        });

        this.coins = this.physics.add.group();

        this.walls = this.physics.add.staticGroup();
        this.spawners = this.physics.add.staticGroup(); // Fixed portals
        this.createMap();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.input.on('pointerdown', () => this.shoot());

        // Player Health Bar Graphics
        this.healthBar = this.add.graphics();

        this.spawnWave();

        // Overlap/Collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            enemy.takeDamage(10 * this.player.damageMultiplier);
            bullet.destroy();
        });

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            player.health -= enemy.damage / 60;
            if (player.health <= 0) {
                this.scene.start('GameOverScene', { wave: this.wave });
            }
        });

        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            const baseValue = 5;
            player.coins += Math.floor(baseValue * (coin.coinMult || 1));
            this.updateUI();
            coin.destroy();
        });

        // Wall Collisions
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.bullets, this.walls, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.enemyBullets, this.walls, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.player, this.enemyBullets, (player, bullet) => {
            player.health -= 10;
            bullet.destroy();
            this.updateUI();
            if (player.health <= 0) {
                this.scene.start('GameOverScene', { wave: this.wave });
            }
        });
        this.physics.add.collider(this.enemies, this.enemies);

        // UI
        this.setupUI();
    }

    update() {
        if (this.isWavePaused) {
            this.healthBar.clear();
            return;
        }

        this.player.update({ ...this.cursors, ...this.keys }, this.input.activePointer);

        // Update Health Bar above player
        this.updateHealthBar();

        // Check wave complete
        if (this.enemiesKilled >= this.enemiesPerWave && !this.isWavePaused) {
            this.completeWave();
        }
    }

    updateHealthBar() {
        this.healthBar.clear();

        // Player Health Bar
        const px = this.player.x - 20;
        const py = this.player.y - 30;
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(px, py, 40, 6);
        const pPct = Math.max(0, this.player.health / this.player.maxHealth);
        this.healthBar.fillStyle(pPct > 0.5 ? 0x00ff00 : (pPct > 0.25 ? 0xffff00 : 0xff0000), 1);
        this.healthBar.fillRect(px + 1, py + 1, 38 * pPct, 4);

        // Boss Health Bar (if any)
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isBoss && enemy.active) {
                const bx = enemy.x - 40;
                const by = enemy.y - 85; // Above the name tag
                const bWidth = 80;
                const bHeight = 8;

                // Shadow/BG
                this.healthBar.fillStyle(0x000000, 0.7);
                this.healthBar.fillRect(bx, by, bWidth, bHeight);

                // Border
                this.healthBar.lineStyle(2, 0x00f2ff, 1);
                this.healthBar.strokeRect(bx, by, bWidth, bHeight);

                // Internal Fill
                const bPct = Math.max(0, enemy.health / enemy.maxHealth);
                this.healthBar.fillStyle(0xff0055, 1);
                this.healthBar.fillRect(bx + 1, by + 1, (bWidth - 2) * bPct, bHeight - 2);
            }
        });
    }

    spawnWave() {
        this.enemiesKilled = 0;
        this.isBossWave = (this.wave % 4 === 0);

        if (this.isBossWave) {
            this.enemiesPerWave = 1;
            console.log(`BOSS WAVE ${this.wave}: RAFAEL ROSSETI COMING!`);
            this.time.delayedCall(1000, () => this.spawnBoss());
        } else {
            this.enemiesPerWave = 3 + (this.wave - 1) * 5;
            this.enemiesSpawned = 0;

            // Spawn first enemy immediately
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

        // Transform into Boss
        boss.setTexture('boss');
        boss.clearTint(); // Remove the default enemy pink tint
        boss.setScale(1.5);
        boss.health = 400 * (1 + (this.wave * 0.25));
        boss.maxHealth = boss.health;
        boss.speed = 120;
        boss.damage = 25;
        boss.isBoss = true;

        this.enemies.add(boss);

        // Name Tag
        const nameTag = this.add.text(boss.x, boss.y - 70, 'Rafael Rosseti', {
            fontSize: '16px',
            fill: '#00f2ff',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Update tag position
        this.events.on('update', () => {
            if (boss.active) {
                nameTag.setPosition(boss.x, boss.y - 70);
            } else {
                nameTag.destroy();
            }
        });

        // Effect
        this.cameras.main.flash(500, 255, 0, 85);
        this.tweens.add({
            targets: portal,
            scale: 2,
            duration: 300,
            yoyo: true
        });
    }

    spawnEnemy() {
        const portalList = this.spawners.getChildren();
        if (portalList.length === 0) return;

        const portal = portalList[Phaser.Math.Between(0, portalList.length - 1)];
        const enemy = new Enemy(this, portal.x, portal.y, this.wave);
        this.enemies.add(enemy);

        // Simple scale effect on portal when spawning
        this.tweens.add({
            targets: portal,
            scale: 1.5,
            duration: 100,
            yoyo: true
        });
    }

    spawnCoin(x, y) {
        const coin = this.coins.create(x, y, 'coin');
        coin.setBounce(0.5);
        // Store multiplier for collection
        coin.coinMult = this.difficultyConfig.coinMult;
    }

    shoot() {
        if (this.isWavePaused) return;

        const bullet = this.bullets.get(this.player.x, this.player.y);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            this.physics.moveTo(bullet, this.input.x, this.input.y, 400);

            // Auto destroy after life
            this.time.delayedCall(2000, () => {
                if (bullet.active) bullet.destroy();
            });
        }
    }

    completeWave() {
        this.isWavePaused = true;
        this.player.coins += 50;

        // Pass data to UpgradeScene
        this.scene.start('UpgradeScene', {
            difficulty: this.difficulty,
            player: {
                health: this.player.health,
                maxHealth: this.player.maxHealth,
                coins: this.player.coins,
                damageMultiplier: this.player.damageMultiplier,
                speedMultiplier: this.player.speedMultiplier
            },
            wave: this.wave
        });
    }

    setupUI() {
        const ui = document.getElementById('ui-layer');
        ui.innerHTML = `
            <div id="wave-container" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); text-align: center; pointer-events: none;">
                <div style="font-family: 'Press Start 2P', cursive; font-size: 18px; color: var(--secondary); text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px var(--secondary);">WAVE <span id="wave-count">1</span></div>
            </div>
            <div id="game-stats" style="position: absolute; top: 20px; right: 20px; font-family: 'Press Start 2P', cursive; font-size: 14px; text-shadow: 2px 2px #000; color: #ffda00;">
                <div>$ <span id="coin-count">0</span></div>
            </div>
        `;
    }

    updateUI() {
        const waveCount = document.getElementById('wave-count');
        const coinCount = document.getElementById('coin-count');
        if (!waveCount || !coinCount) return;

        waveCount.innerText = this.wave;
        coinCount.innerText = this.player.coins;
    }

    createMap() {
        const wallPositions = [
            { x: 200, y: 150, w: 4, h: 1 },
            { x: 600, y: 150, w: 1, h: 4 },
            { x: 200, y: 400, w: 1, h: 4 },
            { x: 500, y: 450, w: 4, h: 1 },
        ];

        wallPositions.forEach(pos => {
            for (let i = 0; i < pos.w; i++) {
                for (let j = 0; j < pos.h; j++) {
                    this.walls.create(pos.x + (i * 32), pos.y + (j * 32), 'wall').refreshBody();
                }
            }
        });

        const portalPositions = [
            { x: 100, y: 100 }, { x: 700, y: 100 },
            { x: 100, y: 500 }, { x: 700, y: 500 }
        ];

        portalPositions.forEach(pos => {
            const portal = this.add.sprite(pos.x, pos.y, 'portal');
            this.spawners.add(portal);
            this.tweens.add({
                targets: portal,
                angle: 360,
                duration: 3000,
                repeat: -1
            });
        });
    }
}
