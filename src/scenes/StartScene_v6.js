import { settingsManager } from '../utils/SettingsManager.js?v=8';
import { CHARACTERS } from '../utils/CharacterData.js?v=8';

export class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene_v6');
        this.difficulty = 'normal';
        this.selectedCharacter = localStorage.getItem('upgradeOrDie_selectedCharacter') || 'player';
        this.maxWave = parseInt(localStorage.getItem('upgradeOrDie_maxWave') || '1', 10);
        console.log("StartScene v6 Constructor - Max Wave:", this.maxWave);
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a0c).setOrigin(0);

        // Title
        const title = this.add.text(width / 2, height / 2 - 200, 'UPGRADE OR DIE', {
            fontSize: '36px',
            fontFamily: '"Press Start 2P"',
            fill: '#ff0055',
            stroke: '#00f2ff',
            strokeThickness: 3,
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5);

        // Difficulty Header
        this.add.text(width / 2, height / 2 - 110, 'SELECT DIFFICULTY:', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff',
            padding: { x: 5, y: 5 }
        }).setOrigin(0.5);

        const diffs = [
            { id: 'easy', name: 'PAV', color: '#00ff00', desc: '+Coins, -Health' },
            { id: 'normal', name: 'ROSSETI', color: '#00f2ff', desc: 'Standard Experience' },
            { id: 'hard', name: 'PORQUINHO DA SORTE', color: '#ff0055', desc: '-Coins, +Health' }
        ];

        this.diffButtons = [];

        diffs.forEach((d, i) => {
            const x = width / 2;
            const y = height / 2 - 50 + (i * 60); // More breathing room between buttons

            const btn = this.add.text(x, y, d.name, {
                fontSize: d.name.length > 10 ? '14px' : '18px', // Dynamically scale long names
                fontFamily: '"Press Start 2P"',
                fill: this.difficulty === d.id ? d.color : '#444',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                this.difficulty = d.id;
                this.updateButtons(diffs);
            });

        this.diffButtons.push({ btn, id: d.id, color: d.color });
        });

        // Character Selection Button
        const currentCharacter = CHARACTERS.find(c => c.id === this.selectedCharacter) || CHARACTERS[0];
        const characterBtnText = 'SKIN: ' + currentCharacter.name;
        
        this.characterBtn = this.add.text(width / 2, height - 120, characterBtnText, {
            fontSize: '14px',
            fontFamily: '"Press Start 2P"',
            fill: currentCharacter.color,
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.characterBtn.on('pointerdown', () => this.handleOpenCharacters());

        // Click to Start
        const startBtn = this.add.text(width / 2, height - 70, 'START GAME', {
            fontSize: '20px',
            fontFamily: '"Press Start 2P"',
            fill: '#ffffff',
            backgroundColor: '#ff0055',
            padding: { x: 25, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            console.log("StartScene: Starting GameScene_v6");
            this.scene.start('GameScene_v6', { difficulty: this.difficulty, wave: 1, character: this.selectedCharacter });
        });

        // Settings Button
        const settingsBtn = this.add.text(width / 2, height - 170, 'CONFIGURAÇÕES', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P"',
            fill: '#00f2ff',
            padding: { x: 10, y: 10 }
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
        const uiLayer = document.getElementById('ui-layer') || document.body;
        
        // Inject Character Overlay if missing
        if (!document.getElementById('character-overlay')) {
            console.log("StartScene: Character UI missing, injecting...");
            const characterHTML = `
                <div id="character-overlay" class="settings-overlay" style="display: none; z-index: 1000; align-items:center; justify-content:center; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85);">
                    <div class="settings-menu" style="width: 90%; max-width: 700px; max-height: 90%; overflow-y: auto; text-align: center;">
                        <h2 style="color: var(--primary); margin-bottom: 2rem; font-family: 'Press Start 2P', cursive; font-size: 16px;">ESCOLHA A SKIN / CLASSE</h2>
                        <div id="character-list" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;"></div>
                        <button class="pause-btn" id="close-character" style="margin-top: 2rem;">FECHAR</button>
                        <p style="margin-top: 20px; font-size: 10px; color: #aaa;">Seu recorde máximo: Wave ${this.maxWave}</p>
                    </div>
                </div>
            `;
            uiLayer.insertAdjacentHTML('beforeend', characterHTML);
            document.getElementById('close-character').onclick = () => {
                document.getElementById('character-overlay').style.display = 'none';
            }
        }

        // Inject Settings Overlay if missing (Fall-back for debug)
        if (!document.getElementById('settings-overlay')) {
            console.log("StartScene: Settings UI missing, injecting...");
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
        
    }

    handleOpenCharacters() {
        this.ensureSettingsUI();
        const overlay = document.getElementById('character-overlay');
        const listContainer = document.getElementById('character-list');
        listContainer.innerHTML = '';
        
        CHARACTERS.forEach(char => {
            const isUnlocked = this.maxWave >= char.unlockWave;
            const isSelected = this.selectedCharacter === char.id;
            
            const card = document.createElement('div');
            card.style.border = `2px solid ${isSelected ? char.color : '#333'}`;
            card.style.borderRadius = '8px';
            card.style.padding = '15px';
            card.style.width = '160px';
            card.style.backgroundColor = isUnlocked ? '#1a1a25' : '#0a0a0c';
            card.style.cursor = isUnlocked ? 'pointer' : 'not-allowed';
            card.style.opacity = isUnlocked ? '1' : '0.5';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.textAlign = 'center';
            
            card.innerHTML = `
                <h3 style="color: ${char.color}; font-size: 14px; margin-bottom: 10px; min-height: 30px;">${char.name}</h3>
                <p style="font-size: 10px; color: #ddd; margin-bottom: 15px; min-height: 40px; line-height: 1.4;">${char.desc.replace(/\n/g, '<br>')}</p>
                <div style="margin-top: auto; font-size: 10px; color: ${isUnlocked ? '#00ff00' : '#ff0055'}">
                    ${isUnlocked ? (isSelected ? 'SELECIONADO' : 'SELECIONAR') : `REQUER WAVE ${char.unlockWave}`}
                </div>
            `;
            
            if (isUnlocked) {
                card.onmouseover = () => card.style.transform = 'scale(1.05)';
                card.onmouseout = () => card.style.transform = 'scale(1)';
                card.onclick = () => {
                    this.selectedCharacter = char.id;
                    localStorage.setItem('upgradeOrDie_selectedCharacter', char.id);
                    this.characterBtn.setText('SKIN: ' + char.name);
                    this.characterBtn.setFill(char.color);
                    overlay.style.display = 'none';
                };
            }
            listContainer.appendChild(card);
        });

        overlay.style.display = 'flex';
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
