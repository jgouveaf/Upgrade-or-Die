import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
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

        this.graphics.destroy();
    }

    create() {
        this.player = new Player(this, 400, 300);

        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 50
        });

        this.coins = this.physics.add.group();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.input.on('pointerdown', () => this.shoot());

        // Wave logic
        this.wave = 1;
        this.enemiesPerWave = 5;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.isWavePaused = false;

        this.spawnWave();

        // Overlap/Collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            enemy.takeDamage(10 * this.player.damageMultiplier);
            bullet.destroy();
        });

        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            player.health -= enemy.damage / 60; // Continuous damage
            if (player.health <= 0) this.scene.restart();
        });

        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            player.coins += 5;
            this.updateUI();
            coin.destroy();
        });

        // UI
        this.setupUI();
    }

    update() {
        if (this.isWavePaused) return;

        this.player.update(Object.assign(this.cursors, this.keys), this.input.activePointer);

        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });

        // Check wave complete
        if (this.enemiesKilled >= this.enemiesPerWave) {
            this.completeWave();
        }
    }

    spawnWave() {
        this.enemiesKilled = 0;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 5 + (this.wave * 2);

        this.time.addEvent({
            delay: 1500,
            callback: () => {
                if (this.enemiesSpawned < this.enemiesPerWave) {
                    this.spawnEnemy();
                    this.enemiesSpawned++;
                }
            },
            callbackScope: this,
            repeat: this.enemiesPerWave - 1
        });
    }

    spawnEnemy() {
        const side = Phaser.Math.Between(0, 3); // 0-Top, 1-Right, 2-Bottom, 3-Left
        let x, y;

        if (side === 0) { x = Phaser.Math.Between(0, 800); y = -50; }
        else if (side === 1) { x = 850; y = Phaser.Math.Between(0, 600); }
        else if (side === 2) { x = Phaser.Math.Between(0, 800); y = 650; }
        else { x = -50; y = Phaser.Math.Between(0, 600); }

        const enemy = new Enemy(this, x, y, this.wave);
        this.enemies.add(enemy);
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
        this.wave++;
        this.player.coins += 50; // Survival bonus
        this.updateUI();
        this.showShop();
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
        document.getElementById('wave-count').innerText = this.wave;
        document.getElementById('coin-count').innerText = this.player.coins;
        document.getElementById('health-pct').innerText = Math.max(0, Math.floor(this.player.health));
    }

    showShop() {
        const ui = document.getElementById('ui-layer');
        const shop = document.createElement('div');
        shop.className = 'shop-overlay';

        const upgrades = [
            { id: 'health', name: 'Nano-Armor', desc: '+20 Max HP & Restore HP', cost: 50 * (this.wave) },
            { id: 'damage', name: 'Power Cells', desc: '+15% Damage Multiplier', cost: 75 * (this.wave) },
            { id: 'speed', name: 'Rocket Boots', desc: '+10% Movement Speed', cost: 40 * (this.wave) }
        ];

        // Pick 3 random (well, we only have 3 for now, but in future it could be random)
        const selected = upgrades.sort(() => 0.5 - Math.random());

        shop.innerHTML = `
            <h2 class="shop-title">WAVE ${this.wave - 1} CLEAR</h2>
            <p style="margin-bottom: 20px;">Choose an Upgrade</p>
            <div class="upgrade-container">
                ${selected.map(up => `
                    <div class="upgrade-card" data-id="${up.id}" data-cost="${up.cost}">
                        <h3>${up.name}</h3>
                        <p>${up.desc}</p>
                        <div class="cost">${up.cost} Coins</div>
                    </div>
                `).join('')}
            </div>
            <button id="skip-shop" style="margin-top: 30px; background: none; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Continue to Next Wave</button>
        `;

        ui.appendChild(shop);

        shop.querySelectorAll('.upgrade-card').forEach(card => {
            card.onclick = () => {
                const cost = parseInt(card.dataset.cost);
                if (this.player.coins >= cost) {
                    this.player.coins -= cost;
                    this.applyUpgrade(card.dataset.id);
                    this.nextWave();
                } else {
                    card.style.borderColor = 'red';
                    setTimeout(() => card.style.borderColor = 'rgba(255,255,255,0.1)', 500);
                }
            };
        });

        shop.querySelector('#skip-shop').onclick = () => this.nextWave();
    }

    applyUpgrade(id) {
        if (id === 'health') {
            this.player.maxHealth += 20;
            this.player.health = this.player.maxHealth;
        } else if (id === 'damage') {
            this.player.damageMultiplier += 0.15;
        } else if (id === 'speed') {
            this.player.speedMultiplier += 0.10;
        }
        this.updateUI();
    }

    nextWave() {
        document.querySelector('.shop-overlay').remove();
        this.isWavePaused = false;
        this.spawnWave();
    }
}
