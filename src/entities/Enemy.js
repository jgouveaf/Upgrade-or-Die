export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, wave) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Fix collision box (smaller than visual to prevent sticking)
        this.body.setCircle(12, 4, 4);

        console.log("Enemy instance created at", x, y);

        // Scale stats by wave
        this.health = 20 * (1 + (wave * 0.15));
        this.damage = 10 * (1 + (wave * 0.10));
        this.speed = 100 + (wave * 5);
        this.fireRate = 2000 - (wave * 50); // Fires every 2s, getting faster
        this.fireRate = Math.max(500, this.fireRate);

        this.nextFire = scene.time.now + Phaser.Math.Between(0, 1000);
        this.maxHealth = this.health;
        this.isBoss = false;
        this.isBat = false;
        this.setTint(0xff0055);
    }

    update() {
        const player = this.scene.player;
        if (this.scene.isWavePaused || !player || !player.body) {
            if (this.body) this.setVelocity(0);
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Move towards player
        if (distance < 2000) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

            // Set velocity directly
            const vx = Math.cos(angle) * this.speed;
            const vy = Math.sin(angle) * this.speed;
            this.setVelocity(vx, vy);

            this.setRotation(angle + Math.PI / 2);

            // Try to shoot if in range
            if (distance < 400 && this.scene.time.now > this.nextFire && !this.isBat) {
                this.shoot(player);
            }
        } else {
            this.setVelocity(0);
        }
    }

    shoot(player) {
        this.nextFire = this.scene.time.now + this.fireRate;

        const bulletKey = this.isBoss ? 'bossBullet' : 'enemyBullet';
        const bullet = this.scene.enemyBullets.get(this.x, this.y, bulletKey);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setTexture(bulletKey);

            const bulletSpeed = this.isBoss ? 400 : 300;
            this.scene.physics.moveToObject(bullet, player, bulletSpeed);

            // Auto destroy after life
            this.scene.time.delayedCall(3000, () => {
                if (bullet.active) bullet.destroy();
            });
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            // Flash effect
            const originalTint = this.isBoss ? 0xffffff : 0xff0055;
            this.setTint(0xffffff);
            this.scene.time.delayedCall(100, () => {
                if (this.active) {
                    if (this.isBoss || this.isBat) this.clearTint();
                    else this.setTint(originalTint);
                }
            });
        }
    }

    die() {
        // Drop coins
        if (this.isBoss) {
            // Drop 20 coins of 5 value = 100 coins total
            for (let i = 0; i < 20; i++) {
                this.scene.spawnCoin(
                    this.x + Phaser.Math.Between(-40, 40),
                    this.y + Phaser.Math.Between(-40, 40)
                );
            }
        } else {
            this.scene.spawnCoin(this.x, this.y);
        }
        this.scene.enemiesKilled++;
        this.destroy();
    }
}
