import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.wave = data.wave || 1;
        this.enemiesPerWave = 3 + (this.wave - 1) * 5; // Much more aggressive scaling
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.isWavePaused = false;

        console.log(`GameScene Init: Wave ${this.wave}, Total Enemies: ${this.enemiesPerWave}`);

        // If data.player exists, it's a transition from UpgradeScene
        this.persistedPlayer = data.player || null;
    }

    preload() {
        // Create simple graphics since we don't have assets yet
        this.graphics = this.add.graphics();

        // Player texture
        this.graphics.fillStyle(0x00f2ff, 1);
        this.graphics.fillCircle(16, 16, 16);
        this.graphics.generateTexture('player', 32, 32);

        // Enemy texture
        this.graphics.clear();
        this.graphics.fillStyle(0xff0055, 1);
        this.graphics.fillTriangle(0, 32, 16, 0, 32, 32);
        this.graphics.generateTexture('enemy', 32, 32);

        // Bullet texture
        this.graphics.clear();
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillCircle(4, 4, 4);
        this.graphics.generateTexture('bullet', 8, 8);

        // Coin texture
        this.graphics.clear();
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillCircle(6, 6, 6);
        this.graphics.generateTexture('coin', 12, 12);

        // Enemy Bullet texture (Orange/Red)
        this.graphics.clear();
        this.graphics.fillStyle(0xff4400, 1);
        this.graphics.fillCircle(4, 4, 4);
        this.graphics.generateTexture('enemyBullet', 8, 8);

        // Wall texture
        this.graphics.clear();
        this.graphics.fillStyle(0x333333, 1);
        this.graphics.fillRect(0, 0, 32, 32);
        this.graphics.lineStyle(2, 0xffffff, 0.1);
        this.graphics.strokeRect(0, 0, 32, 32);
        this.graphics.generateTexture('wall', 32, 32);

        // Portal texture (Solid Glowing Circles)
        this.graphics.clear();
        this.graphics.fillStyle(0xff00ff, 0.3);
        this.graphics.fillCircle(24, 24, 20);
        this.graphics.lineStyle(3, 0x00ffff, 1);
        this.graphics.strokeCircle(24, 24, 20);
        this.graphics.generateTexture('portal', 48, 48);

        this.graphics.destroy();
    }

    create() {
        console.log("GameScene: Creating...");
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
        this.spawners = this.add.group();
        this.createMap();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.input.on('pointerdown', () => this.shoot());

        this.spawnWave();

        // Overlap/Collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            enemy.takeDamage(10 * this.player.damageMultiplier);
            bullet.destroy();
        });

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            player.health -= enemy.damage / 60; // Continuous damage
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
        this.physics.add.collider(this.enemies, this.enemies); // Enemies don't stack

        // UI
        this.setupUI();
    }

    update() {
        if (this.isWavePaused) return;

        this.player.update({ ...this.cursors, ...this.keys }, this.input.activePointer);

        // Enemies are updated automatically by Group(runChildUpdate: true)

        // Check wave complete
        if (this.enemiesKilled >= this.enemiesPerWave && !this.isWavePaused) {
            console.log("Wave Complete Triggered");
            this.completeWave();
        }
    }

    spawnWave() {
        console.log(`Starting Wave ${this.wave}. Target: ${this.enemiesPerWave} enemies.`);
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
            repeat: this.enemiesPerWave - 2 // -2 because we already spawned 1
        });
    }

    spawnEnemy() {
        const portalList = this.spawners.getChildren();
        if (portalList.length === 0) return;

        const portal = portalList[Phaser.Math.Between(0, portalList.length - 1)];
        const x = portal.x;
        const y = portal.y;

        const enemy = new Enemy(this, x, y, this.wave);
        this.enemies.add(enemy);
        console.log(`Enemy spawned at portal ${x}, ${y} for Wave ${this.wave}`);

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
        this.player.coins += 50; // Survival bonus

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
            <div id="game-stats" style="position: absolute; top: 10px; left: 10px; font-weight: bold; text-shadow: 2px 2px #000;">
                <div>Wave: <span id="wave-count">1</span></div>
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


    nextWave() {
        this.isWavePaused = false;
        this.spawnWave();
    }

    createMap() {
        // Simple procedural obstacles
        const wallPositions = [
            // Corners/Edges to keep play area interesting
            { x: 200, y: 150, w: 4, h: 1 },
            { x: 600, y: 150, w: 1, h: 4 },
            { x: 200, y: 400, w: 1, h: 4 },
            { x: 500, y: 450, w: 4, h: 1 },
            // Removed central wall that blocked spawn test
        ];

        wallPositions.forEach(pos => {
            for (let i = 0; i < pos.w; i++) {
                for (let j = 0; j < pos.h; j++) {
                    this.walls.create(pos.x + (i * 32), pos.y + (j * 32), 'wall').refreshBody();
                }
            }
        });

        // Add Spawners (Portals) - Safer positions
        const portalPositions = [
            { x: 100, y: 100 },
            { x: 700, y: 100 },
            { x: 100, y: 500 },
            { x: 700, y: 500 }
        ];

        portalPositions.forEach(pos => {
            const portal = this.add.sprite(pos.x, pos.y, 'portal');
            this.spawners.add(portal);

            // Add a simple rotation animation to the portal
            this.tweens.add({
                targets: portal,
                angle: 360,
                duration: 3000,
                repeat: -1
            });
        });
    }
}
