window.onload = function(){
    // create an instance or copy of the Phaser game framework
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameContainer');
    
    // Instantiate or make game state
    game.state.add('Starship', BasicGame.Game);
    
    // start "Starship" game state (look below)
    game.state.start('Starship');
    
};

var BasicGame = {};

BasicGame.Game = function (game) {
    this.PLAYER_SPEED = 400;//200
    this.BULLET_DELAY = 100;
    this.playerNextBullet = 0;
    this.nextEnemy = 0;
    this.ENEMY_BULLET_DELAY = 1000;
};

BasicGame.Game.prototype = {
    
    /**************************************/
    /*****         Init Method        *****/
    /**************************************/
    init: function () {
        // init or initialization of the starting conditions of the game
        
        // Pause game if the browser loses focus.
        this.stage.disableVisibilityChange = false;

        // Place game in the middle of the browser
        this.scale.pageAlignHorizontally = true;
        
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.nextEnemy = this.time.now + this.rnd.integerInRange(1000, 2000);
        
        this.score = 0;
        this.gameOver = false;

    },
    
    /**************************************/
    /*****        Preload Method      *****/
    /**************************************/
    preload: function () {
		// Preload the game images, sounds, etc first before starting the game
        this.load.spritesheet('player', 'assets/sprites/player.png', 64, 64);
        this.load.image('stars', 'assets/sprites/starBackground.png');
        this.load.image('bullet', 'assets/sprites/bullet.png');
        this.load.spritesheet('enemy', 'assets/sprites/enemy01.png', 32, 32);
        this.load.spritesheet('enemyRed', 'assets/sprites/enemy02.png', 32, 32);
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', 32, 32);
        this.load.audio('laserShot', 'assets/sfx/Laser.Shoot.m4a',
                        'assets/sfx/Laser.Shoot.ogg');
        this.load.audio('explosion', 'assets/sfx/Explosion.m4a',
                        'assets/sfx/Explosion.ogg');
        this.load.audio('music', 'assets/music/Star.Command.John.Rawman.mp3');
	},
    
    /**************************************/
    /*****        Create Method       *****/
    /**************************************/
    create: function () {
        // We instantiate or make our game objects here
        
        this.background = this.add.tileSprite(0, 0, 800, 600, 'stars');
        this.background.autoScroll(0, 100);
        
        /*****      Player Ship Sprite       *****/
        this.player = this.add.sprite(this.world.centerX, 550, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('fly', [0, 1, 2], 30, true);
        this.player.play('fly');
        this.player.health = 3;
        this.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        
        /*****      Player Bullet Group       *****/
        this.bulletGrp = this.add.group();
        this.bulletGrp.enableBody = true;
        this.bulletGrp.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletGrp.createMultiple(10, 'bullet');
        this.bulletGrp.setAll('checkWorldBounds', true);
        this.bulletGrp.setAll('outOfBoundsKill', true);
        this.bulletGrp.setAll('anchor.x', 0.5);
        this.bulletGrp.setAll('anchor.y', 0.5);
        
        /*****      Enemy Ship Group       *****/
        this.enemyGrp = this.add.group();
        this.enemyGrp.enableBody = true;
        this.enemyGrp.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyGrp.createMultiple(10, 'enemy');
        this.enemyGrp.setAll('checkWorldBounds', true);
        this.enemyGrp.setAll('outOfBoundsKill', true);
        this.enemyGrp.setAll('anchor.x', 0.5);
        this.enemyGrp.setAll('anchor.y', 0.5);
        this.enemyGrp.setAll('value', 10, false, false, 0, true);
        this.enemyGrp.setAll('nextBullet', 0, false, false, 0, true);
        this.enemyGrp.forEach(function(enemy){
            enemy.animations.add('fly', [0, 1, 2], 15, true);
            enemy.play('fly');
        }, this);
        
        /*****      Enemy Bullet Group       *****/
        this.enemyBulletGrp = this.add.group();
        this.enemyBulletGrp.enableBody = true;
        this.enemyBulletGrp.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBulletGrp.createMultiple(10, 'bullet');
        this.enemyBulletGrp.setAll('checkWorldBounds', true);
        this.enemyBulletGrp.setAll('outOfBoundsKill', true);
        this.enemyBulletGrp.setAll('anchor.x', 0.5);
        this.enemyBulletGrp.setAll('anchor.y', 0.5);
        
        /*****      Explosion Group       *****/
        this.explosionGrp = this.add.group();
        this.explosionGrp.createMultiple(10, 'explosion');
        this.explosionGrp.setAll('anchor.x', 0.5);
        this.explosionGrp.setAll('anchor.y', 0.5);
        this.explosionGrp.forEach(function(member){
            member.animations.add('bang');
        }, this);
        
        /*****      GUI Player Lives    *****/
        this.livesTxt = this.add.text(35,
                                      24,
                                      "Lives:",
                                      {font:'24px arial', fill:'#856f91'});
        this.livesGrp = this.add.group();
        this.livesGrp.x = this.livesTxt.width+43;
        for(i = 0; i < this.player.health; i++){
            var shipSprite = this.add.sprite(i*40, 24, 'player');
            shipSprite.scale.setTo(0.5);
            this.livesGrp.add(shipSprite);
        };
        
        /*****      GUI Score    *****/
        this.scoreTxt = this.add.text(620,
                                      24,
                                      "Score: "+this.score,
                                      {font:'24px arial', fill:'#856f91'});
        
        /*****      GUI Game Over    *****/
        this.gameOverTxt = this.add.text(this.world.centerX,
                                         this.world.centerY,
                                         "Game Over",
                                         {font:'48px arial', fill:'#856f91'});
        this.gameOverTxt.anchor.setTo(0.5);
        
        /*****      GUI Play Again?    *****/
        this.playAgainTxt = this.add.text(this.world.centerX,
                                          this.world.centerY+this.gameOverTxt.height,
                                          "Play Again?\n Y / N",
                                          {font:'24px arial', fill:'#856f91', align:'center'});
        this.playAgainTxt.anchor.setTo(0.5);
        
        /*****      GUI Group    *****/
        this.endGameTextGrp = this.add.group();
        this.endGameTextGrp.add(this.playAgainTxt);
        this.endGameTextGrp.add(this.gameOverTxt);
        this.endGameTextGrp.alpha = 0;
        
        /*****      Audio Sprites       *****/
        this.shootSFX = this.add.audio('laserShot');
        this.explosionSFX = this.add.audio('explosion');
        this.music = this.add.audio('music');
//        this.music.loopFull(0.25);
        
        /*****      Player Keyboard Input      *****/
        this.arrowKeys = this.input.keyboard.createCursorKeys();
        
        this.keyInput = this.input.keyboard.addKeys({'shoot': Phaser.Keyboard.SPACEBAR,
                                                     'Yes': Phaser.Keyboard.Y,
                                                     'No': Phaser.Keyboard.N});

    },

    /**************************************/
    /*****        Update Method       *****/
    /**************************************/
    update: function () {
        //  This is the game loop.        
        this.checkForInput();
        
        this.physics.arcade.overlap(this.bulletGrp, 
                                    this.enemyGrp,
                                    this.enemyHit,
                                    null,
                                    this);
        this.physics.arcade.overlap(this.player,
                                    this.enemyGrp,
                                    this.playerHit,
                                    null,
                                    this);
        
        this.physics.arcade.overlap(this.player,
                                    this.enemyBulletGrp,
                                    this.playerHit,
                                    null,
                                    this);
        
        this.spawnEnemy();
        this.shootEnemyBullet();

    },
    
    /**************************************/
    /*****        Custom Methods      *****/
    /**************************************/

/*****      Playrt Keyboard Input Check     *****/
    checkForInput: function(){
        
        this.player.body.velocity.setTo(0, 0);
        
        if(!this.gameOver){
            if(this.arrowKeys.left.isDown){
                this.player.body.velocity.x = -this.PLAYER_SPEED;
            }else if(this.arrowKeys.right.isDown){
                this.player.body.velocity.x = this.PLAYER_SPEED;
            };

            if(this.arrowKeys.up.isDown){
                this.player.body.velocity.y = -this.PLAYER_SPEED;
            }else if(this.arrowKeys.down.isDown){
                this.player.body.velocity.y = this.PLAYER_SPEED;
            };

            if(this.keyInput.shoot.isDown){
                this.shootBullet();
            };
        };
        
        if(this.gameOver){
            if(this.keyInput.Yes.isDown){
                this.state.restart();
                this.music.stop();
            };
        };
    },
    
/*****      Shoot Bullets Methods     *****/
    shootBullet: function(){
        if(this.playerNextBullet < this.time.now){
            var bullet = this.bulletGrp.getFirstDead();

            if(!bullet){
                return;
            };

            bullet.reset(this.player.x, this.player.y-32);
            bullet.body.velocity.y = -500;  
            this.shootSFX.play();
            
            this.playerNextBullet = this.time.now + this.BULLET_DELAY;
        };
    },
    
    shootEnemyBullet: function(){
        if(this.player.alive){
            this.enemyGrp.forEachAlive(function(enemy){
                if(enemy.key === 'enemyRed'){
                    if(enemy.nextBullet < this.time.now){
                        var bullet = this.enemyBulletGrp.getFirstDead();
                        if(bullet === null){
                            return;
                        };
                        bullet.reset(enemy.x, enemy.y);
                        this.physics.arcade.moveToObject(bullet, this.player, 500);
                        this.shootSFX.play();
                        enemy.nextBullet = this.time.now + this.ENEMY_BULLET_DELAY;
                    };
                };
            }, this)
        };
    },

/*****      Enemy and Player Hit Methods      *****/
    enemyHit: function(bullet, enemy){
        console.log("Enemy Hit");
        bullet.kill();
        enemy.damage(1);
        this.blownUp(enemy);
        if(!enemy.alive){
            this.score += enemy.value;
            this.scoreTxt.text = "Score: "+this.score;
        };
    },
    
    playerHit: function(player, enemy){
        player.damage(1);
        this.livesGrp.children[this.player.health].kill();
        enemy.kill();
        if(this.player.alive){
            this.blownUp(enemy);
        }else{
            this.blownUp(player);
            this.gameOver = true;
            this.endGame();
        };
    },
    
    blownUp: function(target){
        var pop = this.explosionGrp.getFirstDead();
        if(!pop){
            return;
        }
        
        pop.reset(target.x, target.y);
        pop.play('bang', 15, false, true);
        this.explosionSFX.play();
    },
    
/*****      Add Enemies to the Game Screen     *****/
    spawnEnemy: function(){
        if(this.nextEnemy < this.time.now){
            var enemy = this.enemyGrp.getFirstDead();
            if(!enemy){
                return;
            };
            enemy.reset(this.rnd.integerInRange(20, 780), -10);
            
            var enemyShooter = Math.random();
            
            if(enemyShooter < 0.5){
                enemy.loadTexture('enemyRed');
                enemy.value = 20;
                enemy.health = 2;
            }else{
                enemy.loadTexture('enemy');
                enemy.value = 10;
                enemy.health = 1;
            };
            
            enemy.play('fly');
            
            enemy.body.velocity.y = this.rnd.integerInRange(125, 200);
            
            this.nextEnemy = this.time.now + this.rnd.integerInRange(1000, 2000);
        };
    },
    
/*****      End Game     *****/
    endGame: function(){
        this.add.tween(this.endGameTextGrp).to({alpha: 1},
                                               500,
                                               Phaser.Easing.Linear.None,
                                               true);
    },
    
    
    render:function(){
        // post rendering effects
        // var anchor = new Phaser.Point(this.player.x, this.player.y);
        // this.game.debug.geom(anchor, 'rgba(255, 255, 255, 1)');
//         this.game.debug.body(this.player);
        
//        this.bulletGrp.forEach(function(member){
//           this.game.debug.body(member)
//        }, this);
//        
//        this.enemyGrp.forEach(function(member){
//           this.game.debug.body(member)
//        }, this);
        
    }

};
