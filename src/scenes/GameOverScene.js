export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.finalWave = data.wave || 1;
    }

    preload() {
        const graphics = this.add.graphics();

        // 1. Detailed Rafael Rosseti (GameOver Style) - 128x128
        graphics.clear();

        // Shirt (White)
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(32, 64, 64, 64);

        // Face (Skin)
        graphics.fillStyle(0xffdbac, 1);
        graphics.fillRect(40, 16, 48, 48);

        // Bald head detail (shading)
        graphics.fillStyle(0xedc9af, 1);
        graphics.fillRect(40, 16, 48, 12);

        // Beard/Goatee (Dark Brown)
        graphics.fillStyle(0x331a00, 1);
        graphics.fillRect(48, 48, 32, 16); // Main beard
        graphics.fillRect(56, 44, 16, 4);  // Mustache

        // Eyes
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(50, 32, 6, 6);
        graphics.fillRect(72, 32, 6, 6);

        // Rock Sign Hands (Left)
        graphics.fillStyle(0xffdbac, 1);
        graphics.fillRect(16, 56, 16, 24);
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillRect(20, 56, 4, 12); // Fingers gap

        graphics.generateTexture('rossetiGameOver', 128, 128);

        // 2. Speech Bubble
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(0, 0, 240, 80, 10);
        graphics.fillTriangle(30, 80, 50, 80, 40, 100);
        graphics.generateTexture('speechBubble', 240, 110);

        graphics.destroy();
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a0c, 1).setOrigin(0);

        // "GAME OVER" at top
        this.add.text(width / 2, 80, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: '"Press Start 2P"',
            fill: '#ff0055',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Stats
        this.add.text(width / 2, 140, `YOU REACHED WAVE ${this.finalWave}`, {
            fontSize: '14px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Rafael Rosseti Image
        const character = this.add.image(width / 2, height - 150, 'rossetiGameOver').setScale(1.5);

        // Speech Bubble
        const bubble = this.add.image(width / 2 + 160, height - 280, 'speechBubble').setOrigin(0.5);
        const speech = this.add.text(bubble.x, bubble.y - 12, 'Se tá difícil,\nvai fazer PAV', {
            fontSize: '12px',
            fontFamily: '"Press Start 2P"',
            fill: '#000000',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Retry Button
        const retryBtn = this.add.text(width / 2, height - 40, 'CLICK TO RETRY', {
            fontSize: '18px',
            fontFamily: '"Press Start 2P"',
            fill: '#00f2ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: retryBtn,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Animations for character
        this.tweens.add({
            targets: [character, bubble, speech],
            y: '-=10',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
