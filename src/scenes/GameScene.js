import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.wave = data.wave || 1;
        this.enemiesPerWave = 3 + (this.wave - 1) * 5;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.isWavePaused = false;

        console.log(`GameScene Init: Wave ${this.wave}, Total Enemies: ${this.enemiesPerWave}`);

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

        this.graphics.destroy();
    }

    create() {
        console.log("GameScene: Creating 2D Pixel Art...");
        this.player = new Player(this, 400, 300);

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
            player.coins += 5;
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

        const x = this.player.x - 20;
        const y = this.player.y - 30;
        const width = 40;
        const height = 6;

        // Background
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(x, y, width, height);

        // Health fill
        const healthPct = Math.max(0, this.player.health / this.player.maxHealth);
        const color = healthPct > 0.5 ? 0x00ff00 : (healthPct > 0.25 ? 0xffff00 : 0xff0000);

        this.healthBar.fillStyle(color, 1);
        this.healthBar.fillRect(x + 1, y + 1, (width - 2) * healthPct, height - 2);
    }

    spawnWave() {
        this.enemiesKilled = 0;
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
                <div style="font-size: 24px; color: var(--secondary); text-transform: uppercase; letter-spacing: 2px; font-weight: 800; text-shadow: 0 0 10px var(--secondary);">Wave <span id="wave-count">1</span></div>
            </div>
            <div id="game-stats" style="position: absolute; top: 10px; left: 10px; font-weight: bold; text-shadow: 2px 2px #000;">
                <div>Coins: <span id="coin-count">0</span></div>
                <div>Health: <span id="health-pct">100</span>%</div>
            </div>
        `;
    }

    updateUI() {
        if (!document.getElementById('wave-count')) return;
        document.getElementById('wave-count').innerText = this.wave;
        document.getElementById('coin-count').innerText = this.player.coins;
        document.getElementById('health-pct').innerText = Math.max(0, Math.floor(this.player.health));
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
