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
    this.PLAYER_SPEED = 200;
    this.BULLET_DELAY = 100;
    this.playerNextBullet = 0;
    this.nextEnemy = 0;
};

BasicGame.Game.prototype = {
    
    init: function () {
        // init or initialization of the starting conditions of the game
        
        // Pause game if the browser loses focus.
        this.stage.disableVisibilityChange = false;

        // Place game in the middle of the browser
        this.scale.pageAlignHorizontally = true;
        
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.nextEnemy = this.time.now + this.rnd.integerInRange(1000, 2000);

    },
    
    preload: function () {
		// Preload the game images, sounds, etc first before starting the game
        this.load.spritesheet('player', 'assets/sprites/player.png', 64, 64);
        this.load.image('stars', 'assets/sprites/starBackground.png');
        this.load.image('bullet', 'assets/sprites/bullet.png');
        this.load.spritesheet('enemy', 'assets/sprites/enemy01.png', 32, 32);
        this.load.spritesheet('explosion', 'assets/sprites/explosion.png', 32, 32);
	},
    
    
    create: function () {
        // We instantiate or make our game objects here
        
        this.background = this.add.tileSprite(0, 0, 800, 600, 'stars');
        this.background.autoScroll(0, 100);
        
        this.player = this.add.sprite(this.world.centerX, 550, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('fly', [0, 1, 2], 30, true);
//        this.player.play('fly');
        this.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        
        this.bulletGrp = this.add.group();
        this.bulletGrp.enableBody = true;
        this.bulletGrp.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletGrp.createMultiple(10, 'bullet');
        this.bulletGrp.setAll('checkWorldBounds', true);
        this.bulletGrp.setAll('outOfBoundsKill', true);
        this.bulletGrp.setAll('anchor.x', 0.5);
        this.bulletGrp.setAll('anchor.y', 0.5);
        
        this.enemyGrp = this.add.group();
        this.enemyGrp.enableBody = true;
        this.enemyGrp.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyGrp.createMultiple(10, 'enemy');
        this.enemyGrp.setAll('checkWorldBounds', true);
        this.enemyGrp.setAll('outOfBoundsKill', true);
        this.enemyGrp.setAll('anchor.x', 0.5);
        this.enemyGrp.setAll('anchor.y', 0.5);
        this.enemyGrp.forEach(function(enemy){
            enemy.animations.add('fly', [0, 1, 2], 15, true);
            enemy.play('fly');
        }, this);
        
        this.explosionGrp = this.add.group();
        this.explosionGrp.createMultiple(10, 'explosion');
        this.explosionGrp.setAll('anchor.x', 0.5);
        this.explosionGrp.setAll('anchor.y', 0.5);
        this.explosionGrp.forEach(function(member){
            member.animations.add('bang');
        }, this);
    
        
        this.arrowKeys = this.input.keyboard.createCursorKeys();
        
        this.keyInput = this.input.keyboard.addKeys({'shoot': Phaser.Keyboard.SPACEBAR});

    },

    update: function () {
        //  This is the game loop.        
        this.checkForInput();
        
        this.physics.arcade.overlap(this.bulletGrp, 
                                    this.enemyGrp,
                                    this.enemyHit,
                                    null,
                                    this);
        this.spawnEnemy();

    },
    
    checkForInput: function(){
        
        this.player.body.velocity.setTo(0, 0);
        
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
    },
    
    shootBullet: function(){
        if(this.playerNextBullet < this.time.now){
            var bullet = this.bulletGrp.getFirstExists(false);

            if(!bullet){
                return;
            };

            bullet.reset(this.player.x, this.player.y-32);
            bullet.body.velocity.y = -500;  
            
            this.playerNextBullet = this.time.now + this.BULLET_DELAY;
        };
    },
    
    enemyHit: function(bullet, enemy){
        console.log("Enemy Hit");
        bullet.kill();
        enemy.kill();
        this.blownUp(enemy);
    },
    
    blownUp: function(target){
        var pop = this.explosionGrp.getFirstExists(false);
        if(!pop){
            return;
        }
        
        pop.reset(target.x, target.y);
        pop.play('bang', 15, false, true);
    },
    
    spawnEnemy: function(){
        if(this.nextEnemy < this.time.now){
            var enemy = this.enemyGrp.getFirstExists(false);
            if(!enemy){
                return;
            };
            enemy.reset(this.rnd.integerInRange(20, 780), -16);
            enemy.body.velocity.y = this.rnd.integerInRange(125, 200);
            
            this.nextEnemy = this.time.now + this.rnd.integerInRange(1000, 2000);
        };
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
