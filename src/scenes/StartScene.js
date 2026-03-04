export class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
        this.difficulty = 'normal';
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a0c).setOrigin(0);

        // Title
        const title = this.add.text(width / 2, height / 2 - 120, 'UPGRADE OR DIE', {
            fontSize: '48px',
            fontFamily: '"Press Start 2P"',
            fill: '#ff0055',
            stroke: '#00f2ff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Difficulty Header
        this.add.text(width / 2, height / 2 - 30, 'SELECT DIFFICULTY:', {
            fontSize: '16px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const diffs = [
            { id: 'easy', name: 'PAV', color: '#00ff00', desc: '+Coins, -Health' },
            { id: 'normal', name: 'ROSSETI', color: '#00f2ff', desc: 'Standard Experience' },
            { id: 'hard', name: 'PORQUINHO DA SORTE', color: '#ff0055', desc: '-Coins, +Health' }
        ];

        this.diffButtons = [];

        diffs.forEach((d, i) => {
            const x = width / 2;
            const y = height / 2 + 40 + (i * 60);

            const btn = this.add.text(x, y, d.name, {
                fontSize: '18px',
                fontFamily: '"Press Start 2P"',
                fill: this.difficulty === d.id ? d.color : '#444'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                this.difficulty = d.id;
                this.updateButtons(diffs);
            });

            this.diffButtons.push({ btn, id: d.id, color: d.color });
        });

        // Click to Start
        const startBtn = this.add.text(width / 2, height - 60, 'START GAME', {
            fontSize: '20px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff',
            backgroundColor: '#ff0055',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene', { difficulty: this.difficulty, wave: 1 });
        });

        // Blink animation
        this.tweens.add({
            targets: startBtn,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    updateButtons(diffs) {
        this.diffButtons.forEach(b => {
            const d = diffs.find(df => df.id === b.id);
            b.btn.setFill(this.difficulty === b.id ? d.color : '#444');
            if (this.difficulty === b.id) {
                b.btn.setScale(1.1);
            } else {
                b.btn.setScale(1);
            }
        });
    }
}
