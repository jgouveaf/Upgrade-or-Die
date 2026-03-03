export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, wave) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        console.log("Enemy instance created at", x, y);

        // Scale stats by wave
        this.health = 20 * (1 + (wave * 0.15));
        this.damage = 10 * (1 + (wave * 0.10));
        this.speed = 100 + (wave * 5);
        this.fireRate = 2000 - (wave * 50); // Fires every 2s, getting faster
        this.fireRate = Math.max(500, this.fireRate);

        this.nextFire = scene.time.now + Phaser.Math.Between(0, 1000);
        this.setTint(0xff0055);
    }

    update(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Move towards player
        if (distance < 2000) {
            this.scene.physics.moveToObject(this, player, this.speed);
            this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) + Math.PI / 2);

            // Try to shoot if in range
            if (distance < 400 && this.scene.time.now > this.nextFire) {
                this.shoot(player);
            }
        } else {
            this.setVelocity(0);
        }
    }

    shoot(player) {
        this.nextFire = this.scene.time.now + this.fireRate;
        const bullet = this.scene.enemyBullets.get(this.x, this.y);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            this.scene.physics.moveToObject(bullet, player, 300);

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
            this.setTint(0xffffff);
            this.scene.time.delayedCall(100, () => this.setTint(0xff0055));
        }
    }

    die() {
        // Drop coins
        this.scene.spawnCoin(this.x, this.y);
        this.destroy();
    }
}
