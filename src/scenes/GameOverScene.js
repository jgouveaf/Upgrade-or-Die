export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.finalWave = data.wave || 1;
    }

    create() {
        const { width, height } = this.scale;

        // Overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        // Text
        this.add.text(width / 2, height / 2 - 100, 'GAME OVER', {
            fontSize: '80px',
            fontWeight: '800',
            fill: '#ff0055'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `You reached Wave ${this.finalWave}`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const retryBtn = this.add.text(width / 2, height / 2 + 100, 'CLICK TO RETRY', {
            fontSize: '24px',
            fill: '#00f2ff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: retryBtn,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
