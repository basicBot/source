/**

 Copyright © 2014-2018 alertBot

 Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.

 */

 (function() {

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem('alertBotRoom'));
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
        clearInterval(alertBot.room.autodisableInterval);
        clearInterval(alertBot.room.afkInterval);
        alertBot.status = false;
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
        var alertBotSettings = alertBot.settings;
        var alertBotRoom = alertBot.room;
        var alertBotInfo = {
            time: Date.now(),
            version: alertBot.version
        };
        var data = {
            users: API.getUsers(),
            userinfo: API.getUser(),
            room: location.pathname,
            alertBotSettings: alertBotSettings,
            alertBotRoom: alertBotRoom,
            alertBotInfo: alertBotInfo
        };
        return sock.msg(data);
    };
    */

    var storeToStorage = function() {
        localStorage.setItem('alertBotsettings', JSON.stringify(alertBot.settings));
        localStorage.setItem('alertBotRoom', JSON.stringify(alertBot.room));
        var alertBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: alertBot.version
        };
        localStorage.setItem('alertBotStorageInfo', JSON.stringify(alertBotStorageInfo));
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
            var link = alertBot.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[alertBot.settings.language.toLowerCase()];
                if (alertBot.settings.chatLink !== alertBot.chatLink) {
                    link = alertBot.settings.chatLink;
                } else {
                    if (typeof link === 'undefined') {
                        link = alertBot.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        alertBot.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(alertBot.chatLink, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        alertBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem('alertBotsettings'));
        if (settings !== null) {
            for (var prop in settings) {
                alertBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem('alertBotStorageInfo');
        if (info === null) API.chatLog(alertBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem('alertBotsettings'));
            var room = JSON.parse(localStorage.getItem('alertBotRoom'));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(alertBot.chat.retrievingdata);
                for (var prop in settings) {
                    alertBot.settings[prop] = settings[prop];
                }
                alertBot.room.users = room.users;
                alertBot.room.afkList = room.afkList;
                alertBot.room.historyList = room.historyList;
                alertBot.room.mutedUsers = room.mutedUsers;
                //alertBot.room.autoskip = room.autoskip;
                alertBot.room.roomstats = room.roomstats;
                alertBot.room.messages = room.messages;
                alertBot.room.queue = room.queue;
                alertBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(alertBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var info = _.find(require.s.contexts._.defined, (m) => m && m.attributes && 'hostID' in m.attributes).get('long_description');
        var ref_bot = '@alertBot=';
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
                        alertBot.settings[prop] = json_sett[prop];
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

    var alertBot = {
        version: '2.12.2',
        status: false,
        name: 'alertBot',
        loggedInID: null,
        scriptLink: 'https://rawgit.com/HarryMcKenzie/source/master/alertBot.js',
        cmdLink: 'http://git.io/245Ppg',
        chatLink: 'https://rawgit.com/HarryMcKenzie/source/master/lang/en.json',
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
        botName: 'alertBot',
  			language: 'english',
  			chatLink: 'https://rawgit.com/HarryMcKenzie/source/master/lang/en.json',
  			scriptLink: 'https://rawgit.com/HarryMcKenzie/source/master/alertBot.js',
  			roomLock: false, // Requires an extension to re-load the script
  			startupCap: 50, // 1-200
  			startupVolume: 0, // 0-100
  			startupEmoji: false, // true or false
  			autowoot: false,
  			autoskip: false,
  			smartSkip: false,
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
  			skipReasons: [],
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
  			intervalMessages: [],
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
                if (alertBot.status && alertBot.settings.autodisable) {
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
                    alertBot.room.roulette.rouletteStatus = true;
                    alertBot.room.roulette.countdown = setTimeout(function() {
                        alertBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(alertBot.chat.isopen);
                },
                endRoulette: function() {
                    alertBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * alertBot.room.roulette.participants.length);
                    var winner = alertBot.room.roulette.participants[ind];
                    alertBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = alertBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(alertBot.chat.winnerpicked, {
                        name: name,
                        position: pos
                    }));
                    setTimeout(function(winner, pos) {
                        alertBot.userUtilities.moveUser(winner, pos, false);
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
                      var users = alertBot.room.users;
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
                user.lastDC.songCount = alertBot.room.roomstats.songCount;
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
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === id) {
                        return alertBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    var match = alertBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return alertBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function(id) {
                var user = alertBot.userUtilities.lookupUser(id);
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
                var user = alertBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < alertBot.room.queue.id.length; i++) {
                            if (alertBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            alertBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(alertBot.chat.alreadyadding, {
                                position: alertBot.room.queue.position[alreadyQueued]
                            }));
                        }
                        alertBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            alertBot.room.queue.id.unshift(id);
                            alertBot.room.queue.position.unshift(pos);
                        } else {
                            alertBot.room.queue.id.push(id);
                            alertBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(alertBot.chat.adding, {
                            name: name,
                            position: alertBot.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = alertBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return alertBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(alertBot.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return alertBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (alertBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = alertBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(alertBot.chat.toolongago, {
                    name: alertBot.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = alertBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = alertBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(alertBot.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(alertBot.chat.valid, {
                    name: alertBot.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                alertBot.userUtilities.moveUser(user.id, newPosition, true);
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
                    API.moderateLockWaitList(!alertBot.roomUtilities.booth.locked);
                    alertBot.roomUtilities.booth.locked = false;
                    if (alertBot.settings.lockGuard) {
                        alertBot.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(alertBot.roomUtilities.booth.locked);
                        }, alertBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(alertBot.roomUtilities.booth.locked);
                    clearTimeout(alertBot.roomUtilities.booth.lockTimer);
                      }
                  },

            afkCheck: function() {
                if (!alertBot.status || !alertBot.settings.afkRemoval) return void(0);
                var rank = alertBot.roomUtilities.rankToNumber(alertBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, alertBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = alertBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = alertBot.userUtilities.getUser(user);
                            if (rank !== null && alertBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = alertBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = alertBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                          /*
                                //Prevent users that were in the room but not in queue to be affected by afk removal

                                if (inactivity > alertBot.settings.maximumAfk * 60 * 1500) {

                                    alertBot.userUtilities.setLastActivity(user);

                                }

                          */
                                if (inactivity > alertBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(alertBot.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(alertBot.chat.warning2, {
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
                                            alertBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(alertBot.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: alertBot.settings.maximumAfk
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
                alertBot.room.queueable = false;

                if (waitlistlength == 50) {
                    alertBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 1);
                    alertBot.room.skippable = false;
                    setTimeout(function() {
                        alertBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        alertBot.userUtilities.moveUser(id, alertBot.settings.skipPosition, false);
                        alertBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                alertBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks if shouldCycle is true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(alertBot.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (alertBot.settings.cycleGuard) { // Is cycle guard on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                            alertBot.room.cycleTimer = setTimeout(function() { // Start timer
                                API.moderateDJCycle(false); // Disable cycle
                            }, alertBot.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function() {
                var interval;
                if (alertBot.settings.motdEnabled) interval = alertBot.settings.motdInterval;
                else interval = alertBot.settings.messageInterval;
                if ((alertBot.room.roomstats.songCount % interval) === 0 && alertBot.status) {
                    var msg;
                    if (alertBot.settings.motdEnabled) {
                        msg = alertBot.settings.motd;
                    } else {
                        if (alertBot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = alertBot.room.roomstats.songCount % alertBot.settings.intervalMessages.length;
                        msg = alertBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in alertBot.settings.blacklists) {
                    alertBot.room.blacklists[bl] = [];
                    if (typeof alertBot.settings.blacklists[bl] === 'function') {
                        alertBot.room.blacklists[bl] = alertBot.settings.blacklists();
                    } else if (typeof alertBot.settings.blacklists[bl] === 'string') {
                        if (alertBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.get(alertBot.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    alertBot.room.blacklists[l] = list;
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
                    console.table(alertBot.room.newBlacklisted);
                } else {
                    console.log(alertBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < alertBot.room.newBlacklisted.length; i++) {
                    var track = alertBot.room.newBlacklisted[i];
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

                alertBot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === chat.uid) {
                        alertBot.userUtilities.setLastActivity(alertBot.room.users[i]);
                        if (alertBot.room.users[i].username !== chat.un) {
                            alertBot.room.users[i].username = chat.un;
                        }
                    }
                }
                if (alertBot.chatUtilities.chatFilter(chat)) return void(0);
                if (!alertBot.chatUtilities.commandCheck(chat))
                    alertBot.chatUtilities.action(chat);
            },
            eventUserjoin: function(user) {
                var known = false;
                var index = null;
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === user.id) {
                        known = true;
                        index = i;
                    }
                }
                var greet = true;
                var welcomeback = null;
                if (known) {
                    alertBot.room.users[index].inRoom = true;
                    var u = alertBot.userUtilities.lookupUser(user.id);
                    var jt = u.jointime;
                    var t = Date.now() - jt;
                    if (t < 10 * 1000) greet = false;
                    else welcomeback = true;
                } else {
                    alertBot.room.users.push(new alertBot.User(user.id, user.username));
                    welcomeback = false;
                }
                for (var j = 0; j < alertBot.room.users.length; j++) {
                    if (alertBot.userUtilities.getUser(alertBot.room.users[j]).id === user.id) {
                        alertBot.userUtilities.setLastActivity(alertBot.room.users[j]);
                        alertBot.room.users[j].jointime = Date.now();
                    }

                }

                if (botCreatorIDs.indexOf(user.id) > -1) {
                  console.log(true);
                    API.sendChat('@'+user.username+' '+':sparkles: :bow: :sparkles:');
                } else if (alertBot.settings.welcome && greet) {
                  console.log(false);
                  console.log(botCreatorIDs);
                    welcomeback ?
                        setTimeout(function(user) {
                            API.sendChat(subChat(alertBot.chat.welcomeback, {
                                name: user.username
                            }));
                        }, 1 * 1000, user) :
                        setTimeout(function(user) {
                            API.sendChat(subChat(alertBot.chat.welcome, {
                                name: user.username
                            }));
                        }, 1 * 1000, user);
                }
            },
            eventUserleave: function(user) {
                var lastDJ = API.getHistory()[0].user.id;
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === user.id) {
                        alertBot.userUtilities.updateDC(alertBot.room.users[i]);
                        alertBot.room.users[i].inRoom = false;
                        if (lastDJ == user.id) {
                            var user = alertBot.userUtilities.lookupUser(alertBot.room.users[i].id);
                            alertBot.userUtilities.updatePosition(user, 0);
                            user.lastDC.time = null;
                            user.lastDC.position = user.lastKnownPosition;
                        }
                    }
                }
            },
            eventVoteupdate: function(obj) {
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === obj.user.id) {
                        if (obj.vote === 1) {
                            alertBot.room.users[i].votes.woot++;
                        } else {
                            alertBot.room.users[i].votes.meh++;
                        }
                    }
                }

                var mehs = API.getScore().negative;
                var woots = API.getScore().positive;
                var dj = API.getDJ();
                var timeLeft = API.getTimeRemaining();
                var timeElapsed = API.getTimeElapsed();

                if (alertBot.settings.voteSkip) {
                    if ((mehs - woots) >= (alertBot.settings.voteSkipLimit)) {
                        API.sendChat(subChat(alertBot.chat.voteskipexceededlimit, {
                            name: dj.username,
                            limit: alertBot.settings.voteSkipLimit
                        }));
                        if (alertBot.settings.smartSkip && timeLeft > timeElapsed) {
                            alertBot.roomUtilities.smartSkip();
                        } else {
                            API.moderateForceSkip();
                        }
                    }
                }

            },
            eventCurateupdate: function(obj) {
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === obj.user.id) {
                        alertBot.room.users[i].votes.curate++;
                    }
                }
            },
            eventDjadvance: function(obj) {
                if (!obj.dj) return;
                if (alertBot.settings.autowoot) {
                    $('#woot').click(); // autowoot
                }

                var user = alertBot.userUtilities.lookupUser(obj.dj.id)
                for (var i = 0; i < alertBot.room.users.length; i++) {
                    if (alertBot.room.users[i].id === user.id) {
                        alertBot.room.users[i].lastDC = {
                            time: null,
                            position: null,
                            songCount: 0
                        };
                    }
                }

                var lastplay = obj.lastPlay;
                if (typeof lastplay === 'undefined') return;
                if (alertBot.settings.songstats) {
                    if (typeof alertBot.chat.songstatistics === 'undefined') {
                        API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'W/' + lastplay.score.grabs + 'G/' + lastplay.score.negative + 'M.')
                    } else {
                        API.sendChat(subChat(alertBot.chat.songstatistics, {
                            artist: lastplay.media.author,
                            title: lastplay.media.title,
                            woots: lastplay.score.positive,
                            grabs: lastplay.score.grabs,
                            mehs: lastplay.score.negative
                        }))
                    }
                }
                alertBot.room.roomstats.totalWoots += lastplay.score.positive;
                alertBot.room.roomstats.totalMehs += lastplay.score.negative;
                alertBot.room.roomstats.totalCurates += lastplay.score.grabs;
                alertBot.room.roomstats.songCount++;
                alertBot.roomUtilities.intervalMessage();
                alertBot.room.currentDJID = obj.dj.id;

                var blacklistSkip = setTimeout(function() {
                    var mid = obj.media.format + ':' + obj.media.cid;
                    for (var bl in alertBot.room.blacklists) {
                        if (alertBot.settings.blacklistEnabled) {
                            if (alertBot.room.blacklists[bl].indexOf(mid) > -1) {
                                API.sendChat(subChat(alertBot.chat.isblacklisted, {
                                    blacklist: bl
                                }));
                                if (alertBot.settings.smartSkip) {
                                    return alertBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        }
                    }
                }, 1);
                var newMedia = obj.media;
                clearTimeout(alertBot.room.tgSkip);
                var timeLimitSkip = setTimeout(function() {
                    if (alertBot.settings.timeGuard && newMedia.duration > alertBot.settings.maximumSongLength * 60 && !alertBot.room.roomevent) {
                        if (typeof alertBot.settings.strictTimeGuard === 'undefined' || alertBot.settings.strictTimeGuard) {
                            var name = obj.dj.username;
                            API.sendChat(subChat(alertBot.chat.timelimit, {
                                name: name,
                                maxlength: alertBot.settings.maximumSongLength
                            }));
                            if (alertBot.settings.smartSkip) {
                                return alertBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        } else {
                            alertBot.room.tgSkip = setTimeout(function() {
                                if (alertBot.settings.timeGuard) return API.moderateForceSkip();
                                return;
                            }, alertBot.settings.maximumSongLength*60*1000);
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
                                API.sendChat(subChat(alertBot.chat.notavailable, {
                                    name: name
                                }));
                                if (alertBot.settings.smartSkip) {
                                    return alertBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        });
                    } else {
                        var checkSong = SC.get('/tracks/' + cid, function(track) {
                            if (typeof track.title === 'undefined') {
                                var name = obj.dj.username;
                                API.sendChat(subChat(alertBot.chat.notavailable, {
                                    name: name
                                }));
                                if (alertBot.settings.smartSkip) {
                                    return alertBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        });
                    }
                }, 1);
                clearTimeout(historySkip);
                if (alertBot.settings.historySkip) {
                    var alreadyPlayed = false;
                    var apihistory = API.getHistory();
                    var name = obj.dj.username;
                    var historySkip = setTimeout(function() {
                        for (var i = 0; i < apihistory.length; i++) {
                            if (apihistory[i].media.cid === obj.media.cid) {
                                alertBot.room.historyList[i].push(+new Date());
                                alreadyPlayed = true;
                                API.sendChat(subChat(alertBot.chat.songknown, {
                                    name: name
                                }));
                                if (alertBot.settings.smartSkip) {
                                    return alertBot.roomUtilities.smartSkip();
                                } else {
                                    return API.moderateForceSkip();
                                }
                            }
                        }
                        if (!alreadyPlayed) {
                            alertBot.room.historyList.push([obj.media.cid, +new Date()]);
                        }
                    }, 1);
                }
                if (user.ownSong) {
                    API.sendChat(subChat(alertBot.chat.permissionownsong, {
                        name: user.username
                    }));
                    user.ownSong = false;
                }
                clearTimeout(alertBot.room.autoskipTimer);
                if (alertBot.settings.autoskip) {
                    var remaining = obj.media.duration * 1000;
                    var startcid = API.getMedia().cid;
                    alertBot.room.autoskipTimer = setTimeout(function() {
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
                    if (alertBot.room.queue.id.length > 0 && alertBot.room.queueable) {
                        alertBot.room.queueable = false;
                        setTimeout(function() {
                            alertBot.room.queueable = true;
                        }, 500);
                        alertBot.room.queueing++;
                        var id, pos;
                        setTimeout(
                            function() {
                                id = alertBot.room.queue.id.splice(0, 1)[0];
                                pos = alertBot.room.queue.position.splice(0, 1)[0];
                                API.moderateAddDJ(id, pos);
                                setTimeout(
                                    function(id, pos) {
                                        API.moderateMoveDJ(id, pos);
                                        alertBot.room.queueing--;
                                        if (alertBot.room.queue.id.length === 0) setTimeout(function() {
                                            alertBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1000, id, pos);
                            }, 1000 + alertBot.room.queueing * 2500);
                    }
                }
                for (var i = 0; i < users.length; i++) {
                    var user = alertBot.userUtilities.lookupUser(users[i].id);
                    alertBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
                }
            },

            chatcleaner: function(chat) {
                if (!alertBot.settings.filterChat) return false;
                if (alertBot.userUtilities.getPermission(chat.uid) >= API.ROLE.BOUNCER) return false;
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
                    API.sendChat(subChat(alertBot.chat.caps, {
                        name: chat.un
                    }));
                    return true;
                }
                msg = msg.toLowerCase();
                if (msg === 'skip') {
                    API.sendChat(subChat(alertBot.chat.askskip, {
                        name: chat.un
                    }));
                    return true;
                }
                for (var j = 0; j < alertBot.chatUtilities.spam.length; j++) {
                    if (msg === alertBot.chatUtilities.spam[j]) {
                        API.sendChat(subChat(alertBot.chat.spam, {
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
                  var perm = alertBot.userUtilities.getPermission(chat.uid);
                  var user = alertBot.userUtilities.lookupUser(chat.uid);
                  var isMuted = false;
                  for (var i = 0; i < alertBot.room.mutedUsers.length; i++) {
                      if (alertBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                  }
                  if (isMuted) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }
                  if (alertBot.settings.lockdownEnabled) {
                      if (perm === API.ROLE.NONE) {
                          API.moderateDeleteChat(chat.cid);
                          return true;
                      }
                  }
                  if (alertBot.chatcleaner(chat)) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }
                  if (alertBot.settings.cmdDeletion && msg.startsWith(alertBot.settings.commandLiteral)) {
                      API.moderateDeleteChat(chat.cid);
                  }
                  /**
                   var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                   if (plugRoomLinkPatt.exec(msg)) {
                      if (perm === API.ROLE.NONE) {
                          API.sendChat(subChat(alertBot.chat.roomadvertising, {name: chat.un}));
                          API.moderateDeleteChat(chat.cid);
                          return true;
                      }
                  }
                   **/
                  if (msg.indexOf('http://adf.ly/') > -1) {
                      API.moderateDeleteChat(chat.cid);
                      API.sendChat(subChat(alertBot.chat.adfly, {
                          name: chat.un
                      }));
                      return true;
                  }
                  if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                      API.moderateDeleteChat(chat.cid);
                      return true;
                  }

                  var rlJoinChat = alertBot.chat.roulettejoin;
                  var rlLeaveChat = alertBot.chat.rouletteleave;

                  var joinedroulette = rlJoinChat.split('%%NAME%%');
                  if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                  else joinedroulette = joinedroulette[0];

                  var leftroulette = rlLeaveChat.split('%%NAME%%');
                  if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                  else leftroulette = leftroulette[0];

                  if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === alertBot.loggedInID) {
                      setTimeout(function(id) {
                          API.moderateDeleteChat(id);
                      }, 5 * 1000, chat.cid);
                      return true;
                  }
                  return false;
              },
                commandCheck: function(chat) {
                    var cmd;
                    if (chat.message.charAt(0) === alertBot.settings.commandLiteral) {
                        var space = chat.message.indexOf(' ');
                        if (space === -1) {
                            cmd = chat.message;
                        } else cmd = chat.message.substring(0, space);
                    } else return false;
                    var userPerm = alertBot.userUtilities.getPermission(chat.uid);
                    //console.log('name: ' + chat.un + ', perm: ' + userPerm);
                    if (chat.message !== alertBot.settings.commandLiteral + 'join' && chat.message !== alertBot.settings.commandLiteral + 'leave') {
                        if (userPerm === API.ROLE.NONE && !alertBot.room.usercommand) return void(0);
                        if (!alertBot.room.allcommand) return void(0);
                    }
                    if (chat.message === alertBot.settings.commandLiteral + 'eta' && alertBot.settings.etaRestriction) {
                        if (userPerm < API.ROLE.BOUNCER) {
                            var u = alertBot.userUtilities.lookupUser(chat.uid);
                            if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                                API.moderateDeleteChat(chat.cid);
                                return void(0);
                            } else u.lastEta = Date.now();
                        }
                    }
                    var executed = false;

                    for (var comm in alertBot.commands) {
                        var cmdCall = alertBot.commands[comm].command;
                        if (!Array.isArray(cmdCall)) {
                            cmdCall = [cmdCall]
                        }
                        for (var i = 0; i < cmdCall.length; i++) {
                            if (alertBot.settings.commandLiteral + cmdCall[i] === cmd) {
                                alertBot.commands[comm].functionality(chat, alertBot.settings.commandLiteral + cmdCall[i]);
                                executed = true;
                                break;
                            }
                        }
                    }

                    if (executed && userPerm === API.ROLE.NONE) {
                        alertBot.room.usercommand = false;
                        setTimeout(function() {
                            alertBot.room.usercommand = true;
                        }, alertBot.settings.commandCooldown * 1000);
                    }
                    if (executed) {
                        /*if (alertBot.settings.cmdDeletion) {
                            API.moderateDeleteChat(chat.cid);
                        }*/

                        //alertBot.room.allcommand = false;
                        //setTimeout(function () {
                        alertBot.room.allcommand = true;
                        //}, 5 * 1000);
                    }
                    return executed;
                },
                action: function(chat) {
                    var user = alertBot.userUtilities.lookupUser(chat.uid);
                    if (chat.type === 'message') {
                        for (var j = 0; j < alertBot.room.users.length; j++) {
                            if (alertBot.userUtilities.getUser(alertBot.room.users[j]).id === chat.uid) {
                                alertBot.userUtilities.setLastActivity(alertBot.room.users[j]);
                            }

                        }
                    }
                    alertBot.room.roomstats.chatmessages++;
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
                if (alertBot.userUtilities.getPermission(u) < API.ROLE.BOUNCER) return API.chatLog(alertBot.chat.greyuser);
                if (alertBot.userUtilities.getPermission(u) === API.ROLE.BOUNCER) API.chatLog(alertBot.chat.bouncer);
                alertBot.connectAPI();
                API.moderateDeleteChat = function(cid) {
                    $.ajax({
                        url: '/_/chat/' + cid,
                        type: 'DELETE'
                    })
                };

                alertBot.room.name = window.location.pathname;
                var Check;

                console.log(alertBot.room.name);

                var detect = function() {
                    if (alertBot.room.name != window.location.pathname) {
                        console.log('Killing bot after room change.');
                        storeToStorage();
                        alertBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                        if (alertBot.settings.roomLock) {
                            window.location = alertBot.room.name;
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
                window.bot = alertBot;
                alertBot.roomUtilities.updateBlacklists();
                setInterval(alertBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
                alertBot.getNewBlacklistedSongs = alertBot.roomUtilities.exportNewBlacklistedSongs;
                alertBot.logNewBlacklistedSongs = alertBot.roomUtilities.logNewBlacklistedSongs;
                if (alertBot.room.roomstats.launchTime === null) {
                    alertBot.room.roomstats.launchTime = Date.now();
                }

                for (var j = 0; j < alertBot.room.users.length; j++) {
                    alertBot.room.users[j].inRoom = false;
                }
                var userlist = API.getUsers();
                for (var i = 0; i < userlist.length; i++) {
                    var known = false;
                    var ind = null;
                    for (var j = 0; j < alertBot.room.users.length; j++) {
                        if (alertBot.room.users[j].id === userlist[i].id) {
                            known = true;
                            ind = j;
                        }
                    }
                    if (known) {
                        alertBot.room.users[ind].inRoom = true;
                    } else {
                        alertBot.room.users.push(new alertBot.User(userlist[i].id, userlist[i].username));
                        ind = alertBot.room.users.length - 1;
                    }
                    var wlIndex = API.getWaitListPosition(alertBot.room.users[ind].id) + 1;
                    alertBot.userUtilities.updatePosition(alertBot.room.users[ind], wlIndex);
                }
                alertBot.room.afkInterval = setInterval(function() {
                    alertBot.roomUtilities.afkCheck()
                }, 10 * 1000);
                alertBot.room.autodisableInterval = setInterval(function() {
                    alertBot.room.autodisableFunc();
                }, 60 * 60 * 1000);
                alertBot.loggedInID = API.getUser().id;
                alertBot.status = true;
                API.sendChat('/cap ' + alertBot.settings.startupCap);
                API.setVolume(alertBot.settings.startupVolume);
                if (alertBot.settings.autowoot) {
                    $('#woot').click();
                }
                if (alertBot.settings.startupEmoji) {
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
                API.chatLog('Avatars capped at ' + alertBot.settings.startupCap);
                API.chatLog('Volume set to ' + alertBot.settings.startupVolume);
                //socket();
                loadChat(API.sendChat(subChat(alertBot.chat.online, {
                    botname: alertBot.settings.botName,
                    version: alertBot.version
                })));
            },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = alertBot.userUtilities.getPermission(id);
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
                        if (alertBot.settings.bouncerPlus) {
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



            idCommand: {
                command: 'iduser',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!alertBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 1);
                        }
                    }
                    var id = alertBot.userUtilities.getID(name);

                    if (id) {
                      API.sendChat('/me @' + chat.un + ' ' + name + '\'s ID is "' + id + '".');
                    }
                    else {
                      API.sendChat('/me @' + chat.un + ' Invalid user specified.');
                       }

                      }
                   },


    loadChat(alertBot.startup);
}).call(this);
