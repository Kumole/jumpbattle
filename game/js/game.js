// Johannes Grangrund
// 001051595

let game
const playerOptions = {
    gravity: 800,
    speed: 300,
    jump: 550
}

const p1 = {
    ...playerOptions
}

const p2 = {
    ...playerOptions
}

const itemOptions = {
    gravity: 250,
}

const spriteConfig = {
    platform: {
        scaleX: 0.5,
        scaleY: 1
    },
}

let winner = 'Player X';

let player1Score = 0
let player2Score = 0

const Scoreboard = {
    scores: [],

    addScore: function(winner, winnerScore, loserScore, timestamp) {
        this.scores.push({winner, winnerScore, loserScore, timestamp});

        // Sort the array in descending order based on the winner's score
        this.scores.sort((a, b) => b.winnerScore - a.winnerScore);


        if (this.scores.length > 10) {
            this.scores.length = 10;
        }
    },

    getScores: function() {
        return this.scores;
    }
};


window.onload = function () {
    let gameConfig = {
        type: Phaser.AUTO,
        parent: 'phaser-game',
        backgroundColor: '#2C2C2C',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1000,
            height: 1000
        },
        pixelArt: false,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: [characterCreation, playGame, gameOver]
    }
    game = new Phaser.Game(gameConfig)
    window.focus();

}


class characterCreation extends Phaser.Scene {
    constructor() {
        super({ key: 'characterCreation' });
    }

    preload() {
        
    }

    create() {

        class Menu {
            constructor(scene, x, y, options) {
                this.scene = scene;
                this.x = x;
                this.y = y;
                this.options = options;
        
                this.createMenu();
            }
        
            createMenu() {
                // Label
                this.labelText = this.scene.add.text(this.x, this.y, this.options.label + ": ", { fontSize: '24px', fill: '#fff' });
            
                // Decrease button
                this.decreaseButton = this.scene.add.text(this.x + 100, this.y, '-', { fontSize: '24px', fill: '#0f0' })
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.options.value -= this.options.increment;
                        if (this.labelText.text === 'Speed: ') {
                            p1.speed = this.options.value;
                            p2.speed = this.options.value;
                        } else if (this.labelText.text === 'Jump: ') {
                            p1.jump = this.options.value;
                            p2.jump = this.options.value;
                        }
                        this.valueText.setText(this.options.value);
                    });
            
                // Value text
                this.valueText = this.scene.add.text(this.x + 135, this.y, this.options.value, { fontSize: '24px', fill: '#fff' });
            
                // Increase button
                this.increaseButton = this.scene.add.text(this.x + 200, this.y, '+', { fontSize: '24px', fill: '#0f0' })
                    .setInteractive()
                    .on('pointerdown', () => {
                        this.options.value += this.options.increment;
                        if (this.labelText.text === 'Speed: ') {
                            p1.speed = this.options.value;
                            p2.speed = this.options.value;
                        } else if (this.labelText.text === 'Jump: ') {
                            p1.jump = this.options.value;
                            p2.jump = this.options.value;
                        }
                        this.valueText.setText(this.options.value);
                    });
            }
        }

        // Add UI elements for customization
        this.add.text(game.config.width / 2 - 250, 180,
            'Customize starting values', { fontSize: '32px', fill: '#fff' });


        new Menu(this, game.config.width / 2 - 100, 250, {
            label: 'Speed',
            value: p1.speed,
            increment: 10,
        });

        new Menu(this, game.config.width / 2 - 100, 300, {
            label: 'Jump',
            value: p1.jump,
            increment: 10,
        });


        // Start game button
        const startButton = this.add.text(game.config.width / 2 - 80, 400,
            'Start Game', { fontSize: '24px', fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.startGame());

        // Use 'Enter' key to start the game
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                this.startGame();
            }
        });

        this.add.text(50, 600, 'Instructions', { fontSize: '32px', fill: '#fff' });
        this.add.text(50, 650, 'You are competing against the other player. \nShoot bombs at platforms above you to destroy them', { fontSize: '24px', fill: '#fff' });
        this.add.text(50, 700, 'Collect stars to increase speed or jump height', { fontSize: '24px', fill: '#fff' });

        this.add.text(100, 850, 'Player 1 Controls', { fontSize: '24px', fill: '#fff' });
        this.add.text(100, 875, 'Move: WASD', { fontSize: '24px', fill: '#fff' });
        this.add.text(100, 900, 'Shoot: F', { fontSize: '24px', fill: '#fff' });

        this.add.text(game.config.width - 400, 850, 'Player 2 Controls', { fontSize: '24px', fill: '#fff' });
        this.add.text(game.config.width - 400, 875, 'Move: Arrow Keys', { fontSize: '24px', fill: '#fff' });
        this.add.text(game.config.width - 400, 900, 'Shoot: CTRL', { fontSize: '24px', fill: '#fff' });

    }

    startGame() {
        this.scene.start('playGame');
    }
} 

