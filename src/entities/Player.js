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
}
