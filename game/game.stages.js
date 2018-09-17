/**
 * # Game stages definition file
 * Copyright(c) 2018 Stefano Balietti <<futur.dorko@gmail.com>>
 * MIT Licensed
 *
 * Stages are defined using the stager API
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(stager, settings) {

     stager
        .next('instructions')
        .repeat('game', settings.REPEAT)
        .next('end')
        .gameover();

    stager.extendStage('game', {
        steps: [ 'v1', 'v2' ]
    });
    
    // Modify the stager to skip one stage.
    stager.skip('instructions');
};
