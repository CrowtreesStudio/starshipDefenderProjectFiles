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
};

BasicGame.Game.prototype = {
    
    init: function () {
        // init or initialization of the starting conditions of the game
        
        // Pause game if the browser loses focus.
        this.stage.disableVisibilityChange = false;

        // Place game in the middle of the browser
        this.scale.pageAlignHorizontally = true;

    },
    
    preload: function () {
		// Preload the game images, sounds, etc first before starting the game
        
	},
    
    
    create: function () {
        // We instantiate or make our game objects here

    },

    update: function () {
        //  This is the game loop.

    },
    
    render:function(){
        // post rendering effects
        
    }

};
