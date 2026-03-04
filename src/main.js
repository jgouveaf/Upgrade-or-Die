import { StartScene } from './scenes/StartScene_v4.js';
import { GameScene } from './scenes/GameScene_v4.js';
import { UpgradeScene } from './scenes/UpgradeScene_v4.js';
import { GameOverScene } from './scenes/GameOverScene_v4.js';

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