class playGame extends Phaser.Scene {

    constructor() {
        super('playGame')
        this.p1Score = 0
        this.p2Score = 0

        this.p1CanShoot = true
        this.p2CanShoot = true
    }

    preload() {
        this.load.image('platform', 'assets/platform.png')
        
        this.load.spritesheet('player1', 'assets/player1.png', {
            frameWidth: 32,
            frameHeight: 48
        })
        this.load.spritesheet('player2', 'assets/player2.png', {
            frameWidth: 32,
            frameHeight: 48
        })
        this.load.image('star', 'assets/star.png')
        this.load.image('star_jump', 'assets/jumpstar.png')
        this.load.image('star_speed', 'assets/speedstar.png')

        this.load.image('sky', 'assets/sky.png')

        this.load.image('bomb', 'assets/bomb.png')

        /*
            Retrieved from https://creatorassets.com/a/8-bit-jump-sound-effects 
        */
        this.load.audio('jump', 'assets/sounds/jump.mp3'); 
        this.load.audio('jump2', 'assets/sounds/jump2.mp3');


        /*
            Music used free under Creative Commons License
            Made by Patrick de Arteaga
            https://patrickdearteaga.com 
            Song name: "Humble Match"
        */
        this.load.audio('music', 'assets/sounds/music.ogg');

    }

