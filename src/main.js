import { StartScene } from './scenes/StartScene.js?v=2';
import { GameScene } from './scenes/GameScene.js?v=2';
import { UpgradeScene } from './scenes/UpgradeScene.js?v=2';
import { GameOverScene } from './scenes/GameOverScene.js?v=2';

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
