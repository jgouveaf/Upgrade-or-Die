import { GADGET_DEFINITIONS, ELEMENTS, GADGET_TYPES } from '../utils/GadgetData.js';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene_v6');
        this.isSpecialPhase = false;
        console.log("UpgradeScene v6 Constructor");
    }

    init(data = {}) {
        console.log("UpgradeScene_v6: init called with data:", data);
        this.playerData = data.player || {
            coins: 0,
            health: 100,
            maxHealth: 100,
            damageMultiplier: 1,
            speedMultiplier: 1,
            gadgets: { turrets: {}, forceFields: {}, specialShots: {} }
        };
        this.wave = data.wave || 1;
        this.difficulty = data.difficulty || 'normal';
        this.isSpecialPhase = data.isSpecialPhase || false;

        // Ensure gadgets object exists
        if (!this.playerData.gadgets) {
            this.playerData.gadgets = { turrets: {}, forceFields: {}, specialShots: {} };
        }
    }

    create() {
        console.log("UpgradeScene: create called. Wave:", this.wave);
        const { width, height } = this.scale;
        if (!width || !height) {
            console.warn("UpgradeScene: Scale not available yet?");
        }
        // Overlay background
        this.add.rectangle(0, 0, width, height, 0x0a0a0c, 1).setOrigin(0);

        this.selectedItem = null;
        this.selectedCard = null;

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

        this.createConfirmButton(width, height);

        // Special Gadget Phase (Every 3 waves)
        if (this.wave % 3 === 0 && !this.isSpecialPhase) {
            this.showSpecialGadgetOffer(width, height);
        } else {
            this.showStandardUpgrades(width, height);
        }

        // Generate Pixel Art Icons
        this.generatePixelIcons();

        // Setup ENTER key for confirmation
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.enterKey.on('down', () => {
            if (this.confirmContainer.visible) {
                this.confirmPurchase();
            }
        });
    }

    generatePixelIcons() {
        const drawIcon = (key, data, palette) => {
            if (this.textures.exists(key)) return;
            const g = this.add.graphics();
            for (let y = 0; y < data.length; y++) {
                for (let x = 0; x < data[y].length; x++) {
                    const char = data[y][x];
                    if (char !== ' ') {
                        g.fillStyle(palette[char], 1);
                        g.fillRect(x * 2, y * 2, 2, 2); // 2x2 pixels per block
                    }
                }
            }
            g.generateTexture(key, data[0].length * 2, data.length * 2);
            g.destroy();
        };

        drawIcon('icon_electric', [
            "  w  ",
            " wcw ",
            "wwc  ",
            " wcw ",
            "  cww",
            "  w  ",
            "  w  "
        ], { 'w': 0xffffff, 'c': 0x00f2ff });

        drawIcon('icon_fire', [
            "  r  ",
            " yrr ",
            " yry ",
            "rory ",
            "ryyr ",
            " yr  "
        ], { 'y': 0xffff00, 'o': 0xffaa00, 'r': 0xff4400 });

        drawIcon('icon_poison', [
            " www ",
            " wgw ",
            "w   w",
            "wgggw",
            "wgggg",
            "wwwww"
        ], { 'w': 0xffffff, 'g': 0x00ff00 });

        drawIcon('icon_force', [
            "  ww ",
            " www ",
            " wwww",
            " www ",
            "  w  "
        ], { 'w': 0xffffff });

        drawIcon('icon_push', [
            " wwww ",
            "w    w",
            " wwww "
        ], { 'w': 0xff00ff });
    }

    createConfirmButton(width, height) {
        const confirmBg = this.add.rectangle(0, 0, 260, 50, 0x00ff00).setInteractive({ useHandCursor: true });
        const confirmText = this.add.text(0, 0, 'CONFIRMAR (ENTER)', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P"',
            fill: '#000000',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Place it above the skip button
        this.confirmContainer = this.add.container(width / 2, height - 100, [confirmBg, confirmText]);
        this.confirmContainer.setVisible(false);
        this.confirmContainer.setDepth(100);

        confirmBg.on('pointerover', () => confirmBg.setFillStyle(0x00cc00));
        confirmBg.on('pointerout', () => confirmBg.setFillStyle(0x00ff00));
        confirmBg.on('pointerdown', () => this.confirmPurchase());
    }

    selectItem(item, card, defaultStrokeWidth, defaultColor) {
        if (this.selectedCard) {
            this.selectedCard.setStrokeStyle(this.selectedCard.defaultStrokeWidth, this.selectedCard.defaultColor);
        }

        this.selectedItem = item;
        this.selectedCard = card;
        card.defaultStrokeWidth = defaultStrokeWidth;
        card.defaultColor = defaultColor;

        card.setStrokeStyle(6, 0x00ff00);
        this.confirmContainer.setVisible(true);
    }

    confirmPurchase() {
        if (!this.selectedItem) return;

        if (this.selectedItem.type === 'upgrade') {
            this.applyUpgrade(this.selectedItem.id, this.selectedItem.cost);
            this.finishUpgrade();
        } else if (this.selectedItem.type === 'gadget') {
            this.playerData.coins -= this.selectedItem.cost;
            this.applyGadget(this.selectedItem.gadget);
            console.log("UpgradeScene: Gadget applied, restarting v6");
            this.scene.restart({
                player: this.playerData,
                wave: this.wave,
                difficulty: this.difficulty,
                isSpecialPhase: true
            });
        }

        this.selectedItem = null;
        this.selectedCard = null;
        this.confirmContainer.setVisible(false);
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

            card.on('pointerover', () => {
                if (this.selectedCard !== card) card.setStrokeStyle(4, 0xff0055);
            });
            card.on('pointerout', () => {
                if (this.selectedCard !== card) card.setStrokeStyle(2, 0x333333);
            });

            card.on('pointerdown', () => {
                if (this.playerData.coins >= up.cost) {
                    this.selectItem({ type: 'upgrade', id: up.id, cost: up.cost }, card, 2, 0x333333);
                } else {
                    this.cameras.main.shake(100, 0.01);
                    costText.setFill('#ff0000');
                    this.time.delayedCall(500, () => costText.setFill('#ffda00'));
                }
            });
        });

        const skip = this.add.text(width / 2, height - 40, 'Pular (Skip)', {
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
        }).setOrigin(0.5).setAlpha(1);

        // Pick 3 random gadgets from definitions
        const shuffled = [...GADGET_DEFINITIONS].sort(() => 0.5 - Math.random());
        const options = shuffled.slice(0, 3);

        options.forEach((gadget, index) => {
            const x = width / 2 - 200 + (index * 200);
            const y = height / 2 + 50;
            const element = ELEMENTS[gadget.element.toUpperCase()];

            const cost = 175;

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
                fill: '#ffffff', // changed to white
                align: 'center',
                wordWrap: { width: 160 }
            }).setOrigin(0.5);

            // Icon (Pixel Art Sprite Instead of Text)
            this.add.image(x, y - 45, 'icon_' + gadget.element).setScale(2);


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
                if (this.selectedCard !== card) card.setStrokeStyle(6, 0xffffff);
                card.setScale(1.05);
            });
            card.on('pointerout', () => {
                if (this.selectedCard !== card) card.setStrokeStyle(3, element.color);
                card.setScale(1);
            });

            card.on('pointerdown', () => {
                if (this.playerData.coins >= cost) {
                    this.selectItem({ type: 'gadget', gadget: gadget, cost: cost }, card, 3, element.color);
                } else {
                    this.cameras.main.shake(100, 0.01);
                }
            });
        });

        // Skip gadget button
        const skipGadget = this.add.text(width / 2, height - 30, 'Pular Oferta (Continuar)', {
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
        console.log("UpgradeScene: Finish upgrade, starting GameScene_v6");
        this.scene.start('GameScene_v6', {
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
