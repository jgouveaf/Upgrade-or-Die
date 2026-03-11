export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, scene.playerSkin || 'player');
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
        this.isImmortal = false;

        // Gadget System
        this.gadgets = {
            turrets: {}, // Key: element, Value: level
            forceFields: {}, // Key: element, Value: level
            specialShots: {} // Key: element, Value: level
        };
    }

    update(input, mouse) {
        const speed = this.baseSpeed * this.speedMultiplier;

        // Movement
        this.setVelocity(0);
        if (input.left.isDown) this.setVelocityX(-speed);
        if (input.right.isDown) this.setVelocityX(speed);
        if (input.up.isDown) this.setVelocityY(-speed);
        if (input.down.isDown) this.setVelocityY(speed);

        // Rotation
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
                if (!this.isImmortal) {
                    this.health -= 5;
                }

                if (this.health <= 0) {
                    scene.scene.start('GameOverScene_v6', { wave: scene.wave });
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
