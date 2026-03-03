export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, wave) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Scale stats by wave
        this.health = 20 * (1 + (wave * 0.15));
        this.damage = 10 * (1 + (wave * 0.10));
        this.speed = 100 + (wave * 5);

        this.setTint(0xff0055);
    }

    update(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance < 2000) {
            this.scene.physics.moveToObject(this, player, this.speed);
            this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) + Math.PI / 2);
        } else {
            this.setVelocity(0);
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
