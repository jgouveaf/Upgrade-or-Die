import { StartScene } from './scenes/StartScene_v6.js?v=8';
import { GameScene } from './scenes/GameScene_v6.js?v=8';
import { UpgradeScene } from './scenes/UpgradeScene_v6.js?v=8';
import { GameOverScene } from './scenes/GameOverScene_v6.js?v=8';

console.log("Main.js v6 Loaded - Force Refresh");

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
// Initialized v6
window.game = game; // Make accessible globally for debugging
console.log("Game Instance Created");
