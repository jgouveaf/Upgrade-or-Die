export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, wave) {
        super(scene, x, y, 'fireBat');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCircle(12, 4, 4);

        // Escala stats por wave
        this.health = 20 * (1 + (wave * 0.15));
        this.damage = 10 * (1 + (wave * 0.10));
        this.speed = 100 + (wave * 5);
        this.fireRate = Math.max(1500, 2500 - (wave * 80));

        this.nextFire = scene.time.now + Phaser.Math.Between(500, 2000);
        this.maxHealth = this.health;
        this.isBoss = false;
        this.isBat = true;
        this.isFireBat = true;
        this.isYellow = false;
        this.isPoisoned = false;
        this.poisonEvent = null;
        this.isFlapping = false;

        this.setTexture('fireBat');
        this.setScale(1.5);
    }

    update() {
        const player = this.scene.player;
        if (this.scene.isWavePaused || !player || !player.body) {
            this.setVelocity(0);
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance < 2000) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

            // Desvio de obstáculos
            const rayLength = 60;
            const lookAheadX = this.x + Math.cos(angle) * rayLength;
            const lookAheadY = this.y + Math.sin(angle) * rayLength;

            const wallInWay = this.scene.walls.getChildren().some(wall =>
                Phaser.Geom.Rectangle.Contains(wall.getBounds(), lookAheadX, lookAheadY)
            );

            if (wallInWay) {
                const leftAngle = angle - Math.PI / 4;
                const rightAngle = angle + Math.PI / 4;
                const leftClear = !this.scene.walls.getChildren().some(wall => {
                    const lx = this.x + Math.cos(leftAngle) * rayLength;
                    const ly = this.y + Math.sin(leftAngle) * rayLength;
                    return Phaser.Geom.Rectangle.Contains(wall.getBounds(), lx, ly);
                });
                if (leftClear) {
                    angle = leftAngle;
                } else {
                    const rightClear = !this.scene.walls.getChildren().some(wall => {
                        const rx = this.x + Math.cos(rightAngle) * rayLength;
                        const ry = this.y + Math.sin(rightAngle) * rayLength;
                        return Phaser.Geom.Rectangle.Contains(wall.getBounds(), rx, ry);
                    });
                    if (rightClear) angle = rightAngle;
                }
            }

            this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
            this.setRotation(angle + Math.PI / 2);

            // Atira APENAS SE estiver em alcance E o cooldown passou
            if (distance < 400 && this.scene.time.now > this.nextFire) {
                this.shoot(player);
            }
        } else {
            this.setVelocity(0);
        }

        // Animação de asas (só inicia uma vez)
        if (!this.isFlapping) {
            this.isFlapping = true;
            this.scene.tweens.add({
                targets: this,
                scaleY: 1.1,
                scaleX: 1.8,
                duration: 150,
                yoyo: true,
                repeat: -1
            });
        }

        // Partículas de fogo
        if (this.scene.fireParticles && Phaser.Math.Between(0, 10) > 7) {
            this.scene.fireParticles.emitParticleAt(this.x, this.y);
        }
    }

    shoot(player) {
        // Registra próximo tiro ANTES de qualquer retorno
        this.nextFire = this.scene.time.now + this.fireRate;

        // Pega UMA ÚNICA bala do pool
        const bullet = this.scene.enemyBullets.get(this.x, this.y);
        if (!bullet) return;

        // Mata qualquer tween residual desta bala (pool reutiliza objetos)
        this.scene.tweens.killTweensOf(bullet);

        // Configura a bala
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setTexture('fireball_img');
        bullet.clearTint();
        bullet.setScale(1.2);
        bullet.setAlpha(1);
        bullet.setAngle(0);

        if (bullet.body) {
            bullet.body.enable = true;
            bullet.body.setSize(12, 12);
        }

        // Velocidade em direção ao jogador
        this.scene.physics.moveToObject(bullet, player, 220);

        // Animação de rotação da bola de fogo
        this.scene.tweens.add({
            targets: bullet,
            angle: 360,
            duration: 600,
            repeat: -1
        });

        // Auto-destruição após 4 segundos
        this.scene.time.delayedCall(4000, () => {
            if (bullet && bullet.active) {
                this.scene.tweens.killTweensOf(bullet);
                bullet.setActive(false).setVisible(false);
            }
        });
    }

    placeIndicator(player) {
        this.nextFire = this.scene.time.now + (this.fireRate * 1.5);

        const targetX = player.x;
        const targetY = player.y;

        const indicator = this.scene.add.sprite(targetX, targetY, 'bombIndicator');
        indicator.setAlpha(0.6);
        indicator.setScale(0.1);
        indicator.setTint(0xffcccc);

        this.scene.tweens.add({
            targets: indicator,
            scale: 2.0,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            onUpdate: (tween, target) => {
                if (!target || !target.scene) { tween.stop(); return; }
                const progress = tween.progress;
                const r = Math.floor(255 - (progress * 119));
                const g = Math.floor(204 - (progress * 204));
                const b = Math.floor(204 - (progress * 204));
                target.setTint((r << 16) | (g << 8) | b);
            },
            onComplete: () => {
                if (indicator && indicator.scene) {
                    const currentScene = indicator.scene;
                    this.explode(currentScene, targetX, targetY);
                    const explosion = currentScene.add.graphics();
                    explosion.fillStyle(0xff4400, 0.8);
                    explosion.fillCircle(targetX, targetY, 60);
                    currentScene.tweens.add({
                        targets: explosion,
                        alpha: 0,
                        scale: 1.5,
                        duration: 300,
                        onComplete: () => explosion.destroy()
                    });
                    indicator.destroy();
                }
            }
        });
    }

    explode(scene, x, y) {
        if (!scene || !scene.player) return;
        const dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, x, y);
        if (dist < 60) {
            if (!scene.player.isImmortal) scene.player.health -= 30;
            scene.cameras.main.shake(100, 0.01);
            scene.updateUI();
            if (scene.player.health <= 0) {
                scene.scene.start('GameOverScene_v6', { wave: scene.wave });
            }
        }
    }

    applyPoison(scene) {
        if (this.isPoisoned) return;
        this.isPoisoned = true;
        this.setTint(0x00ff00);

        let poisonTicks = 0;
        this.poisonEvent = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.active) return;
                const damage = this.health * 0.10;
                this.takeDamage(damage);
                poisonTicks++;
                if (poisonTicks >= 3) this.clearPoison();
            },
            repeat: 2
        });
    }

    clearPoison() {
        this.isPoisoned = false;
        if (this.poisonEvent) {
            this.poisonEvent.remove();
            this.poisonEvent = null;
        }
        if (this.active) {
            this.clearTint();
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            this.setTintFill(0xffffff);
            this.setAlpha(0.6);
            this.scene.time.delayedCall(100, () => {
                if (this.active) {
                    this.clearTint();
                    this.setAlpha(1);
                }
            });
        }
    }

    die() {
        if (this.poisonEvent) this.poisonEvent.remove();

        if (this.isBoss) {
            for (let i = 0; i < 20; i++) {
                this.scene.spawnCoin(
                    this.x + Phaser.Math.Between(-40, 40),
                    this.y + Phaser.Math.Between(-40, 40)
                );
            }
        } else {
            this.scene.spawnCoin(this.x, this.y);
        }

        this.scene.enemiesKilled++;
        this.destroy();
    }
}
