import { StartScene } from './scenes/StartScene_v3.js';
import { GameScene } from './scenes/GameScene_v3.js';
import { UpgradeScene } from './scenes/UpgradeScene_v3.js';
import { GameOverScene } from './scenes/GameOverScene_v3.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0a0c',
    render: {
        pixelArt: true,
        antialias: false,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    input: {
        mouse: {
            disableContextMenu: true
        }
    },
    scene: [StartScene, GameScene, UpgradeScene, GameOverScene]
};

const game = new Phaser.Game(config);
// Initialized
