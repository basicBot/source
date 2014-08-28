(function () {

    //Define our function responsible for extending the bot.
    function extend() {
        //If the bot hasn't been loaded properly, try again in 1 second(s).
        if (!window.bot) {
            return setTimeout(extend, 1 * 1000);
        }

        //Precaution to make sure it is assigned properly.
        var bot = window.bot;

        /*
        Extend the bot here, either by calling another function or here directly.
        Model code for a bot command:

        bot.commands.commandCommand = {
            command: 'cmd',
                rank: 'user/bouncer/mod/manager',
                type: 'startsWith/exact',
                functionality: function(chat, cmd){
                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if( !esBot.commands.executable(this.rank, chat) ) return void (0);
                else{
                    //Commands functionality goes here.
                }
            }
        }

        */

        bot.commands.baconCommand = {
            command: 'bacon',  //The command to be called. With the standard command literal this would be: !bacon
            rank: 'user', //Minimum user permission to use the command
            type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
            functionality: function(chat, cmd){
                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if( !esBot.commands.executable(this.rank, chat) ) return void (0);
                else{
                    API.sendChat("/me Bacon!!!");
                }
            }
        }

    }

    //Start the bot and extend it when it has loaded.
    $.getScript('https://rawgit.com/***REMOVED***/basicBot/development/basicBot.js');

}).call(this);