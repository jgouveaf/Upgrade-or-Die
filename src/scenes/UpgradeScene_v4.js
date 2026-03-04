import { GADGET_DEFINITIONS, ELEMENTS, GADGET_TYPES } from '../utils/GadgetData.js';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
        this.isSpecialPhase = false;
    }

    init(data) {
        this.playerData = data.player;
        this.wave = data.wave;
        this.difficulty = data.difficulty || 'normal';
        this.isSpecialPhase = data.isSpecialPhase || false;
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

        // Special Gadget Phase (Every 3 waves)
        if (this.wave % 3 === 0 && !this.isSpecialPhase) {
            this.showSpecialGadgetOffer(width, height);
        } else {
            this.showStandardUpgrades(width, height);
        }
    }

    showStandardUpgrades(width, height) {
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
                    this.finishUpgrade();
                } else {
                    this.cameras.main.shake(100, 0.01);
                    costText.setFill('#ff0000');
                    this.time.delayedCall(500, () => costText.setFill('#ffda00'));
                }
            });
        });

        const skip = this.add.text(width / 2, height - 50, 'Skip to next wave', {
            fontSize: '12px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff',
            alpha: 0.5
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        skip.on('pointerdown', () => this.finishUpgrade());
    }

    showSpecialGadgetOffer(width, height) {
        this.add.text(width / 2, 160, '⭐ SPECIAL OFFER: SELECT GADGET ⭐', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P"',
            fill: '#00f2ff'
        }).setOrigin(0.5).setAlpha(0);

        // Pick 3 random gadgets from definitions
        const shuffled = [...GADGET_DEFINITIONS].sort(() => 0.5 - Math.random());
        const options = shuffled.slice(0, 3);

        options.forEach((gadget, index) => {
            const x = width / 2 - 200 + (index * 200);
            const y = height / 2 + 50;
            const element = ELEMENTS[gadget.element.toUpperCase()];

            const cost = 100 * (1 + Math.floor(this.wave / 3));

            const card = this.add.rectangle(x, y, 180, 260, 0x1a1a25)
                .setStrokeStyle(3, element.color)
                .setInteractive({ useHandCursor: true });

            // Type Label
            this.add.text(x, y - 110, gadget.type.replace('_', ' ').toUpperCase(), {
                fontSize: '8px',
                fontFamily: '"Press Start 2P"',
                fill: '#888'
            }).setOrigin(0.5);

            // Name
            this.add.text(x, y - 85, gadget.name, {
                fontSize: '11px',
                fontFamily: '"Press Start 2P"',
                fill: element.color,
                align: 'center',
                wordWrap: { width: 160 }
            }).setOrigin(0.5);

            // Icon
            this.add.text(x, y - 45, element.icon, {
                fontSize: '32px'
            }).setOrigin(0.5);

            // Description
            this.add.text(x, y + 10, gadget.desc, {
                fontSize: '9px',
                fontFamily: '"Press Start 2P"',
                fill: '#ddd',
                align: 'center',
                wordWrap: { width: 150 }
            }).setOrigin(0.5);

            // Star Level if already owned
            const typeKey = gadget.type === GADGET_TYPES.TURRET ? 'turrets' :
                (gadget.type === GADGET_TYPES.FORCE_FIELD ? 'forceFields' : 'specialShots');
            const currentLevel = this.playerData.gadgets[typeKey][gadget.element] || 0;

            if (currentLevel > 0) {
                this.add.text(x, y + 60, '⭐'.repeat(currentLevel), { fontSize: '10px' }).setOrigin(0.5);
                this.add.text(x, y + 75, 'LEVEL UP!', { fontSize: '8px', fill: '#00ff00' }).setOrigin(0.5);
            } else {
                this.add.text(x, y + 75, 'NEW!', { fontSize: '8px', fill: '#ffff00' }).setOrigin(0.5);
            }

            const costText = this.add.text(x, y + 105, `$ ${cost}`, {
                fontSize: '12px',
                fontFamily: '"Press Start 2P"',
                fill: '#ffda00'
            }).setOrigin(0.5);

            card.on('pointerover', () => {
                card.setStrokeStyle(6, 0xffffff);
                card.setScale(1.05);
            });
            card.on('pointerout', () => {
                card.setStrokeStyle(3, element.color);
                card.setScale(1);
            });

            card.on('pointerdown', () => {
                if (this.playerData.coins >= cost) {
                    this.playerData.coins -= cost;
                    this.applyGadget(gadget);
                    this.scene.restart({
                        player: this.playerData,
                        wave: this.wave,
                        difficulty: this.difficulty,
                        isSpecialPhase: true
                    });
                } else {
                    this.cameras.main.shake(100, 0.01);
                }
            });
        });

        // Skip gadget button
        const skipGadget = this.add.text(width / 2, height - 30, 'Skip Special Offer (Continue to upgrades)', {
            fontSize: '9px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff',
            alpha: 0.6
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        skipGadget.on('pointerdown', () => {
            this.scene.restart({
                player: this.playerData,
                wave: this.wave,
                difficulty: this.difficulty,
                isSpecialPhase: true
            });
        });
    }

    applyGadget(gadget) {
        const typeKey = gadget.type === GADGET_TYPES.TURRET ? 'turrets' :
            (gadget.type === GADGET_TYPES.FORCE_FIELD ? 'forceFields' : 'specialShots');

        if (!this.playerData.gadgets[typeKey][gadget.element]) {
            this.playerData.gadgets[typeKey][gadget.element] = 1;
        } else {
            this.playerData.gadgets[typeKey][gadget.element]++;
        }
    }

    finishUpgrade() {
        this.scene.start('GameScene', {
            player: this.playerData,
            wave: this.wave + 1,
            difficulty: this.difficulty
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
