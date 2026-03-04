import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { settingsManager } from '../utils/SettingsManager.js';

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
        this.persistedPlayer = data.player || null;
    }

    preload() {
        this.graphics = this.add.graphics();

        // Pixel Player (Blocky Robot)
        this.graphics.fillStyle(0x00f2ff, 1);
        this.graphics.fillRect(4, 4, 24, 24);
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(8, 8, 4, 4);
        this.graphics.fillRect(20, 8, 4, 4);
        this.graphics.generateTexture('player', 32, 32);

        // Pixel Enemy (Blocky Invader)
        this.graphics.clear();
        this.graphics.fillStyle(0xff0055, 1);
        this.graphics.fillRect(0, 8, 32, 16);
        this.graphics.fillRect(8, 0, 16, 32);
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(8, 8, 4, 4);
        this.graphics.fillRect(20, 8, 4, 4);
        this.graphics.generateTexture('enemy', 32, 32);

        // Pixel Bullet
        this.graphics.clear();
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillRect(0, 0, 8, 8);
        this.graphics.generateTexture('bullet', 8, 8);

        // Pixel Coin
        this.graphics.clear();
        this.graphics.fillStyle(0xffda00, 1);
        this.graphics.fillRect(3, 0, 6, 12);
        this.graphics.fillRect(0, 3, 12, 6);
        this.graphics.generateTexture('coin', 12, 12);

        // Pixel Enemy Bullet
        this.graphics.clear();
        this.graphics.fillStyle(0xff4400, 1);
        this.graphics.fillRect(0, 0, 8, 8);
        this.graphics.generateTexture('enemyBullet', 8, 8);

        // Pixel Wall
        this.graphics.clear();
        this.graphics.fillStyle(0x444444, 1);
        this.graphics.fillRect(0, 0, 32, 32);
        this.graphics.generateTexture('wall', 32, 32);

        // Pixel Portal
        this.graphics.clear();
        this.graphics.lineStyle(4, 0x00ffff, 1);
        this.graphics.strokeRect(4, 4, 40, 40);
        this.graphics.generateTexture('portal', 48, 48);

        // Pixel Boss (Rafael Rosseti)
        this.graphics.clear();
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(16, 32, 32, 32);
        this.graphics.fillStyle(0xffdbac, 1);
        this.graphics.fillRect(20, 8, 24, 24);
        this.graphics.generateTexture('boss', 64, 64);

<<<<<<< HEAD
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

        // Pixel Poison Bat - 32x32
        this.graphics.clear();

        // Wings (Dark Green / Toxic)
        this.graphics.fillStyle(0x004400, 1);
        this.graphics.fillRect(4, 12, 8, 4); // Left wing connection
        this.graphics.fillRect(0, 8, 8, 4);  // Left wing tip
        this.graphics.fillRect(20, 12, 8, 4); // Right wing connection
        this.graphics.fillRect(24, 8, 8, 4);  // Right wing tip

        // Wing membranes (Lighter vibrant green)
        this.graphics.fillStyle(0x00cc00, 1);
        this.graphics.fillRect(2, 10, 4, 2);
        this.graphics.fillRect(26, 10, 4, 2);

        // Body (Lighter toxic green)
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillRect(12, 8, 8, 12); // Hood/Body
        this.graphics.fillRect(14, 20, 4, 4);  // Lower body/tail

        // Head detail
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillRect(10, 6, 12, 4);

        // Eyes (Glowing Purple/Red)
        this.graphics.fillStyle(0xff00ff, 1);
        this.graphics.fillRect(12, 10, 2, 2);
        this.graphics.fillRect(18, 10, 2, 2);

        // Fangs
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(13, 13, 1, 2);
        this.graphics.fillRect(18, 13, 1, 2);

        // Poison Aura/Droplets
        this.graphics.fillStyle(0x00ff00, 0.4);
        this.graphics.fillRect(10, 22, 2, 2);
        this.graphics.fillRect(20, 18, 2, 2);

        this.graphics.generateTexture('poisonBat', 32, 32);
=======
        // Pixel Poison Bat
        this.graphics.clear();
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillRect(8, 8, 8, 8);
        this.graphics.generateTexture('poisonBat', 24, 24);
>>>>>>> 4e36a5b5bdf50d118da998df238bfe0dee5d7cdb

        this.graphics.destroy();
    }

    create() {
        console.log("GameScene: Create starting...");
        this.player = new Player(this, 400, 300);

        if (this.persistedPlayer) {
            this.player.health = this.persistedPlayer.health;
            this.player.maxHealth = this.persistedPlayer.maxHealth;
            this.player.coins = this.persistedPlayer.coins;
            this.player.damageMultiplier = this.persistedPlayer.damageMultiplier;
            this.player.speedMultiplier = this.persistedPlayer.speedMultiplier;
        } else {
            this.player.health *= this.difficultyConfig.hpMult;
            this.player.maxHealth *= this.difficultyConfig.hpMult;
        }

        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        this.bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 50 });
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

        // INITIALIZE HEALTH BAR EARLY
        this.healthBar = this.add.graphics();
        console.log("GameScene: HealthBar initialized:", !!this.healthBar);

        this.spawnWave();

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            enemy.takeDamage(10 * this.player.damageMultiplier);
            bullet.destroy();
        });

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            player.health -= enemy.damage / 60;
            if (enemy.isBat) player.applyPoison(this);
            if (player.health <= 0) this.scene.start('GameOverScene', { wave: this.wave });
        });

        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            player.coins += Math.floor(5 * (coin.coinMult || 1));
            this.updateUI();
            coin.destroy();
        });

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
<<<<<<< HEAD
        this.physics.add.collider(this.bullets, this.walls, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.enemyBullets, this.walls, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.player, this.enemyBullets, (player, bullet) => {
            const isBossBullet = bullet.texture.key === 'bossBullet';
            player.health -= isBossBullet ? 25 : 10;

            // Visual feedback for boss hit
            if (isBossBullet) {
                this.cameras.main.shake(100, 0.01);
            }

            bullet.destroy();
=======
        this.physics.add.collider(this.bullets, this.walls, (b) => b.destroy());
        this.physics.add.collider(this.enemyBullets, this.walls, (b) => b.destroy());
        this.physics.add.collider(this.player, this.enemyBullets, (p, b) => {
            p.health -= 10;
            b.destroy();
>>>>>>> 4e36a5b5bdf50d118da998df238bfe0dee5d7cdb
            this.updateUI();
            if (p.health <= 0) this.scene.start('GameOverScene', { wave: this.wave });
        });
        this.physics.add.collider(this.enemies, this.enemies);

        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => this.togglePause());

        this.setupUI();
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
            this.scene.start('StartScene');
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
                const by = enemy.y - 85;
                const bWidth = 80;
                const bPct = Math.max(0, enemy.health / enemy.maxHealth);
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
        this.enemies.add(boss);

        const nameTag = this.add.text(boss.x, boss.y - 70, 'Rafael Rosseti', { fontSize: '16px', fill: '#00f2ff' }).setOrigin(0.5);
        this.events.on('update', () => {
            if (boss.active) nameTag.setPosition(boss.x, boss.y - 70);
            else nameTag.destroy();
        });
    }

    spawnEnemy() {
        const portalList = this.spawners.getChildren();
        if (portalList.length === 0) return;
        const portal = portalList[Phaser.Math.Between(0, portalList.length - 1)];
        const enemy = new Enemy(this, portal.x, portal.y, this.wave);
        if (this.wave >= 5 && Math.random() < 0.3) {
            enemy.setTexture('poisonBat');
            enemy.isBat = true;
        }
        this.enemies.add(enemy);
    }

    spawnCoin(x, y) {
        const coin = this.coins.create(x, y, 'coin');
        coin.setBounce(0.5);
        coin.coinMult = this.difficultyConfig.coinMult;
    }

    shoot() {
        if (this.isWavePaused) return;
        const bullet = this.bullets.get(this.player.x, this.player.y);
        if (bullet) {
            bullet.setActive(true).setVisible(true);
            this.physics.moveTo(bullet, this.input.x + this.cameras.main.scrollX, this.input.y + this.cameras.main.scrollY, 400);
            this.time.delayedCall(2000, () => { if (bullet.active) bullet.destroy(); });
        }
    }

    completeWave() {
        this.isWavePaused = true;
        this.player.coins += 50;
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
        const wallPositions = [{ x: 200, y: 150, w: 4, h: 1 }, { x: 600, y: 150, w: 1, h: 4 }, { x: 200, y: 400, w: 1, h: 4 }, { x: 500, y: 450, w: 4, h: 1 }];
        wallPositions.forEach(pos => {
            for (let i = 0; i < pos.w; i++) {
                for (let j = 0; j < pos.h; j++) {
                    this.walls.create(pos.x + (i * 32), pos.y + (j * 32), 'wall').refreshBody();
                }
            }
        });
        const portalPositions = [{ x: 100, y: 100 }, { x: 700, y: 100 }, { x: 100, y: 500 }, { x: 700, y: 500 }];
        portalPositions.forEach(pos => {
            const portal = this.add.sprite(pos.x, pos.y, 'portal');
            this.spawners.add(portal);
            this.tweens.add({ targets: portal, angle: 360, duration: 3000, repeat: -1 });
        });
    }
}
