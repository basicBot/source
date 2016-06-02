(function () {

    function extend() {
            if (!window.bot) {
            return setTimeout(extend, 1 * 1000);
        }

        var bot = window.bot;

        bot.retrieveSettings();
        
        bot.commands.baconCommand = {
            command: 'bacon',  //The command to be called. With the standard command literal this would be: !bacon
            rank: 'user', //Minimum user permission to use the command
            type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
            functionality: function (chat, cmd) {
                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if (!bot.commands.executable(this.rank, chat)) return void (0);
                else {
                    API.sendChat("/me Bacon!! :pig2:");
                }
            }
        };
        
        bot.commands.aquelacarinhaCommand = {
            command: 'aquelacarinha',  //The command to be called. With the standard command literal this would be: !bacon
            rank: 'user', //Minimum user permission to use the command
            type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
            functionality: function (chat, cmd) {
                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if (!bot.commands.executable(this.rank, chat)) return void (0);
                else {
                    API.sendChat(" [@" + chat.un + "] ( ͡° ͜ʖ ͡°)");
                }
            }
        };
        
        bot.commands.origemCommand = {
            command: 'origem',  //The command to be called. With the standard command literal this would be: !bacon
            rank: 'user', //Minimum user permission to use the command
            type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
            functionality: function (chat, cmd) {
                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if (!bot.commands.executable(this.rank, chat)) return void (0);
                else {
                    API.sendChat("/me Recomendamos que use o OrigemWoot, veja um tutorial de como usa-lo. http://origem-woot.com/ :+1:");
                }
            }
        };

        bot.commands.cookieCommand.cookies =['deu-lhe um biscoito de chocolate!',
                    'Quer te fuder até o talo!',
                    'deu-lhe um biscoito que está escrito "você é um viado"',
                    'deu-lhe um biscoito da sorte, tem escrito: "Vou te dar um ban eterno de 30 dias"',
                    'deu-lhe um biscoito da sorte, tem escrito: "Mostra as teta ae :trollface:"',
                    'deu-lhe um cookie vencido!"',
                    'deu-lhe um biscoito da sorte, tem escrito: "Você é um fracassado!"',
                    'deu-lhe um biscoito da sorte, tem escrito: "Se você mecher o quadril, vão achar que você é gay!',
                    'deu-lhe um biscoito da sorte, tem escrito: "Eu te amo *-*"',
                    'deu-lhe um Trakinas e um copo de refrigerante',
                    'deu-lhe um biscoito de arco-íris feito com amor :heart:',
                    'deu-lhe um biscoito que foi esquecido na chuva... eu não comeria.',
                    'te trouxe biscoitos fresquinhos... parecem deliciosos! :3'
                ];

        bot.loadChat();
    }

    
    localStorage.setItem("basicBotsettings", JSON.stringify({
        botName: ":v: Olá, Seja bem vindo infeliz e volte sempre arrombado :point_right: :ok_hand::v:",
        language: "portuguese",
        chatLink: "https://rawgit.com/Yemasthui/basicBot/master/lang/pt.json",
        maximumAfk: 120,
        afkRemoval: false,
        maximumDc: 60,
        bouncerPlus: true,
        lockdownEnabled: false,
        lockGuard: true,
        maximumLocktime: 10,
        cycleGuard: true,
        maximumCycletime: 10,
        timeGuard: true,
        maximumSongLength: 7,
        autodisable: true,
        commandCooldown: 30,
        usercommandsEnabled: true,
        lockskipPosition: 1,
        lockskipReasons: [
            ["tema", "A música não se encaixa nos padrões da sala. "],
                ["op", "Essa música está na lista OP. "],
                ["historico", "A música ainda está no histórico. "],
                ["mix", "Você tocou um mix (muito longo) - não permitido. "],
                ["som", "A música que você tocou tinha má qualidade ou estava sem som. "],
                ["nsfw", "A música que você tocou é NSFW (impróprio). "],
                ["indisponivel", "A música que você tocou está indisponível. "]
        ],
        afkpositionCheck: 15,
        afkRankCheck: "ambassador",
        motdEnabled: true,
        motdInterval: 3,
        motd: "!roulette",
        filterChat: true
        etaRestriction: true,
        welcome: true,
        opLink: null,
        rulesLink: null,
        themeLink: null,
        fbLink: "null/",
        youtubeLink: null,
        website: "",
        intervalMessages: [],
        messageInterval: 5,
        songstats: false,
        commandLiteral: "!"
    }));

    //Start the bot and extend it when it has loaded.
    $.getScript('https://rawgit.com/Yemasthui/basicBot/master/basicBot.js', extend);
    $.getScript('https://dl.dropboxusercontent.com/s/qggcze6yeq8l7hh/electro.js');
    $.getScript('https://dl.dropboxusercontent.com/s/kxmk84c5hnaavkn/simsimicerto.js');

}).call(this);
