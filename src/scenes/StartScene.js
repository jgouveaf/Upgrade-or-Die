export class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a0c).setOrigin(0);

        // Title
        const title = this.add.text(width / 2, height / 2 - 50, 'UPGRADE OR DIE', {
            fontSize: '64px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '800',
            fill: '#ff0055',
            stroke: '#00f2ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height / 2 + 20, 'Survive the waves. Evolution is mandatory.', {
            fontSize: '18px',
            fill: '#ffffff',
            alpha: 0.7
        }).setOrigin(0.5);

        // Click to Start
        const startBtn = this.add.text(width / 2, height / 2 + 100, 'CLICK TO START', {
            fontSize: '24px',
            fontWeight: 'bold',
            fill: '#00f2ff'
        }).setOrigin(0.5);

        // Animations
        this.tweens.add({
            targets: startBtn,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
