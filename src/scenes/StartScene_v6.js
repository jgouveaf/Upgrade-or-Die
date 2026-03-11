import { settingsManager } from '../utils/SettingsManager.js?v=13';
import { CHARACTERS } from '../utils/CharacterData.js?v=13';

export class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene_v6');
        this.difficulty = 'normal';
    }

    init() {
        // All skins unlocked by default
        localStorage.setItem('upgradeOrDie_cheatUnlockAll', 'true');

        this.selectedCharacter = localStorage.getItem('upgradeOrDie_selectedCharacter') || 'player';
        this.maxWave = parseInt(localStorage.getItem('upgradeOrDie_maxWave') || '1', 10);
        this.totalDeaths = parseInt(localStorage.getItem('upgradeOrDie_deaths') || '0', 10);
        this.totalKills = parseInt(localStorage.getItem('upgradeOrDie_totalKills') || '0', 10);
        this.bestMatchKills = parseInt(localStorage.getItem('upgradeOrDie_bestMatchKills') || '0', 10);
        this.maxWaveEasy = parseInt(localStorage.getItem('upgradeOrDie_maxWave_easy') || '1', 10);
        this.maxWaveNormal = parseInt(localStorage.getItem('upgradeOrDie_maxWave_normal') || '1', 10);
        this.maxWaveHard = parseInt(localStorage.getItem('upgradeOrDie_maxWave_hard') || '1', 10);
        console.log("StartScene v6 Init - Max Wave:", this.maxWave, "Deaths:", this.totalDeaths, "Total Kills:", this.totalKills);
    }

    create() {
        // Generate all skin textures so they show in the character selection menu
        this.generateSkinTextures();

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

        // Cheat: Unlock all skins with 'Q'
        this.input.keyboard.on('keydown-Q', () => {
            console.log("Cheat activated: Unlocking all skins...");
            localStorage.setItem('upgradeOrDie_cheatUnlockAll', 'true');
            if (document.getElementById('character-overlay') && document.getElementById('character-overlay').style.display === 'flex') {
                this.handleOpenCharacters(); // Refresh the menu if it's open
            }
            // Optional: flash screen or play sound to indicate success
            this.cameras.main.flash(500, 255, 255, 255);
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
                        <p style="margin-top: 20px; font-size: 10px; color: #aaa;">Recorde: Wave ${this.maxWave} | Mortes Totais: ${this.totalDeaths}</p>
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
            let isUnlocked = false;
            let unlockText = '';
            
            if (localStorage.getItem('upgradeOrDie_cheatUnlockAll') === 'true') {
                isUnlocked = true;
                unlockText = `Mestre dos Cheats`;
            } else if (char.unlockWave !== undefined && char.unlockWave !== null) {
                isUnlocked = this.maxWave >= char.unlockWave;
                unlockText = `REQUER WAVE ${char.unlockWave}`;
            } else if (char.unlockDeaths !== undefined && char.unlockDeaths !== null) {
                isUnlocked = this.totalDeaths >= char.unlockDeaths;
                unlockText = `REQUER ${char.unlockDeaths} MORTE(S)`;
            } else if (char.unlockTotalKills !== undefined && char.unlockTotalKills !== null) {
                isUnlocked = this.totalKills >= char.unlockTotalKills;
                unlockText = `REQUER ${char.unlockTotalKills} ABATES TOTAIS`;
            } else if (char.unlockMatchKills !== undefined && char.unlockMatchKills !== null) {
                isUnlocked = this.bestMatchKills >= char.unlockMatchKills;
                unlockText = `REQUER ${char.unlockMatchKills} ABATES (PARTIDA)`;
            } else if (char.unlockDifficulty !== undefined && char.unlockWaveCond !== null) {
                let diffMaxWave = this.maxWaveNormal;
                let diffName = "NORMAL";
                if (char.unlockDifficulty === 'hard') { diffMaxWave = this.maxWaveHard; diffName = "DIFÍCIL"; }
                if (char.unlockDifficulty === 'easy') { diffMaxWave = this.maxWaveEasy; diffName = "FÁCIL"; }
                isUnlocked = diffMaxWave >= char.unlockWaveCond;
                unlockText = `REQUER WAVE ${char.unlockWaveCond} NO ${diffName}`;
            } else {
                isUnlocked = true; // Default unlocked
                unlockText = `DESBLOQUEADO`;
            }
            
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
            
            let iconHtml = '';
            if (this.game && this.game.textures.exists(char.skin)) {
                // To display Phaser canvas textures in DOM, we get the base64 URL
                const canvas = this.game.textures.get(char.skin).getSourceImage();
                if (canvas && canvas.toDataURL) {
                    const dataURL = canvas.toDataURL();
                    // scale icon rendering style to mimic simple pixel art scaled up
                    iconHtml = `<img src="${dataURL}" style="width: 32px; height: 32px; image-rendering: pixelated; margin-bottom: 5px;">`;
                }
            }

            card.innerHTML = `
                <h3 style="color: ${char.color}; font-size: 14px; margin-bottom: 5px; min-height: 30px;">${char.name}</h3>
                ${iconHtml}
                <p style="font-size: 10px; color: #ddd; margin-bottom: 15px; min-height: 40px; line-height: 1.4;">${char.desc.replace(/\n/g, '<br>')}</p>
                <div style="margin-top: auto; font-size: 10px; color: ${isUnlocked ? '#00ff00' : '#ff0055'}">
                    ${isUnlocked ? (isSelected ? 'SELECIONADO' : 'SELECIONAR') : unlockText}
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

    generateSkinTextures() {
        const g = this.add.graphics();

        // skin_1: APRENDIZ - Yellow helmet recruit
        if (!this.textures.exists('skin_1')) {
            g.clear();
            g.fillStyle(0xffff66, 1); g.fillRoundedRect(4, 2, 24, 22, 6);
            g.fillStyle(0xffaa00, 1); g.fillRect(4, 2, 24, 8);
            g.fillStyle(0xffffff, 1); g.fillRect(10, 12, 4, 4); g.fillRect(18, 12, 4, 4);
            g.fillStyle(0x000000, 1); g.fillRect(11, 13, 2, 2); g.fillRect(19, 13, 2, 2);
            g.fillStyle(0xffaa00, 1); g.fillRect(8, 24, 16, 8);
            g.generateTexture('skin_1', 32, 32);
        }

        // skin_2: GLADIADOR - Full medieval knight helmet
        if (!this.textures.exists('skin_2')) {
            g.clear();
            g.fillStyle(0x888888, 1); g.fillRoundedRect(4, 2, 24, 28, 6);
            g.fillStyle(0x666666, 1); g.fillRect(4, 4, 8, 22);
            g.fillStyle(0xaaaaaa, 1); g.fillRect(22, 4, 6, 18);
            g.fillStyle(0x222222, 1); g.fillRect(7, 12, 18, 10);
            g.fillStyle(0x555555, 1); g.fillRect(7, 13, 18, 2); g.fillRect(7, 16, 18, 2); g.fillRect(7, 19, 18, 2);
            g.fillStyle(0x555555, 1); g.fillRect(15, 12, 2, 10);
            g.fillStyle(0x777777, 1); g.fillRect(4, 28, 24, 4);
            g.fillStyle(0x888888, 1); g.fillRect(2, 14, 4, 16); g.fillRect(26, 14, 4, 16);
            g.fillStyle(0x999999, 1); g.fillRect(14, 2, 4, 4);
            g.generateTexture('skin_2', 32, 32);
        }

        // skin_3: EXTERMINADOR - Robot with red eye
        if (!this.textures.exists('skin_3')) {
            g.clear();
            g.fillStyle(0x333333, 1); g.fillRoundedRect(4, 2, 24, 24, 4);
            g.fillStyle(0x555555, 1); g.fillRect(6, 4, 20, 10);
            g.fillStyle(0xff0000, 1); g.fillCircle(12, 13, 4);
            g.fillStyle(0xffffff, 1); g.fillRect(19, 11, 5, 5);
            g.fillStyle(0x000000, 1); g.fillRect(20, 12, 3, 3);
            g.fillStyle(0xff0000, 1); g.fillRect(14, 18, 6, 2);
            g.fillStyle(0x444444, 1); g.fillRect(6, 26, 20, 6);
            g.fillStyle(0xff4400, 1); g.fillRect(8, 27, 4, 2); g.fillRect(20, 27, 4, 2);
            g.generateTexture('skin_3', 32, 32);
        }

        // skin_4: MÁQUINA DE MATAR - Full metal cyborg
        if (!this.textures.exists('skin_4')) {
            g.clear();
            g.fillStyle(0x222222, 1); g.fillRect(2, 2, 28, 28);
            g.fillStyle(0x00f2ff, 1); g.fillRect(4, 4, 24, 4);
            g.fillStyle(0x00f2ff, 1); g.fillCircle(11, 14, 4); g.fillCircle(21, 14, 4);
            g.fillStyle(0xffffff, 1); g.fillCircle(11, 14, 2); g.fillCircle(21, 14, 2);
            g.fillStyle(0x00f2ff, 1); g.fillRect(10, 20, 12, 2);
            g.fillStyle(0x00f2ff, 1); g.fillRect(4, 26, 24, 2);
            g.fillStyle(0x444444, 1); g.fillRect(6, 6, 4, 2); g.fillRect(22, 6, 4, 2);
            g.generateTexture('skin_4', 32, 32);
        }

        // skin_5: SOBREVIVENTE - Worn armor with bandages
        if (!this.textures.exists('skin_5')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 4, 20, 20, 5);
            g.fillStyle(0x888888, 1); g.fillRect(4, 2, 24, 8);
            g.fillStyle(0xffffff, 1); g.fillRect(6, 14, 8, 2);
            g.fillStyle(0x000000, 1); g.fillRect(21, 13, 3, 3);
            g.fillStyle(0x666666, 1); g.fillRect(6, 24, 20, 8);
            g.fillStyle(0xffffff, 1); g.fillRect(12, 26, 8, 2); g.fillRect(10, 28, 12, 2);
            g.generateTexture('skin_5', 32, 32);
        }

        // skin_6: VETERANO - Military cap with medals
        if (!this.textures.exists('skin_6')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 4, 18, 20, 5);
            g.fillStyle(0x556655, 1); g.fillRect(4, 2, 24, 8);
            g.fillStyle(0xffdd00, 1); g.fillRect(12, 4, 8, 2);
            g.fillStyle(0x000000, 1); g.fillRect(10, 13, 3, 3); g.fillRect(19, 13, 3, 3);
            g.fillStyle(0x999966, 1); g.fillRect(6, 24, 20, 8);
            g.fillStyle(0xffdd00, 1); g.fillRect(8, 26, 3, 3); g.fillRect(13, 26, 3, 3); g.fillRect(18, 26, 3, 3);
            g.fillStyle(0xff0000, 1); g.fillRect(9, 27, 1, 1); g.fillRect(14, 27, 1, 1); g.fillRect(19, 27, 1, 1);
            g.generateTexture('skin_6', 32, 32);
        }

        // skin_7: IMPARÁVEL - Warrior with shoulder spikes
        if (!this.textures.exists('skin_7')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 4, 20, 18, 5);
            g.fillStyle(0x882200, 1); g.fillRect(4, 2, 24, 8);
            g.fillStyle(0xffaa00, 1); g.fillRect(4, 2, 4, 4); g.fillRect(24, 2, 4, 4);
            g.fillStyle(0x000000, 1); g.fillRect(10, 11, 4, 4); g.fillRect(18, 11, 4, 4);
            g.fillStyle(0xff4400, 1); g.fillRect(10, 9, 4, 2); g.fillRect(18, 9, 4, 2);
            g.fillStyle(0x882200, 1); g.fillRect(4, 22, 24, 10);
            g.generateTexture('skin_7', 32, 32);
        }

        // skin_8: LENDA VIVA - Golden glowing figure
        if (!this.textures.exists('skin_8')) {
            g.clear();
            g.fillStyle(0xffaa00, 1); g.fillRoundedRect(4, 2, 24, 24, 8);
            g.fillStyle(0xffee00, 1); g.fillRoundedRect(6, 4, 20, 16, 6);
            g.fillStyle(0xffffff, 1); g.fillRect(9, 10, 5, 5); g.fillRect(18, 10, 5, 5);
            g.fillStyle(0xffee00, 1); g.fillRect(10, 11, 3, 3); g.fillRect(19, 11, 3, 3);
            g.fillStyle(0xffdd00, 1); g.fillRect(12, 18, 8, 2);
            g.fillStyle(0xffaa00, 1); g.fillRect(4, 26, 24, 6);
            g.generateTexture('skin_8', 32, 32);
        }

        // skin_9: KAMIKAZE - Barrel with fuse
        if (!this.textures.exists('skin_9')) {
            g.clear();
            g.fillStyle(0x884400, 1); g.fillRoundedRect(6, 4, 20, 20, 4);
            g.fillStyle(0x553300, 1); g.fillRect(6, 8, 20, 2); g.fillRect(6, 14, 20, 2); g.fillRect(6, 20, 20, 2);
            g.fillStyle(0xffff00, 1); g.fillRect(10, 10, 4, 4); g.fillRect(18, 10, 4, 4);
            g.fillStyle(0x000000, 1); g.fillRect(11, 11, 2, 2); g.fillRect(19, 11, 2, 2);
            g.fillStyle(0xff4400, 1); g.fillRect(15, 2, 2, 4);
            g.fillStyle(0xffff00, 1); g.fillCircle(15, 2, 2);
            g.fillStyle(0xcc3300, 1); g.fillRect(8, 24, 16, 8);
            g.generateTexture('skin_9', 32, 32);
        }

        // skin_10: FÊNIX - Fire bird with flame crest
        if (!this.textures.exists('skin_10')) {
            g.clear();
            g.fillStyle(0xff6600, 1); g.fillRoundedRect(6, 6, 20, 18, 8);
            g.fillStyle(0xff0000, 1); g.fillRect(4, 2, 6, 8); g.fillRect(22, 2, 6, 8);
            g.fillStyle(0xffff00, 1); g.fillRect(6, 4, 4, 6); g.fillRect(22, 4, 4, 6);
            g.fillStyle(0xffffff, 1); g.fillRect(10, 12, 4, 4); g.fillRect(18, 12, 4, 4);
            g.fillStyle(0xff6600, 1); g.fillRect(11, 13, 2, 2); g.fillRect(19, 13, 2, 2);
            g.fillStyle(0xff4400, 1); g.fillRect(6, 24, 20, 8);
            g.generateTexture('skin_10', 32, 32);
        }

        // skin_11: IMORTAL - Ghostly spectral figure
        if (!this.textures.exists('skin_11')) {
            g.clear();
            g.fillStyle(0x8888cc, 1); g.fillRoundedRect(4, 2, 24, 26, 10);
            g.fillStyle(0x6666aa, 1); g.fillRect(4, 16, 24, 12);
            g.fillStyle(0xffffff, 1); g.fillCircle(12, 12, 5); g.fillCircle(20, 12, 5);
            g.fillStyle(0x000000, 1); g.fillCircle(12, 12, 3); g.fillCircle(20, 12, 3);
            g.fillStyle(0xaaaadd, 1); g.fillRect(10, 20, 12, 2);
            g.generateTexture('skin_11', 32, 32);
        }

        // skin_12: MATADOR RÁPIDO - Speed visor helmet
        if (!this.textures.exists('skin_12')) {
            g.clear();
            g.fillStyle(0x0044aa, 1); g.fillRoundedRect(4, 2, 24, 24, 6);
            g.fillStyle(0x00aaff, 1); g.fillRect(6, 10, 20, 6);
            g.fillStyle(0xffffff, 1); g.fillRect(8, 11, 4, 4); g.fillRect(20, 11, 4, 4);
            g.fillStyle(0x00aaff, 1); g.fillRect(11, 12, 2, 2); g.fillRect(21, 12, 2, 2);
            g.fillStyle(0x003388, 1); g.fillRect(6, 26, 20, 6);
            g.fillStyle(0x00aaff, 1); g.fillRect(10, 28, 12, 2);
            g.generateTexture('skin_12', 32, 32);
        }

        // skin_13: MATADOR FUROR - Berserker with rage eyes
        if (!this.textures.exists('skin_13')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 4, 20, 20, 5);
            g.fillStyle(0x663300, 1); g.fillRect(6, 2, 20, 10);
            g.fillStyle(0x884422, 1); g.fillRect(2, 4, 6, 4); g.fillRect(24, 4, 6, 4);
            g.fillStyle(0xff0000, 1); g.fillRect(9, 12, 5, 4); g.fillRect(18, 12, 5, 4);
            g.fillStyle(0xffaa00, 1); g.fillRect(9, 10, 5, 2); g.fillRect(18, 10, 5, 2);
            g.fillStyle(0xcc3300, 1); g.fillRect(6, 24, 20, 8);
            g.generateTexture('skin_13', 32, 32);
        }

        // skin_14: ASSASSINO EM SÉRIE - Dark ninja
        if (!this.textures.exists('skin_14')) {
            g.clear();
            g.fillStyle(0x111111, 1); g.fillRoundedRect(4, 2, 24, 26, 6);
            g.fillStyle(0x222222, 1); g.fillRect(6, 4, 20, 20);
            g.fillStyle(0xff0055, 1); g.fillRect(8, 12, 6, 4); g.fillRect(18, 12, 6, 4);
            g.fillStyle(0x000000, 1); g.fillRect(6, 18, 20, 2);
            g.fillStyle(0x333333, 1); g.fillRect(4, 24, 24, 8);
            g.fillStyle(0xff0055, 1); g.fillRect(10, 26, 12, 2);
            g.generateTexture('skin_14', 32, 32);
        }

        // skin_15: INICIANTE - Fresh recruit
        if (!this.textures.exists('skin_15')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 5, 18, 18, 5);
            g.fillStyle(0x00aaff, 1); g.fillRect(6, 3, 20, 8);
            g.fillStyle(0xffffff, 1); g.fillRect(6, 7, 20, 2);
            g.fillStyle(0x000000, 1); g.fillRect(10, 14, 3, 3); g.fillRect(19, 14, 3, 3);
            g.fillStyle(0x000000, 1); g.fillRect(14, 19, 4, 1);
            g.fillStyle(0x00aaff, 1); g.fillRect(6, 23, 20, 9);
            g.generateTexture('skin_15', 32, 32);
        }

        // skin_16: EXPERIENTE - Camo helmet veteran
        if (!this.textures.exists('skin_16')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 5, 18, 18, 5);
            g.fillStyle(0x445544, 1); g.fillRect(4, 3, 24, 9);
            g.fillStyle(0x334433, 1); g.fillRect(6, 5, 8, 4); g.fillRect(18, 5, 6, 3);
            g.fillStyle(0x000000, 1); g.fillRect(10, 14, 4, 3); g.fillRect(18, 14, 4, 3);
            g.fillStyle(0xddaa88, 1); g.fillRect(12, 19, 5, 2);
            g.fillStyle(0x445544, 1); g.fillRect(6, 23, 20, 9);
            g.generateTexture('skin_16', 32, 32);
        }

        // skin_17: MUITO FÁCIL - Relaxed with sunglasses
        if (!this.textures.exists('skin_17')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 5, 20, 20, 8);
            g.fillStyle(0xffff00, 1); g.fillRect(6, 3, 20, 6);
            g.fillStyle(0x000000, 1); g.fillRect(8, 12, 16, 4);
            g.fillStyle(0x333300, 1); g.fillRect(9, 13, 5, 2); g.fillRect(18, 13, 5, 2);
            g.fillStyle(0x000000, 1); g.fillRect(13, 13, 5, 2);
            g.fillStyle(0x000000, 1); g.fillRect(14, 19, 4, 2);
            g.fillStyle(0xffaa00, 1); g.fillRect(6, 25, 20, 7);
            g.generateTexture('skin_17', 32, 32);
        }

        // skin_18: APENAS UM ARRANHÃO - Bandaged
        if (!this.textures.exists('skin_18')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(7, 5, 18, 20, 5);
            g.fillStyle(0xffffff, 1); g.fillRect(6, 6, 10, 3); g.fillRect(8, 4, 6, 4);
            g.fillStyle(0xdddddd, 1); g.fillRect(7, 7, 8, 2);
            g.fillStyle(0x000000, 1); g.fillRect(10, 14, 3, 3);
            g.fillStyle(0xffffff, 1); g.fillRect(18, 12, 7, 3);
            g.fillStyle(0x000000, 1); g.fillRect(19, 13, 5, 1);
            g.fillStyle(0xaaaaaa, 1); g.fillRect(6, 25, 20, 7);
            g.fillStyle(0xffffff, 1); g.fillRect(8, 26, 16, 2); g.fillRect(8, 29, 16, 2);
            g.generateTexture('skin_18', 32, 32);
        }

        // skin_19: DORMINHOCO - Sleepy with nightcap
        if (!this.textures.exists('skin_19')) {
            g.clear();
            g.fillStyle(0xffdbac, 1); g.fillRoundedRect(6, 6, 20, 20, 8);
            g.fillStyle(0x4444cc, 1); g.fillRect(6, 2, 20, 10);
            g.fillStyle(0xffffff, 1); g.fillRect(6, 10, 20, 2);
            g.fillStyle(0x4444cc, 1); g.fillRect(22, 0, 4, 6);
            g.fillStyle(0x000000, 1); g.fillRect(9, 14, 5, 2); g.fillRect(18, 14, 5, 2);
            g.fillStyle(0xffdbac, 1); g.fillRect(10, 14, 3, 1); g.fillRect(19, 14, 3, 1);
            g.fillStyle(0x000000, 1); g.fillRect(14, 20, 4, 2);
            g.fillStyle(0x4444cc, 1); g.fillRect(6, 26, 20, 6);
            g.fillStyle(0xffffff, 1); g.fillRect(6, 28, 4, 2); g.fillRect(14, 28, 4, 2); g.fillRect(22, 28, 4, 2);
            g.generateTexture('skin_19', 32, 32);
        }

        // skin_20: DEUS DA MORTE - Dark hooded figure, no face
        if (!this.textures.exists('skin_20')) {
            g.clear();
            g.fillStyle(0x111111, 1); g.fillRoundedRect(4, 8, 24, 24, 4);
            g.fillStyle(0x0a0a0a, 1); g.fillRoundedRect(2, 2, 28, 18, 10);
            g.fillStyle(0x000000, 1); g.fillRoundedRect(7, 6, 18, 14, 6);
            g.fillStyle(0xff0000, 1); g.fillRect(10, 11, 4, 1); g.fillRect(18, 11, 4, 1);
            g.fillStyle(0x1a1a1a, 1); g.fillRect(8, 18, 2, 12); g.fillRect(22, 18, 2, 12); g.fillRect(14, 20, 2, 10);
            g.fillStyle(0x222222, 1); g.fillRect(2, 4, 3, 3); g.fillRect(26, 6, 2, 4); g.fillRect(4, 8, 2, 2); g.fillRect(26, 10, 3, 2);
            g.generateTexture('skin_20', 32, 32);
        }

        g.destroy();
    }
}
