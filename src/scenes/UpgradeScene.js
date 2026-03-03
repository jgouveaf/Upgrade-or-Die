export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    init(data) {
        this.playerData = data.player;
        this.wave = data.wave;
        this.difficulty = data.difficulty || 'normal';
    }

    create() {
        const { width, height } = this.scale;

        // Overlay background
        this.add.rectangle(0, 0, width, height, 0x0a0a0c, 1).setOrigin(0);

        this.add.text(width / 2, 60, `WAVE ${this.wave} COMPLETE`, {
            fontSize: '24px',
            fontFamily: '"Press Start 2P"',
            fill: '#ff0055'
        }).setOrigin(0.5);

        this.add.text(width / 2, 110, `$ ${this.playerData.coins}`, {
            fontSize: '18px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffda00'
        }).setOrigin(0.5);

        const upgrades = [
            { id: 'health', name: 'NANO-ARMOR', desc: '+20 HP\n& HEAL', cost: 20 * (this.wave + 1) },
            { id: 'damage', name: 'POWER CELLS', desc: '+15%\nDAMAGE', cost: 30 * (this.wave + 1) },
            { id: 'speed', name: 'ROCKET BOOTS', desc: '+10%\nSPEED', cost: 15 * (this.wave + 1) }
        ];

        const selected = upgrades.sort(() => 0.5 - Math.random());

        selected.forEach((up, index) => {
            const x = width / 2 - 200 + (index * 200);
            const y = height / 2 + 20;

            const card = this.add.rectangle(x, y, 180, 260, 0x141419)
                .setStrokeStyle(2, 0x333333)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, y - 90, up.name, {
                fontSize: '12px',
                fontFamily: '"Press Start 2P"',
                fill: '#00f2ff',
                fontWeight: 'bold',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(x, y - 20, up.desc, {
                fontSize: '10px',
                fontFamily: '"Press Start 2P"',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 10,
                wordWrap: { width: 150 }
            }).setOrigin(0.5);

            const costText = this.add.text(x, y + 90, `$ ${up.cost}`, {
                fontSize: '14px',
                fontFamily: '"Press Start 2P"',
                fill: '#ffda00',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            card.on('pointerover', () => card.setStrokeStyle(4, 0xff0055));
            card.on('pointerout', () => card.setStrokeStyle(2, 0x333333));

            card.on('pointerdown', () => {
                if (this.playerData.coins >= up.cost) {
                    this.applyUpgrade(up.id, up.cost);
                    this.scene.start('GameScene', {
                        player: this.playerData,
                        wave: this.wave + 1,
                        difficulty: this.difficulty
                    });
                } else {
                    this.cameras.main.shake(100, 0.01);
                    costText.setFill('#ff0000');
                    this.time.delayedCall(500, () => costText.setFill('#ffda00'));
                }
            });
        });

        // Skip button
        const skip = this.add.text(width / 2, height - 50, 'Skip to next wave', {
            fontSize: '12px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff',
            alpha: 0.5
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        skip.on('pointerdown', () => {
            this.scene.start('GameScene', {
                player: this.playerData,
                wave: this.wave + 1,
                difficulty: this.difficulty
            });
        });
    }

    applyUpgrade(id, cost) {
        this.playerData.coins -= cost;
        if (id === 'health') {
            this.playerData.maxHealth += 20;
            this.playerData.health = this.playerData.maxHealth;
        } else if (id === 'damage') {
            this.playerData.damageMultiplier += 0.15;
        } else if (id === 'speed') {
            this.playerData.speedMultiplier += 0.10;
        }
    }
}