    create() {
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: true
        })

        const { width, height } = this.sys.game.config;

        this.sound.stopAll();
        this.backgroundMusic = this.sound.add('music', { 
            loop: true,
            volume: 0.2
        });
        this.backgroundMusic.play();

        this.add.image(0, 0, 'sky').setDisplaySize(width, height).setOrigin(0, 0);
        for (let i = 0; i < 15; i++) {
            this.groundGroup.create(
                Phaser.Math.Between(0, game.config.width),
                Phaser.Math.Between(0, game.config.height / 2),
                'platform'
            ).setScale(spriteConfig.platform.scaleX, spriteConfig.platform.scaleY)
        }

        // Player 1
        this.player1 = this.physics.add.sprite(100, game.config.height / 2, 'player1')
        this.player1.body.gravity.y = p1.gravity
        this.physics.add.collider(this.player1, this.groundGroup)
        // Spawn platform
        this.groundGroup.create(100, game.config.height / 2 + 55,'platform').setScale(spriteConfig.platform.scaleX, spriteConfig.platform.scaleY)


        // Player 2
        this.player2 = this.physics.add.sprite(game.config.width - 100, game.config.height / 2, 'player2')
        this.player2.body.gravity.y = p2.gravity
        this.physics.add.collider(this.player2, this.groundGroup)
        // Spawn platform
        this.groundGroup.create(game.config.width - 100, game.config.height / 2 + 55,'platform').setScale(spriteConfig.platform.scaleX, spriteConfig.platform.scaleY)

        this.starsGroup = this.physics.add.group({})
        this.physics.add.collider(this.starsGroup, this.groundGroup)


        this.physics.add.overlap(this.player1, this.starsGroup, this.collectStar, null, this)
        this.physics.add.overlap(this.player2, this.starsGroup, this.collectStar, null, this)

        // P1 UI
        this.add.text(20, 20, 'Player 1: ', {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);
        this.add.image(210, 35, 'star').setDepth(1); 
        this.p1ScoreText = this.add.text(225, 22, '0', {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);
        this.p1SpeedText = this.add.text(20, 50, 'Speed: ' + p1.speed, {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);
        this.p1JumpText = this.add.text(20, 80, 'Jump: ' + p1.jump, {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);

        // P2 UI
        this.add.text(game.config.width - 200, 20, 'Player 2: ', {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);
        this.add.image(game.config.width - 215, 35, 'star').setDepth(1);
        this.p2ScoreText = this.add.text(game.config.width - 250, 22, '0', {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);
        this.p2SpeedText = this.add.text(game.config.width - 200, 50, 'Speed: ' + p2.speed, {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);
        this.p2JumpText = this.add.text(game.config.width - 200, 80, 'Jump: ' + p2.jump, {
            fontSize: '32px',
            fill: '#fff'
        }).setDepth(1);


        this.addImage = this.add.image(30, game.config.height - 35, 'bomb').setDepth(1).setScale(2);
        this.add.text(50, game.config.height - 50, 'F', {
            fontSize: '32px',
            fill: '#000'
        }).setDepth(1);
        
        this.addImage = this.add.image(game.config.width - 30, game.config.height - 35, 'bomb').setDepth(1).setScale(2);
        this.add.text(game.config.width - 130, game.config.height - 50, 'CTRL', {
                fontSize: '32px',
                fill: '#000'
        }).setDepth(1);



        this.triggerTimer = this.time.addEvent({
            callback: this.addGround,
            callbackScope: this,
            delay: 1600,
            loop: true
        })

        this.ARROW_KEYS = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL)
        }

        this.WASD = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        }

        // Player 1 animations
        this.anims.create({
            key: 'player1_left',
            frames: this.anims.generateFrameNumbers('player1', {
                start: 0,
                end: 3
            }),
            frameRate: 10,
            repeat: -1

        })

        this.anims.create({
            key: 'player1_turn',
            frames: [{
                key: 'player1',
                frame: 4
            }],
            frameRate: 10

        })

        this.anims.create({
            key: 'player1_right',
            frames: this.anims.generateFrameNumbers('player1', {
                start: 5,
                end: 9
            }),
            frameRate: 10,
            repeat: -1

        })

        // Player 2 animations
        this.anims.create({
            key: 'player2_left',
            frames: this.anims.generateFrameNumbers('player2', {
                start: 0,
                end: 3
            }),
            frameRate: 10,
            repeat: -1

        })

        this.anims.create({
            key: 'player2_turn',
            frames: [{
                key: 'player2',
                frame: 4
            }],
            frameRate: 10

        })

        this.anims.create({
            key: 'player2_right',
            frames: this.anims.generateFrameNumbers('player2', {
                start: 5,
                end: 9
            }),
            frameRate: 10,
            repeat: -1

        })


        // Sound
        this.jumpSound = this.sound.add('jump');
        this.jump2Sound = this.sound.add('jump2');


    }

    addGround() {
        console.log("Adding ground");

        // Randomly spawn 1 or 2 platforms
        const numberOfPlatforms = Phaser.Math.Between(1, 2);

        for (let i = 0; i < numberOfPlatforms; i++) {
            this.groundGroup.create(
                Phaser.Math.Between(0, game.config.width),
                0,
                'platform'
            ).setScale(spriteConfig.platform.scaleX, spriteConfig.platform.scaleY);
        }
        this.groundGroup.setVelocityY(playerOptions.speed / 4);
    
        if (Phaser.Math.Between(0, 1)) { // 50% chance of spawning star or not
            let star = null;
            if (Phaser.Math.Between(0, 1)) { // 50% chance of spawning speed star
                star = this.starsGroup.create(
                    Phaser.Math.Between(0, game.config.width),
                    0,
                    'star_speed'
                );
            } else { // 50% chance of spawning jump star
                star = this.starsGroup.create(
                    Phaser.Math.Between(0, game.config.width),
                    0,
                    'star_jump'
                );
            }
            star.setVelocityY(itemOptions.gravity); 
        }
    }


    collectStar(player, star) {
        star.disableBody(true, true)
        if (player === this.player1) {
            this.p1Score += 1
            this.p1ScoreText.setText(this.p1Score)
        } else if (player === this.player2) {
            this.p2Score += 1
            this.p2ScoreText.setText(this.p2Score)
        }
        if (star.texture.key === 'star_speed') { // Increases player speed if speed star is collected
            if (player === this.player1) {
                p1.speed += 5
                this.p1SpeedText.setText('Speed: ' + p1.speed)
            } else if (player === this.player2) {
                p2.speed += 5
                this.p2SpeedText.setText('Speed: ' + p2.speed)
            }

        } else if (star.texture.key === 'star_jump') { // Increases player jump force if jump star is collected
            if (player === this.player1) {
                p1.jump += 5
                this.p1JumpText.setText('Jump: ' + p1.jump)
            } else if (player === this.player2) {
                p2.jump += 5
                this.p2JumpText.setText('Jump: ' + p2.jump)
            }
        }
    }

    shootProjectile(origin) {
        let projectile;
        if (origin === 'player1' && this.p1CanShoot) {
            projectile = this.physics.add.sprite(this.player1.x, this.player1.y, 'bomb');
            this.p1CanShoot = false
            setTimeout(() => {
                this.p1CanShoot = true
            }, 1000)
        
        } else if (origin === 'player2' && this.p2CanShoot) {
            projectile = this.physics.add.sprite(this.player2.x, this.player2.y, 'bomb');
            this.p2CanShoot = false
            setTimeout(() => {
                this.p2CanShoot = true
            }, 1000)

        } else {
            return
        }
        projectile.setVelocityY(-600)
        this.physics.add.collider(projectile, this.groundGroup, function(projectile, ground) {
            projectile.destroy(); 
            ground.destroy(); 

            this.starsGroup.children.iterate(function(star) {
                star.setVelocityY(itemOptions.gravity);
            });
        }, null, this)
        
    }




    update() {

        // Player 1 movement
        if (this.WASD.left.isDown) {
            this.player1.body.velocity.x = -p1.speed
            this.player1.anims.play('player1_left', true)
        }
        else if (this.WASD.right.isDown) {
            this.player1.body.velocity.x = p1.speed
            this.player1.anims.play('player1_right', true)
        }
        else {
            this.player1.body.velocity.x = 0
            this.player1.anims.play('player1_turn', true)
        }

        if (this.WASD.up.isDown && this.player1.body.touching.down) {
            this.player1.body.velocity.y = -p1.jump
            this.jumpSound.play();
        }

        if (Phaser.Input.Keyboard.JustDown(this.WASD.shoot)) {
            this.shootProjectile('player1');
        }

        // Player 2 movement
        if (this.ARROW_KEYS.left.isDown) {
            this.player2.body.velocity.x = -p2.speed
            this.player2.anims.play('player2_left', true)
        }
        else if (this.ARROW_KEYS.right.isDown) {
            this.player2.body.velocity.x = p2.speed
            this.player2.anims.play('player2_right', true)
        }
        else {
            this.player2.body.velocity.x = 0
            this.player2.anims.play('player2_turn', true)
        }

        if (this.ARROW_KEYS.up.isDown && this.player2.body.touching.down) {
            this.player2.body.velocity.y = -p2.jump
            this.jump2Sound.play();
        }

        if (Phaser.Input.Keyboard.JustDown(this.ARROW_KEYS.shoot)) {
            this.shootProjectile('player2');
        }

        // Game over
        if (this.player1.y > game.config.height || this.player1.y < 0) {
            player1Score = this.p1Score
            player2Score = this.p2Score

            this.p1ScoreText.setText('0')
            this.p2ScoreText.setText('0')
            Object.assign(p1, playerOptions);
            Object.assign(p2, playerOptions);
            this.p1SpeedText.setText('Speed: ' + playerOptions.speed)
            this.p1JumpText.setText('Jump: ' + playerOptions.jump)
            this.p2SpeedText.setText('Speed: ' + playerOptions.speed)
            this.p2JumpText.setText('Jump: ' + playerOptions.jump)

            winner = 'Player 2';
            
            this.scene.start('gameOver')

        }
        if (this.player2.y > game.config.height || this.player2.y < 0) {
            player1Score = this.p1Score
            player2Score = this.p2Score

            this.p1ScoreText.setText('0')
            this.p2ScoreText.setText('0')
            Object.assign(p1, playerOptions);
            Object.assign(p2, playerOptions);
            this.p1SpeedText.setText('Speed: ' + playerOptions.speed)
            this.p1JumpText.setText('Jump: ' + playerOptions.jump)
            this.p2SpeedText.setText('Speed: ' + playerOptions.speed)
            this.p2JumpText.setText('Jump: ' + playerOptions.jump)

            winner = 'Player 1';

            this.scene.start('gameOver')
        }

    }
}

class gameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'gameOver' });
    }

    create() {

        const timestamp = new Date().toLocaleString();
        if (player1Score > player2Score) {
            Scoreboard.addScore('Player 1', player1Score, player2Score, timestamp);
            this.add.text(100, 150, 'Player 1 Wins!', { fontSize: '24px', fill: '#fff' });
        } else if (player2Score > player1Score) {
            Scoreboard.addScore('Player 2', player2Score, player1Score, timestamp);
            this.add.text(100, 150, 'Player 2 Wins!', { fontSize: '24px', fill: '#fff' });
        } else {
            Scoreboard.addScore('Tie', player1Score, player2Score, timestamp);
            this.add.text(100, 150, 'It\'s a tie!', { fontSize: '24px', fill: '#fff' });
        }

        this.add.text(100, 100, 'Game Over', { fontSize: '32px', fill: '#fff' });


        this.add.text(100, 200, 'Player 1 Score: ' + game.scene.scenes[1].p1Score, { fontSize: '24px', fill: '#fff' });
        this.add.text(100, 225, 'Player 2 Score: ' + game.scene.scenes[1].p2Score, { fontSize: '24px', fill: '#fff' });


        this.add.text(100, 400, 'Scoreboard', { fontSize: '24px', fill: '#fff' });
        const highScores = Scoreboard.getScores();

        highScores.forEach((score, index) => {
            this.add.text(100, 450 + (index * 25), `${score.winner}: ${score.winnerScore} - ${score.loserScore}        ${score.timestamp}`, { fontSize: '24px', fill: '#fff' });
        });


        // Restart game button
        const restartButton = this.add.text(100, 300, 'Restart Game', { fontSize: '24px', fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.restartGame());

        // Add event listener for 'keydown' event
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                this.restartGame();
            }
        });
    }

    restartGame() {
        this.scene.start('characterCreation');
    }
}