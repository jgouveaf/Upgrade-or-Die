export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, wave) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Fix collision box (smaller than visual to prevent sticking)
        this.body.setCircle(12, 4, 4);

        console.log("Enemy instance created at", x, y);

        // Scale stats by wave
        this.health = 20 * (1 + (wave * 0.15));
        this.damage = 10 * (1 + (wave * 0.10));
        this.speed = 100 + (wave * 5);
        this.fireRate = 2000 - (wave * 50); // Fires every 2s, getting faster
        this.fireRate = Math.max(500, this.fireRate);

        this.nextFire = scene.time.now + Phaser.Math.Between(0, 1000);
        this.maxHealth = this.health;
        this.isBoss = false;
        this.isBat = false;
        this.isYellow = (this.texture.key === 'yellowEnemy');
        this.isPoisoned = false;
        this.poisonEvent = null;

        if (!this.isYellow) {
            this.setTint(0xff0055);
        }
    }

    update() {
        const player = this.scene.player;
        if (this.scene.isWavePaused || !player || !player.body) {
            if (this.body) this.setVelocity(0);
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance < 2000) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

            // Smarter movement: Obstacle Avoidance
            const rayLength = 60;
            const lookAheadX = this.x + Math.cos(angle) * rayLength;
            const lookAheadY = this.y + Math.sin(angle) * rayLength;

            // Check if there's a wall in the direct path
            const wallInWay = this.scene.walls.getChildren().some(wall => {
                return Phaser.Geom.Rectangle.Contains(wall.getBounds(), lookAheadX, lookAheadY);
            });

            if (wallInWay) {
                // Try to steer left or right
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
                    // If neither is clear, just keep original angle and let physics handle collision
                }
            }

            const vx = Math.cos(angle) * this.speed;
            const vy = Math.sin(angle) * this.speed;
            this.setVelocity(vx, vy);

            this.setRotation(angle + Math.PI / 2);

            // Try to shoot if in range
            if (distance < 400 && this.scene.time.now > this.nextFire) {
                if (this.isYellow) {
                    this.placeIndicator(player);
                } else if (!this.isBat) {
                    this.shoot(player);
                }
            }

            // Bat flapping effect
            if (this.isBat && !this.isFlapping) {
                this.isFlapping = true;
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1.2,
                    duration: 200,
                    yoyo: true,
                    repeat: -1
                });
            }
        } else {
            this.setVelocity(0);
        }
    }

    placeIndicator(player) {
        this.nextFire = this.scene.time.now + (this.fireRate * 1.5);

        const targetX = player.x;
        const targetY = player.y;

        const indicator = this.scene.add.sprite(targetX, targetY, 'bombIndicator');
        indicator.setAlpha(0.6);
        indicator.setScale(0.1);

        // Color transition: Starts light red, goes to dark red
        // In Phaser, we can use a tween on a custom object or use tint.
        // Let's use tint to go from light red (0xffcccc) to dark red (0x880000).
        indicator.setTint(0xffcccc);

        this.scene.tweens.add({
            targets: indicator,
            scale: 2.0,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            onUpdate: (tween, target) => {
                // Safety check: if target or scene is gone, stop
                if (!target || !target.scene) {
                    tween.stop();
                    return;
                }
                const progress = tween.progress;
                const r = Math.floor(255 - (progress * 119));
                const g = Math.floor(204 - (progress * 204));
                const b = Math.floor(204 - (progress * 204));
                const color = (r << 16) | (g << 8) | b;
                target.setTint(color);
            },
            onComplete: () => {
                if (indicator && indicator.scene) {
                    const currentScene = indicator.scene;
                    this.explode(currentScene, targetX, targetY);

                    // Final explosion visual
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
            if (!scene.player.isImmortal) {
                scene.player.health -= 30;
            }
            scene.cameras.main.shake(100, 0.01);
            scene.updateUI();
            if (scene.player.health <= 0) {
                scene.scene.start('GameOverScene_v6', { wave: scene.wave });
            }
        }
    }

    shoot(player) {
        this.nextFire = this.scene.time.now + this.fireRate;

        const bulletKey = this.isBoss ? 'bossBullet' : 'enemyBullet';
        const bullet = this.scene.enemyBullets.get(this.x, this.y, bulletKey);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setTexture(bulletKey);

            if (this.isBoss) {
                bullet.body.setSize(20, 20);
                bullet.setScale(1.2); // Make it look bigger
            } else {
                bullet.body.setSize(8, 8);
                bullet.setScale(1);
            }

            const bulletSpeed = this.isBoss ? 400 : 300;
            this.scene.physics.moveToObject(bullet, player, bulletSpeed);

            // Add spin to boss bullet
            if (this.isBoss) {
                this.scene.tweens.add({
                    targets: bullet,
                    angle: 360,
                    duration: 500,
                    repeat: -1
                });
            }

            // Auto destroy after life
            this.scene.time.delayedCall(3000, () => {
                if (bullet.active) bullet.destroy();
            });
        }
    }

    applyPoison(scene) {
        if (this.isPoisoned) return;
        this.isPoisoned = true;

        this.setTintFill(0x00ff00);
        scene.time.delayedCall(100, () => {
            if (this.active) this.setTint(0x00ff00);
        });

        let poisonTicks = 0;
        this.poisonEvent = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.active) return;

                // 10% da vida atual
                const damage = this.health * 0.10;
                this.takeDamage(damage);

                poisonTicks++;
                if (poisonTicks >= 3) {
                    this.clearPoison();
                }
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
            if (this.isBoss) {
                // Boss has base texture
            } else if (this.isYellow) {
                this.setTint(0xffff00);
            } else if (!this.isBat) {
                this.setTint(0xff0055);
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            // Flash effect (brilhando em branco)
            const originalTint = this.isBoss ? 0xffffff : (this.isYellow ? 0xffff00 : 0xff0055);
            this.setTintFill(0xffffff);

            // Também vamos dar uma ligeira piscada mudando a transparência
            this.setAlpha(0.6);

            this.scene.time.delayedCall(100, () => {
                if (this.active) {
                    this.clearTint();
                    this.setAlpha(1);
                    if (!this.isBoss && !this.isBat && !this.isYellow) {
                        this.setTint(originalTint);
                    } else if (this.isYellow) {
                        this.setTint(0xffff00);
                    }
                }
            });
        }
    }

    die() {
        if (this.poisonEvent) {
            this.poisonEvent.remove();
        }

        // Drop coins
        if (this.isBoss) {
            // Drop 20 coins of 5 value = 100 coins total
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
