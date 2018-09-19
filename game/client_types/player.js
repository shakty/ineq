/**
 * # Player type implementation of the game stages
 * Copyright(c) 2018 Stefano Balietti <<futur.dorko@gmail.com>>
 * MIT Licensed
 *
 * Each client type must extend / implement the stages defined in `game.stages`.
 * Upon connection each client is assigned a client type and it is automatically
 * setup with it.
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    stager.setOnInit(function() {

        // Initialize the client.
        var header, frame;
        header = W.generateHeader();
        frame = W.generateFrame();

        // Add widgets.
        // this.visualRound = node.widgets.append('VisualRound', header, {
        //     title: false
        // });
        // this.visualTimer = node.widgets.append('VisualTimer', header);

        this.doneButton = node.widgets.append('DoneButton', header);

        // Additional debug information while developing the game.
        // this.debugInfo = node.widgets.append('DebugInfo', header)
    });

    stager.extendStep('instructions', {
        frame: 'instructions.htm'
    });

    stager.extendStep('v1', {
        donebutton: false,
        frame: 'game.htm',
        cb: function() {
            var header, btnUnfair, btnRedstr;
            var toggleUnfair, toggleRedstr;
            
            header = W.getHeader();
            btnUnfair = document.createElement('button');
            btnUnfair.className = 'btn btn-lg btn-primary';
            btnUnfair.innerHTML = 'Unfair';
            toggleUnfair = false;
            btnUnfair.onclick = function() {
                if (toggleUnfair) {
                    btnUnfair.className = 'btn btn-lg btn-primary';
                    toggleUnfair = false;
                }
                else {
                    btnUnfair.className = 'btn btn-lg btn-danger';
                    toggleUnfair = true;
                }
            };
            header.appendChild(btnUnfair);

            header.appendChild(document.createTextNode(' '));
            
            btnRedstr = document.createElement('button');
            btnRedstr.className = 'btn btn-lg btn-primary';
            btnRedstr.innerHTML = 'Redistribute';
            toggleRedstr = false;
            btnRedstr.onclick = function() {
                if (toggleRedstr) {
                    btnRedstr.className = 'btn btn-lg btn-primary';
                    toggleRedstr = false;
                }
                else {
                    btnRedstr.className = 'btn btn-lg btn-danger';
                    toggleRedstr = true;
                }
            };
            header.appendChild(btnRedstr);
            
            console.log('v1');
        }
    });


    stager.extendStep('v2', {
        donebutton: false,
        frame: 'game.htm',
        cb: function() {
            console.log('v2');
        }
    });
    
    stager.extendStep('end', {
        donebutton: false,
        frame: 'end.htm',
        cb: function() {
            
        }
    });
};
