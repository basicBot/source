/**

 Copyright © 2014-2018 jungleBot

 Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.

 */

 (function() {

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem('jungleBotRoom'));
        window.location = 'https://plug.dj' + room.name;
    };*/

    API.getWaitListPosition = function(id) {
        if (typeof id === 'undefined' || id === null) {
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for (var i = 0; i < wl.length; i++) {
            if (wl[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    var kill = function() {
        clearInterval(jungleBot.room.autodisableInterval);
        clearInterval(jungleBot.room.afkInterval);
        jungleBot.status = false;
    };

    // This socket server is used solely for statistical and troubleshooting purposes.
    // This server may not always be up, but will be used to get live data at any given time.

    /*
    var socket = function() {
        function loadSocket() {
            SockJS.prototype.msg = function(a) {
                this.send(JSON.stringify(a))
            };
            sock = new SockJS('https://benzi.io:4964/socket');
            sock.onopen = function() {
                console.log('Connected to socket!');
                sendToSocket();
            };
            sock.onclose = function() {
                console.log('Disconnected from socket, reconnecting every minute ..');
                var reconnect = setTimeout(function() {
                    loadSocket()
                }, 60 * 1000);
            };
            sock.onmessage = function(broadcast) {
                var rawBroadcast = broadcast.data;
                var broadcastMessage = rawBroadcast.replace(/["\\]+/g, '');
                API.chatLog(broadcastMessage);
                console.log(broadcastMessage);
            };
        }
        if (typeof SockJS == 'undefined') {
            $.getScript('https://cdn.jsdelivr.net/sockjs/1.0.3/sockjs.min.js', loadSocket);
        } else loadSocket();
    }

    var sendToSocket = function() {
        var jungleBotSettings = jungleBot.settings;
        var jungleBotRoom = jungleBot.room;
        var jungleBotInfo = {
            time: Date.now(),
            version: jungleBot.version
        };
        var data = {
            users: API.getUsers(),
            userinfo: API.getUser(),
            room: location.pathname,
            jungleBotSettings: jungleBotSettings,
            jungleBotRoom: jungleBotRoom,
            jungleBotInfo: jungleBotInfo
        };
        return sock.msg(data);
    };
    */

    var storeToStorage = function() {
        localStorage.setItem('jungleBotsettings', JSON.stringify(jungleBot.settings));
        localStorage.setItem('jungleBotRoom', JSON.stringify(jungleBot.room));
        var jungleBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: jungleBot.version
        };
        localStorage.setItem('jungleBotStorageInfo', JSON.stringify(jungleBotStorageInfo));
    };

    var subChat = function(chat, obj) {
        if (typeof chat === 'undefined') {
            API.chatLog('There is a chat text missing.');
            console.log('There is a chat text missing.');
            return '[Error] No text message found.';

            // TODO: Get missing chat messages from source.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function(cb) {
        if (!cb) cb = function() {};
        $.get('https://rawgit.com/HarryMcKenzie/source/master/lang/langIndex.json', function(json) {
            var link = jungleBot.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[jungleBot.settings.language.toLowerCase()];
                if (jungleBot.settings.chatLink !== jungleBot.chatLink) {
                    link = jungleBot.settings.chatLink;
                } else {
                    if (typeof link === 'undefined') {
                        link = jungleBot.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        jungleBot.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(jungleBot.chatLink, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        jungleBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem('jungleBotsettings'));
        if (settings !== null) {
            for (var prop in settings) {
                jungleBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem('jungleBotStorageInfo');
        if (info === null) API.chatLog(jungleBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem('jungleBotsettings'));
            var room = JSON.parse(localStorage.getItem('jungleBotRoom'));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(jungleBot.chat.retrievingdata);
                for (var prop in settings) {
                    jungleBot.settings[prop] = settings[prop];
                }
                jungleBot.room.users = room.users;
                jungleBot.room.afkList = room.afkList;
                jungleBot.room.historyList = room.historyList;
                jungleBot.room.mutedUsers = room.mutedUsers;
                //jungleBot.room.autoskip = room.autoskip;
                jungleBot.room.roomstats = room.roomstats;
                jungleBot.room.messages = room.messages;
                jungleBot.room.queue = room.queue;
                jungleBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(jungleBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var info = _.find(require.s.contexts._.defined, (m) => m && m.attributes && 'hostID' in m.attributes).get('long_description');
        var ref_bot = '@jungleBot=';
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(' ') < link.indexOf('\n')) ind_space = link.indexOf(' ');
            else ind_space = link.indexOf('\n');
            link = link.substring(0, ind_space);
            $.get(link, function(json) {
                if (json !== null && typeof json !== 'undefined') {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        jungleBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function(a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            } else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
        return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = 'Yemasthui';
    var botMaintainer = 'Benzi';
    var botCreatorIDs = [3851534, 4105209, 3941421, 37218461];

    var jungleBot = {
        version: '2.12.2',
        status: false,
        name: 'jungleBot',
        loggedInID: null,
        scriptLink: 'https://rawgit.com/HarryMcKenzie/source/master/jungleBot.js',
        cmdLink: 'http://git.io/245Ppg',
        chatLink: 'https://rawgit.com/HarryMcKenzie/source/master/lang/en.json',
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
        botName: 'JungleBot',
  			language: 'english',
  			chatLink: 'https://rawgit.com/HarryMcKenzie/source/master/lang/en.json',
  			scriptLink: 'https://rawgit.com/HarryMcKenzie/source/master/jungleBot.js',
  			roomLock: false, // Requires an extension to re-load the script
  			startupCap: 1, // 1-200
  			startupVolume: 0, // 0-100
  			startupEmoji: false, // true or false
  			autowoot: false,
  			autoskip: true,
  			smartSkip: true,
  			cmdDeletion: true,
  			maximumAfk: 180,
  			afkRemoval: true,
  			maximumDc: 60,
  			bouncerPlus: false,
  			blacklistEnabled: true,
  			lockdownEnabled: false,
  			lockGuard: false,
  			maximumLocktime: 10,
  			cycleGuard: true,
  			maximumCycletime: 10,
  			voteSkip: false,
  			voteSkipLimit: 69,
  			historySkip: false,
  			timeGuard: true,
  			strictTimeGuard: true,
  			maximumSongLength: 10,
  			autodisable: false,
  			commandCooldown: 30,
  			usercommandsEnabled: true,
  			thorCommand: false,
  			thorCooldown: 500,
  			skipPosition: 0,
  			skipReasons: [
  				['theme', 'This song does not fit the room theme. '],
  				['op', 'This song is on the OP list. '],
  				['history', 'This song is in the history. '],
  				['mix', 'You played a mix, which is against the rules. '],
  				['sound', 'The song you played had bad sound quality or no sound. '],
  				['nsfw', 'The song you played was NSFW (image or sound). '],
  				['unavailable', 'The song you played was not available for some users. ']
  				['staff', 'a Staff member didn´t enjoy the song and abused their powers for everyone´s sake. ']
  			],
  			afkpositionCheck: 50,
  			afkRankCheck: 'user',
  			motdEnabled: false,
  			motdInterval: 15,
  			motd: 'Allo',
  			filterChat: false,
  			etaRestriction: true,
  			welcome: false,
  			opLink: null,
  			rulesLink: 'http://bit.ly/xqcs-jungle',
  			themeLink: null,
  			fbLink: null,
  			youtubeLink: 'http://youtube.com/xqcow',
  			website: 'http://twitch.tv/xqcow',
  			intervalMessages: ["The RCS extension is an enhancement for plug.dj. Install it so you can see our custom channel theme! https://rcs.radiant.dj", "Connect with xQc: Stream: http://twitch.tv/xqcow Twitter: https://twitter.com/xqc YouTube: http://yoube.com/xQcOW Discord: http://discord.gg/xqcow (you don't have to be a sub)", "FAQ for new users on the channel: http://bit.ly/jungle-dj-help", "A list of commands for the bot can be found here: https://git.io/fN5eb#bot-commands"],
  			messageInterval: 11,
  			songstats: false,
  			commandLiteral: '!',
  			blacklists: {
  				BANNED: 'https://rawgit.com/HarryMcKenzie/source/master/blacklists/BANNEDlist.json'
  						}
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function() {
                if (jungleBot.status && jungleBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function() {}, 1),
            tgSkip: null,
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function() {
                    jungleBot.room.roulette.rouletteStatus = true;
                    jungleBot.room.roulette.countdown = setTimeout(function() {
                        jungleBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(jungleBot.chat.isopen);
                },
                endRoulette: function() {
                    jungleBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * jungleBot.room.roulette.participants.length);
                    var winner = jungleBot.room.roulette.participants[ind];
                    jungleBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = jungleBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(jungleBot.chat.winnerpicked, {
                        name: name,
                        position: pos
                    }));
                    setTimeout(function(winner, pos) {
                        jungleBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            usersUsedThor: []
        },
        User: function(id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {

          //START CUSTOM USERUTILITIES FUNCTIONS

          //Find user ID without them necessarily being in the room still
          getID: function(name) {
                      var id;
                      var users = jungleBot.room.users;
                      var len = users.length;
                      for (var i = 0; i < len; ++i) {
                          if (users[i].username == name) {
                              var id = users[i].id;
                          }
                      }

                  if (isNaN(id)) return false;
                  else return id;
              },

          //END CUSTOM FUNCTIONS

            getJointime: function(user) {
                return user.jointime;
            },
            getUser: function(user) {
                return API.getUser(user.id);
            },
            updatePosition: function(user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function(user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = jungleBot.room.roomstats.songCount;
            },
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function(user) {
                return user.lastActivity;
            },
            getWarningCount: function(user) {
                return user.afkWarningCount;
            },
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function(id) {
                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    if (jungleBot.room.users[i].id === id) {
                        return jungleBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    var match = jungleBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return jungleBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function(id) {
                var user = jungleBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function(obj) {
                var u;
                if (typeof obj === 'object') u = obj;
                else u = API.getUser(obj);
                if (isNaN(u.gRole)) return 9999;
                if (botCreatorIDs.indexOf(u.id) > -1) return 9999;
                if (isNaN(u.gRole)) return 9999;
                if (u.gRole < 3000) return u.role;
                else {
                    switch (u.gRole) {
                        case 3000:
                            return (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        case 5000:
                            return (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                    }
                }
                return 0;
            },
            moveUser: function(id, pos, priority) {
                var user = jungleBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < jungleBot.room.queue.id.length; i++) {
                            if (jungleBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            jungleBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(jungleBot.chat.alreadyadding, {
                                position: jungleBot.room.queue.position[alreadyQueued]
                            }));
                        }
                        jungleBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            jungleBot.room.queue.id.unshift(id);
                            jungleBot.room.queue.position.unshift(pos);
                        } else {
                            jungleBot.room.queue.id.push(id);
                            jungleBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(jungleBot.chat.adding, {
                            name: name,
                            position: jungleBot.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = jungleBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return jungleBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(jungleBot.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return jungleBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (jungleBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = jungleBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(jungleBot.chat.toolongago, {
                    name: jungleBot.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = jungleBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = jungleBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(jungleBot.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(jungleBot.chat.valid, {
                    name: jungleBot.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                jungleBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function(rankString) {
                var rankInt = null;
                switch (rankString) {
                    case 'admin':
                        rankInt = 10;
                        break;
                    case 'ambassador':
                        rankInt = 7;
                        break;
                    case 'host':
                        rankInt = 5;
                        break;
                    case 'cohost':
                        rankInt = 4;
                        break;
                    case 'manager':
                        rankInt = 3;
                        break;
                    case 'bouncer':
                        rankInt = 2;
                        break;
                    case 'residentdj':
                        rankInt = 1;
                        break;
                    case 'user':
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function(msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function() {}, 1000),
                locked: false,
                lockBooth: function() {
                    API.moderateLockWaitList(!jungleBot.roomUtilities.booth.locked);
                    jungleBot.roomUtilities.booth.locked = false;
                    if (jungleBot.settings.lockGuard) {
                        jungleBot.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(jungleBot.roomUtilities.booth.locked);
                        }, jungleBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(jungleBot.roomUtilities.booth.locked);
                    clearTimeout(jungleBot.roomUtilities.booth.lockTimer);
                      }
                  },

            afkCheck: function() {
                if (!jungleBot.status || !jungleBot.settings.afkRemoval) return void(0);
                var rank = jungleBot.roomUtilities.rankToNumber(jungleBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, jungleBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = jungleBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = jungleBot.userUtilities.getUser(user);
                            if (rank !== null && jungleBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = jungleBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = jungleBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                          /*
                                //Prevent users that were in the room but not in queue to be affected by afk removal

                                if (inactivity > jungleBot.settings.maximumAfk * 60 * 1500) {

                                    jungleBot.userUtilities.setLastActivity(user);

                                }

                          */
                                if (inactivity > jungleBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(jungleBot.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(jungleBot.chat.warning2, {
                                            name: name
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    } else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            jungleBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(jungleBot.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: jungleBot.settings.maximumAfk
                                            }));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function(reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                jungleBot.room.queueable = false;

                if (waitlistlength == 50) {
                    jungleBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 1);
                    jungleBot.room.skippable = false;
                    setTimeout(function() {
                        jungleBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        jungleBot.userUtilities.moveUser(id, jungleBot.settings.skipPosition, false);
                        jungleBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                jungleBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks if shouldCycle is true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(jungleBot.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (jungleBot.settings.cycleGuard) { // Is cycle guard on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                            jungleBot.room.cycleTimer = setTimeout(function() { // Start timer
                                API.moderateDJCycle(false); // Disable cycle
                            }, jungleBot.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function() {
                var interval;
                if (jungleBot.settings.motdEnabled) interval = jungleBot.settings.motdInterval;
                else interval = jungleBot.settings.messageInterval;
                if ((jungleBot.room.roomstats.songCount % interval) === 0 && jungleBot.status) {
                    var msg;
                    if (jungleBot.settings.motdEnabled) {
                        msg = jungleBot.settings.motd;
                    } else {
                        if (jungleBot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = jungleBot.room.roomstats.songCount % jungleBot.settings.intervalMessages.length;
                        msg = jungleBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in jungleBot.settings.blacklists) {
                    jungleBot.room.blacklists[bl] = [];
                    if (typeof jungleBot.settings.blacklists[bl] === 'function') {
                        jungleBot.room.blacklists[bl] = jungleBot.settings.blacklists();
                    } else if (typeof jungleBot.settings.blacklists[bl] === 'string') {
                        if (jungleBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.get(jungleBot.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    jungleBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        } catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function() {
                if (typeof console.table !== 'undefined') {
                    console.table(jungleBot.room.newBlacklisted);
                } else {
                    console.log(jungleBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < jungleBot.room.newBlacklisted.length; i++) {
                    var track = jungleBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
                }
              },
            eventChat: function(chat) {
                chat.message = linkFixer(chat.message);
                chat.message = decodeEntities(chat.message);
                chat.message = chat.message.trim();

                jungleBot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    if (jungleBot.room.users[i].id === chat.uid) {
                        jungleBot.userUtilities.setLastActivity(jungleBot.room.users[i]);
                        if (jungleBot.room.users[i].username !== chat.un) {
                            jungleBot.room.users[i].username = chat.un;
                        }
                    }
                }
                if (jungleBot.chatUtilities.chatFilter(chat)) return void(0);
                if (!jungleBot.chatUtilities.commandCheck(chat))
                    jungleBot.chatUtilities.action(chat);
            },
            eventUserjoin: function(user) {
                var known = false;
                var index = null;
                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    if (jungleBot.room.users[i].id === user.id) {
                        known = true;
                        index = i;
                    }
                }
                var greet = true;
                var welcomeback = null;
                if (known) {
                    jungleBot.room.users[index].inRoom = true;
                    var u = jungleBot.userUtilities.lookupUser(user.id);
                    var jt = u.jointime;
                    var t = Date.now() - jt;
                    if (t < 10 * 1000) greet = false;
                    else welcomeback = true;
                } else {
                    jungleBot.room.users.push(new jungleBot.User(user.id, user.username));
                    welcomeback = false;
                }
                for (var j = 0; j < jungleBot.room.users.length; j++) {
                    if (jungleBot.userUtilities.getUser(jungleBot.room.users[j]).id === user.id) {
                        jungleBot.userUtilities.setLastActivity(jungleBot.room.users[j]);
                        jungleBot.room.users[j].jointime = Date.now();
                    }

                }

                if (botCreatorIDs.indexOf(user.id) > -1) {
                  console.log(true);
                    API.sendChat('@'+user.username+' '+':sparkles: :bow: :sparkles:');
                } else if (jungleBot.settings.welcome && greet) {
                  console.log(false);
                  console.log(botCreatorIDs);
                    welcomeback ?
                        setTimeout(function(user) {
                            API.sendChat(subChat(jungleBot.chat.welcomeback, {
                                name: user.username
                            }));
                        }, 1 * 1000, user) :
                        setTimeout(function(user) {
                            API.sendChat(subChat(jungleBot.chat.welcome, {
                                name: user.username
                            }));
                        }, 1 * 1000, user);
                }
            },
            eventUserleave: function(user) {
                var lastDJ = API.getHistory()[0].user.id;
                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    if (jungleBot.room.users[i].id === user.id) {
                        jungleBot.userUtilities.updateDC(jungleBot.room.users[i]);
                        jungleBot.room.users[i].inRoom = false;
                        if (lastDJ == user.id) {
                            var user = jungleBot.userUtilities.lookupUser(jungleBot.room.users[i].id);
                            jungleBot.userUtilities.updatePosition(user, 0);
                            user.lastDC.time = null;
                            user.lastDC.position = user.lastKnownPosition;
                        }
                    }
                }
            },
            eventVoteupdate: function(obj) {
                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    if (jungleBot.room.users[i].id === obj.user.id) {
                        if (obj.vote === 1) {
                            jungleBot.room.users[i].votes.woot++;
                        } else {
                            jungleBot.room.users[i].votes.meh++;
                        }
                    }
                }

                var mehs = API.getScore().negative;
                var woots = API.getScore().positive;
                var dj = API.getDJ();
                var timeLeft = API.getTimeRemaining();
                var timeElapsed = API.getTimeElapsed();

                if (jungleBot.settings.voteSkip) {
                    if ((mehs - woots) >= (jungleBot.settings.voteSkipLimit)) {
                        API.sendChat(subChat(jungleBot.chat.voteskipexceededlimit, {
                            name: dj.username,
                            limit: jungleBot.settings.voteSkipLimit
                        }));
                        if (jungleBot.settings.smartSkip && timeLeft > timeElapsed) {
                            jungleBot.roomUtilities.smartSkip();
                        } else {
                            API.moderateForceSkip();
                        }
                    }
                }

            },
            eventCurateupdate: function(obj) {
                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    if (jungleBot.room.users[i].id === obj.user.id) {
                        jungleBot.room.users[i].votes.curate++;
                    }
                }
            },
            eventDjadvance: function(obj) {
                if (!obj.dj) return;
                if (jungleBot.settings.autowoot) {
                    $('#woot').click(); // autowoot
                }

                var user = jungleBot.userUtilities.lookupUser(obj.dj.id)
                for (var i = 0; i < jungleBot.room.users.length; i++) {
                    if (jungleBot.room.users[i].id === user.id) {
                        jungleBot.room.users[i].lastDC = {
                            time: null,
                            position: null,
                            songCount: 0
                        };
                    }
                }

                var lastplay = obj.lastPlay;
                if (typeof lastplay === 'undefined') return;
                if (jungleBot.settings.songstats) {
                    if (typeof jungleBot.chat.songstatistics === 'undefined') {
                        API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'W/' + lastplay.score.grabs + 'G/' + lastplay.score.negative + 'M.')
                    } else {
                        API.sendChat(subChat(jungleBot.chat.songstatistics, {
                            artist: lastplay.media.author,
                            title: lastplay.media.title,
                            woots: lastplay.score.positive,
                            grabs: lastplay.score.grabs,
                            mehs: lastplay.score.negative
                        }))
                    }
                }
                jungleBot.room.roomstats.totalWoots += lastplay.score.positive;
                jungleBot.room.roomstats.totalMehs += lastplay.score.negative;
                jungleBot.room.roomstats.totalCurates += lastplay.score.grabs;
                jungleBot.room.roomstats.songCount++;
                jungleBot.roomUtilities.intervalMessage();
                jungleBot.room.currentDJID = obj.dj.id;

                var blacklistSkip = setTimeout(function() {
                    var mid = obj.media.format + ':' + obj.media.cid;
                    for (var bl in jungleBot.room.blacklists) {
                        if (jungleBot.settings.blacklistEnabled) {
                            if (jungleBot.room.blacklists[bl].indexOf(mid) > -1) {
                                API.sendChat(subChat(jungleBot.chat.isblacklisted, {
                                    blacklist: bl
                                }));
                                if (jungleBot.settings.smartSkip) {
                                    return jungleBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        }
                    }
                }, 1);
                var newMedia = obj.media;
                clearTimeout(jungleBot.room.tgSkip);
                var timeLimitSkip = setTimeout(function() {
                    if (jungleBot.settings.timeGuard && newMedia.duration > jungleBot.settings.maximumSongLength * 60 && !jungleBot.room.roomevent) {
                        if (typeof jungleBot.settings.strictTimeGuard === 'undefined' || jungleBot.settings.strictTimeGuard) {
                            var name = obj.dj.username;
                            API.sendChat(subChat(jungleBot.chat.timelimit, {
                                name: name,
                                maxlength: jungleBot.settings.maximumSongLength
                            }));
                            if (jungleBot.settings.smartSkip) {
                                return jungleBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        } else {
                            jungleBot.room.tgSkip = setTimeout(function() {
                                if (jungleBot.settings.timeGuard) return API.moderateForceSkip();
                                return;
                            }, jungleBot.settings.maximumSongLength*60*1000);
                        }
                    }
                }, 2000);
                var format = obj.media.format;
                var cid = obj.media.cid;
                var naSkip = setTimeout(function() {
                    if (format == 1) {
                        $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function(track) {
                            if (typeof(track.items[0]) === 'undefined') {
                                var name = obj.dj.username;
                                API.sendChat(subChat(jungleBot.chat.notavailable, {
                                    name: name
                                }));
                                if (jungleBot.settings.smartSkip) {
                                    return jungleBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        });
                    } else {
                        var checkSong = SC.get('/tracks/' + cid, function(track) {
                            if (typeof track.title === 'undefined') {
                                var name = obj.dj.username;
                                API.sendChat(subChat(jungleBot.chat.notavailable, {
                                    name: name
                                }));
                                if (jungleBot.settings.smartSkip) {
                                    return jungleBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        });
                    }
                }, 1);
                clearTimeout(historySkip);
                if (jungleBot.settings.historySkip) {
                    var alreadyPlayed = false;
                    var apihistory = API.getHistory();
                    var name = obj.dj.username;
                    var historySkip = setTimeout(function() {
                        for (var i = 0; i < apihistory.length; i++) {
                            if (apihistory[i].media.cid === obj.media.cid) {
                                jungleBot.room.historyList[i].push(+new Date());
                                alreadyPlayed = true;
                                API.sendChat(subChat(jungleBot.chat.songknown, {
                                    name: name
                                }));
                                if (jungleBot.settings.smartSkip) {
                                    return jungleBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        }
                        if (!alreadyPlayed) {
                            jungleBot.room.historyList.push([obj.media.cid, +new Date()]);
                        }
                    }, 1);
                }
                if (user.ownSong) {
                    API.sendChat(subChat(jungleBot.chat.permissionownsong, {
                        name: user.username
                    }));
                    user.ownSong = false;
                }
                clearTimeout(jungleBot.room.autoskipTimer);
                if (jungleBot.settings.autoskip) {
                    var remaining = obj.media.duration * 1000;
                    var startcid = API.getMedia().cid;
                    jungleBot.room.autoskipTimer = setTimeout(function() {
                        if (!API.getMedia()) return;

                        var endcid = API.getMedia().cid;
                        if (startcid === endcid) {
                            //API.sendChat('Song stuck, skipping...');
                            API.moderateForceSkip();
                        }
                    }, remaining + 5000);
                }
                storeToStorage();
                //sendToSocket();
            },
            eventWaitlistupdate: function(users) {
                if (users.length < 50) {
                    if (jungleBot.room.queue.id.length > 0 && jungleBot.room.queueable) {
                        jungleBot.room.queueable = false;
                        setTimeout(function() {
                            jungleBot.room.queueable = true;
                        }, 500);
                        jungleBot.room.queueing++;
                        var id, pos;
                        setTimeout(
                            function() {
                                id = jungleBot.room.queue.id.splice(0, 1)[0];
                                pos = jungleBot.room.queue.position.splice(0, 1)[0];
                                API.moderateAddDJ(id, pos);
                                setTimeout(
                                    function(id, pos) {
                                        API.moderateMoveDJ(id, pos);
                                        jungleBot.room.queueing--;
                                        if (jungleBot.room.queue.id.length === 0) setTimeout(function() {
                                            jungleBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1000, id, pos);
                            }, 1000 + jungleBot.room.queueing * 2500);
                    }
                }
                for (var i = 0; i < users.length; i++) {
                    var user = jungleBot.userUtilities.lookupUser(users[i].id);
                    jungleBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
                }
            },

            chatcleaner: function(chat) {
                if (!jungleBot.settings.filterChat) return false;
                if (jungleBot.userUtilities.getPermission(chat.uid) >= API.ROLE.BOUNCER) return false;
                var msg = chat.message;
                var containsLetters = false;
                for (var i = 0; i < msg.length; i++) {
                    ch = msg.charAt(i);
                    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
                }
                if (msg === '') {
                    return true;
                }
                if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
                msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
                var capitals = 0;
                var ch;
                for (var i = 0; i < msg.length; i++) {
                    ch = msg.charAt(i);
                    if (ch >= 'A' && ch <= 'Z') capitals++;
                }
                if (capitals >= 40) {
                    API.sendChat(subChat(jungleBot.chat.caps, {
                        name: chat.un
                    }));
                    return true;
                }
                msg = msg.toLowerCase();
                if (msg === 'skip') {
                    API.sendChat(subChat(jungleBot.chat.askskip, {
                        name: chat.un
                    }));
                    return true;
                }
                for (var j = 0; j < jungleBot.chatUtilities.spam.length; j++) {
                    if (msg === jungleBot.chatUtilities.spam[j]) {
                        API.sendChat(subChat(jungleBot.chat.spam, {
                            name: chat.un
                        }));
                        return true;
                    }
                }
                return false;
            },

            chatUtilities: {
              chatFilter: function(chat) {
                  var msg = chat.message;
                  var perm = jungleBot.userUtilities.getPermission(chat.uid);
                  var user = jungleBot.userUtilities.lookupUser(chat.uid);
                  var isMuted = false;
                  for (var i = 0; i < jungleBot.room.mutedUsers.length; i++) {
                      if (jungleBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                  }
                  if (isMuted) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }
                  if (jungleBot.settings.lockdownEnabled) {
                      if (perm === API.ROLE.NONE) {
                          API.moderateDeleteChat(chat.cid);
                          return true;
                      }
                  }
                  if (jungleBot.chatcleaner(chat)) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }
                  if (jungleBot.settings.cmdDeletion && msg.startsWith(jungleBot.settings.commandLiteral)) {
                      API.moderateDeleteChat(chat.cid);
                  }
                  /**
                   var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                   if (plugRoomLinkPatt.exec(msg)) {
                      if (perm === API.ROLE.NONE) {
                          API.sendChat(subChat(jungleBot.chat.roomadvertising, {name: chat.un}));
                          API.moderateDeleteChat(chat.cid);
                          return true;
                      }
                  }
                   **/
                  if (msg.indexOf('http://adf.ly/') > -1) {
                      API.moderateDeleteChat(chat.cid);
                      API.sendChat(subChat(jungleBot.chat.adfly, {
                          name: chat.un
                      }));
                      return true;
                  }
                  if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }

                  var rlJoinChat = jungleBot.chat.roulettejoin;
                  var rlLeaveChat = jungleBot.chat.rouletteleave;

                  var joinedroulette = rlJoinChat.split('%%NAME%%');
                  if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                  else joinedroulette = joinedroulette[0];

                  var leftroulette = rlLeaveChat.split('%%NAME%%');
                  if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                  else leftroulette = leftroulette[0];

                  if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === jungleBot.loggedInID) {
                      setTimeout(function(id) {
                          API.moderateDeleteChat(id);
                      }, 5 * 1000, chat.cid);
                      return true;
                  }
                  return false;
              },
                commandCheck: function(chat) {
                    var cmd;
                    if (chat.message.charAt(0) === jungleBot.settings.commandLiteral) {
                        var space = chat.message.indexOf(' ');
                        if (space === -1) {
                            cmd = chat.message;
                        } else cmd = chat.message.substring(0, space);
                    } else return false;
                    var userPerm = jungleBot.userUtilities.getPermission(chat.uid);
                    //console.log('name: ' + chat.un + ', perm: ' + userPerm);
                    if (chat.message !== jungleBot.settings.commandLiteral + 'join' && chat.message !== jungleBot.settings.commandLiteral + 'leave') {
                        if (userPerm === API.ROLE.NONE && !jungleBot.room.usercommand) return void(0);
                        if (!jungleBot.room.allcommand) return void(0);
                    }
                    if (chat.message === jungleBot.settings.commandLiteral + 'eta' && jungleBot.settings.etaRestriction) {
                        if (userPerm < API.ROLE.BOUNCER) {
                            var u = jungleBot.userUtilities.lookupUser(chat.uid);
                            if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                                API.moderateDeleteChat(chat.cid);
                                return void(0);
                            } else u.lastEta = Date.now();
                        }
                    }
                    var executed = false;

                    for (var comm in jungleBot.commands) {
                        var cmdCall = jungleBot.commands[comm].command;
                        if (!Array.isArray(cmdCall)) {
                            cmdCall = [cmdCall]
                        }
                        for (var i = 0; i < cmdCall.length; i++) {
                            if (jungleBot.settings.commandLiteral + cmdCall[i] === cmd) {
                                jungleBot.commands[comm].functionality(chat, jungleBot.settings.commandLiteral + cmdCall[i]);
                                executed = true;
                                break;
                            }
                        }
                    }

                    if (executed && userPerm === API.ROLE.NONE) {
                        jungleBot.room.usercommand = false;
                        setTimeout(function() {
                            jungleBot.room.usercommand = true;
                        }, jungleBot.settings.commandCooldown * 1000);
                    }
                    if (executed) {
                        /*if (jungleBot.settings.cmdDeletion) {
                            API.moderateDeleteChat(chat.cid);
                        }*/

                        //jungleBot.room.allcommand = false;
                        //setTimeout(function () {
                        jungleBot.room.allcommand = true;
                        //}, 5 * 1000);
                    }
                    return executed;
                },
                action: function(chat) {
                    var user = jungleBot.userUtilities.lookupUser(chat.uid);
                    if (chat.type === 'message') {
                        for (var j = 0; j < jungleBot.room.users.length; j++) {
                            if (jungleBot.userUtilities.getUser(jungleBot.room.users[j]).id === chat.uid) {
                                jungleBot.userUtilities.setLastActivity(jungleBot.room.users[j]);
                            }

                        }
                    }
                    jungleBot.room.roomstats.chatmessages++;
                },
                spam: [
                    '???????????????'
                ],
                curses: [
                    'heck'
                ]
            },

            connectAPI: function() {
                this.proxy = {
                    eventChat: $.proxy(this.eventChat, this),
                    eventUserskip: $.proxy(this.eventUserskip, this),
                    eventUserjoin: $.proxy(this.eventUserjoin, this),
                    eventUserleave: $.proxy(this.eventUserleave, this),
                    //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                    eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                    eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                    eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                    eventDjadvance: $.proxy(this.eventDjadvance, this),
                    //eventDjupdate: $.proxy(this.eventDjupdate, this),
                    eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                    eventVoteskip: $.proxy(this.eventVoteskip, this),
                    eventModskip: $.proxy(this.eventModskip, this),
                    eventChatcommand: $.proxy(this.eventChatcommand, this),
                    eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

                };
                API.on(API.CHAT, this.proxy.eventChat);
                API.on(API.USER_SKIP, this.proxy.eventUserskip);
                API.on(API.USER_JOIN, this.proxy.eventUserjoin);
                API.on(API.USER_LEAVE, this.proxy.eventUserleave);
                API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
                API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
                API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
                API.on(API.ADVANCE, this.proxy.eventDjadvance);
                API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
                API.on(API.MOD_SKIP, this.proxy.eventModskip);
                API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
                API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
            },
            disconnectAPI: function() {
                API.off(API.CHAT, this.proxy.eventChat);
                API.off(API.USER_SKIP, this.proxy.eventUserskip);
                API.off(API.USER_JOIN, this.proxy.eventUserjoin);
                API.off(API.USER_LEAVE, this.proxy.eventUserleave);
                API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
                API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
                API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
                API.off(API.ADVANCE, this.proxy.eventDjadvance);
                API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
                API.off(API.MOD_SKIP, this.proxy.eventModskip);
                API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
                API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
            },
            startup: function() {
                var u = API.getUser();
                if (jungleBot.userUtilities.getPermission(u) < API.ROLE.BOUNCER) return API.chatLog(jungleBot.chat.greyuser);
                if (jungleBot.userUtilities.getPermission(u) === API.ROLE.BOUNCER) API.chatLog(jungleBot.chat.bouncer);
                jungleBot.connectAPI();
                API.moderateDeleteChat = function(cid) {
                    $.ajax({
                        url: '/_/chat/' + cid,
                        type: 'DELETE'
                    })
                };

                jungleBot.room.name = window.location.pathname;
                var Check;

                console.log(jungleBot.room.name);

                var detect = function() {
                    if (jungleBot.room.name != window.location.pathname) {
                        console.log('Killing bot after room change.');
                        storeToStorage();
                        jungleBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                        if (jungleBot.settings.roomLock) {
                            window.location = jungleBot.room.name;
                        } else {
                            clearInterval(Check);
                        }
                    }
                };

                Check = setInterval(function() {
                    detect()
                }, 20000);

                retrieveSettings();
                retrieveFromStorage();
                window.bot = jungleBot;
                jungleBot.roomUtilities.updateBlacklists();
                setInterval(jungleBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
                jungleBot.getNewBlacklistedSongs = jungleBot.roomUtilities.exportNewBlacklistedSongs;
                jungleBot.logNewBlacklistedSongs = jungleBot.roomUtilities.logNewBlacklistedSongs;
                if (jungleBot.room.roomstats.launchTime === null) {
                    jungleBot.room.roomstats.launchTime = Date.now();
                }

                for (var j = 0; j < jungleBot.room.users.length; j++) {
                    jungleBot.room.users[j].inRoom = false;
                }
                var userlist = API.getUsers();
                for (var i = 0; i < userlist.length; i++) {
                    var known = false;
                    var ind = null;
                    for (var j = 0; j < jungleBot.room.users.length; j++) {
                        if (jungleBot.room.users[j].id === userlist[i].id) {
                            known = true;
                            ind = j;
                        }
                    }
                    if (known) {
                        jungleBot.room.users[ind].inRoom = true;
                    } else {
                        jungleBot.room.users.push(new jungleBot.User(userlist[i].id, userlist[i].username));
                        ind = jungleBot.room.users.length - 1;
                    }
                    var wlIndex = API.getWaitListPosition(jungleBot.room.users[ind].id) + 1;
                    jungleBot.userUtilities.updatePosition(jungleBot.room.users[ind], wlIndex);
                }
                jungleBot.room.afkInterval = setInterval(function() {
                    jungleBot.roomUtilities.afkCheck()
                }, 10 * 1000);
                jungleBot.room.autodisableInterval = setInterval(function() {
                    jungleBot.room.autodisableFunc();
                }, 60 * 60 * 1000);
                jungleBot.loggedInID = API.getUser().id;
                jungleBot.status = true;
                API.sendChat('/cap ' + jungleBot.settings.startupCap);
                API.setVolume(jungleBot.settings.startupVolume);
                if (jungleBot.settings.autowoot) {
                    $('#woot').click();
                }
                if (jungleBot.settings.startupEmoji) {
                    var emojibuttonoff = $('.icon-emoji-off');
                    if (emojibuttonoff.length > 0) {
                        emojibuttonoff[0].click();
                    }
                    API.chatLog(':smile: Emojis enabled.');
                } else {
                    var emojibuttonon = $('.icon-emoji-on');
                    if (emojibuttonon.length > 0) {
                        emojibuttonon[0].click();
                    }
                    API.chatLog('Emojis disabled.');
                }
                API.chatLog('Avatars capped at ' + jungleBot.settings.startupCap);
                API.chatLog('Volume set to ' + jungleBot.settings.startupVolume);
                //socket();
                loadChat(API.sendChat(subChat(jungleBot.chat.online, {
                    botname: jungleBot.settings.botName,
                    version: jungleBot.version
                })));
            },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = jungleBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'ambassador':
                        minPerm = (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'host':
                    case 'host':
                        minPerm = API.ROLE.HOST;
                        break;
                    case 'cohost':
                        minPerm = API.ROLE.COHOST;
                        break;
                    case 'manager':
                        minPerm = API.ROLE.MANAGER;
                        break;
                    case 'mod':
                        if (jungleBot.settings.bouncerPlus) {
                            minPerm = API.ROLE.BOUNCER;
                        } else {
                            minPerm = API.ROLE.MANAGER;
                        }
                        break;
                    case 'bouncer':
                        minPerm = API.ROLE.BOUNCER;
                        break;
                    case 'residentdj':
                        minPerm = API.ROLE.DJ;
                        break;
                    case 'user':
                        minPerm = API.ROLE.NONE;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },


	// START OF COMMANDS

		// START OF CUSTOM COMMANDS

			/*
            command: {
                command: 'cmd',
                rank: 'user/bouncer/mod/manager',
                type: 'startsWith/exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {

                    }
                }
            },
            */


            //blacklist the previous song

            blacklistpreviousCommand: {
                            command: ['blacklistprevious', 'blp'],
                            rank: 'bouncer',
                            type: 'startsWith',
                            functionality: function(chat, cmd) {
                                if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                                else {
                                    var msg = chat.message;
                                    var lastplay = API.getHistory()[1];
                                    if (typeof lastplay === 'undefined') return;
                                    var list;
                                    if (msg.length === cmd.length) list = 'BANNED';
                                    else list = msg.substring(cmd.length + 1);
                                    var media = lastplay.media;

                                    var track = {
                                        list: list,
                                        author: media.author,
                                        title: media.title,
                                        mid: media.format + ':' + media.cid
                                    };
                                    jungleBot.room.newBlacklisted.push(track);
                                    jungleBot.room.blacklists[list].push(media.format + ':' + media.cid);
                                    API.sendChat('/me Added.');
                                    API.chatLog(subChat(jungleBot.chat.newblacklisted, {
                                        name: chat.un,
                                        blacklist: list,
                                        author: media.author,
                                        title: media.title,
                                        mid: media.format + ':' + media.cid
                                    }));

                                    if (typeof jungleBot.room.newBlacklistedSongFunction === 'function') {
                                        jungleBot.room.newBlacklistedSongFunction(track);
                                          }
                                      }
                                  }
                               },

            //Print ID of user in chat, regardless of if they are still in the room.

            idCommand: {
                command: 'id',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 1);
                        }
                    }
                    var id = jungleBot.userUtilities.getID(name);

                    if (id) {
                      API.sendChat('/me @' + chat.un + ' ' + name + '\'s ID is "' + id + '".');
                    }
                    else {
                      API.sendChat('/me @' + chat.un + ' Invalid user specified.');
                       }

                      }
                   },

            // no u
        		nouCommand: {
                        command: ['nou'],
                        rank: 'residentdj',
                        type: 'startsWith',
                        functionality: function(chat, cmd) {

        					var msg = chat.message;
        					var cmdmsg = msg.substr(cmd.length + 1);

                            if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                            if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                            else {
        	                       API.sendChat(cmdmsg + ' no u');
                             }
                          }
                      },

            // say

            	sayCommand: {
                        command: ['say'],
                        rank: 'manager',
                        type: 'startsWith',
                        functionality: function(chat, cmd) {

                  				var msg = chat.message;
                  				var cmdmsg = msg.substr(cmd.length + 1);

                            if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                            if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                            else {
                                       API.sendChat(cmdmsg);
                            }
                        }
                    },

            // chu say brug?

          	chusayCommand: {
                        command: ['chusay', 'brug', 'feelsweirdbrug'],
                        rank: 'residentdj',
                        type: 'startsWith',
                        functionality: function(chat, cmd) {

        					var msg = chat.message;
        					var cmdmsg = msg.substr(cmd.length + 1);

                            if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                            if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                            else {
        	                       API.sendChat(cmdmsg + ' https://i.imgur.com/Y5Zx98w.gif');
                            }
                        }
                    },

            // @user with WeirdChamp

          	weirdchampCommand: {
                          command: ['weirdchamp', 'weird'],
                          rank: 'residentdj',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {

          					var msg = chat.message;
          					var cmdmsg = msg.substr(cmd.length + 1);

                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                              else {

          						API.sendChat(subChat(jungleBot.chat.weirdchamp, {
                                      name: cmdmsg,
                                  }));
                              }
                          }
                      },

          	//(◕‿◕✿) CHAT IS RUNNING IN POSITIVE CHAT OR BAN MODE (◕‿◕✿)

          	attitudeCommand: {
                          command: ['attitude', 'negativity'],
                          rank: 'residentdj',
                          type: 'startsWith',
                          functionality: function(chat, cmd) {

          					var msg = chat.message;
          					var cmdmsg = msg.substr(cmd.length + 1);

                              if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                              if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                              else {

          						API.sendChat(subChat(jungleBot.chat.attitude, {
                                      name: cmdmsg,
                                  }));
                              }
                          }
                      },

            // MrDestructoid clapping

          	clapCommand: {
          		  command: 'clap',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat(":MrDestructoid: :bttvClap:");
                      }
                    }
                  },


                  //MrDestructoid in natural habitat
                  mackygeeCommand: {
                    command: ['mackygee', 'macky'],
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("https://i.imgur.com/LABtfS6.gif");
                      }
                    }
                  },

                  //MrDestructoid woots
                  wootCommand: {
                    command: 'woot',
                    rank: 'residentdj',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("/woot");
                        API.sendChat(":MrDestructoid: :bttvClap:");
                      }
                    }
                  },

                  //MrDestructoid ResidentSleeper
                  ResidentSleeperCommand: {
                    command: 'sleeper',
                    rank: 'residentdj',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("ResidentSleeper Clap");
                      }
                    }
                  },

                  //MrDestructoid sparkle
                  sparkleCommand: {
                    command: 'sparkle',
                    rank: 'residentdj',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("/sparkle");
                      }
                    }
                  },

                  //Exports the chat to local storage .txt
                  exportchatCommand: {
                    command: 'exportchat',
                    rank: 'manager',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("/exportchat");
                      }
                    }
                  },

                  //cute robot
                  ayayaCommand: {
                    command: 'ayaya',
                    rank: 'residentdj',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("AYAYA Clap");
                      }
                    }
                  },

                  //MrDestructoid voteemotespam
                  voteemotespamCommand: {
                    command: 'votespam',
                    rank: 'manager',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("/voteemotespam");
                      }
                    }
                  },

                  // Nightcore command
                  nightcoreCommand: {
                    command: 'nightcore',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("MrDestructoid says: If you're about to queue a nightcore song, just look up the original and queue that instead.");
                      }
                    }
                  },

                  // Show commands
                  commandsCommand: {
                    command: 'commands',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("Find the bot commands for this channel here: https://git.io/fN5eb#bot-commands");
                      }
                    }
                  },

                   // RCS help
                  rcsCommand: {
                    command: 'rcs',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("The RCS extension is an enhancement for plug.dj. Install it so you can see our custom channel theme! https://rcs.radiant.dj");
                      }
                    }
                  },

                   // Emotes help
                  emotesCommand: {
                    command: ['emotes', 'downloadpoggers'],
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("To use emotes when you have RCS installed type colons like :this:. Alternatively, install the GTE extension and add xqcow in the settings: https://chrome.google.com/webstore/detail/global-twitch-emotes/pgniedifoejifjkndekolimjeclnokkb");
                      }
                    }
                  },

                   // Twitch link
                  twitchCommand: {
                    command: 'twitch',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("xQc's Twitch: https://www.twitch.tv/xqcow");
                      }
                    }
                  },

                   // Discord link
                  discordCommand: {
                    command: 'discord',
                    rank: 'user',
                    type: 'exact',
                    functionality: function (chat, cmd) {
                      if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                      if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                      else {
                        API.sendChat("xQc's Discord: https://discord.gg/xqcow");
                      }
                    }
                  },




          		//END OF CUSTOM COMMANDS


            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = jungleBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(jungleBot.chat.invalidtime, {
                                name: chat.un
                            }));
                        }
                        for (var i = 0; i < jungleBot.room.users.length; i++) {
                            userTime = jungleBot.userUtilities.getLastActivity(jungleBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(jungleBot.chat.activeusersintime, {
                            name: chat.un,
                            amount: chatters,
                            time: time
                        }));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (jungleBot.room.roomevent) {
                                    jungleBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            afklimitCommand: {
            			command: ['afklimit', 'maximumafk', 'maxafktime'],
                            rank: 'manager',
                            type: 'startsWith',
                            functionality: function(chat, cmd) {
                                if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                                if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                                else {
                                    var msg = chat.message;
                                    if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nolimitspecified, {
                                        name: chat.un
                                    }));
                                    var limit = msg.substring(cmd.length + 1);
                                    if (!isNaN(limit)) {
                                        jungleBot.settings.maximumAfk = parseInt(limit, 10);
                                        API.sendChat(subChat(jungleBot.chat.maximumafktimeset, {
                                            name: chat.un,
                                            time: jungleBot.settings.maximumAfk
                                        }));
                                    } else API.sendChat(subChat(jungleBot.chat.invalidlimitspecified, {
                                        name: chat.un
                                    }));
                                }
                            }
                        },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.afkRemoval) {
                            jungleBot.settings.afkRemoval = !jungleBot.settings.afkRemoval;
                            clearInterval(jungleBot.room.afkInterval);
                            API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.afkremoval
                            }));
                        } else {
                            jungleBot.settings.afkRemoval = !jungleBot.settings.afkRemoval;
                            jungleBot.room.afkInterval = setInterval(function() {
                                jungleBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.afkremoval
                            }));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        jungleBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(jungleBot.chat.afkstatusreset, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var lastActive = jungleBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = jungleBot.roomUtilities.msToStr(inactivity);

                        var launchT = jungleBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline) {
                            API.sendChat(subChat(jungleBot.chat.inactivelonger, {
                                botname: jungleBot.settings.botName,
                                name: chat.un,
                                username: name
                            }));
                        } else {
                            API.sendChat(subChat(jungleBot.chat.inactivefor, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.autodisable) {
                            jungleBot.settings.autodisable = !jungleBot.settings.autodisable;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.autodisable
                            }));
                        } else {
                            jungleBot.settings.autodisable = !jungleBot.settings.autodisable;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.autodisable
                            }));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.autoskip) {
                            jungleBot.settings.autoskip = !jungleBot.settings.autoskip;
                            clearTimeout(jungleBot.room.autoskipTimer);
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.autoskip
                            }));
                        } else {
                            jungleBot.settings.autoskip = !jungleBot.settings.autoskip;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.autoskip
                            }));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(jungleBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(jungleBot.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        var randomUser = Math.floor(Math.random() * crowd.length);
                        var randomBall = Math.floor(Math.random() * jungleBot.chat.balls.length);
                        var randomSentence = Math.floor(Math.random() * 1);
                        API.sendChat(subChat(jungleBot.chat.ball, {
                            name: chat.un,
                            botname: jungleBot.settings.botName,
                            question: argument,
                            response: jungleBot.chat.balls[randomBall]
                        }));
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var list;
                        var msg = chat.message;

                        if (msg.length === cmd.length) list = 'BANNED';
                        else list = msg.substring(cmd.length + 1);

                        var media = API.getMedia();
                        var timeLeft = API.getTimeRemaining();
                        var timeElapsed = API.getTimeElapsed();
                        var track = {
                            list: list,
                            author: media.author,
                            title: media.title,
                            mid: media.format + ':' + media.cid
                        };
                        jungleBot.room.newBlacklisted.push(track);
                        jungleBot.room.blacklists[list].push(media.format + ':' + media.cid);
                        API.sendChat('/me Added.');
                        API.chatLog(subChat(jungleBot.chat.newblacklisted, {
                            name: chat.un,
                            blacklist: list,
                            author: media.author,
                            title: media.title,
                            mid: media.format + ':' + media.cid
                        }));
                        if (jungleBot.settings.smartSkip && timeLeft > timeElapsed) {
                            jungleBot.roomUtilities.smartSkip();
                        } else {
                            API.moderateForceSkip();
                        }
                        if (typeof jungleBot.room.newBlacklistedSongFunction === 'function') {
                            jungleBot.room.newBlacklistedSongFunction(track);
                              }
                          }
                      }
                  },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ':' + cid;

                        API.sendChat(subChat(jungleBot.chat.blinfo, {
                            name: name,
                            author: author,
                            title: title,
                            songid: songid
                        }));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (jungleBot.settings.bouncerPlus) {
                            jungleBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': 'Bouncer+'
                            }));
                        } else {
                            if (!jungleBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = jungleBot.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    jungleBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'Bouncer+'
                                    }));
                                }
                            } else return API.sendChat(subChat(jungleBot.chat.bouncerplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(jungleBot.chat.currentbotname, {
                            botname: jungleBot.settings.botName
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            jungleBot.settings.botName = argument;
                            API.sendChat(subChat(jungleBot.chat.botnameset, {
                                botName: jungleBot.settings.botName
                            }));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute('data-cid'));
                        }
                        return API.sendChat(subChat(jungleBot.chat.chatcleared, {
                            name: chat.un
                        }));
                    }
                }
            },

            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        localStorage.clear();
                        API.chatLog('Cleared localstorage, please refresh the page!');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.cmdDeletion) {
                            jungleBot.settings.cmdDeletion = !jungleBot.settings.cmdDeletion;
                            API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.cmddeletion
                            }));
                        } else {
                            jungleBot.settings.cmdDeletion = !jungleBot.settings.cmdDeletion;
                            API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.cmddeletion
                            }));
                        }
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function(chat) {
                    var c = Math.floor(Math.random() * jungleBot.chat.cookies.length);
                    return jungleBot.chat.cookies[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(jungleBot.chat.eatcookie);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = jungleBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(jungleBot.chat.nousercookie, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(jungleBot.chat.selfcookie, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(jungleBot.chat.cookie, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    cookie: this.getCookie()
                                }));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        jungleBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.cycleGuard) {
                            jungleBot.settings.cycleGuard = !jungleBot.settings.cycleGuard;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.cycleguard
                            }));
                        } else {
                            jungleBot.settings.cycleGuard = !jungleBot.settings.cycleGuard;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.cycleguard
                            }));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== '') {
                            jungleBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(jungleBot.chat.cycleguardtime, {
                                name: chat.un,
                                time: jungleBot.settings.maximumCycletime
                            }));
                        } else return API.sendChat(subChat(jungleBot.chat.invalidtime, {
                            name: chat.un
                        }));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = jungleBot.userUtilities.getPermission(chat.uid);
                            if (perm < API.ROLE.BOUNCER) return API.sendChat(subChat(jungleBot.chat.dclookuprank, {
                                name: chat.un
                            }));
                        }
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var toChat = jungleBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*
            // This does not work anymore.
            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        var message = $('.message');
                        var emote = $('.emote');
                        var from = $('.un.clickable');
                        for (var i = 0; i < chats.length; i++) {
                            var n = from[i].textContent;
                            if (name.trim() === n.trim()) {

                                // var messagecid = $(message)[i].getAttribute('data-cid');
                                // var emotecid = $(emote)[i].getAttribute('data-cid');
                                // API.moderateDeleteChat(messagecid);

                                // try {
                                //     API.moderateDeleteChat(messagecid);
                                // }
                                // finally {
                                //     API.moderateDeleteChat(emotecid);
                                // }

                                if (typeof $(message)[i].getAttribute('data-cid') == 'undefined'){
                                    API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                } else {
                                    API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                }
                            }
                        }
                        API.sendChat(subChat(jungleBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },
            */

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        for (var i = 1; i < jungleBot.room.chatMessages.length; i++) {
                            if (jungleBot.room.chatMessages[i].indexOf(user.id) > -1) {
                                API.moderateDeleteChat(jungleBot.room.chatMessages[i][0]);
                                jungleBot.room.chatMessages[i].splice(0);
                            }
                        }
                        API.sendChat(subChat(jungleBot.chat.deletechat, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(jungleBot.chat.emojilist, {
                            link: link
                        }));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = jungleBot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch (lang) {
                            case 'en':
                                break;
                            case 'da':
                                ch += 'Vær venlig at tale engelsk.';
                                break;
                            case 'de':
                                ch += 'Bitte sprechen Sie Englisch.';
                                break;
                            case 'es':
                                ch += 'Por favor, hable Inglés.';
                                break;
                            case 'fr':
                                ch += 'Parlez anglais, s\'il vous plaît.';
                                break;
                            case 'nl':
                                ch += 'Spreek Engels, alstublieft.';
                                break;
                            case 'pl':
                                ch += 'Proszę mówić po angielsku.';
                                break;
                            case 'pt':
                                ch += 'Por favor, fale Inglês.';
                                break;
                            case 'sk':
                                ch += 'Hovorte po anglicky, prosím.';
                                break;
                            case 'cs':
                                ch += 'Mluvte prosím anglicky.';
                                break;
                            case 'sr':
                                ch += 'Молим Вас, говорите енглески.';
                                break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var perm = jungleBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < API.ROLE.BOUNCER) return void(0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(jungleBot.chat.youaredj, {
                            name: name
                        }));
                        if (pos < 0) return API.sendChat(subChat(jungleBot.chat.notinwaitlist, {
                            name: name
                        }));
                        if (pos == 0) return API.sendChat(subChat(jungleBot.chat.youarenext, {
                            name: name
                        }));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = jungleBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(jungleBot.chat.eta, {
                            name: name,
                            time: estimateString,
                            position: realpos
                        }));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.filterChat) {
                            jungleBot.settings.filterChat = !jungleBot.settings.filterChat;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.chatfilter
                            }));
                        } else {
                            jungleBot.settings.filterChat = !jungleBot.settings.filterChat;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.chatfilter
                            }));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(jungleBot.chat.forceskip, {
                            name: chat.un
                        }));
                        API.moderateForceSkip();
                        jungleBot.room.skippable = false;
                        setTimeout(function() {
                            jungleBot.room.skippable = true
                        }, 5 * 1000);
                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(jungleBot.chat.ghosting, {
                                name1: chat.un,
                                name2: name
                            }));
                        } else API.sendChat(subChat(jungleBot.chat.notghosting, {
                            name1: chat.un,
                            name2: name
                        }));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating,
                                        'tag': fixedtag
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g, '+');
                            var commatag = tag.replace(/ /g, ', ');
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(jungleBot.chat.validgiftags, {
                                        name: chat.un,
                                        id: id,
                                        tags: commatag
                                    }));
                                } else {
                                    API.sendChat(subChat(jungleBot.chat.invalidgiftags, {
                                        name: chat.un,
                                        tags: commatag
                                    }));
                                }
                            });
                        } else {
                            function get_random_id(api_key, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(jungleBot.chat.validgifrandom, {
                                        name: chat.un,
                                        id: id
                                    }));
                                } else {
                                    API.sendChat(subChat(jungleBot.chat.invalidgifrandom, {
                                        name: chat.un
                                    }));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: ['help','starterhelp'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = '(Updated link coming soon)';
                        API.sendChat(subChat(jungleBot.chat.starterhelp, {
                            link: link
                        }));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.historySkip) {
                            jungleBot.settings.historySkip = !jungleBot.settings.historySkip;
                            API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.historyskip
                            }));
                        } else {
                            jungleBot.settings.historySkip = !jungleBot.settings.historySkip;
                            API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.historyskip
                            }));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.room.roulette.rouletteStatus && jungleBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            jungleBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(jungleBot.chat.roulettejoin, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var join = jungleBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = jungleBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(jungleBot.chat.jointime, {
                            namefrom: chat.un,
                            username: name,
                            time: timeString
                        }));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = jungleBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));

                        var permFrom = jungleBot.userUtilities.getPermission(chat.uid);
                        var permTokick = jungleBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(jungleBot.chat.kickrank, {
                                name: chat.un
                            }));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(jungleBot.chat.kick, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function(id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        } else API.sendChat(subChat(jungleBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        storeToStorage();
                        //sendToSocket();
                        API.sendChat(jungleBot.chat.kill);
                        jungleBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(jungleBot.chat.currentlang, {
                            language: jungleBot.settings.language
                        }));
                        var argument = msg.substring(cmd.length + 1);

                        $.get('https://rawgit.com/HarryMcKenzie/source/master/lang/langIndex.json', function(json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === 'undefined') {
                                API.sendChat(subChat(jungleBot.chat.langerror, {
                                    link: 'http://git.io/vJ9nI'
                                }));
                            } else {
                                jungleBot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(jungleBot.chat.langset, {
                                    language: jungleBot.settings.language
                                }));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var ind = jungleBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            jungleBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(jungleBot.chat.rouletteleave, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = jungleBot.userUtilities.lookupUser(chat.uid);
                        var perm = jungleBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= API.ROLE.DJ || isDj) {
                            if (media.format === 1) {
                                var linkToSong = 'https://youtu.be/' + media.cid;
                                API.sendChat(subChat(jungleBot.chat.songlink, {
                                    name: from,
                                    link: linkToSong
                                }));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function(sound) {
                                    API.sendChat(subChat(jungleBot.chat.songlink, {
                                        name: from,
                                        link: sound.permalink_url
                                    }));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        jungleBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = jungleBot.settings.lockdownEnabled;
                        jungleBot.settings.lockdownEnabled = !temp;
                        if (jungleBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.lockdown
                            }));
                        } else return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                            name: chat.un,
                            'function': jungleBot.chat.lockdown
                        }));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.lockGuard) {
                            jungleBot.settings.lockGuard = !jungleBot.settings.lockGuard;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.lockguard
                            }));
                        } else {
                            jungleBot.settings.lockGuard = !jungleBot.settings.lockGuard;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.lockguard
                            }));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            jungleBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(jungleBot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                jungleBot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    jungleBot.room.skippable = false;
                                    setTimeout(function() {
                                        jungleBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        jungleBot.userUtilities.moveUser(id, jungleBot.settings.lockskipPosition, false);
                                        jungleBot.room.queueable = true;
                                        setTimeout(function() {
                                            jungleBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < jungleBot.settings.lockskipReasons.length; i++) {
                                var r = jungleBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += jungleBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(jungleBot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                jungleBot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    jungleBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function() {
                                        jungleBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        jungleBot.userUtilities.moveUser(id, jungleBot.settings.lockskipPosition, false);
                                        jungleBot.room.queueable = true;
                                        setTimeout(function() {
                                            jungleBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== '') {
                            jungleBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(jungleBot.chat.lockguardtime, {
                                name: chat.un,
                                time: jungleBot.settings.maximumLocktime
                            }));
                        } else return API.sendChat(subChat(jungleBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(jungleBot.chat.logout, {
                            name: chat.un,
                            botname: jungleBot.settings.botName
                        }));
                        setTimeout(function() {
                            $('.logout').mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            jungleBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(jungleBot.chat.maxlengthtime, {
                                name: chat.un,
                                time: jungleBot.settings.maximumSongLength
                            }));
                        } else return API.sendChat(subChat(jungleBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            mehCommand: {
                command: 'meh',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $('#meh').click();
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + jungleBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!jungleBot.settings.motdEnabled) jungleBot.settings.motdEnabled = !jungleBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            jungleBot.settings.motd = argument;
                            API.sendChat(subChat(jungleBot.chat.motdset, {
                                msg: jungleBot.settings.motd
                            }));
                        } else {
                            jungleBot.settings.motdInterval = argument;
                            API.sendChat(subChat(jungleBot.chat.motdintervalset, {
                                interval: jungleBot.settings.motdInterval
                            }));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        if (user.id === jungleBot.loggedInID) return API.sendChat(subChat(jungleBot.chat.addbotwaitlist, {
                            name: chat.un
                        }));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(jungleBot.chat.move, {
                                name: chat.un
                            }));
                            jungleBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(jungleBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined') {
                                return API.sendChat(subChat(jungleBot.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permUser = jungleBot.userUtilities.getPermission(user.id);
                        if (permUser == API.ROLE.NONE) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(jungleBot.chat.mutedmaxtime, {
                                    name: chat.un,
                                    time: '45'
                                }));
                            } else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(jungleBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(jungleBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(jungleBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(jungleBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            }
                        } else API.sendChat(subChat(jungleBot.chat.muterank, {
                            name: chat.un
                        }));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof jungleBot.settings.opLink === 'string')
                            return API.sendChat(subChat(jungleBot.chat.oplist, {
                                link: jungleBot.settings.opLink
                            }));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(jungleBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        //sendToSocket();
                        storeToStorage();
                        jungleBot.disconnectAPI();
                        setTimeout(function() {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(jungleBot.chat.reload);
                        //sendToSocket();
                        storeToStorage();
                        jungleBot.disconnectAPI();
                        kill();
                        setTimeout(function() {
                            $.getScript(jungleBot.settings.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = jungleBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                } else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(jungleBot.chat.removenotinwl, {
                                name: chat.un,
                                username: name
                            }));
                        } else API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.etaRestriction) {
                            jungleBot.settings.etaRestriction = !jungleBot.settings.etaRestriction;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.etarestriction
                            }));
                        } else {
                            jungleBot.settings.etaRestriction = !jungleBot.settings.etaRestriction;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.etarestriction
                            }));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (!jungleBot.room.roulette.rouletteStatus) {
                            jungleBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof jungleBot.settings.rulesLink === 'string')
                            return API.sendChat(subChat(jungleBot.chat.roomrules, {
                                link: jungleBot.settings.rulesLink
                            }));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var woots = jungleBot.room.roomstats.totalWoots;
                        var mehs = jungleBot.room.roomstats.totalMehs;
                        var grabs = jungleBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(jungleBot.chat.sessionstats, {
                            name: from,
                            woots: woots,
                            mehs: mehs,
                            grabs: grabs
                        }));
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(jungleBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (jungleBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    jungleBot.roomUtilities.smartSkip();
                                } else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < jungleBot.settings.skipReasons.length; i++) {
                                var r = jungleBot.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += jungleBot.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(jungleBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (jungleBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    jungleBot.roomUtilities.smartSkip(msgSend);
                                } else {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            jungleBot.settings.skipPosition = pos;
                            return API.sendChat(subChat(jungleBot.chat.skippos, {
                                name: chat.un,
                                position: jungleBot.settings.skipPosition
                            }));
                        } else return API.sendChat(subChat(jungleBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.songstats) {
                            jungleBot.settings.songstats = !jungleBot.settings.songstats;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.songstats
                            }));
                        } else {
                            jungleBot.settings.songstats = !jungleBot.settings.songstats;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.songstats
                            }));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat('/me jungleBot is an open-source bot for plug.dj. More info can be found here: https://github.com/jungleBot/source');
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += jungleBot.chat.afkremoval + ': ';
                        if (jungleBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += jungleBot.chat.afksremoved + ': ' + jungleBot.room.afkList.length + '. ';
                        msg += jungleBot.chat.afklimit + ': ' + jungleBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (jungleBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.blacklist + ': ';
                        if (jungleBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.lockguard + ': ';
                        if (jungleBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.cycleguard + ': ';
                        if (jungleBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.timeguard + ': ';
                        if (jungleBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.chatfilter + ': ';
                        if (jungleBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.historyskip + ': ';
                        if (jungleBot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.voteskip + ': ';
                        if (jungleBot.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.cmddeletion + ': ';
                        if (jungleBot.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jungleBot.chat.autoskip + ': ';
                        if (jungleBot.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = jungleBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = jungleBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(jungleBot.chat.activefor, {
                            time: since
                        });

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 250){
                            firstpart = msg.substr(0, 250);
                            secondpart = msg.substr(250);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 250) {
                            var split = msg.match(/.{1,242}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat('/me ' + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        } else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = jungleBot.userUtilities.lookupUserName(name1);
                        var user2 = jungleBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(jungleBot.chat.swapinvalid, {
                            name: chat.un
                        }));
                        if (user1.id === jungleBot.loggedInID || user2.id === jungleBot.loggedInID) return API.sendChat(subChat(jungleBot.chat.addbottowaitlist, {
                            name: chat.un
                        }));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(jungleBot.chat.swapwlonly, {
                            name: chat.un
                        }));
                        API.sendChat(subChat(jungleBot.chat.swapping, {
                            'name1': name1,
                            'name2': name2
                        }));
                        if (p1 === -1) {
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function(user1, p2) {
                                jungleBot.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        } else if (p2 === -1) {
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function(user2, p1) {
                                jungleBot.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        } else if (p1 < p2) {
                            jungleBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function(user1, p2) {
                                jungleBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        } else {
                            jungleBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function(user2, p1) {
                                jungleBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof jungleBot.settings.themeLink === 'string')
                            API.sendChat(subChat(jungleBot.chat.genres, {
                                link: jungleBot.settings.themeLink
                            }));
                    }
                }
            },

            thorCommand: {
                command: 'thor',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.thorCommand) {
                            var id = chat.uid,
                                isDj = API.getDJ().id == id ? true : false,
                                from = chat.un,
                                djlist = API.getWaitList(),
                                inDjList = false,
                                oldTime = 0,
                                usedThor = false,
                                indexArrUsedThor,
                                thorCd = false,
                                timeInMinutes = 0,
								pos = API.getWaitListPosition(chat.uid),
                                worthyAlg = Math.floor(Math.random() * pos) + 1,
                                worthy = worthyAlg == 1 ? true : false;

                            // sly benzi 👀
                            if (botCreatorIDs.indexOf(id) > -1) {
                                worthy = true;
                            }


                            for (var i = 0; i < djlist.length; i++) {
                                if (djlist[i].id == id)
                                    inDjList = true;
                            }

                            if (inDjList) {
                                for (var i = 0; i < jungleBot.room.usersUsedThor.length; i++) {
                                    if (jungleBot.room.usersUsedThor[i].id == id) {
                                        oldTime = jungleBot.room.usersUsedThor[i].time;
                                        usedThor = true;
                                        indexArrUsedThor = i;
                                    }
                                }

                                if (usedThor) {
                                    timeInMinutes = (jungleBot.settings.thorCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                    thorCd = timeInMinutes > 0 ? true : false;
                                    if (thorCd == false)
                                        jungleBot.room.usersUsedThor.splice(indexArrUsedThor, 1);
                                }

                                if (thorCd == false || usedThor == false) {
                                    var user = {
                                        id: id,
                                        time: Date.now()
                                    };
                                    jungleBot.room.usersUsedThor.push(user);
                                }
                            }

                            if (!inDjList) {
                                return API.sendChat(subChat(jungleBot.chat.thorNotClose, {
                                    name: from
                                }));
                            } else if (thorCd) {
                                return API.sendChat(subChat(jungleBot.chat.thorcd, {
                                    name: from,
                                    time: timeInMinutes
                                }));
                            }

                            if (worthy) {
                                if (API.getWaitListPosition(id) != 0)
                                    jungleBot.userUtilities.moveUser(id, 1, false);
                                API.sendChat(subChat(jungleBot.chat.thorWorthy, {
                                    name: from
                                }));
                            } else {
                                if (API.getWaitListPosition(id) != djlist.length - 1)
                                    jungleBot.userUtilities.moveUser(id, djlist.length, false);
                                API.sendChat(subChat(jungleBot.chat.thorNotWorthy, {
                                    name: from
                                }));
                            }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.timeGuard) {
                            jungleBot.settings.timeGuard = !jungleBot.settings.timeGuard;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.timeguard
                            }));
                        } else {
                            jungleBot.settings.timeGuard = !jungleBot.settings.timeGuard;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.timeguard
                            }));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = jungleBot.settings.blacklistEnabled;
                        jungleBot.settings.blacklistEnabled = !temp;
                        if (jungleBot.settings.blacklistEnabled) {
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.blacklist
                            }));
                        } else return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                            name: chat.un,
                            'function': jungleBot.chat.blacklist
                        }));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.motdEnabled) {
                            jungleBot.settings.motdEnabled = !jungleBot.settings.motdEnabled;
                            API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.motd
                            }));
                        } else {
                            jungleBot.settings.motdEnabled = !jungleBot.settings.motdEnabled;
                            API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.motd
                            }));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.voteSkip) {
                            jungleBot.settings.voteSkip = !jungleBot.settings.voteSkip;
                            API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.voteskip
                            }));
                        } else {
                            jungleBot.settings.voteSkip = !jungleBot.settings.voteSkip;
                            API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.voteskip
                            }));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/bans', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) return API.sendChat(subChat(jungleBot.chat.notbanned, {
                                name: chat.un
                            }));
                            API.moderateUnbanUser(bannedUser.id);
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        jungleBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/mutes', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var arg = msg.substring(cmd.length + 1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = jungleBot.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all') {
                                if (permFrom > API.ROLE.BOUNCER) {
                                    for (var i = 0; i < mutedUsers.length; i++) {
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(jungleBot.chat.unmutedeveryone, {
                                        name: chat.un
                                    }));
                                } else API.sendChat(subChat(jungleBot.chat.unmuteeveryonerank, {
                                    name: chat.un
                                }));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++) {
                                    var user = mutedUsers[i];
                                    if (user.username === name) {
                                        mutedUser = user;
                                        found = true;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(jungleBot.chat.notbanned, {
                                    name: chat.un
                                }));
                                API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            uptimeCommand: {
                command: 'uptime',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var launchT = jungleBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = jungleBot.roomUtilities.msToStr(durationOnline);
                        API.sendChat(subChat(jungleBot.chat.activefor, {
                            time: since
                        }));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            jungleBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(jungleBot.chat.commandscd, {
                                name: chat.un,
                                time: jungleBot.settings.commandCooldown
                            }));
                        } else return API.sendChat(subChat(jungleBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.usercommands
                            }));
                            jungleBot.settings.usercommandsEnabled = !jungleBot.settings.usercommandsEnabled;
                        } else {
                            API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.usercommands
                            }));
                            jungleBot.settings.usercommandsEnabled = !jungleBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jungleBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = jungleBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(jungleBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(jungleBot.chat.voteratio, {
                            name: chat.un,
                            username: name,
                            woot: vratio.woot,
                            mehs: vratio.meh,
                            ratio: ratio.toFixed(2)
                        }));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(jungleBot.chat.voteskiplimit, {
                            name: chat.un,
                            limit: jungleBot.settings.voteSkipLimit
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (!jungleBot.settings.voteSkip) jungleBot.settings.voteSkip = !jungleBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(jungleBot.chat.voteskipinvalidlimit, {
                                name: chat.un
                            }));
                        } else {
                            jungleBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(jungleBot.chat.voteskipsetlimit, {
                                name: chat.un,
                                limit: jungleBot.settings.voteSkipLimit
                            }));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (jungleBot.settings.welcome) {
                            jungleBot.settings.welcome = !jungleBot.settings.welcome;
                            return API.sendChat(subChat(jungleBot.chat.toggleoff, {
                                name: chat.un,
                                'function': jungleBot.chat.welcomemsg
                            }));
                        } else {
                            jungleBot.settings.welcome = !jungleBot.settings.welcome;
                            return API.sendChat(subChat(jungleBot.chat.toggleon, {
                                name: chat.un,
                                'function': jungleBot.chat.welcomemsg
                            }));
                        }
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {

                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;

                                if (rawlang == 'en') {
                                    var language = 'English';
                                } else if (rawlang == 'bg') {
                                    var language = 'Bulgarian';
                                } else if (rawlang == 'cs') {
                                    var language = 'Czech';
                                } else if (rawlang == 'fi') {
                                    var language = 'Finnish';
                                } else if (rawlang == 'fr') {
                                    var language = 'French';
                                } else if (rawlang == 'pt') {
                                    var language = 'Portuguese';
                                } else if (rawlang == 'zh') {
                                    var language = 'Chinese';
                                } else if (rawlang == 'sk') {
                                    var language = 'Slovak';
                                } else if (rawlang == 'nl') {
                                    var language = 'Dutch';
                                } else if (rawlang == 'ms') {
                                    var language = 'Malay';
                                }

                                var rawrank = API.getUser(id);

                                if (rawrank.role == API.ROLE.NONE) {
                                    var rank = 'User';
                                } else if (rawrank.role == API.ROLE.DJ) {
                                    var rank = 'Resident DJ';
                                } else if (rawrank.role == API.ROLE.BOUNCER) {
                                    var rank = 'Bouncer';
                                } else if (rawrank.role == API.ROLE.MANAGER) {
                                    var rank = 'Manager';
                                } else if (rawrank.role == API.ROLE.COHOST) {
                                    var rank = 'Co-Host';
                                } else if (rawrank.role == API.ROLE.HOST) {
                                    var rank = 'Host';
                                }

                                if (rawrank.gRole == 3000) {
                                    var rank = 'Brand Ambassador';
                                } else if (rawrank.gRole == 5000) {
                                    var rank = 'Admin';
                                }

                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = 'https://plug.dj/@/' + slug;
                                } else {
                                    var profile = '~';
                                }

                                API.sendChat(subChat(jungleBot.chat.whois, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id,
                                    avatar: avatar,
                                    profile: profile,
                                    language: language,
                                    level: level,
                                    joined: joined,
                                    rank: rank
                                }));
                            }
                        }
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!jungleBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof jungleBot.settings.youtubeLink === 'string')
                            API.sendChat(subChat(jungleBot.chat.youtube, {
                                name: chat.un,
                                link: jungleBot.settings.youtubeLink
                            }));
                    }
                }
            }
        }
    };

    loadChat(jungleBot.startup);
}).call(this);
