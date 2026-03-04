import { settingsManager } from '../utils/SettingsManager.js';

export class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene_v6');
        this.difficulty = 'normal';
        console.log("StartScene v6 Constructor");
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
            console.log("StartScene: Starting GameScene_v6");
            this.scene.start('GameScene_v6', { difficulty: this.difficulty, wave: 1 });
        });

        // Settings Button
        const settingsBtn = this.add.text(width / 2, height - 120, 'CONFIGURAÇÕES', {
            fontSize: '16px',
            fontFamily: '"Press Start 2P"',
            fill: '#00f2ff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        settingsBtn.on('pointerdown', () => this.handleOpenSettings());

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

    handleOpenSettings() {
        this.ensureSettingsUI();
        const overlay = document.getElementById('settings-overlay');
        const closeBtn = document.getElementById('close-settings');

        overlay.style.display = 'flex';
        this.renderBindings();

        closeBtn.onclick = () => {
            overlay.style.display = 'none';
        };
    }

    ensureSettingsUI() {
        if (document.getElementById('settings-overlay')) return;

        console.log("StartScene: Settings UI missing from DOM, injecting...");
        const uiLayer = document.getElementById('ui-layer') || document.body;

        const settingsHTML = `
            <div id="settings-overlay" class="settings-overlay" style="display: none;">
                <div class="settings-menu">
                    <h2 style="color: var(--primary); text-align: center; margin-bottom: 2rem;">CONFIGURAÇÕES</h2>
                    <div id="bindings-list" class="bindings-list"></div>
                    <button class="pause-btn" id="close-settings" style="margin-top: 2rem;">FECHAR</button>
                </div>
                <div id="rebinding-modal" class="rebinding-modal" style="display: none;">
                    <div class="rebinding-content">
                        <p>PRESSIONE UMA TECLA PARA</p>
                        <h3 id="rebinding-action" style="color: var(--secondary); margin-top: 1rem;">AÇÃO</h3>
                        <p style="font-size: 0.7rem; margin-top: 2rem; opacity: 0.7;">(Pressione ESC para cancelar)</p>
                    </div>
                </div>
            </div>
        `;

        uiLayer.insertAdjacentHTML('beforeend', settingsHTML);
    }

    renderBindings() {
        const list = document.getElementById('bindings-list');
        list.innerHTML = '';

        const actions = [
            { id: 'UP', label: 'MOVER CIMA' },
            { id: 'LEFT', label: 'MOVER ESQUERDA' },
            { id: 'DOWN', label: 'MOVER BAIXO' },
            { id: 'RIGHT', label: 'MOVER DIREITA' },
            { id: 'SHOOT', label: 'ATIRAR' }
        ];

        actions.forEach(action => {
            const row = document.createElement('div');
            row.className = 'binding-row';

            const currentKey = settingsManager.getBinding(action.id);

            row.innerHTML = `
                <span class="binding-label">${action.label}</span>
                <span class="binding-key">${currentKey}</span>
                <button class="edit-btn" data-action="${action.id}">EDITAR</button>
            `;

            list.appendChild(row);

            row.querySelector('.edit-btn').onclick = () => this.startRebinding(action.id, action.label);
        });
    }

    startRebinding(actionId, actionLabel) {
        const modal = document.getElementById('rebinding-modal');
        const actionText = document.getElementById('rebinding-action');

        actionText.innerText = actionLabel;
        modal.style.display = 'flex';

        const handleKeyDown = (e) => {
            e.preventDefault();
            if (e.key === 'Escape') {
                finish();
                return;
            }

            const newKey = e.key.toUpperCase();
            settingsManager.setBinding(actionId, newKey);
            finish();
        };

        const handlePointerDown = (e) => {
            let mouseBtn = '';
            if (e.button === 0) mouseBtn = 'LEFT_CLICK';
            else if (e.button === 2) mouseBtn = 'RIGHT_CLICK';
            else if (e.button === 1) mouseBtn = 'MIDDLE_CLICK';

            if (mouseBtn) {
                settingsManager.setBinding(actionId, mouseBtn);
                finish();
            }
        };

        const finish = () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handlePointerDown);
            modal.style.display = 'none';
            this.renderBindings();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handlePointerDown);
    }
}
