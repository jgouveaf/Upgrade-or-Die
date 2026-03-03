export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDrag(1000);

        // Stats
        this.baseSpeed = 200;
        this.baseHealth = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.damageMultiplier = 1;
        this.speedMultiplier = 1;

        this.coins = 0;
        this.isPoisoned = false;
        this.poisonEvent = null;
    }

    update(cursors, mouse) {
        const speed = this.baseSpeed * this.speedMultiplier;

        // Movement
        this.setVelocity(0);
        if (cursors.left.isDown || cursors.A.isDown) this.setVelocityX(-speed);
        if (cursors.right.isDown || cursors.D.isDown) this.setVelocityX(speed);
        if (cursors.up.isDown || cursors.W.isDown) this.setVelocityY(-speed);
        if (cursors.down.isDown || cursors.S.isDown) this.setVelocityY(speed);

        // Animation or rotation can be added here
        const angle = Phaser.Math.Angle.Between(this.x, this.y, mouse.x + this.scene.cameras.main.scrollX, mouse.y + this.scene.cameras.main.scrollY);
        this.setRotation(angle + Math.PI / 2);
    }

    applyPoison(scene) {
        if (this.isPoisoned) return;
        this.isPoisoned = true;
        this.setTint(0x00ff00);

        let poisonTicks = 0;
        this.poisonEvent = scene.time.addEvent({
            delay: 1000, // Damage every 1 second
            callback: () => {
                this.health -= 5;

                // Show floating text maybe? Not critical right now.

                if (this.health <= 0) {
                    scene.scene.start('GameOverScene', { wave: scene.wave });
                }

                poisonTicks++;
                if (poisonTicks >= 3) {
                    this.clearPoison();
                }
            },
            repeat: 2 // runs callback 3 times total due to repeat + initial call
        });
    }

    clearPoison() {
        this.isPoisoned = false;
        this.clearTint();
        if (this.poisonEvent) {
            this.poisonEvent.remove();
        }
    }
}
