var plugCubed;
window._trackJs = {
    token: 'cf5080f9fb404dcea25d40b82ceff544',
    network: {
        error: false
    },
    userId: API.getUser().id
};
if (typeof plugCubed !== 'undefined')
    plugCubed.close();
if ($('#plugcubed-tracker').length < 1)
    $('head').append($('<script>').attr('src', 'https://d2zah9y47r7bi2.cloudfront.net/releases/current/tracker.js').attr({
        id: 'plugcubed-tracker',
        'data-token': 'cf5080f9fb404dcea25d40b82ceff544'
    }));
/**
 Simple JavaScript Inheritance
 By John Resig http://ejohn.org/
 MIT Licensed.

 Modified by Plug DJ, Inc.
 */
define('plugCubed/Class', [], function() {
    var e, t, n;
    e = false;
    t = /xyz/.test(function() {
        xyz
    }) ? /\b_super\b/ : /.*/;
    n = function() {};
    n.extend = function(n) {
        var r = this.prototype;

        e = true;
        var i = new this;
        e = false;

        for (var s in n) {
            if (!n.hasOwnProperty(s)) continue;
            if (typeof n[s] == "function" && typeof r[s] == "function" && t.test(n[s])) {
                i[s] = function(e, t) {
                    return function() {
                        var n = this._super;
                        this._super = r[e];
                        var i = t.apply(this, arguments);
                        this._super = n;
                        return i;
                    }
                }(s, n[s]);
            } else {
                i[s] = n[s];
            }
        }

        function Class() {
            !e && this.init && this.init.apply(this, arguments)
        }

        Class.prototype = i;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };
    return n;
});
define('plugCubed/handlers/TriggerHandler', ['jquery', 'plugCubed/Class'], function($, Class) {
    return Class.extend({
        triggerHandlers: [],
        trigger: undefined,
        registered: false,
        init: function() {
            var i;
            if (this.triggerHandlers.length > 0)
                this.close();
            this.triggerHandlers = [];
            if (this.trigger === undefined)
                throw new Error('Missing TriggerHandler trigger!');
            if (typeof this.trigger === 'string') {
                this.triggerHandlers[this.trigger] = this.handler;
            } else if ($.isArray(this.trigger)) {
                for (i in this.trigger) {
                    if (!this.trigger.hasOwnProperty(i)) continue;
                    if (typeof this[this.trigger[i]] === 'function') {
                        this.triggerHandlers[this.trigger[i]] = this[this.trigger[i]];
                    } else {
                        this.triggerHandlers[this.trigger[i]] = this.handler;
                    }
                }
            } else if ($.isPlainObject(this.trigger)) {
                for (i in this.trigger) {
                    if (!this.trigger.hasOwnProperty(i)) continue;
                    this.triggerHandlers[i] = this.trigger[i];
                }
            }
        },
        register: function() {
            var i;
            for (i in this.triggerHandlers) {
                if (!this.triggerHandlers.hasOwnProperty(i)) continue;
                if (typeof this.triggerHandlers[i] === 'function') {
                    API.on(i, this.triggerHandlers[i], this);
                }
            }
            this.registered = true;
        },
        close: function() {
            var i;
            for (i in this.triggerHandlers) {
                if (!this.triggerHandlers.hasOwnProperty(i)) continue;
                if (typeof this.triggerHandlers[i] === 'function') {
                    API.off(i, this.triggerHandlers[i], this);
                    delete this.triggerHandlers[i];
                }
            }
            this.registered = false;
        }
    });
});
define('plugCubed/Lang', ['jquery', 'plugCubed/Class'], function($, Class) {
    var language, defaultLanguage, isLoaded, _this, Lang;

    language = {};
    defaultLanguage = {};
    isLoaded = false;

    Lang = Class.extend({
        curLang: 'en',
        init: function() {
            _this = this;
            $.getJSON('https://d1rfegul30378.cloudfront.net/alpha/lang.json?_' + Date.now(), function(a) {
                _this.allLangs = a;
            }).done(function() {
                if (_this.allLangs.length === 1) API.chatLog('Error loading language informations for plugCubed', true);
                _this.loadDefault();
            }).fail(function() {
                API.chatLog('Error loading language informations for plugCubed', true);
                _this.loadDefault();
            });
        },
        /**
         * Load default language (English) from server.
         */
        loadDefault: function() {
            $.getJSON('https://d1rfegul30378.cloudfront.net/alpha/langs/lang.en.json?_' + Date.now(), function(b) {
                defaultLanguage = b;
                isLoaded = true;
            }).error(function() {
                setTimeout(function() {
                    _this.loadDefault();
                }, 500);
            });
        },
        /**
         * Load language file from server.
         * @param {Function} [callback] Optional callback that will be called on success and failure.
         */
        load: function(callback) {
            if (!isLoaded) {
                setTimeout(function() {
                    _this.load(callback);
                }, 500);
                return;
            }
            var lang = API.getUser().language;
            if (!lang || lang === 'en') {
                language = {};
                $.extend(true, language, defaultLanguage);
                this.curLang = 'en';
                if (typeof callback === 'function') callback();
                return;
            }
            $.getJSON('https://d1rfegul30378.cloudfront.net/alpha/langs/lang.' + lang + '.json?_' + Date.now(), function(a) {
                language = {};
                $.extend(true, language, defaultLanguage, a);
                _this.curLang = lang;
                if (typeof callback === 'function') callback();
            }).error(function() {
                console.log('[plugÂ³] Couldn\'t load language file for ' + lang);
                language = defaultLanguage;
                if (typeof callback === 'function') callback();
            });
        },
        /**
         * Get string from language file.
         * @param {String} selector Selector key
         * @returns {*} String from language file, if not found returns selector and additional arguments.
         */
        i18n: function(selector) {
            var a = language,
                i;
            if (a === undefined) {
                return '{' + $.makeArray(arguments).join(', ') + '}';
            }
            var key = selector.split('.');
            for (i in key) {
                if (!key.hasOwnProperty(i)) continue;
                if (a[key[i]] === undefined) {
                    return '{' + $.makeArray(arguments).join(', ') + '}';
                }
                a = a[key[i]];
            }
            if (arguments.length > 1) {
                for (i = 1; i < arguments.length; i++)
                    a = a.split('%' + i).join(arguments[i]);
            }
            return a;
        },
        allLangs: [{
            "file": "en",
            "name": "English"
        }]
    });
    return new Lang();
});
var plugCubedUserData;
define('plugCubed/Utils', ['plugCubed/Class', 'plugCubed/Lang', 'lang/Lang'], function(Class, p3Lang, Lang) {
    var cleanHTMLMessage, developer, sponsor, ambassador, donatorDiamond, donatorPlatinum, donatorGold, donatorSilver, donatorBronze, special, PopoutView, ChatFacade, Database, runLite;

    cleanHTMLMessage = function(input, disallow) {
        var allowed, tags, disallowed = [];
        if ($.isArray(disallow)) disallowed = disallow;
        allowed = $(['span', 'div', 'table', 'tr', 'td', 'br', 'br/', 'strong', 'em', 'a']).not(disallowed).get();
        if (disallow === '*') allowed = [];
        tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        return input.replace(tags, function(a, b) {
            return allowed.indexOf(b.toLowerCase()) > -1 ? a : '';
        });
    };
    developer = sponsor = ambassador = donatorDiamond = donatorPlatinum = donatorGold = donatorSilver = donatorBronze = [];
    special = {};
    runLite = !requirejs.defined('ce221/a82cc/b5033');

    if (!runLite) {
        PopoutView = require('ce221/df202/bd7f7/bc67e/e39c3');
        ChatFacade = require('ce221/f5c01/a983c');
        Database = require('ce221/b0533/e5fad');
    } else {
        ChatFacade = {
            uiLanguages: [],
            chatLanguages: []
        };
    }

    $.getJSON('https://d1rfegul30378.cloudfront.net/titles.json', function(data) {
        developer = data.developer ? data.developer : [];
        sponsor = data.sponsor ? data.sponsor : [];
        special = data.special ? data.special : {};
        ambassador = data.ambassador ? data.ambassador : [];
        if (data.donator) {
            donatorDiamond = data.donator.diamond ? data.donator.diamond : [];
            donatorPlatinum = data.donator.platinum ? data.donator.platinum : [];
            donatorGold = data.donator.gold ? data.donator.gold : [];
            donatorSilver = data.donator.silver ? data.donator.silver : [];
            donatorBronze = data.donator.bronze ? data.donator.bronze : [];
        }
    });

    var handler = Class.extend({
        runLite: runLite,
        proxifyImage: function(url) {
            if (this.startsWithIgnoreCase(url, 'http://')) {
                return 'https://api.plugCubed.net/proxy/' + url;
            }
            return url;
        },
        getHighestRank: function(userID) {
            if (this.isPlugCubedDeveloper(userID)) return 'developer';
            if (this.isPlugCubedSponsor(userID)) return 'sponsor';
            if (this.isPlugCubedSpecial(userID)) return 'special';
            if (this.isPlugCubedAmbassador(userID)) return 'ambassador';
            if (this.isPlugCubedDonatorDiamond(userID)) return 'donatorDiamond';
            if (this.isPlugCubedDonatorPlatinum(userID)) return 'donatorPlatinum';
            if (this.isPlugCubedDonatorGold(userID)) return 'donatorGold';
            if (this.isPlugCubedDonatorSilver(userID)) return 'donatorSilver';
            if (this.isPlugCubedDonatorBronze(userID)) return 'donatorBronze';
            return undefined;
        },
        havePlugCubedRank: function(userID) {
            return this.isPlugCubedDeveloper(userID) || this.isPlugCubedSponsor(userID) || this.isPlugCubedSpecial(userID) || this.isPlugCubedAmbassador(userID) || this.isPlugCubedDonatorDiamond(userID) || this.isPlugCubedDonatorPlatinum(userID) || this.isPlugCubedDonatorGold(userID) || this.isPlugCubedDonatorSilver(userID) || this.isPlugCubedDonatorBronze(userID);
        },
        getAllPlugCubedRanks: function(userID, onlyP3) {
            var ranks = [];

            // plugCubed ranks
            if (this.isPlugCubedDeveloper(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.developer'));
            }
            if (this.isPlugCubedSponsor(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.sponsor'));
            }
            if (this.isPlugCubedSpecial(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.special', this.getPlugCubedSpecial(userID).title));
            }
            if (this.isPlugCubedAmbassador(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.ambassador'));
            }
            if (this.isPlugCubedDonatorDiamond(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorDiamond'));
            }
            if (this.isPlugCubedDonatorPlatinum(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorPlatinum'));
            }
            if (this.isPlugCubedDonatorGold(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorGold'));
            }
            if (this.isPlugCubedDonatorSilver(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorSilver'));
            }
            if (this.isPlugCubedDonatorBronze(userID)) {
                ranks.push(p3Lang.i18n('info.specialTitles.donatorBronze'));
            }

            // plug.dj ranks
            if (!onlyP3) {
                if (this.hasPermission(userID, 5, true)) {
                    ranks.push(Lang.roles.admin);
                } else if (this.hasPermission(userID, 4, true)) {
                    ranks.push(Lang.roles.leader);
                } else if (this.hasPermission(userID, 3, true)) {
                    ranks.push(Lang.roles.ambassador);
                } else if (this.hasPermission(userID, 2, true)) {
                    ranks.push(Lang.roles.volunteer);
                } else if (this.hasPermission(userID, API.ROLE.HOST)) {
                    ranks.push(Lang.roles.host);
                } else if (this.hasPermission(userID, API.ROLE.COHOST)) {
                    ranks.push(Lang.roles.cohost);
                } else if (this.hasPermission(userID, API.ROLE.MANAGER)) {
                    ranks.push(Lang.roles.manager);
                } else if (this.hasPermission(userID, API.ROLE.BOUNCER)) {
                    ranks.push(Lang.roles.bouncer);
                } else if (this.hasPermission(userID, API.ROLE.RESIDENTDJ)) {
                    ranks.push(Lang.roles.dj);
                }
            }

            return ranks.join(' / ');
        },
        isPlugCubedDeveloper: function(userID) {
            if (!userID) userID = API.getUser().id;
            return developer.indexOf(userID) > -1;
        },
        isPlugCubedSponsor: function(userID) {
            if (!userID) userID = API.getUser().id;
            return sponsor.indexOf(userID) > -1;
        },
        isPlugCubedSpecial: function(userID) {
            if (!userID) userID = API.getUser().id;
            return this.getPlugCubedSpecial(userID) !== undefined;
        },
        isPlugCubedAmbassador: function(userID) {
            if (!userID) userID = API.getUser().id;
            return ambassador.indexOf(userID) > -1;
        },
        isPlugCubedDonatorDiamond: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorDiamond.indexOf(userID) > -1;
        },
        isPlugCubedDonatorPlatinum: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorPlatinum.indexOf(userID) > -1;
        },
        isPlugCubedDonatorGold: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorGold.indexOf(userID) > -1;
        },
        isPlugCubedDonatorSilver: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorSilver.indexOf(userID) > -1;
        },
        isPlugCubedDonatorBronze: function(userID) {
            if (!userID) userID = API.getUser().id;
            return donatorBronze.indexOf(userID) > -1;
        },
        getPlugCubedSpecial: function(userID) {
            if (!userID) userID = API.getUser().id;
            return special[userID];
        },
        cleanHTML: function(msg, disallow) {
            return cleanHTMLMessage(msg, disallow);
        },
        cleanTypedString: function(msg) {
            return msg.split("<").join("&lt;").split(">").join("&gt;");
        },
        chatLog: function(type, message, color) {
            var $chat, b, $message, $text;
            if (!message) return;
            if (typeof message !== 'string') message = message.html();

            message = cleanHTMLMessage(message);
            $chat = !runLite && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages');
            b = $chat.scrollTop() > $chat[0].scrollHeight - $chat.height() - 20;
            $message = $('<div>').addClass(type ? type : 'update');
            $text = $('<span>').addClass('text').html(message);

            if (type === 'system') {
                $message.append('<i class="icon icon-chat-system"></i>');
            } else {
                $text.css('color', this.toRGB(color && this.isRGB(color) ? color : 'd1d1d1'));
            }
            $chat.append($message.append($text));
            b && $chat.scrollTop($chat[0].scrollHeight);
        },
        getRoomID: function() {
            return document.location.pathname.split('/')[1];
        },
        getRoomname: function() {
            return $('#room-name').text().trim();
        },
        getUserData: function(userID, key, defaultValue) {
            if (plugCubedUserData[userID] === undefined || plugCubedUserData[userID][key] === undefined) {
                return defaultValue;
            }
            return plugCubedUserData[userID][key];
        },
        setUserData: function(userID, key, value) {
            if (plugCubedUserData[userID] === undefined) {
                plugCubedUserData[userID] = {};
            }
            plugCubedUserData[userID][key] = value;
        },
        getUser: function(data) {
            var method = 'number';
            if (typeof data === 'string') {
                method = 'string';
                data = data.trim();
                if (data.substr(0, 1) === '@')
                    data = data.substr(1);
            }

            var users = API.getUsers();
            for (var i in users) {
                if (!users.hasOwnProperty(i)) continue;
                if (method === 'string') {
                    if (this.equalsIgnoreCase(users[i].username, data) || this.equalsIgnoreCaseTrim(users[i].id.toString(), data))
                        return users[i];
                    continue;
                }
                if (method === 'number') {
                    if (users[i].id === data)
                        return users[i];
                }
            }
            return null;
        },
        getUserInfo: function(data) {
            var user = this.getUser(data);
            if (user === null) {
                API.chatLog(p3Lang.i18n('error.userNotFound'));
            } else {
                var rank, status, voted, position, voteTotal, waitlistpos, inbooth, lang, disconnectInfo;

                voteTotal = this.getUserData(user.id, 'wootcount', 0) + this.getUserData(user.id, 'mehcount', 0);
                waitlistpos = API.getWaitListPosition(user.id);
                inbooth = API.getDJ().id === user.id;
                lang = Lang.languages[user.language];
                disconnectInfo = this.getUserData(user.id, 'disconnects', {
                    count: 0
                });

                if (this.hasPermission(user.id, 5, true)) {
                    rank = Lang.roles.admin;
                } else if (this.hasPermission(user.id, 4, true)) {
                    rank = Lang.roles.leader;
                } else if (this.hasPermission(user.id, 3, true)) {
                    rank = Lang.roles.ambassador;
                } else if (this.hasPermission(user.id, 2, true)) {
                    rank = Lang.roles.volunteer;
                } else if (this.hasPermission(user.id, API.ROLE.HOST)) {
                    rank = Lang.roles.host;
                } else if (this.hasPermission(user.id, API.ROLE.COHOST)) {
                    rank = Lang.roles.cohost;
                } else if (this.hasPermission(user.id, API.ROLE.MANAGER)) {
                    rank = Lang.roles.manager;
                } else if (this.hasPermission(user.id, API.ROLE.BOUNCER)) {
                    rank = Lang.roles.bouncer;
                } else if (this.hasPermission(user.id, API.ROLE.RESIDENTDJ)) {
                    rank = Lang.roles.dj;
                } else {
                    rank = Lang.roles.none;
                }

                if (inbooth) {
                    position = p3Lang.i18n('info.djing');
                } else if (waitlistpos > -1) {
                    position = p3Lang.i18n('info.inWaitlist', waitlistpos + 1, API.getWaitList().length);
                } else {
                    position = p3Lang.i18n('info.notInList');
                }

                switch (user.status) {
                    default: status = Lang.userStatus.available;
                    break;
                    case API.STATUS.AFK:
                        status = Lang.userStatus.away;
                        break;
                    case API.STATUS.WORKING:
                        status = Lang.userStatus.working;
                        break;
                    case API.STATUS.GAMING:
                        status = Lang.userStatus.gaming;
                        break;
                }

                switch (user.vote) {
                    case -1:
                        voted = p3Lang.i18n('vote.meh');
                        break;
                    default:
                        voted = p3Lang.i18n('vote.undecided');
                        break;
                    case 1:
                        voted = p3Lang.i18n('vote.woot');
                        break;
                }
                if (inbooth) voted = p3Lang.i18n('vote.djing');

                var title = this.getAllPlugCubedRanks(user.id, true),
                    message = $('<table>').css({
                        width: '100%',
                        color: '#CC00CC'
                    });

                // Username
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.name'))).append($('<span>').css('color', '#FFFFFF').text(this.cleanTypedString(user.username)))));
                // Title
                if (title !== '')
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.title'))).append($('<span>').css('color', '#FFFFFF').text(title))));
                // UserID
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.id'))).append($('<span>').css('color', '#FFFFFF').text(user.id))));
                // Rank / Time Joined
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.rank'))).append($('<span>').css('color', '#FFFFFF').text(rank))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.joined'))).append($('<span>').css('color', '#FFFFFF').text(this.getTimestamp(this.getUserData(user.id, 'joinTime', Date.now()))))));
                // Status / Vote
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.status'))).append($('<span>').css('color', '#FFFFFF').text(status))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.vote'))).append($('<span>').css('color', '#FFFFFF').text(voted))));
                // Position
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.position'))).append($('<span>').css('color', '#FFFFFF').text(position))));
                // Points / Fans
                message.append($('<tr>').append($('<td>').append('XP').append($('<span>').css('color', '#FFFFFF').text(user.xp))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.fans'))).append($('<span>').css('color', '#FFFFFF').text(user.fans))));
                // Woot / Meh
                message.append($('<tr>').append($('<td>').append($('<strong>').text(p3Lang.i18n('info.wootCount'))).append($('<span>').css('color', '#FFFFFF').text(this.getUserData(user.id, 'wootcount', 0)))).append($('<td>').append($('<strong>').text(p3Lang.i18n('info.mehCount'))).append($('<span>').css('color', '#FFFFFF').text(this.getUserData(user.id, 'mehcount', 0)))));
                // Ratio
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.ratio'))).append($('<span>').css('color', '#FFFFFF').text((function(a, b) {
                    if (b === 0) return a === 0 ? '0:0' : '1:0';
                    for (var i = 1; i <= b; i++) {
                        var e = i * (a / b);
                        if (e % 1 === 0) return e + ':' + i;
                    }
                })(this.getUserData(user.id, 'wootcount', 0), this.getUserData(user.id, 'mehcount', 0))))));
                // Disconnects
                message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.disconnects'))).append($('<span>').css('color', '#FFFFFF').text(disconnectInfo.count))));
                if (disconnectInfo.count > 0) {
                    // Last Position
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastPosition'))).append($('<span>').css('color', '#FFFFFF').text(disconnectInfo.position < -1 ? 'Wasn\'t in booth nor waitlist' : (disconnectInfo.position < 0 ? 'Was DJing' : 'Was ' + (disconnectInfo.position + 1) + ' in waitlist')))));
                    // Lase Disconnect Time
                    message.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('info.lastDisconnect'))).append($('<span>').css('color', '#FFFFFF').text(this.getTimestamp(disconnectInfo.time)))));
                }

                this.chatLog(undefined, $('<div>').append(message).html());
            }
        },
        hasPermission: function(uid, permission, global) {
            var user = API.getUser(uid);
            if (user && user.id) {
                var role = global ? user.gRole : user.role + (user.gRole > 0 ? 5 + user.gRole : 0);
                return role >= permission;
            }
            return false;
        },
        getAllUsers: function() {
            var table = $('<table>').css({
                    width: '100%',
                    color: '#CC00CC',
                    position: 'relative',
                    left: '-25px'
                }),
                users = API.getUsers();
            for (var i in users) {
                if (users.hasOwnProperty(i)) {
                    var user = users[i];
                    table.append($('<tr>').append($('<td>').append(user.username)).append($('<td>').append(user.id)));
                }
            }
            this.chatLog(undefined, $('<div>').append(table).html());
        },
        playChatSound: function() {
            if (runLite || Database.settings.chatSound) {
                document.getElementById('chat-sound').playChatSound();
            }
        },
        playMentionSound: function() {
            if (runLite || Database.settings.chatSound) {
                document.getElementById('chat-sound').playMentionSound();
            }
        },
        getTimestamp: function(t, format) {
            var time, hours, minutes, seconds, postfix = '';
            if (!format) format = 'hh:mm';

            time = t ? new Date(t) : new Date();

            hours = time.getHours();
            minutes = time.getMinutes();
            seconds = time.getSeconds();

            if ($('.icon-timestamps-12').length === 1) {
                if (hours < 12) {
                    postfix = ' AM';
                } else {
                    postfix = ' PM';
                    hours -= 12;
                }
                if (hours === 0) {
                    hours = 12;
                }
            }

            hours = (hours < 10 ? '0' : '') + hours;
            minutes = (minutes < 10 ? '0' : '') + minutes;
            seconds = (seconds < 10 ? '0' : '') + seconds;

            return format.split('hh').join(hours).split('mm').join(minutes).split('ss').join(seconds) + postfix;
        },
        randomRange: function(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },
        isRGB: function(a) {
            return typeof a === 'string' ? /^(#|)(([0-9A-F]{6}$)|([0-9A-F]{3}$))/i.test(a) : false;
        },
        toRGB: function(a) {
            return this.isRGB(a) ? a.substr(0, 1) === '#' ? a : '#' + a : undefined;
        },
        isNumber: function(a) {
            return typeof a === 'string' ? !isNaN(parseInt(a, 10)) && isFinite(a) : false;
        },
        equalsIgnoreCase: function(a, b) {
            return typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : false;
        },
        equalsIgnoreCaseTrim: function(a, b) {
            return typeof a === 'string' && typeof b === 'string' ? a.trim().toLowerCase() === b.trim().toLowerCase() : false;
        },
        startsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.indexOf(b) === 0;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.startsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.lastIndexOf(b) === a.length - b.length;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.endsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        startsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return this.startsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.startsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return this.endsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && this.endsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        getBaseURL: function(url) {
            return url.indexOf('?') < 0 ? url : url.substr(0, url.indexOf('?'));
        },
        logColors: {
            userCommands: '66FFFF',
            modCommands: 'FF0000',
            infoMessage1: 'FFFF00',
            infoMessage2: '66FFFF'
        }
    });
    return new handler();
});
define('plugCubed/StyleManager', ['jquery', 'plugCubed/Class'], function($, Class) {
    var obj, styles = {},
        update = function() {
            var a = '';
            for (var i in styles) {
                if (styles.hasOwnProperty(i))
                    a += styles[i];
            }
            obj.text(a);
        },
        a = Class.extend({
            init: function() {
                obj = $('<style type="text/css">');
                $('head').append(obj);
            },
            get: function(key) {
                return styles[key];
            },
            set: function(key, style) {
                styles[key] = style;
                update();
            },
            has: function(key) {
                return styles[key] !== undefined;
            },
            unset: function(key) {
                if (typeof key === 'string') {
                    key = [key];
                }
                var doUpdate = false;
                for (var i in key) {
                    if (key.hasOwnProperty(i) && this.has(key[i])) {
                        delete styles[key[i]];
                        doUpdate = true;
                    }
                }
                if (doUpdate)
                    update();
            },
            destroy: function() {
                styles = {};
                obj.remove();
            }
        });
    return new a();
});
define('plugCubed/bridges/Context', ['plugCubed/Utils'], function(p3Utils) {
    if (!p3Utils.runLite)
        return require('ce221/a82cc/a42d7');
    return {
        _events: {
            'chat:receive': [],
            'chat:delete': []
        },
        trigger: function() {},
        on: function(key) {
            this._events[key] = [];
        },
        off: function() {}
    };
});
/**
 Modified version of plug.dj's VolumeView
 VolumeView copyright (C) 2014 by Plug DJ, Inc.
 */
define('plugCubed/bridges/VolumeView', ['jquery', 'plugCubed/Lang', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function($, p3Lang, p3Utils, _$context) {
    if (p3Utils.runLite) return null;
    var original = require('ce221/df202/bd7f7/d1409/bc88b'),
        _PlaybackModel;

    return original.extend({
        initialize: function(PlaybackModel) {
            _PlaybackModel = PlaybackModel;
            this._super();
        },
        render: function() {
            this._super();
            this.$('.button').mouseover(function() {
                if (typeof plugCubed !== 'undefined') {
                    if (_PlaybackModel.get('mutedOnce')) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), $(this), true);
                    } else if (_PlaybackModel.get('muted')) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), $(this), true);
                    }
                }
            }).mouseout(function() {
                if (typeof plugCubed !== 'undefined')
                    _$context.trigger('tooltip:hide');
            });
            this.onChange();
            return this;
        },
        remove: function() {
            this._super();
            var volume = new original();
            $('#now-playing-bar').append(volume.$el);
            volume.render();
        },
        onClick: function() {
            if (typeof plugCubed !== 'undefined') {
                _$context.trigger('tooltip:hide');
                if (_PlaybackModel.get('muted')) {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.mutedOnce'), this.$('.button'), true);
                } else if (!_PlaybackModel.get('mutedOnce')) {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.muted'), this.$('.button'), true);
                } else {
                    _$context.trigger('tooltip:hide');
                }
            }

            if (_PlaybackModel.get('mutedOnce')) {
                _PlaybackModel.set('volume', _PlaybackModel.get('lastVolume'));
            } else if (_PlaybackModel.get('muted')) {
                _PlaybackModel.onVolumeChange();
                this.onChange();
            } else if (_PlaybackModel.get('volume') > 0) {
                _PlaybackModel.set({
                    lastVolume: _PlaybackModel.get('volume'),
                    volume: 0
                });
            }
        },
        onChange: function() {
            var currentVolume = _PlaybackModel.get('volume');
            this.$span.text(currentVolume + '%');
            this.$circle.css('left', parseInt(this.$hit.css('left')) + this.max * (currentVolume / 100) - this.$circle.width() / 2);
            if (currentVolume > 60 && !this.$icon.hasClass('icon-volume-on')) {
                this.$icon.removeClass().addClass('icon icon-volume-on');
            } else if (currentVolume > 0 && !this.$icon.hasClass('icon-volume-half')) {
                this.$icon.removeClass().addClass('icon icon-volume-half');
            } else if (currentVolume === 0) {
                if (_PlaybackModel.get('mutedOnce')) {
                    if (!this.$icon.hasClass('icon-volume-off-once')) {
                        this.$icon.removeClass().addClass('icon icon-volume-off-once');
                    }
                } else if (!this.$icon.hasClass('icon-volume-off')) {
                    this.$icon.removeClass().addClass('icon icon-volume-off');
                }
            }
        }
    });
});
define('plugCubed/bridges/PlaybackModel', ['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/bridges/VolumeView'], function(Class, p3Utils, p3Lang, VolumeView) {
    var handler;
    if (p3Utils.runLite) {
        handler = Class.extend({
            init: function() {
                API.on(API.ADVANCE, this.djAdvance, this);
                this.set('lastVolume', this.get('volume'));
            },
            close: function() {
                API.off(API.ADVANCE, this.djAdvance, this);
            },
            djAdvance: function() {
                if (this.get('mutedOnce'))
                    this.unmute();
            },
            get: function(key) {
                switch (key) {
                    case 'volume':
                        return API.getVolume();
                    case 'muted':
                        return this.get('volume') === 0;
                }
                return this[key];
            },
            set: function(key, value) {
                switch (key) {
                    case 'volume':
                        API.setVolume(value);
                        return;
                    case 'muted':
                        this.set('volume', value ? 0 : this.get('lastVolume'));
                        return;
                }
                this[key] = value;
            },
            mute: function() {
                this.set('lastVolume', API.getVolume());
                API.setVolume(0);
            },
            muteOnce: function() {
                this.set('mutedOnce', true);
                this.set('lastVolume', API.getVolume());
                API.setVolume(0);
            },
            unmute: function() {
                API.setVolume(this.get('lastVolume'));
            }
        });
    } else {
        var PlaybackModel = require('ce221/bbc3c/f6ff1'),
            volume;

        function onMediaChange() {
            if (PlaybackModel.get('mutedOnce') === true)
                PlaybackModel.set('volume', PlaybackModel.get('lastVolume'));
        }

        handler = Class.extend({
            initialize: function() {
                PlaybackModel.off('change:volume', PlaybackModel.onVolumeChange);
                PlaybackModel.onVolumeChange = function() {
                    if (typeof plugCubed === 'undefined')
                        this.set('muted', this.get('volume') == 0);
                    else {
                        if (this.get('mutedOnce') === undefined)
                            this.set('mutedOnce', false);

                        if (this.get('volume') === 0) {
                            if (!this.get('muted'))
                                this.set('muted', true);
                            else if (!this.get('mutedOnce'))
                                this.set('mutedOnce', true);
                            else {
                                this.set('mutedOnce', false);
                                this.set('muted', false);
                            }
                        } else {
                            this.set('mutedOnce', false);
                            this.set('muted', false);
                        }
                    }
                };
                PlaybackModel.on('change:volume', PlaybackModel.onVolumeChange);

                $('#volume').remove();
                console.log(1);
                volume = new VolumeView(this);
                $('#now-playing-bar').append(volume.$el);
                volume.render();
                console.log(2);

                PlaybackModel.on('change:media', onMediaChange);
                PlaybackModel._events['change:media'].unshift(PlaybackModel._events['change:media'].pop());
            },
            mute: function() {
                while (!PlaybackModel.get('muted') || PlaybackModel.get('mutedOnce'))
                    volume.onClick();
            },
            muteOnce: function() {
                while (!PlaybackModel.get('mutedOnce'))
                    volume.onClick();
            },
            unmute: function() {
                while (PlaybackModel.get('muted'))
                    volume.onClick();
            },
            close: function() {}
        });
    }

    return new handler();
});
define('plugCubed/Settings', ['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/bridges/PlaybackModel'], function(Class, p3Utils, p3Lang, Styles, PlaybackModel) {
    var names = [],
        curVersion;

    // Misc
    names.push('version');
    // Features
    names.push('autowoot', 'autojoin', 'autorespond', 'awaymsg', 'notify', 'customColors', 'chatimages', 'moderation', 'notifySongLength', 'useRoomSettings');
    // Registers
    names.push('registeredSongs', 'alertson', 'colors');

    curVersion = 2;

    function upgradeVersion(save) {
        switch (save.version) {
            case void 0:
            case 1:
                // Inline Images => Chat Images
                if (save.inlineimages !== undefined)
                    save.chatImages = save.inlineimages;

                // Moderation
                if (save.moderation === undefined)
                    save.moderation = {};
                if (save.afkTimers !== undefined)
                    save.moderation.afkTimers = save.afkTimers;
        }
        console.log('[plugÂ³] Updated save', save.version, '=>', curVersion);
        save.version = curVersion;
        return save;
    }

    var controller = Class.extend({
        recent: false,
        awaymsg: '',
        autowoot: false,
        autojoin: false,
        autorespond: false,
        notify: 0,
        customColors: false,
        chatImages: true,
        twitchEmotes: true,
        registeredSongs: [],
        alertson: [],
        moderation: {
            afkTimers: false,
            showDeletesMessages: false
        },
        notifySongLength: 10,
        useRoomSettings: {},
        colorInfo: {
            ranks: {
                you: {
                    title: 'ranks.you',
                    color: 'FFDD6F'
                },
                regular: {
                    title: 'ranks.regular',
                    color: 'B0B0B0'
                },
                residentdj: {
                    title: 'ranks.residentdj',
                    color: 'AC76FF'
                },
                bouncer: {
                    title: 'ranks.bouncer',
                    color: 'AC76FF'
                },
                manager: {
                    title: 'ranks.manager',
                    color: 'AC76FF'
                },
                cohost: {
                    title: 'ranks.cohost',
                    color: 'AC76FF'
                },
                host: {
                    title: 'ranks.host',
                    color: 'AC76FF'
                },
                ambassador: {
                    title: 'ranks.ambassador',
                    color: '89BE6C'
                },
                admin: {
                    title: 'ranks.admin',
                    color: '42A5DC'
                }
            },
            notifications: {
                join: {
                    title: 'notify.join',
                    color: '3366FF'
                },
                leave: {
                    title: 'notify.leave',
                    color: '3366FF'
                },
                curate: {
                    title: 'notify.curate',
                    color: '00FF00'
                },
                meh: {
                    title: 'notify.meh',
                    color: 'FF0000'
                },
                stats: {
                    title: 'notify.stats',
                    color: '66FFFF'
                },
                updates: {
                    title: 'notify.updates',
                    color: 'FFFF00'
                },
                songLength: {
                    title: 'notify.songLength',
                    color: '66FFFF'
                }
            }
        },
        colors: {
            you: 'FFDD6F',
            regular: 'B0B0B0',
            residentdj: 'AC76FF',
            bouncer: 'AC76FF',
            manager: 'AC76FF',
            cohost: 'AC76FF',
            host: 'AC76FF',
            ambassador: '89BE6C',
            admin: '42A5DC',
            join: '3366FF',
            leave: '3366FF',
            curate: '00FF00',
            stats: '66FFFF',
            updates: 'FFFF00',
            songLength: '66FFFF'
        },
        load: function() {
            try {
                var save = JSON.parse(localStorage.getItem('plugCubed')) || {};

                // Upgrade if needed
                if (save.version === undefined || save.version !== curVersion) {
                    save = upgradeVersion(save);
                    this.save();
                }

                // Get the settings
                for (var i in names) {
                    if (!names.hasOwnProperty(i)) continue;
                    if (save[names[i]] !== undefined && typeof this[names[i]] == typeof save[names[i]])
                        this[names[i]] = save[names[i]];
                }

                if (this.autowoot) {
                    (function() {
                        var dj = API.getDJ();
                        if (dj === null || dj.id === API.getUser().id) return;
                        $('#woot').click();
                    })();
                }

                if (this.autojoin) {
                    (function() {
                        var dj = API.getDJ();
                        if (dj === null || dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
                        $('#dj-button').click();
                    })();
                }

                // Update styles if AFK timers are enabled
                if (this.moderation.afkTimers && (p3Utils.isPlugCubedDeveloper() || p3Utils.hasPermission(undefined, API.ROLE.BOUNCER))) {
                    Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                }

                if (this.twitchEmotes) {
                    require('plugCubed/handlers/ChatHandler').loadTwitchEmotes();
                }

                if (this.registeredSongs.length > 0 && this.registeredSongs.indexOf(API.getMedia().id) > -1) {
                    if (!p3Utils.runLite) {
                        PlaybackModel.muteOnce();
                    } else {
                        this.lastVolume = API.getVolume();
                        API.setVolume(0);
                    }
                    API.chatLog(p3Lang.i18n('automuted', API.getMedia().title));
                    this.autoMuted = true;
                } else if (this.autoMuted) {
                    API.setVolume(this.lastVolume);
                    this.autoMuted = false;
                }
            } catch (err) {
                console.error('[plugÂ³] Error loading settings');
                trackJs.track(err);
            }
        },
        save: function() {
            var settings = {};
            for (var i in names) {
                if (names.hasOwnProperty(i))
                    settings[names[i]] = this[names[i]];
            }
            settings.version = curVersion;
            localStorage.setItem('plugCubed', JSON.stringify(settings));
        }
    });
    return new controller();
});
define('plugCubed/enums/Notifications', [], function() {
    return {
        USER_JOIN: 1,
        USER_LEAVE: 2,
        USER_CURATE: 4,
        SONG_STATS: 8,
        SONG_UPDATE: 16,
        SONG_HISTORY: 32,
        SONG_LENGTH: 64,
        USER_MEH: 128
    };
});
define('plugCubed/notifications/History', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var history = [],
        handler = TriggerHandler.extend({
            trigger: {
                advance: this.onDjAdvance,
                modSkip: this.onSkip,
                userSkip: this.onSkip,
                voteSkip: this.onSkip
            },
            register: function() {
                this.getHistory();
                this._super();
            },
            isInHistory: function(id) {
                var info = {
                    pos: -1,
                    inHistory: false,
                    skipped: false,
                    length: history.length
                };
                for (var i in history) {
                    if (!history.hasOwnProperty(i)) continue;
                    var a = history[i];
                    if (a.id == id && (~~i + 1) < history.length) {
                        info.pos = ~~i + 2;
                        info.inHistory = true;
                        if (!a.wasSkipped) {
                            return info;
                        }
                    }
                }
                info.skipped = info.pos > -1;
                return info;
            },
            onHistoryCheck: function(id) {
                if ((!API.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper()) || (Settings.notify & enumNotifications.SONG_HISTORY) !== enumNotifications.SONG_HISTORY) return;
                var historyData = this.isInHistory(id);
                if (historyData.inHistory) {
                    if (!historyData.skipped) {
                        p3Utils.playMentionSound();
                        setTimeout(p3Utils.playMentionSound, 50);
                        p3Utils.chatLog('system', p3Lang.i18n('notify.message.history', historyData.pos, historyData.length) + '<br><span onclick="if (API.getMedia().id === \'' + id + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>');
                    } else {
                        API.chatLog(p3Lang.i18n('notify.message.historySkipped', historyData.pos, historyData.length), true);
                    }
                }
            },
            onDjAdvance: function(data) {
                this.onHistoryCheck(data.media.id);
                var obj = {
                    id: data.media.id,
                    author: data.media.author,
                    title: data.media.title,
                    wasSkipped: false,
                    user: {
                        id: data.dj.id,
                        username: data.dj.username
                    }
                };
                if (history.unshift(obj) > 50)
                    history.splice(50, history.length - 50);
            },
            onSkip: function() {
                history[1].wasSkipped = true;
            },
            getHistory: function() {
                history = [];
                var data = API.getHistory();
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    var a = data[i],
                        obj = {
                            id: a.media.id,
                            author: a.media.author,
                            title: a.media.title,
                            wasSkipped: false,
                            dj: {
                                id: a['user'].id.toString(),
                                username: a['user'].username
                            }
                        };
                    history.push(obj);
                }
            }
        });
    return new handler();
});
define('plugCubed/notifications/SongLength', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH && data.media.duration > Settings.notifySongLength * 60) {
                p3Utils.playMentionSound();
                setTimeout(p3Utils.playMentionSound, 50);
                p3Utils.chatLog('system', p3Lang.i18n('notify.message.songLength', Settings.notifySongLength) + '<br><span onclick="if (API.getMedia().id === \'' + data.id + '\') API.moderateForceSkip()" style="cursor:pointer;">Click here to skip</span>');
            }
        }
    });
    return new handler();
});
define('plugCubed/notifications/SongStats', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.stats', data.lastPlay.score.positive, data.lastPlay.score.negative, data.lastPlay.score.grabs), Settings.colors.stats);
        }
    });
    return new handler();
});
define('plugCubed/notifications/SongUpdate', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if ((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.updates', p3Utils.cleanTypedString(data.media.title), p3Utils.cleanTypedString(data.media.author), p3Utils.cleanTypedString(data.dj.username)), Settings.colors.updates);
        }
    });
    return new handler();
});
define('plugCubed/notifications/UserCurate', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.GRAB_UPDATE,
        handler: function(data) {
            var media = API.getMedia();
            if ((Settings.notify & enumNotifications.USER_CURATE) === enumNotifications.USER_CURATE)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.curate', p3Utils.cleanTypedString(data.user.username), media.author, media.title), Settings.colors.curate);
        }
    });
    return new handler();
});
define('plugCubed/notifications/UserJoin', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastJoin = {},
        handler = TriggerHandler.extend({
            trigger: API.USER_JOIN,
            handler: function(data) {
                if ((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN && (lastJoin[data.id] === undefined || lastJoin[data.id] < Date.now() - 5e3)) {
                    var relationship = 0;
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.join.' + (relationship === 0 || relationship === undefined ? 'normal' : (relationship > 1 ? 'friend' : 'fan')), p3Utils.cleanTypedString(data.username)), Settings.colors.join);
                }
                lastJoin[data.id] = Date.now();
                if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0)
                    p3Utils.setUserData(data.id, 'joinTime', Date.now());
            }
        });
    return new handler();
});
define('plugCubed/notifications/UserLeave', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var lastLeave = {},
        handler = TriggerHandler.extend({
            trigger: API.USER_LEAVE,
            handler: function(data) {
                var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                    count: 0
                });
                if ((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE && (disconnects.time === undefined || Date.now() - disconnects.time < 1000) && (lastLeave[data.id] === undefined || lastLeave[data.id] < Date.now() - 5e3)) {
                    var relationship = 0;
                    p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.leave.' + (relationship === 0 ? 'normal' : (relationship > 1 ? 'friend' : 'fan')), p3Utils.cleanTypedString(data.username)), Settings.colors.leave);
                }
                lastLeave[data.id] = Date.now();
            }
        });
    return new handler();
});
define('plugCubed/notifications/UserMeh', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/enums/Notifications'], function(TriggerHandler, Settings, p3Utils, p3Lang, enumNotifications) {
    var handler = TriggerHandler.extend({
        trigger: API.VOTE_UPDATE,
        handler: function(data) {
            if (data.vote < 0 && (Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH)
                p3Utils.chatLog(undefined, p3Lang.i18n('notify.message.meh', p3Utils.cleanTypedString(data.user.username)), Settings.colors.meh);
        }
    });
    return new handler();
});
define('plugCubed/Notifications', ['plugCubed/Class', 'plugCubed/notifications/History', 'plugCubed/notifications/SongLength', 'plugCubed/notifications/SongStats', 'plugCubed/notifications/SongUpdate', 'plugCubed/notifications/UserCurate', 'plugCubed/notifications/UserJoin', 'plugCubed/notifications/UserLeave', 'plugCubed/notifications/UserMeh'], function() {
    var modules, Class, handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && !modules[i].registered)
                    modules[i].register();
            }
        },
        unregister: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i].registered)
                    modules[i].close();
            }
        }
    });

    return new handler();
});
define('plugCubed/Version', [], function() {
    return {
        major: 4,
        minor: 0,
        patch: 0,
        prerelease: "alpha",
        build: 11,
        minified: false,
        /**
         * @this {version}
         */
        toString: function() {
            return this.major + '.' + this.minor + '.' + this.patch + (this.prerelease !== undefined && this.prerelease !== '' ? '-' + this.prerelease : '') + (this.minified ? '_min' : '') + ' (Build ' + this.build + ')';
        }
    }
});
define('plugCubed/Socket', ['underscore', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Version'], function(_, Class, p3Utils, p3Lang, Version) {
    var _this, Chat, socket, tries = 0,
        socketReconnecting, socketHandler = Class.extend({
            connect: function() {
                if (socket !== undefined && socket.readyState === SockJS.OPEN) return;
                _this = this;
                socket = new SockJS('https://socket.plugcubed.net/_');
                console.log('[plugÂ³] Socket Server', socketReconnecting ? 'Reconnecting' : 'Connecting');
                socket.onopen = _.bind(this.onOpen, this);
                socket.onmessage = _.bind(this.onMessage, this);
                socket.onclose = _.bind(this.onClose, this);
            },
            reconnect: function() {
                if (socket === undefined || socket.readyState !== SockJS.OPEN) {
                    this.connect();
                } else {
                    socket.close();
                }
            },
            disconnect: function() {
                if (socket === undefined || socket.readyState !== SockJS.OPEN) return;
                socket.onclose = function() {
                    console.log('[plugÂ³] Socket Server', 'Closed');
                };
                socket.close();
            },
            onOpen: function() {
                tries = 0;
                console.log('[plugÂ³] Socket Server', socketReconnecting ? 'Reconnected' : 'Connected');
                var userData = API.getUser();
                this.send(JSON.stringify({
                    type: 'user:validate',
                    id: userData.id,
                    username: userData.username,
                    room: p3Utils.getRoomID(),
                    version: Version.toString()
                }));
                $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.online')));
            },
            onMessage: function(msg) {
                var obj = JSON.parse(msg.data),
                    type = obj.type,
                    data = obj.data;

                switch (type) {
                    case 'user:validate':
                        if (data.status === 1) {
                            console.log('[plugÂ³] Socket Server', 'User validated');
                        }
                        return;
                    case 'chat:private':
                        if (p3Utils.runLite || !data.chatID || $('.chat-id-' + data.chatID).length > 0)
                            return;
                        if (data.fromID !== API.getUser().id)
                            p3Utils.playMentionSound();
                        Chat.receive(data);
                        API.trigger(API.CHAT, data);
                        return;
                    case 'chat:private:notfound':
                        var user = API.getUser(data.id) ? API.getUser(data.id) : {
                            username: 'Receiver'
                        };
                        API.chatLog('[plugÂ³ Socket] ' + user.username + ' not found', true);
                        return;
                    case 'room:rave':
                        if (p3Utils.runLite) return;
                        if (p3Utils.isPlugCubedDeveloper(data.id) || p3Utils.isPlugCubedSponsor(data.id) || p3Utils.hasPermission(data.id, API.ROLE.COHOST)) {
                            var Audience = require('ce221/df202/bd7f7/d51d6');
                            clearTimeout(Audience.strobeTimeoutID);
                            if (data.value === 0) {
                                Audience.onFXChange(null, false);
                            } else if (data.value === 1) {
                                Audience.onFXChange(null, 'strobe');
                                p3Utils.chatLog(undefined, p3Lang.i18n('strobe', API.getUser(data.id).username));
                            } else if (data.value === 2) {
                                Audience.onFXChange(null, 'dim');
                                p3Utils.chatLog(undefined, p3Lang.i18n('lightsOut', API.getUser(data.id).username));
                            }
                        }
                        return;
                    case 'broadcast:message':
                        if (p3Utils.isPlugCubedDeveloper(data.id) || p3Utils.isPlugCubedSponsor(data.id)) {
                            p3Utils.chatLog('system', '<strong>' + (data.global ? 'Global' : 'Room') + ' Broadcast from a ' + p3Lang.i18n('info.specialTitles.' + (p3Utils.isPlugCubedDeveloper(data.id) ? 'developer' : 'sponsor')) + '</strong><br><span style="color:#FFFFFF;font-weight:400">' + data.message + '</span>');
                        }
                        return;
                }
            },
            onClose: function(info) {
                console.log('[plugÂ³] Socket Server', 'Closed', info);
                $('.plugcubed-status').text(p3Lang.i18n('footer.socket', p3Lang.i18n('footer.offline')));

                var delay;
                socketReconnecting = true;

                switch (info.code) {
                    case 3002:
                        delay = 300;
                        break;
                    case 3003:
                        return;
                    case 3006:
                        // plug.dj account linked to p3 account
                        return;
                    default:
                        tries++;
                        if (tries < 5) {
                            delay = 5;
                        } else if (tries < 30) {
                            delay = 30;
                        } else if (tries < 60) {
                            delay = 60;
                        } else return;
                        break;
                }

                setTimeout(function() {
                    _this.connect();
                }, delay * 1E3);
            },
            getState: function() {
                return socket.readyState;
            },
            send: function(msg) {
                if (typeof msg === 'string')
                    socket.send(msg);
            }
        });
    if (!p3Utils.runLite)
        Chat = require('ce221/f5c01/a983c');
    return new socketHandler();
});
define('plugCubed/RSS', ['jquery', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/Settings', 'lang/Lang'], function($, Class, p3Utils, p3Lang, Styles, Settings, Lang) {
    var RoomModel, handler, showMessage, _this, oriLang, langKeys, ranks;

    /**
     * @property {{ background: String, chat: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }, footer: String, header: String }} colors
     * @property {{ font: Array, import: Array, rule: Array }} css
     * @property {{ background: String, booth: String, icons: { admin: String, ambassador: String, bouncer: String, cohost: String, residentdj: String, host: String, manager: String }, playback: String }} images
     * @property {{ plugCubed: Object, plugDJ: Object }} text
     * @property {{ allowAutorespond: Boolean, allowAutojoin: Boolean, allowAutowoot: Boolean }} rules
     * @property {String|undefined} roomscript
     */
    var roomSettings;

    showMessage = false;
    oriLang = $.extend(true, {}, Lang);
    langKeys = $.map(oriLang, function(v, i) {
        if (typeof v === 'string')
            return i;
        else
            return $.map(v, function(v2, i2) {
                return i + '.' + i2;
            });
    });
    ranks = ['admin', 'ambassador', 'bouncer', 'cohost', 'residentdj', 'leader', 'host', 'manager', 'volunteer'];

    if (!p3Utils.runLite)
        RoomModel = require('ce221/bbc3c/ecebe');

    function getPlugDJLang(key, original) {
        if (!key) return '';
        var parts = key.split('.'),
            last = parts.pop(),
            partsLen = parts.length,
            cur = original ? oriLang : Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] !== undefined) {
                cur = cur[part];
            } else {
                return '';
            }
            if (cur[last] !== undefined) {
                return cur[last];
            }
        }
        return '';
    }

    function setPlugDJLang(key, value) {
        if (!key || !value) return;
        var parts = key.split('.'),
            last = parts.pop(),
            partsLen = parts.length,
            cur = Lang;
        for (var i = 0; i < partsLen; i++) {
            var part = parts[i];
            if (cur[part] !== undefined)
                cur = cur[part];
            else return;
        }
        if (cur[last] !== undefined)
            cur[last] = value;
    }

    handler = Class.extend({
        rules: {
            allowAutowoot: true,
            allowAutorespond: true,
            allowAutojoin: true
        },
        haveRoomSettings: false,
        chatColors: {},
        chatIcons: {},
        init: function() {
            _this = this;
            if (!p3Utils.runLite)
                RoomModel.on('change:description', this.update, this);
        },
        update: function() {
            var a;
            a = p3Utils.cleanHTML($('#room-info').find('.description').find('.value').html().split('<br>').join('\n'), '*');
            if (a.indexOf('@p3=') > -1) {
                a = a.substr(a.indexOf('@p3=') + 4);
                if (a.indexOf('\n') > -1)
                    a = a.substr(0, a.indexOf('\n'));
                $.getJSON(a + '?_' + Date.now(), function(settings) {
                    roomSettings = settings;
                    showMessage = true;
                    _this.execute();
                }).fail(function() {
                    API.chatLog('Error loading Room Settings', true);
                });
                _this.haveRoomSettings = true;
                return true;
            }
            return false;
        },
        execute: function() {
            var i, a, loadEverything;
            loadEverything = Settings.useRoomSettings[document.location.pathname.split('/')[1]] !== undefined ? Settings.useRoomSettings[document.location.pathname.split('/')[1]] : true;
            if (roomSettings !== undefined) {
                this.chatColors = {};
                this.chatIcons = {};

                for (i in langKeys) {
                    if (!langKeys.hasOwnProperty(i)) continue;
                    var key = langKeys[i];
                    setPlugDJLang(key, getPlugDJLang(key, true));
                }

                $('#p3-dj-booth').remove();

                Styles.unset([
                    'rss-background-color', 'rss-background-image', 'rss-booth', 'rss-fonts', 'rss-imports', 'rss-rules', 'rss-maingui'
                ]);

                if (loadEverything) {
                    // colors
                    if (roomSettings.colors !== undefined) {
                        // colors.background
                        if (roomSettings.colors.background !== undefined && typeof roomSettings.colors.background === 'string' && p3Utils.isRGB(roomSettings.colors.background))
                            Styles.set('rss-background-color', 'body { background-color: ' + p3Utils.toRGB(roomSettings.colors.background) + '!important; }');

                        // colors.chat
                        if (roomSettings.colors.chat !== undefined) {
                            a = {};
                            for (i in roomSettings.colors.chat) {
                                if (!roomSettings.colors.chat.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.colors.chat[i] === 'string' && p3Utils.isRGB(roomSettings.colors.chat[i]))
                                    a[i] = p3Utils.toRGB(roomSettings.colors.chat[i]);
                            }
                            this.chatColors = a;
                        }

                        // colors.header
                        if (roomSettings.colors.header !== undefined && typeof roomSettings.colors.header === 'string' && p3Utils.isRGB(roomSettings.colors.header))
                            Styles.set('rss-header', '#header { background-color: ' + p3Utils.toRGB(roomSettings.colors.header) + '!important; }');

                        // colors.footer
                        if (roomSettings.colors.footer !== undefined && typeof roomSettings.colors.footer === 'string' && p3Utils.isRGB(roomSettings.colors.footer))
                            Styles.set('rss-footer', '#footer { background-color: ' + p3Utils.toRGB(roomSettings.colors.footer) + '!important; }');
                    }

                    // css
                    if (roomSettings.css !== undefined) {
                        // css.font
                        if (roomSettings.css.font !== undefined && $.isArray(roomSettings.css.font)) {
                            var roomFonts = [];
                            for (i in roomSettings.css.font) {
                                if (!roomSettings.css.font.hasOwnProperty(i)) continue;
                                var font = roomSettings.css.font[i];
                                if (font.name !== undefined && font.url !== undefined) {
                                    font.toString = function() {
                                        var sources = [];
                                        if (typeof this.url === 'string')
                                            sources.push('url("' + this.url + '")');
                                        else {
                                            for (var j in this.url) {
                                                if (!this.url.hasOwnProperty(j)) continue;
                                                if (['woff', 'opentype', 'svg', 'embedded-opentype', 'truetype'].indexOf(j) > -1)
                                                    sources.push('url("' + this.url[j] + '") format("' + j + '")')
                                            }
                                        }
                                        return '@font-face { font-family: "' + this.name + '"; src: ' + sources.join(',') + '; }';
                                    };
                                    roomFonts.push(font.toString());
                                }
                            }
                            Styles.set('rss-fonts', roomFonts.join('\n'));
                        }
                        // css.import
                        if (roomSettings.css.import !== undefined && $.isArray(roomSettings.css.import)) {
                            var roomImports = [];
                            for (i in roomSettings.css.import) {
                                if (roomSettings.css.import.hasOwnProperty(i) && typeof roomSettings.css.import[i] === 'string')
                                    roomImports.push('@import url("' + roomSettings.css.import[i] + '")');
                            }
                            Styles.set('rss-imports', roomImports.join('\n'));
                        }
                        // css.setting
                        if (roomSettings.css.rule !== undefined) {
                            var roomCSSRules = [];
                            for (i in roomSettings.css.rule) {
                                if (!roomSettings.css.rule.hasOwnProperty(i)) continue;
                                var rule = [];
                                for (var j in roomSettings.css.rule[i]) {
                                    if (!roomSettings.css.rule[i].hasOwnProperty(j)) continue;
                                    rule.push(j + ':' + roomSettings.css.rule[i][j]);
                                }
                                roomCSSRules.push(i + ' {' + rule.join(';') + '}');
                            }
                            Styles.set('rss-rules', roomCSSRules.join('\n'));
                        }
                    }

                    // images
                    if (roomSettings.images !== undefined) {
                        // images.background
                        if (roomSettings.images.background)
                            Styles.set('rss-background-image', '.room-background { background-image: url("' + p3Utils.proxifyImage(roomSettings.images.background) + '")!important; }');

                        // images.playback
                        if (!p3Utils.runLite) {
                            var playbackBackground = $('#playback').find('.background img');
                            if (playbackBackground.data('_o') === undefined)
                                playbackBackground.data('_o', playbackBackground.attr('src'));
                            var roomLoader = require('ce221/df202/bd7f7/caba5');
                            if (roomSettings.images.playback && typeof roomSettings.images.playback === 'string') {
                                var playbackFrame = new Image;
                                playbackFrame.onload = function() {
                                    playbackBackground.attr('src', this.src);
                                    roomLoader.frameHeight = this.height;
                                    roomLoader.frameWidth = this.width;
                                    roomLoader.onVideoResize(require('ce221/fff6a/abfed').getSize());
                                };
                                playbackFrame.src = p3Utils.proxifyImage(roomSettings.images.playback);
                            } else {
                                playbackBackground.attr('src', playbackBackground.data('_o'));
                                roomLoader.frameHeight = playbackBackground.height();
                                roomLoader.frameWidth = playbackBackground.width();
                                roomLoader.onVideoResize(require('ce221/fff6a/abfed').getSize());
                            }
                        }

                        // images.booth
                        if (roomSettings.images.booth !== undefined && typeof roomSettings.images.booth === 'string')
                            $('#dj-booth').append($('<div id="p3-dj-booth">').css('background-image', 'url("' + p3Utils.proxifyImage(roomSettings.images.booth) + '")'));

                        // images.icons
                        if (roomSettings.images.icons !== undefined) {
                            a = {};
                            for (i in roomSettings.images.icons) {
                                if (!roomSettings.images.icons.hasOwnProperty(i)) continue;
                                if (ranks.indexOf(i) > -1 && typeof roomSettings.images.icons[i] === 'string')
                                    a[i] = p3Utils.proxifyImage(roomSettings.images.icons[i]);
                            }
                            this.chatIcons = a;
                        }
                    }

                    // text
                    if (roomSettings.text !== undefined) {
                        // text.plugCubed
                        if (roomSettings.text.plugCubed !== undefined) {

                        }

                        // text.plugDJ
                        if (roomSettings.text.plugDJ !== undefined) {
                            for (i in roomSettings.text.plugDJ) {
                                if (!roomSettings.text.plugDJ.hasOwnProperty(i)) continue;
                                var value = roomSettings.text.plugDJ[i];
                                if (i && value && typeof value == 'string')
                                    setPlugDJLang(i, roomSettings.text.plugDJ[i]);
                            }
                        }
                    }
                }

                // rules
                if (roomSettings.rules !== undefined) {
                    this.rules.allowAutowoot = roomSettings.rules.allowAutowoot === undefined || roomSettings.rules.allowAutowoot === 'true' || roomSettings.rules.allowAutowoot === true;
                    this.rules.allowAutojoin = roomSettings.rules.allowAutojoin === undefined || roomSettings.rules.allowAutojoin === 'true' || roomSettings.rules.allowAutojoin === true;
                    this.rules.allowAutorespond = roomSettings.rules.allowAutorespond === undefined || roomSettings.rules.allowAutorespond === 'true' || roomSettings.rules.allowAutorespond === true;
                } else {
                    this.rules.allowAutowoot = true;
                    this.rules.allowAutojoin = true;
                    this.rules.allowAutorespond = true;
                }

                // roomscript
                if (roomSettings.roomscript !== undefined) {
                    // TODO: Make this
                }

                // Update autorespond
                if (Settings.autorespond) {
                    if (this.rules.allowAutorespond) {
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                        if (API.getUser().status <= 0)
                            API.setStatus(API.STATUS.AFK);
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                        API.setStatus(API.STATUS.AVAILABLE);
                    }
                }

                if (showMessage) {
                    p3Utils.chatLog(undefined, (typeof roomSettings.author === 'string' ? p3Lang.i18n('roomSpecificSettings.infoHeaderCredits', p3Utils.cleanHTML(roomSettings.author, '*')) : p3Lang.i18n('roomSpecificSettings.infoHeader')) + '<br>' + p3Lang.i18n('roomSpecificSettings.infoDisable'), p3Utils.logColors.infoMessage2);
                    showMessage = false;
                }

                require('plugCubed/CustomChatColors').update();

                // Redraw menu
                require('plugCubed/dialogs/Menu').createMenu();
            }
        },
        close: function() {
            if (!p3Utils.runLite)
                RoomModel.off('change:description', this.update, this);

            this.chatColors = {};
            this.chatIcons = {};

            for (var i in langKeys) {
                if (!langKeys.hasOwnProperty(i)) continue;
                var key = langKeys[i];
                setPlugDJLang(key, getPlugDJLang(key, true));
            }

            $('#p3-dj-booth').remove();

            Styles.unset([
                'rss-background-color', 'rss-background-image', 'rss-booth', 'rss-fonts', 'rss-imports', 'rss-rules', 'rss-maingui'
            ]);
        }
    });
    return new handler();
});
define('plugCubed/Slider', ['jquery', 'plugCubed/Class'], function($, Class) {
    return Class.extend({
        init: function(min, max, val, callback) {
            this.min = min ? min : 0;
            this.max = max ? max : 100;
            this.value = val ? val : this.min;
            this.cb = callback;

            this.startBind = $.proxy(this.onStart, this);
            this.moveBind = $.proxy(this.onUpdate, this);
            this.stopBind = $.proxy(this.onStop, this);
            this.clickBind = $.proxy(this.onClick, this);

            this.$slider = $('<div class="p3slider"><div class="line"></div><div class="circle"></div><div class="hit"></div></div>');
            this.$line = this.$slider.find('.line');
            this.$hit = this.$slider.find('.hit');
            this.$circle = this.$slider.find('.circle');

            this.$hit.mousedown(this.startBind);

            this._max = this.$hit.width() - this.$circle.width();
            this.onChange();

            return this;
        },
        onStart: function(event) {
            this._min = this.$hit.offset().left;
            this._max = this.$hit.width() - this.$circle.width();
            $(document).on('mouseup', this.stopBind).on('mousemove', this.moveBind);
            return this.onUpdate(event);
        },
        onUpdate: function(event) {
            this.value = Math.max(this.min, Math.min(this.max, ~~ ((this.max - this.min) * ((event.pageX - this._min) / this._max)) + this.min));
            this.onChange();
            event.preventDefault();
            event.stopPropagation();
            return false;
        },
        onStop: function(event) {
            $(document).off('mouseup', this.stopBind).off('mousemove', this.moveBind);
            event.preventDefault();
            event.stopPropagation();
            return false;
        },
        onChange: function() {
            this.$circle.css('left', parseInt(this.$hit.css('left')) + this.$line.width() * ((this.value - this.min) / (this.max - this.min)) - this.$circle.width() / 2);
            if (typeof this.cb === 'function') this.cb(this.value);
        }
    });
});
define('plugCubed/CustomChatColors', ['jquery', 'plugCubed/Class', 'plugCubed/RSS', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils'], function($, Class, RSS, Styles, Settings, p3Utils) {
    var handler = Class.extend({
        update: function() {
            var useRoomSettings = Settings.useRoomSettings[document.location.pathname.split('/')[1]];
            useRoomSettings = !!(useRoomSettings === undefined || useRoomSettings === true);

            Styles.unset(['CCC-text-admin', 'CCC-text-ambassador', 'CCC-text-host', 'CCC-text-cohost', 'CCC-text-manager', 'CCC-text-bouncer', 'CCC-text-residentdj', 'CCC-text-regular', 'CCC-text-you', 'CCC-image-admin', 'CCC-image-ambassador', 'CCC-image-host', 'CCC-image-cohost', 'CCC-image-manager', 'CCC-image-bouncer', 'CCC-image-residentdj']);

            if ((useRoomSettings && RSS.chatColors.admin) || Settings.colors.admin !== Settings.colorInfo.ranks.admin.color) {
                Styles.set('CCC-text-admin', ['#user-panel:not(.is-none) .user > .icon-chat-admin + .name', '#user-lists .user > .icon-chat-admin + .name', '.message > .icon-chat-admin ~ .from', '.emote > .icon-chat-admin ~ .from', '.mention > .icon-chat-admin ~ .from { color:' + p3Utils.toRGB(Settings.colors.admin !== Settings.colorInfo.ranks.admin.color ? Settings.colors.admin : RSS.chatColors.admin) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.ambassador) || Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color) {
                Styles.set('CCC-text-ambassador', ['#user-panel:not(.is-none) .user > .icon-chat-ambassador + .name', '#user-lists .user > .icon-chat-ambassador + .name', '.message > .icon-chat-ambassador ~ .from', '.emote > .icon-chat-ambassador ~ .from', '.mention > .icon-chat-ambassador ~ .from { color:' + p3Utils.toRGB(Settings.colors.ambassador !== Settings.colorInfo.ranks.ambassador.color ? Settings.colors.ambassador : RSS.chatColors.ambassador) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.host) || Settings.colors.host !== Settings.colorInfo.ranks.host.color) {
                Styles.set('CCC-text-host', ['#user-panel:not(.is-none) .user > .icon-chat-host + .name', '#user-lists .user > .icon-chat-host + .name', '.message > .icon-chat-host ~ .from', '.emote > .icon-chat-host ~ .from', '.mention > .icon-chat-host ~ .from { color:' + p3Utils.toRGB(Settings.colors.host !== Settings.colorInfo.ranks.host.color ? Settings.colors.host : RSS.chatColors.host) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.cohost) || Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color) {
                Styles.set('CCC-text-cohost', ['#user-panel:not(.is-none) .user > .icon-chat-cohost + .name', '#user-lists .user > .icon-chat-cohost + .name', '.message > .icon-chat-cohost ~ .from', '.emote > .icon-chat-cohost ~ .from', '.mention > .icon-chat-cohost ~ .from { color:' + p3Utils.toRGB(Settings.colors.cohost !== Settings.colorInfo.ranks.cohost.color ? Settings.colors.cohost : RSS.chatColors.cohost) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.manager) || Settings.colors.manager !== Settings.colorInfo.ranks.manager.color) {
                Styles.set('CCC-text-manager', ['#user-panel:not(.is-none) .user > .icon-chat-manager + .name', '#user-lists .user > .icon-chat-manager + .name', '.message > .icon-chat-manager ~ .from', '.emote > .icon-chat-manager ~ .from', '.mention > .icon-chat-manager ~ .from { color:' + p3Utils.toRGB(Settings.colors.manager !== Settings.colorInfo.ranks.manager.color ? Settings.colors.manager : RSS.chatColors.manager) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.bouncer) || Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color) {
                Styles.set('CCC-text-bouncer', ['#user-panel:not(.is-none) .user > .icon-chat-bouncer + .name', '#user-lists .user > .icon-chat-bouncer + .name', '.message > .icon-chat-bouncer ~ .from', '.emote > .icon-chat-bouncer ~ .from', '.mention > .icon-chat-bouncer ~ .from { color:' + p3Utils.toRGB(Settings.colors.bouncer !== Settings.colorInfo.ranks.bouncer.color ? Settings.colors.bouncer : RSS.chatColors.bouncer) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.residentdj) || Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color) {
                Styles.set('CCC-text-residentdj', ['#user-panel:not(.is-none) .user > .icon-chat-dj + .name', '#user-lists .user > .icon-chat-dj + .name', '.message > .icon-chat-dj ~ .from', '.emote > .icon-chat-dj ~ .from', '.mention > .icon-chat-dj ~ .from { color:' + p3Utils.toRGB(Settings.colors.residentdj !== Settings.colorInfo.ranks.residentdj.color ? Settings.colors.residentdj : RSS.chatColors.residentdj) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.regular) || Settings.colors.regular !== Settings.colorInfo.ranks.regular.color) {
                Styles.set('CCC-text-regular', ['#user-panel:not(.is-none) .user > .name:first-child', '#user-lists .user > .name:first-child', '.message > .from', '.emote > .from', '.mention > .from { color:' + p3Utils.toRGB(Settings.colors.regular !== Settings.colorInfo.ranks.regular.color ? Settings.colors.regular : RSS.chatColors.regular) + '!important; }'].join(",\n"));
            }
            if ((useRoomSettings && RSS.chatColors.you) || Settings.colors.you !== Settings.colorInfo.ranks.you.color) {
                Styles.set('CCC-text-you', ['#user-lists .list .user.is-you .name', '.message > .from-you', '.emote > .from-you', '.mention > .from-you { color:' + p3Utils.toRGB(Settings.colors.you !== Settings.colorInfo.ranks.you.color ? Settings.colors.you : RSS.chatColors.you) + '!important; }'].join(",\n"));
            }
            if (useRoomSettings) {
                if (RSS.chatIcons.admin)
                    Styles.set('CCC-image-admin', ['.icon-chat-admin { background-image: url("' + RSS.chatIcons.admin + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.ambassador)
                    Styles.set('CCC-image-ambassador', ['.icon-chat-ambassador { background-image: url("' + RSS.chatIcons.ambassador + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.host)
                    Styles.set('CCC-image-host', ['.icon-chat-host { background-image: url("' + RSS.chatIcons.host + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.cohost)
                    Styles.set('CCC-image-cohost', ['.icon-chat-cohost { background-image: url("' + RSS.chatIcons.cohost + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.manager)
                    Styles.set('CCC-image-manager', ['.icon-chat-manager { background-image: url("' + RSS.chatIcons.manager + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.bouncer)
                    Styles.set('CCC-image-bouncer', ['.icon-chat-bouncer { background-image: url("' + RSS.chatIcons.bouncer + '"); background-position: 0 0; }'].join(",\n"));
                if (RSS.chatIcons.residentdj)
                    Styles.set('CCC-image-residentdj', ['.icon-chat-dj { background-image: url("' + RSS.chatIcons.residentdj + '"); background-position: 0 0; }'].join(",\n"));
            }
        }
    });
    return new handler();
});
define('plugCubed/dialogs/CustomChatColors', ['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/CustomChatColors', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function($, Class, p3Lang, CCC, Settings, p3Utils, _$context) {
    function GUIInput(id, text, defaultColor) {
        if (!Settings.colors[id])
            Settings.colors[id] = defaultColor;
        return $('<div class="item">').addClass('p3-s-cc-' + id).append($('<span>').text(text)).append($('<span>').addClass('default').css('display', Settings.colors[id] === defaultColor ? 'none' : 'block').mouseover(function() {
            _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.reset'), $(this), false);
        }).mouseout(function() {
            _$context.trigger('tooltip:hide');
        }).click(function() {
            $(this).parent().find('input').val(defaultColor);
            $(this).parent().find('.example').css('background-color', p3Utils.toRGB(defaultColor));
            $(this).css('display', 'none');
            Settings.colors[id] = defaultColor;
            Settings.save();
            CCC.update();
        })).append($('<span>').addClass('example').css('background-color', p3Utils.toRGB(Settings.colors[id]))).append($('<input>').val(Settings.colors[id]).keyup(function() {
            if (p3Utils.isRGB($(this).val())) {
                $(this).parent().find('.example').css('background-color', p3Utils.toRGB($(this).val()));
                Settings.colors[id] = $(this).val();
                Settings.save();
                CCC.update();
            }
            $(this).parent().find('.default').css('display', $(this).val() === defaultColor ? 'none' : 'block');
        }));
    }

    var div, a = Class.extend({
        render: function() {
            var i, $settings = $('#p3-settings');
            if (div !== undefined) {
                if (div.css('left') === '-271px') {
                    div.animate({
                        left: $settings.width() + 1
                    });
                    return;
                }
                div.animate({
                    left: -271
                });
                return;
            }
            var container = $('<div class="container">').append($('<div class="section">').text('User Ranks'));
            for (i in Settings.colorInfo.ranks) {
                if (Settings.colorInfo.ranks.hasOwnProperty(i))
                    container.append(GUIInput(i, p3Lang.i18n(Settings.colorInfo.ranks[i].title), Settings.colorInfo.ranks[i].color));
            }
            container.append($('<div class="spacer">').append($('<div class="divider">'))).append($('<div class="section">').text(p3Lang.i18n('notify.header')));
            for (i in Settings.colorInfo.notifications) {
                if (Settings.colorInfo.notifications.hasOwnProperty(i))
                    container.append(GUIInput(i, p3Lang.i18n(Settings.colorInfo.notifications[i].title), Settings.colorInfo.notifications[i].color));
            }
            div = $('<div id="p3-settings-custom-colors" style="left: -271px;">').append($('<div class="header">').append($('<div class="back">').append($('<i class="icon icon-arrow-left"></i>')).click(function() {
                if (div !== undefined) div.animate({
                    left: -271
                });
            })).append($('<div class="title">').append($('<span>').text(p3Lang.i18n('menu.customchatcolors'))))).append(container).animate({
                left: $settings.width() + 1
            });
            $('body').append(div);
        },
        hide: function() {
            if (div !== undefined) div.animate({
                left: -271
            });
        }
    });
    return new a();
});
define('plugCubed/dialogs/ControlPanel', ['jquery', 'underscore', 'plugCubed/Class'], function($, _, Class) {
    var $controlPanelDiv, $menuDiv, $currentDiv, $closeDiv, shownHeight, ControlPanelClass, tabs = {},
        _this, _onResize, _onTabClick;
    ControlPanelClass = Class.extend({
        init: function() {
            _this = this;
            _onResize = _.bind(this.onResize, this);
            _onTabClick = _.bind(this.onTabClick, this);

            $(window).resize(_onResize);

            this.shown = false;
        },
        close: function() {
            $(window).off('resize', _onResize);
            if ($controlPanelDiv !== undefined)
                $controlPanelDiv.remove();
        },
        createControlPanel: function(onlyRecreate) {
            if ($controlPanelDiv !== undefined) {
                $controlPanelDiv.remove();
            } else if (onlyRecreate) return;
            $controlPanelDiv = $('<div>').attr('id', 'p3-control-panel');

            $menuDiv = $('<div>').attr('id', 'p3-control-panel-menu');

            for (var i in tabs) {
                if (tabs.hasOwnProperty(i)) {
                    $menuDiv.append($('<div>').addClass('p3-control-panel-menu-tab').data('id', i).text(i).click(_onTabClick));
                }
            }

            $controlPanelDiv.append($menuDiv);

            $currentDiv = $('<div>').attr('id', 'p3-control-pannel-current');

            $controlPanelDiv.append($currentDiv);

            $closeDiv = $('<div>').attr('id', 'p3-control-panel-close').append('<i class="icon icon-playlist-close"></i>').click(function() {
                _this.toggleControlPanel(false);
            });

            $controlPanelDiv.append($closeDiv);

            $('body').append($controlPanelDiv);
            this.onResize();
        },
        /**
         * Create an input field
         * @param {string} type Type of input field
         * @param {undefined|string} [label]
         * @param {undefined|string} [placeholder] Placeholder
         * @returns {*|jQuery}
         */
        inputField: function(type, label, placeholder) {
            var $div, $label, $input;

            $div = $('<div>').addClass('input-group');
            if (label)
                $label = $('<div>').addClass('label').text(label);
            $input = $('<input>').attr({
                type: type,
                placeholder: placeholder
            });

            if (label)
                $div.append($label);
            $div.append($input);
            return $div;
        },
        /**
         * This callback type is called `requestCallback` and is displayed as a global symbol.
         *
         * @callback onButtonClick
         * @param {object}
         */
        /**
         * Create a button
         * @param {string} label
         * @param {boolean} submit
         * @param {onButtonClick} onClick
         * @returns {*|jQuery}
         */
        button: function(label, submit, onClick) {
            var $div = $('<div>').addClass('button').text(label);
            if (submit)
                $div.addClass('submit');
            if (typeof onClick === 'function')
                $div.click(onClick);
            return $div;
        },
        onResize: function() {
            if ($controlPanelDiv === undefined) return;
            var $panel = $('#playlist-panel'),
                shownHeight = $(window).height() - 150;
            $controlPanelDiv.css({
                width: $panel.width(),
                height: this.shown ? shownHeight : 0,
                'z-index': 50
            });
            $currentDiv.css({
                width: $panel.width() - 256 - 20,
                height: this.shown ? shownHeight - 20 : 0
            });
        },
        toggleControlPanel: function(shown) {
            if ($controlPanelDiv === undefined) {
                if (shown !== undefined && !shown) return;
                this.createControlPanel();
            }
            this.shown = shown !== undefined ? shown : !this.shown;
            shownHeight = $(window).height() - 150;
            $controlPanelDiv.animate({
                height: this.shown ? shownHeight : 0
            }, {
                duration: 350,
                easing: 'easeInOutExpo',
                complete: function() {
                    if (!_this.shown) {
                        $controlPanelDiv.detach();
                        $controlPanelDiv = undefined;
                    }
                }
            });
        },
        onTabClick: function(e) {
            var $this = $(e.currentTarget);
            var tab = tabs[$this.data('id')];
            if (tab === undefined) return;
            $menuDiv.find('.current').removeClass('current');
            $this.addClass('current');
            $currentDiv.html('');
            for (var i in tab) {
                if (tab.hasOwnProperty(i))
                    $currentDiv.append(tab[i]);
            }
        },
        /**
         * Add a new tab, if it doesn't already exists
         * @param {string} name Name of tab
         * @returns {ControlPanelClass}
         */
        addTab: function(name) {
            name = name.trim();
            if (tabs[name] !== undefined) return this;
            tabs[name] = [];
            this.createControlPanel(true);
            return this;
        },
        /**
         * Add content to a tab, if tab exists
         * @param {string} name Name of tab
         * @param content Content to be added
         * @returns {ControlPanelClass}
         */
        addToTab: function(name, content) {
            name = name.trim();
            if (tabs[name] === undefined) return this;
            tabs[name].push(content);
            return this;
        },
        /**
         * Remove a tab, if tab exists
         * @param {string} name Name of tab
         * @returns {ControlPanelClass}
         */
        removeTab: function(name) {
            name = name.trim();
            if (tabs[name] === undefined) return this;
            delete tabs[name];
            this.createControlPanel(true);
            return this;
        }
    });
    return new ControlPanelClass();
});
define('plugCubed/handlers/ChatHandler', ['jquery', 'plugCubed/Class', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/bridges/Context'], function($, Class, p3Utils, p3Lang, Settings, _$context) {
    var PopoutView, twitchEmotes = [];

    if (!p3Utils.runLite)
        PopoutView = require('ce221/df202/bd7f7/bc67e/e39c3');

    function convertImageLinks(text) {
        if (Settings.chatImages) {
            if (text.toLowerCase().indexOf('nsfw') < 0) {
                var temp = $('<div/>');
                temp.html(text).find('a').each(function() {
                    var url = $(this).attr('href'),
                        path, imageURL = null;

                    // Prevent plug.dj exploits
                    if (p3Utils.startsWithIgnoreCase(url, ['http://plug.dj', 'https://plug.dj'])) {
                        return;

                        // Normal image links
                    } else if (p3Utils.endsWithIgnoreCase(url, ['.gif', '.jpg', '.jpeg', '.png']) || p3Utils.endsWithIgnoreCase(p3Utils.getBaseURL(url), ['.gif', '.jpg', '.jpeg', '.png'])) {
                        imageURL = p3Utils.proxifyImage(url);

                        // gfycat links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://gfycat.com/', 'https://gfycat.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0)
                                imageURL = 'https://api.plugCubed.net/redirect/gfycat/' + path;
                        }

                        // Lightshot links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://prntscr.com/', 'https://prntscr.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0)
                                imageURL = 'https://prntscr.com/' + path + '/direct';
                        }

                        // Imgur links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://imgur.com/gallery/', 'https://imgur.com/gallery/'])) {
                        path = url.split('/');
                        if (path.length > 4) {
                            path = path[4];
                            if (path.trim().length !== 0)
                                imageURL = 'https://api.plugCubed.net/redirect/imgur/' + path;
                        }

                        // Gyazo links
                    } else if (p3Utils.startsWithIgnoreCase(url, ['http://gyazo.com/', 'https://gyazo.com/'])) {
                        path = url.split('/');
                        if (path.length > 3) {
                            path = path[3];
                            if (path.trim().length !== 0)
                                imageURL = 'https://i.gyazo.com/' + path + '.png';
                        }
                    } else {
                        // DeviantArt links
                        var daTests = [/http:\/\/[a-z\-\.]+\.deviantart.com\/art\/[0-9a-zA-Z:\-]+/, /http:\/\/[a-z\-\.]+\.deviantart.com\/[0-9a-zA-Z:\-]+#\/[0-9a-zA-Z:\-]+/, /http:\/\/fav.me\/[0-9a-zA-Z]+/, /http:\/\/sta.sh\/[0-9a-zA-Z]+/];
                        for (var i in daTests) {
                            if (daTests.hasOwnProperty(i) && daTests[i].test(url)) {
                                imageURL = 'https://api.plugCubed.net/redirect/da/' + url;
                                break;
                            }
                        }
                    }

                    // If supported image link
                    if (imageURL !== null) {
                        var image = $('<img>').attr('src', imageURL).css('display', 'block').css('max-width', '100%').css('height', 'auto').css('margin', '0 auto');
                        $(this).html(image);
                        image.on('load', function() {
                            var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                                height = this.height;
                            if (this.width > $chat.find('.message').width())
                                height *= this.width / $chat.find('.message').width();
                            $chat.scrollTop($chat[0].scrollHeight + height);
                        });
                    }
                });
                text = temp.html();
            }
        }
        return text;
    }

    function convertEmotes(text) {
        if (Settings.twitchEmotes) {
            var nbspStart = p3Utils.startsWithIgnoreCase(text, '&nbsp;');
            text = ' ' + (nbspStart ? text.replace('&nbsp;', '') : text) + ' ';
            for (var i in twitchEmotes) {
                if (!twitchEmotes.hasOwnProperty(i)) continue;
                var twitchEmote = twitchEmotes[i];
                if (text.indexOf(' ' + twitchEmote.emote + ' ') > -1) {
                    var temp = $('<div>'),
                        image = $('<img>').attr('src', twitchEmote.url).data('emote', $('<span>').html(twitchEmote.emote).text()).mouseover(function() {
                            _$context.trigger('tooltip:show', $(this).data('emote'), $(this), true);
                        }).mouseout(function() {
                            _$context.trigger('tooltip:hide');
                        });
                    image.on('load', function() {
                        var $chat = PopoutView && PopoutView._window ? $(PopoutView._window.document).find('#chat-messages') : $('#chat-messages'),
                            height = this.height;
                        if (this.width > $chat.find('.message').width())
                            height *= this.width / $chat.find('.message').width();
                        $chat.scrollTop($chat[0].scrollHeight + height);
                    });
                    temp.append(image);
                    text = text.split(' ' + twitchEmote.emote + ' ').join(' ' + temp.html() + ' ');
                }
            }
            return (nbspStart ? '&nbsp;' : '') + text.substr(1, text.length - 2);
        }
        return text;
    }

    function onChatReceived(data) {
        if (!data.uid) return;

        if (API.getUser().permission > API.ROLE.RESIDENTDJ && (function(_) {
            return p3Utils.isPlugCubedDeveloper(_) || p3Utils.isPlugCubedSponsor(_) || p3Utils.isPlugCubedAmbassador(_);
        })(API.getUser().id)) {
            data.deletable = true;
        }

        data.type += ' fromID-' + data.uid;

        if (p3Utils.havePlugCubedRank(data.uid))
            data.type += ' is-p3' + p3Utils.getHighestRank(data.uid);

        if (p3Utils.hasPermission(data.uid, API.ROLE.RESIDENTDJ) || p3Utils.hasPermission(data.uid, 1, true) || data.uid == API.getUser().id) {
            data.type += ' from-';
            if (p3Utils.hasPermission(data.uid, API.ROLE.HOST, true)) {
                data.type += 'admin';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER, true)) {
                data.type += 'ambassador';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.HOST)) {
                data.type += 'host';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.COHOST)) {
                data.type += 'cohost';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.MANAGER)) {
                data.type += 'manager';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.BOUNCER)) {
                data.type += 'bouncer';
            } else if (p3Utils.hasPermission(data.uid, API.ROLE.RESIDENTDJ)) {
                data.type += 'dj';
            } else if (data.uid == API.getUser().id) {
                data.type += 'you';
            }
        }

        if (data.type.split(' ')[0] === 'mention') {
            data.type += ' is-';
            if (p3Utils.hasPermission(undefined, 5, true)) {
                data.type += 'admin';
            } else if (p3Utils.hasPermission(undefined, 2, true)) {
                data.type += 'ambassador';
            } else if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER)) {
                data.type += 'staff';
            } else if (p3Utils.hasPermission(undefined, API.ROLE.DJ)) {
                data.type += 'dj';
            } else {
                data.type += 'you';
            }
            data.message = data.message.split('@' + API.getUser().username).join('<span class="name">@' + API.getUser().username + '</span>');
        }

        data.message = convertImageLinks(data.message);
        data.message = convertEmotes(data.message);
    }

    function onChatReceivedLate(data) {
        if (!data.uid) return;

        var $this = $('#chat').find('div[data-cid="' + data.cid + '"]'),
            $icon;

        if (data.type.split(' ')[0] === 'pm') {
            $icon = $this.find('.icon');
            if ($icon.length === 0) {
                $('<i>').addClass('icon').css({
                    width: '16px',
                    height: '16px'
                }).appendTo($this);
            }
            if ($('.icon-chat-sound-on').length > 0) {
                p3Utils.playChatSound();
            }
        } else if (p3Utils.havePlugCubedRank(data.uid) || API.getUser(data.uid).permission > API.ROLE.NONE) {
            $icon = $this.find('.icon');
            var specialIconInfo = p3Utils.getPlugCubedSpecial(data.uid);
            if ($icon.length === 0) {
                $icon = $('<i>').addClass('icon').css({
                    width: '16px',
                    height: '16px'
                }).appendTo($this);
            }

            $icon.mouseover(function() {
                _$context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(data.uid)).text(), $(this), true);
            }).mouseout(function() {
                _$context.trigger('tooltip:hide');
            });

            if (specialIconInfo !== undefined) {
                $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")');
            }
        }

        if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
            $this.data('translated', false);
            $this.dblclick(function() {
                if ($this.data('translated')) {
                    $this.find('.text').html(convertEmotes(convertImageLinks(data.message)));
                    $this.data('translated', false);
                } else {
                    $this.find('.text').html('<em>Translating...</em>');
                    $.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Ftranslate.google.com%2Ftranslate_a%2Ft%3Fclient%3Dp3%26sl%3Dauto%26tl%3D' + API.getUser().language + '%26ie%3DUTF-8%26oe%3DUTF-8%26q%3D' + encodeURIComponent(encodeURIComponent(data.message.replace('&nbsp;', ' '))) + '%22&format=json', function(a) {
                        if (a.error) {
                            $this.find('.text').html(convertEmotes(convertImageLinks(data.message)));
                            $this.data('translated', false);
                        } else {
                            $this.find('.text').html(convertEmotes(convertImageLinks('&nbsp;' + a.query.results.json.sentences.trans)));
                            $this.data('translated', true);
                        }
                    }, 'json');
                }
            });
        }
    }

    function onChatDelete(cid) {
        if (!p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) && !p3Utils.isPlugCubedDeveloper())
            return;
        var $messages = $('#chat').find('div[data-cid="' + cid + '"]');
        if ($messages.length > 0) {
            $messages.each(function() {
                $(this).removeClass('deletable').css('opacity', 0.3).off('mouseenter').off('mouseleave');
            });
            cid = '';
        }
    }

    var handler = Class.extend({
        loadTwitchEmotes: function() {
            $.getJSON('https://api.plugcubed.net/proxy/http://twitchemotes.com/global.json', function(data) {
                twitchEmotes = [];
                for (var i in data) {
                    if (!data.hasOwnProperty(i)) continue;
                    twitchEmotes.push({
                        emote: i,
                        url: data[i].url.indexOf('http://') === 0 ? 'https://' + data[i].url.substr(7) : data[i].url
                    });
                }
                console.log('[plugÂ³]', twitchEmotes.length + ' Twitch.TV emoticons loaded!');
            });
        },
        unloadTwitchEmotes: function() {
            twitchEmotes = [];
        },
        register: function() {
            _$context.on('chat:receive', onChatReceived);
            _$context._events['chat:receive'].unshift(_$context._events['chat:receive'].pop());
            _$context.on('chat:receive', onChatReceivedLate);

            _$context.on('chat:delete', onChatDelete);
            _$context._events['chat:delete'].unshift(_$context._events['chat:delete'].pop());
        },
        close: function() {
            _$context.off('chat:receive', onChatReceived);
            _$context.off('chat:receive', onChatReceivedLate);
            _$context.off('chat:delete', onChatDelete);
        }
    });
    return new handler();
});
define('plugCubed/dialogs/Menu', ['jquery', 'plugCubed/Class', 'plugCubed/Version', 'plugCubed/enums/Notifications', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/StyleManager', 'plugCubed/RSS', 'plugCubed/Slider', 'plugCubed/dialogs/CustomChatColors', 'plugCubed/dialogs/ControlPanel', 'plugCubed/bridges/Context', 'plugCubed/handlers/ChatHandler', 'lang/Lang'], function($, Class, Version, enumNotifications, Settings, p3Utils, p3Lang, Styles, RSS, Slider, dialogColors, dialogControlPanel, _$context, ChatHandler, Lang) {
    var $menuDiv, Database, PlaybackModel, menuClass, _this, menuButton, streamButton, clearChatButton, _onClick;

    menuButton = $('<div id="plugcubed"><div class="cube-wrap"><div class="cube"><i class="icon icon-plugcubed"></i><i class="icon icon-plugcubed other"></i></div></div></div>');
    streamButton = $('<div>').addClass('chat-header-button p3-s-stream').data('key', 'stream');
    clearChatButton = $('<div>').addClass('chat-header-button p3-s-clear').data('key', 'clear');

    if (!p3Utils.runLite) {
        Database = require('ce221/b0533/e5fad');
        PlaybackModel = require('ce221/bbc3c/f6ff1');
    }

    function GUIButton(setting, id, text) {
        return $('<div>').addClass('item p3-s-' + id + (setting ? ' selected' : '')).append($('<i>').addClass('icon icon-check-blue')).append($('<span>').text(text)).data('key', id).click(_onClick);
    }

    function GUILang() {
        $select = $('<select>');
        for (var i in p3Lang.allLangs) {
            var lang = p3Lang.allLangs[i],
                option = $('<option>').attr('value', lang.file).text(lang.name);
            if (lang.file === p3Lang.curLang)
                option.attr('selected', 'selected');
            $select.append(option);
        }
        $select.change(function() {
            p3Lang.load($(this).find('option:selected').attr('value'), function() {
                _this.createMenu();
            })
        });
        return $('<div>').addClass('item p3-s-language selected').append($('<i>').addClass('icon icon-p3-lang')).append($('<span>').append($select));
    }

    menuClass = Class.extend({
        init: function() {
            _this = this;
            _onClick = $.proxy(this.onClick, this);

            this.shown = false;

            $('#app-menu').after(menuButton);
            menuButton.click(function() {
                _this.toggleMenu();
                dialogControlPanel.toggleControlPanel(false);
            });
            $('#room-bar').css('left', 108).find('.favorite').css('right', 55);

            if (!p3Utils.runLite) {
                $('#chat-header').append(streamButton.click($.proxy(this.onClick, this)).mouseover(function() {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.stream'), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                })).append(clearChatButton.click($.proxy(this.onClick, this)).mouseover(function() {
                    _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.clear'), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                }));
                this.setEnabled('stream', Database.settings.streamDisabled);
            }
        },
        close: function() {
            menuButton.remove();
            if ($menuDiv !== undefined)
                $menuDiv.remove();
            $('#room-bar').css('left', 54).find('.favorite').css('right', 0);
            if (!p3Utils.runLite) {
                streamButton.remove();
                clearChatButton.remove();
            }
            dialogControlPanel.close();
        },
        /**
         * Set whether a menu setting is enabled
         * @param {String} id Menu setting ID
         * @param {Boolean} value Is this menu setting enabled?
         */
        setEnabled: function(id, value) {
            var elem = $('.p3-s-' + id).removeClass('selected');
            if (value) elem.addClass('selected');
        },
        /**
         * Handle click event
         * @param {Event} e The click event
         */
        onClick: function(e) {
            var a = $(e.currentTarget).data('key');
            switch (a) {
                case 'woot':
                    Settings.autowoot = !Settings.autowoot;
                    this.setEnabled('woot', Settings.autowoot);
                    if (Settings.autowoot) {
                        (function() {
                            var dj = API.getDJ();
                            if (dj === null || dj.id === API.getUser().id) return;
                            $('#woot').click();
                        })();
                    }
                    break;
                case 'join':
                    Settings.autojoin = !Settings.autojoin;
                    this.setEnabled('join', Settings.autojoin);
                    if (Settings.autojoin) {
                        (function() {
                            var dj = API.getDJ();
                            if (dj === null || dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
                            $('#dj-button').click();
                        })();
                    }
                    break;
                case 'chatimages':
                    Settings.chatImages = !Settings.chatImages;
                    this.setEnabled('chatimages', Settings.chatImages);
                    break;
                case 'twitchemotes':
                    Settings.twitchEmotes = !Settings.twitchEmotes;
                    if (Settings.twitchEmotes) {
                        ChatHandler.loadTwitchEmotes();
                    } else {
                        ChatHandler.unloadTwitchEmotes();
                    }
                    this.setEnabled('twitchemotes', Settings.twitchEmotes);
                    break;
                case 'colors':
                    dialogColors.render();
                    break;
                case 'controlpanel':
                    dialogControlPanel.toggleControlPanel(true);
                    this.toggleMenu(false);
                    break;
                case 'autorespond':
                    Settings.autorespond = !Settings.autorespond;
                    this.setEnabled('autorespond', Settings.autorespond);
                    if (Settings.autorespond) {
                        if (Settings.awaymsg.trim() === "") Settings.awaymsg = p3Lang.i18n('autorespond.default');
                        $('#chat-input-field').attr('disabled', 'disabled').attr('placeholder', p3Lang.i18n('autorespond.disable'));
                        if (API.getUser().status <= 0)
                            API.setStatus(API.STATUS.AFK);
                    } else {
                        $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                        API.setStatus(API.STATUS.AVAILABLE);
                    }
                    break;
                case 'notify-join':
                case 'notify-leave':
                case 'notify-curate':
                case 'notify-meh':
                case 'notify-stats':
                case 'notify-updates':
                case 'notify-history':
                case 'notify-songLength':
                    var elem = $('.p3-s-' + a);
                    if (!elem.data('perm') || (API.hasPermission(undefined, elem.data('perm')) || p3Utils.isPlugCubedDeveloper())) {
                        var bit = elem.data('bit');
                        Settings.notify += (Settings.notify & bit) === bit ? -bit : bit;
                        this.setEnabled(a, (Settings.notify & bit) === bit);
                    }
                    break;
                case 'stream':
                    PlaybackModel.set('streamDisabled', !Database.settings.streamDisabled);
                    this.setEnabled('stream', Database.settings.streamDisabled);
                    return;
                case 'clear':
                    _$context.trigger('ChatFacadeEvent:clear');
                    return;
                case 'roomsettings':
                    var b = Settings.useRoomSettings[window.location.pathname.split('/')[1]];
                    b = !(b === undefined || b === true);
                    Settings.useRoomSettings[window.location.pathname.split('/')[1]] = b;
                    RSS.execute(b);
                    this.setEnabled('roomsettings', b);
                    break;
                case 'afktimers':
                    Settings.moderation.afkTimers = !Settings.moderation.afkTimers;
                    this.setEnabled('afktimers', Settings.moderation.afkTimers);
                    if (Settings.moderation.afkTimers) {
                        Styles.set('waitListMove', '#waitlist .list .user .name { top: 2px; }');
                    } else {
                        Styles.unset('waitListMove');
                        $('#waitlist').find('.user .afkTimer').remove();
                    }
                    break;
                case 'language':
                    console.log('Language click');
                    break;
                default:
                    API.chatLog(p3Lang.i18n('error.unknownMenuKey', a));
                    return;
            }
            Settings.save();
        },
        /**
         * Create the menu.
         * If the menu already exist, recreates it.
         */
        createMenu: function() {
            if ($menuDiv !== undefined)
                $menuDiv.remove();
            $menuDiv = $('<div>').css('left', this.shown ? 0 : -271).attr('id', 'p3-settings');
            var header = $('<div>').addClass('header'),
                container = $('<div>').addClass('container');

            // Header
            header.append($('<div>').addClass('back').append($('<i>').addClass('icon icon-arrow-left')).click(function() {
                _this.toggleMenu(false);
            }));
            header.append($('<div>').addClass('title').append($('<i>').addClass('icon icon-settings-white')).append($('<span>plug&#179;</span>')).append($('<span>').addClass('version').text(Version)));

            // Features
            container.append($('<div>').addClass('section').text('Features'));
            if (RSS.rules.allowAutowoot !== false)
                container.append(GUIButton(Settings.autowoot, 'woot', p3Lang.i18n('menu.autowoot')));
            if (RSS.rules.allowAutojoin !== false)
                container.append(GUIButton(Settings.autojoin, 'join', p3Lang.i18n('menu.autojoin')));
            if (RSS.rules.allowAutorespond !== false)
                container.append(GUIButton(Settings.autorespond, 'autorespond', p3Lang.i18n('menu.autorespond')));
            if (RSS.rules.allowAutorespond !== false) {
                container.append($('<div class="item">').addClass('p3-s-autorespond-input').append($('<input>').val(Settings.awaymsg === '' ? p3Lang.i18n('autorespond.default') : Settings.awaymsg).keyup(function() {
                    $(this).val($(this).val().split('@').join(''));
                    Settings.awaymsg = $(this).val().trim();
                    Settings.save();
                })).mouseover(function() {
                    if (!p3Utils.runLite) {
                        _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.afk'), $(this), false);
                    }
                }).mouseout(function() {
                    if (!p3Utils.runLite) {
                        _$context.trigger('tooltip:hide');
                    }
                }));
            }
            if (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER))
                container.append(GUIButton(Settings.moderation.afkTimers, 'afktimers', p3Lang.i18n('menu.afktimers')));
            if (RSS.haveRoomSettings)
                container.append(GUIButton(Settings.useRoomSettings[window.location.pathname.split('/')[1]] !== undefined ? Settings.useRoomSettings[window.location.pathname.split('/')[1]] : true, 'roomsettings', p3Lang.i18n('menu.roomsettings')));
            container.append(GUIButton(Settings.chatImages, 'chatimages', p3Lang.i18n('menu.chatimages')));
            container.append(GUIButton(Settings.twitchEmotes, 'twitchemotes', p3Lang.i18n('menu.twitchemotes')));
            container.append(GUIButton(false, 'colors', p3Lang.i18n('menu.customchatcolors') + '...'));
            if (p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) {
                container.append(GUIButton(false, 'controlpanel', p3Lang.i18n('menu.controlpanel') + '...'));
            }

            // Divider
            container.append($('<div class="spacer">').append($('<div class="divider">')));

            // Notification
            container.append($('<div class="section">' + p3Lang.i18n('notify.header') + '</div>'));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_JOIN) === enumNotifications.USER_JOIN, 'notify-join', p3Lang.i18n('notify.join')).data('bit', enumNotifications.USER_JOIN));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_LEAVE) === enumNotifications.USER_LEAVE, 'notify-leave', p3Lang.i18n('notify.leave')).data('bit', enumNotifications.USER_LEAVE));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_CURATE) === enumNotifications.USER_CURATE, 'notify-curate', p3Lang.i18n('notify.curate')).data('bit', enumNotifications.USER_CURATE));
            container.append(GUIButton((Settings.notify & enumNotifications.USER_MEH) === enumNotifications.USER_MEH, 'notify-meh', p3Lang.i18n('notify.meh')).data('bit', enumNotifications.USER_MEH));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_STATS) === enumNotifications.SONG_STATS, 'notify-stats', p3Lang.i18n('notify.stats')).data('bit', enumNotifications.SONG_STATS));
            container.append(GUIButton((Settings.notify & enumNotifications.SONG_UPDATE) === enumNotifications.SONG_UPDATE, 'notify-updates', p3Lang.i18n('notify.updates')).data('bit', enumNotifications.SONG_UPDATE));
            if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
                var songLengthSlider = new Slider(5, 30, Settings.notifySongLength, function(v) {
                    Settings.notifySongLength = v;
                    Settings.save();
                    $('.p3-s-notify-songLength').find('span').text(p3Lang.i18n('notify.songLength', v))
                });
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_HISTORY) === enumNotifications.SONG_HISTORY, 'notify-history', p3Lang.i18n('notify.history')).data('bit', enumNotifications.SONG_HISTORY).data('perm', API.ROLE.BOUNCER));
                container.append(GUIButton((Settings.notify & enumNotifications.SONG_LENGTH) === enumNotifications.SONG_LENGTH, 'notify-songLength', p3Lang.i18n('notify.songLength', Settings.notifySongLength)).data('bit', enumNotifications.SONG_LENGTH).data('perm', API.ROLE.BOUNCER));
                container.append(songLengthSlider.$slider.css('left', 40));
            }

            $('body').append($menuDiv.append(header).append(container));
            if (songLengthSlider !== undefined) songLengthSlider.onChange();
        },
        /**
         * Toggle the visibility of the menu
         * @param {Boolean} [shown] Force it to be shown or hidden.
         */
        toggleMenu: function(shown) {
            if ($menuDiv === undefined) {
                this.createMenu();
            }
            this.shown = shown !== undefined ? shown : !this.shown;
            if (!this.shown)
                dialogColors.hide();
            $menuDiv.animate({
                left: this.shown ? 0 : -271
            }, {
                complete: function() {
                    if (!_this.shown) {
                        $menuDiv.detach();
                        $menuDiv = undefined;
                    }
                }
            });
        }
    });
    return new menuClass();
});
define('plugCubed/dialogs/Commands', ['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/Utils'], function($, Class, p3Lang, p3Utils) {
    var userCommands = [
            ['/avail', 'commands.descriptions.avail'],
            ['/afk', 'commands.descriptions.afk'],
            ['/work', 'commands.descriptions.work'],
            ['/gaming', 'commands.descriptions.gaming'],
            ['/join', 'commands.descriptions.join'],
            ['/leave', 'commands.descriptions.leave'],
            ['/whoami', 'commands.descriptions.whoami'],
            ['/mute', 'commands.descriptions.mute'],
            ['/automute', 'commands.descriptions.automute'],
            ['/unmute', 'commands.descriptions.unmute'],
            ['/nextsong', 'commands.descriptions.nextsong'],
            ['/refresh', 'commands.descriptions.refresh'],
            ['/alertson (commands.variables.word)', 'commands.descriptions.alertson'],
            ['/alertsoff', 'commands.descriptions.alertsoff'],
            ['/curate', 'commands.descriptions.curate'],
            ['/getpos', 'commands.descriptions.getpos'],
            ['/version', 'commands.descriptions.version'],
            ['/commands', 'commands.descriptions.commands'],
            ['/link', 'commands.descriptions.link'],
            ['/volume (commands.variables.number/+/-)']
        ],
        modCommands = [
            ['/whois (commands.variables.username)', 'commands.descriptions.whois', API.ROLE.BOUNCER],
            ['/skip', 'commands.descriptions.skip', API.ROLE.BOUNCER],
            ['/ban (commands.variables.username)', 'commands.descriptions.ban', API.ROLE.BOUNCER],
            ['/lockskip', 'commands.descriptions.lockskip', API.ROLE.MANAGER],
            ['/lock', 'commands.descriptions.lock', API.ROLE.MANAGER],
            ['/unlock', 'commands.descriptions.unlock', API.ROLE.MANAGER],
            ['/add (commands.variables.username)', 'commands.descriptions.add', API.ROLE.BOUNCER],
            ['/remove (commands.variables.username)', 'commands.descriptions.remove', API.ROLE.BOUNCER],
            ['/strobe (commands.variables.onoff)', 'commands.descriptions.strobe', API.ROLE.COHOST],
            ['/rave (commands.variables.onoff)', 'commands.descriptions.rave', API.ROLE.COHOST],
            ['/whois all', 'commands.descriptions.whois', API.ROLE.AMBASSADOR],
            ['/banall', 'commands.descriptions.banall', API.ROLE.AMBASSADOR]
        ],
        a = Class.extend({
            userCommands: function() {
                var response = '<strong style="position:relative;left:-20px">=== ' + p3Lang.i18n('commands.userCommands') + ' ===</strong><br>';
                for (var i in userCommands) {
                    if (!userCommands.hasOwnProperty(i)) continue;
                    var command = userCommands[i][0];
                    if (command.split('(').length > 1) {
                        command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                    }
                    response += '<div style="position:relative;left:-10px">' + command + '<br><em style="position:relative;left:10px">' + p3Lang.i18n(userCommands[i][1]) + '</em></div>';
                }
                return response;
            },
            modCommands: function() {
                var response = '<br><strong style="position:relative;left:-20px">=== ' + p3Lang.i18n('commands.modCommands') + ' ===</strong><br>';
                for (var i in modCommands) {
                    if (!modCommands.hasOwnProperty(i)) continue;
                    if (API.hasPermission(undefined, modCommands[i][2])) {
                        var command = modCommands[i][0];
                        if (command.split('(').length > 1) {
                            command = command.split('(')[0] + '(' + p3Lang.i18n(command.split('(')[1].split(')')[0]) + ')';
                        }
                        response += '<div style="position:relative;left:-10px">' + command + '<br><em style="position:relative;left:10px">' + p3Lang.i18n(modCommands[i][1]) + '</em></div>';
                    }
                }
                return response;
            },
            print: function() {
                var content = '<strong style="font-size:1.4em;position:relative;left: -20px">' + p3Lang.i18n('commands.header') + '</strong><br>';
                content += this.userCommands();
                if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                    content += this.modCommands();
                }
                p3Utils.chatLog(undefined, content);
            }
        });
    return new a();
});
define('plugCubed/handlers/CommandHandler', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/dialogs/Commands', 'plugCubed/Settings', 'plugCubed/Socket', 'plugCubed/Version', 'plugCubed/bridges/Context', 'plugCubed/bridges/PlaybackModel'], function(TriggerHandler, p3Utils, p3Lang, dialogCommands, Settings, Socket, Version, Context, PlaybackModel) {
    var lastPMReceiver, commandHandler;
    commandHandler = TriggerHandler.extend({
        trigger: API.CHAT_COMMAND,
        handler: function(value) {
            var i, args = value.split(' '),
                command = args.shift().substr(1);
            if (p3Utils.hasPermission(undefined, 2, true) || p3Utils.isPlugCubedDeveloper()) {
                if (p3Utils.equalsIgnoreCase(command, 'whois')) {
                    if (args.length > 0 && p3Utils.equalsIgnoreCase(args[0], 'all')) {
                        p3Utils.getAllUsers();
                    } else {
                        p3Utils.getUserInfo(args.join(' '));
                    }
                    return;
                }
                if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                    if (p3Utils.equalsIgnoreCase(command, 'banall')) {
                        var me = API.getUser(),
                            users = API.getUsers();
                        for (i in users) {
                            if (users.hasOwnProperty(i) && users[i].id !== me.id)
                                API.moderateBanUser(users[i].id, 0, API.BAN.PERMA);
                        }
                        return;
                    }
                }
            }
            if (API.hasPermission(undefined, API.ROLE.COHOST) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedSponsor()) {
                if (p3Utils.equalsIgnoreCase(command, 'strobe')) {
                    if (Socket.getState() !== SockJS.OPEN) {
                        return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                    }
                    Socket.send(JSON.stringify({
                        type: 'room:rave',
                        value: value.indexOf(p3Lang.i18n('commands.variables.off', 'off')) > -1 ? 0 : (args.length > 0 && p3Utils.isNumber(args[1]) && ~~args[1] >= 50 && ~~args[1] <= 100 ? ~~args[1] : 1)
                    }));
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'rave')) {
                    if (Socket.getState() !== SockJS.OPEN) {
                        return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                    }
                    Socket.send(JSON.stringify({
                        type: 'room:rave',
                        value: value.indexOf(p3Lang.i18n('commands.variables.off', 'off')) > -1 ? 0 : 2
                    }));
                    return;
                }
            }
            if (API.hasPermission(undefined, API.ROLE.MANAGER)) {
                if (p3Utils.equalsIgnoreCase(command, 'lock')) {
                    API.moderateLockWaitList(true, false);
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'unlock')) {
                    API.moderateLockWaitList(false, false);
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'lockskip')) {
                    var userID = API.getDJ().id;
                    API.once(API.ADVANCE, function() {
                        API.once(API.WAIT_LIST_UPDATE, function() {
                            API.moderateMoveDJ(userID, 1);
                        });
                        API.moderateAddDJ(userID);
                    });
                    API.moderateForceSkip();
                    return;
                }
            }
            if (API.hasPermission(undefined, API.ROLE.BOUNCER)) {
                if (p3Utils.equalsIgnoreCase(command, 'skip')) {
                    if (API.getDJ() === undefined) return;
                    if (value.length > 5)
                        API.sendChat('@' + API.getDJ().username + ' - Reason for skip: ' + value.substr(5).trim());
                    API.moderateForceSkip();
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'whois')) {
                    p3Utils.getUserInfo(args.join(' '));
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'add')) {
                    this.moderation(args.join(' '), 'adddj');
                    return;
                }
                if (p3Utils.equalsIgnoreCase(command, 'remove')) {
                    this.moderation(args.join(' '), 'removedj');
                    return;
                }
            }
            if (p3Utils.equalsIgnoreCase(command, 'commands')) {
                dialogCommands.print();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'avail') || p3Utils.equalsIgnoreCase(command, 'available')) {
                API.setStatus(0);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'afk') || p3Utils.equalsIgnoreCase(command, 'brb') || p3Utils.equalsIgnoreCase(command, 'away')) {
                API.setStatus(1);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'work') || p3Utils.equalsIgnoreCase(command, 'working')) {
                API.setStatus(2);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'game') || p3Utils.equalsIgnoreCase(command, 'gaming')) {
                API.setStatus(3);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'join')) {
                API.djJoin();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'leave')) {
                API.djLeave();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'whoami')) {
                p3Utils.getUserInfo(API.getUser().id);
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'refresh')) {
                $('#refresh-button').click();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'volume')) {
                if (args.length > 0) {
                    if (p3Utils.isNumber(args[0])) {
                        console.log('API.setVolume(' + ~~args[0] + ')');
                        API.setVolume(~~args[0]);
                    } else if (args[0] == '+') {
                        console.log('API.setVolume(' + (API.getVolume() + 1) + ')');
                        API.setVolume(API.getVolume() + 1);
                    } else if (args[0] == '-') {
                        console.log('API.setVolume(' + (API.getVolume() - 1) + ')');
                        API.setVolume(API.getVolume() - 1);
                    } else {
                        console.log('Unknown');
                    }
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'version')) {
                API.chatLog(p3Lang.i18n('running', Version));
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'mute')) {
                if (API.getVolume() === 0) return;
                PlaybackModel.mute();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'unmute')) {
                if (API.getVolume() > 0) return;
                PlaybackModel.unmute();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'muteonce')) {
                if (API.getVolume() === 0) return;
                PlaybackModel.muteOnce();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'link')) {
                API.sendChat('plugCubed : http://plugcubed.net');
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'nextsong')) {
                var nextSong = API.getNextMedia(),
                    found = -1;
                if (nextSong === undefined) return API.chatLog(p3Lang.i18n('noNextSong'));
                nextSong = nextSong.media;
                var p3history = require('plugCubed/notifications/History');
                var historyInfo = p3history.isInHistory(nextSong.id);
                API.chatLog(p3Lang.i18n('nextsong', nextSong.title, nextSong.author));
                if (historyInfo.pos > -1 && !historyInfo.skipped) {
                    API.chatLog(p3Lang.i18n('isHistory', historyInfo.pos, historyInfo.length), true);
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'automute')) {
                var media = API.getMedia();
                if (media === undefined) return;
                if (Settings.registeredSongs.indexOf(media.id) < 0) {
                    Settings.registeredSongs.push(media.id);
                    PlaybackModel.muteOnce();
                    API.chatLog(p3Lang.i18n('automute.registered', media.title));
                } else {
                    Settings.registeredSongs.splice(Settings.registeredSongs.indexOf(media.id), 1);
                    PlaybackModel.unmute();
                    API.chatLog(p3Lang.i18n('automute.unregistered', media.title));
                }
                Settings.save();
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'getpos')) {
                var lookup = p3Utils.getUser(value.substr(8)),
                    user = lookup === null ? API.getUser() : lookup,
                    spot = API.getWaitListPosition(user.id);
                if (API.getDJ().id === user.id) {
                    API.chatLog(p3Lang.i18n('info.userDjing', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : p3Utils.cleanTypedString(user.username)));
                } else if (spot === 0) {
                    API.chatLog(p3Lang.i18n('info.userNextDJ', user.id === API.getUser().id ? p3Lang.i18n('ranks.you') : p3Utils.cleanTypedString(user.username)));
                } else if (spot > 0) {
                    API.chatLog(p3Lang.i18n('info.inWaitlist', spot + 1, API.getWaitList().length));
                } else {
                    API.chatLog(p3Lang.i18n('info.notInList'));
                }
                return;
            }
            if (p3Utils.equalsIgnoreCase(command, 'curate') || p3Utils.equalsIgnoreCase(command, 'grab')) {
                if (p3Utils.runLite) {
                    return API.chatLog(p3Lang.i18n('error.noLiteSupport'), true);
                }
                $.getJSON('https://plug.dj/_/playlists', function(response) {
                    if (response.status !== 'ok') {
                        API.chatLog('Error getting playlist info', true);
                        return;
                    }
                    var playlists = response.data;
                    if (playlists.length < 1) {
                        API.chatLog('No playlists found', true);
                        return;
                    }
                    for (var i in playlists) {
                        var playlist = playlists[i];
                        if (playlist.active) {
                            if (playlist.count < 200) {
                                Context.dispatch(new MCE(MCE.CURATE, playlist.id));
                            } else {
                                API.chatLog('Your active playlist is full', true);
                            }
                            return;
                        }
                    }
                    API.chatLog('No playlists found', true);
                }).fail(function() {
                    API.chatLog('Error getting playlist info', true);
                });
                return;
            }
            if (p3Utils.startsWithIgnoreCase(value, '/alertson ') && !p3Utils.equalsIgnoreCaseTrim(value, '/alertson')) {
                Settings.alertson = value.substr(10).split(' ');
                Settings.save();
                API.chatLog('Playing sound on the following words: ' + Settings.alertson.join(', '));
                return;
            }
            if (p3Utils.equalsIgnoreCaseTrim(value, '/alertson') || p3Utils.startsWithIgnoreCase(value, '/alertsoff')) {
                Settings.alertson = [];
                Settings.save();
                API.chatLog('No longer playing sound on specific words');
                return;
            }
            if (p3Utils.startsWithIgnoreCase(value, '/msg ') || p3Utils.startsWithIgnoreCase(value, '/pm ')) {
                if (Socket.getState() !== SockJS.OPEN) {
                    return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                }
                var user = p3Utils.getUser(value.split(' ')[1]);
                if (user !== null) {
                    Socket.send(JSON.stringify({
                        type: 'chat:private',
                        value: {
                            id: user.id,
                            message: value.substr(value.indexOf(user.username) + user.username.length + 1)
                        }
                    }));
                    lastPMReceiver = user;
                } else {
                    API.chatLog('Username not found', true);
                }
                return;
            }
            if (p3Utils.startsWithIgnoreCase(value, '/r ')) {
                if (Socket.getState() !== SockJS.OPEN) {
                    return API.chatLog(p3Lang.i18n('error.notConnected'), true);
                }
                if (lastPMReceiver !== undefined && API.getUser(lastPMReceiver.id) !== undefined) {
                    Socket.send(JSON.stringify({
                        type: 'chat:private',
                        value: {
                            id: lastPMReceiver.id,
                            message: value.substr(3)
                        }
                    }));
                } else
                    API.chatLog('Can not find the last PM receiver', true);
            }
        }
    });
    return new commandHandler();
});
define('plugCubed/features/Alertson', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils'], function(TriggerHandler, Settings, p3Utils) {
    var handler = TriggerHandler.extend({
        trigger: API.CHAT,
        handler: function(data) {
            for (var i in Settings.alertson) {
                if (Settings.alertson.hasOwnProperty(i) && data.message.indexOf(Settings.alertson[i]) > -1) {
                    p3Utils.playChatSound();
                    return;
                }
            }
        }
    });

    return new handler();
});
define('plugCubed/features/Autojoin', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/RSS', 'plugCubed/Utils', 'plugCubed/dialogs/Menu'], function(TriggerHandler, Settings, RSS, p3Utils, Menu) {
    var join, handler;

    join = function() {
        var dj = API.getDJ();
        if (dj === null || dj.id === API.getUser().id || API.getWaitListPosition() > -1) return;
        $('#dj-button').click();
    };

    handler = TriggerHandler.extend({
        trigger: {
            ADVANCE: this.onDjAdvance,
            WAIT_LIST_UPDATE: this.onWaitListUpdate,
            CHAT: this.onChat
        },
        onDjAdvance: function() {
            if (!Settings.autojoin || !RSS.rules.allowAutojoin) return;
            join();
        },
        onWaitListUpdate: function() {
            // If autojoin is not enabled, don't try to disable
            if (!Settings.autojoin) return;
            // If user is DJing, don't try to disable
            var dj = API.getDJ();
            if (dj !== null && dj.id === API.getUser().id) return;
            // If user is in waitlist, don't try to disable
            if (API.getWaitListPosition() > -1) return;
            // Disable
            Settings.autojoin = false;
        },
        onChat: function(data) {
            var a, b;
            a = data.type == 'mention' && API.hasPermission(data.fromID, API.ROLE.BOUNCER);
            b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!joindisable') > -1 && (typeof RSS.rules.allowAutorespond === 'undefined' || RSS.rules.allowAutorespond !== false)) {
                    if (Settings.autojoin) {
                        Settings.autojoin = false;
                        Menu.setEnabled('autojoin', Settings.autojoin);
                        Settings.save();
                        API.sendChat(p3Lang.i18n('autojoin.commandDisable', '@' + data.from));
                    }
                }
            }
        }
    });
    return new handler();
});
define('plugCubed/features/Automute', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/RSS', 'plugCubed/Utils', 'plugCubed/bridges/PlaybackModel'], function(TriggerHandler, Settings, RSS, p3Utils, PlaybackModel) {
    var handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if (Settings.registeredSongs.indexOf(data.media.id) > -1) {
                setTimeout(function() {
                    PlaybackModel.muteOnce();
                }, 800);
                API.chatLog(p3Lang.i18n('automuted', data.media.title));
            }
        }
    });
    return new handler();
});
define('plugCubed/features/Autorespond', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/RSS', 'plugCubed/Utils', 'plugCubed/bridges/PlaybackModel', 'plugCubed/dialogs/Menu', 'lang/Lang'], function(TriggerHandler, p3Lang, Settings, RSS, p3Utils, PlaybackModel, Menu, Lang) {
    var handler = TriggerHandler.extend({
        trigger: API.CHAT,
        handler: function(data) {
            var a = data.type == 'mention' && API.hasPermission(data.fromID, API.ROLE.BOUNCER),
                b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!afkdisable') > -1 && (typeof RSS.rules.allowAutorespond === 'undefined' || RSS.rules.allowAutorespond !== false)) {
                    if (Settings.autorespond) {
                        Settings.autorespond = false;
                        Menu.setEnabled('autorespond', Settings.autorespond);
                        Settings.save();
                        API.sendChat(p3Lang.i18n('autorespond.commandDisable', '@' + data.from));
                    }
                }
            }
            if (data.type == 'mention') {
                if (Settings.autorespond && !Settings.recent && (typeof RSS.rules.allowAutorespond === 'undefined' || RSS.rules.allowAutorespond !== false)) {
                    Settings.recent = true;
                    $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.nextIn', p3Utils.getTimestamp(Date.now() + 18E4)));
                    setTimeout(function() {
                        $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.next'));
                        Settings.recent = false;
                        Settings.save();
                    }, 18E4);
                    API.sendChat('[AFK] @' + data.from + ' ' + Settings.awaymsg.split('@').join(''));
                }
            }
        },
        close: function() {
            this._super();
            if (Settings.autorespond) {
                $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                API.setStatus(API.STATUS.AVAILABLE);
            }
        }
    });

    return new handler();
});
define('plugCubed/features/Autowoot', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/RSS', 'plugCubed/Utils'], function(TriggerHandler, Settings, RSS, p3Utils) {
    var woot, handler;

    woot = function() {
        var dj = API.getDJ();
        if (dj === null || dj.id === API.getUser().id) return;
        $('#woot').click();
    };

    handler = TriggerHandler.extend({
        trigger: API.ADVANCE,
        handler: function(data) {
            if (!data.media || !Settings.autowoot || !RSS.rules.allowAutowoot) return;
            setTimeout(function() {
                woot();
            }, p3Utils.randomRange(1, 10) * 1000);
        }
    });

    return new handler();
});
define('plugCubed/features/Whois', ['plugCubed/handlers/TriggerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function(TriggerHandler, Settings, p3Utils, p3Lang) {
    var handler = TriggerHandler.extend({
        trigger: {
            USER_JOIN: this.onUserJoin,
            USER_LEAVE: this.onUserLeave,
            VOTE_UPDATE: this.onVoteUpdate,
            ADVANCE: this.onDjAdvance
        },
        onUserJoin: function(data) {
            if (p3Utils.getUserData(data.id, 'joinTime', 0) === 0)
                p3Utils.setUserData(data.id, 'joinTime', Date.now());
        },
        onUserLeave: function(data) {
            var disconnects = p3Utils.getUserData(data.id, 'disconnects', {
                count: 0
            });
            disconnects.count++;
            disconnects.position = API.getDJ().id === data.id ? -1 : (API.getWaitListPosition(data.id) < 0 ? -2 : API.getWaitListPosition(data.id));
            disconnects.time = Date.now();
            p3Utils.setUserData(data.id, 'disconnects', disconnects);
        },
        onVoteUpdate: function(data) {
            if (!data || !data.user) return;
            var curVote, wootCount, mehCount;

            curVote = p3Utils.getUserData(data.user.id, 'curVote', 0);
            wootCount = p3Utils.getUserData(data.user.id, 'wootcount', 0) - (curVote === 1 ? 1 : 0) + (data.vote === 1 ? 1 : 0);
            mehCount = p3Utils.getUserData(data.user.id, 'mehcount', 0) - (curVote === -1 ? 1 : 0) + (data.vote === 1 ? 1 : 0);

            p3Utils.setUserData(data.user.id, 'wootcount', wootCount);
            p3Utils.setUserData(data.user.id, 'mehcount', mehCount);
            p3Utils.setUserData(data.user.id, 'curVote', data.vote);
        },
        onDjAdvance: function() {
            var users = API.getUsers();
            for (var i in users) {
                if (users.hasOwnProperty(i))
                    p3Utils.setUserData(users[i].id, 'curVote', 0);
            }
        }
    });

    return new handler();
});
define('plugCubed/Features', ['plugCubed/Class', 'plugCubed/features/Alertson', 'plugCubed/features/Autojoin', 'plugCubed/features/Automute', 'plugCubed/features/Autorespond', 'plugCubed/features/Autowoot', 'plugCubed/features/Whois' /*, 'plugCubed/features/WindowTitle'*/ ], function() {
    var modules, Class, handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && !modules[i].registered)
                    modules[i].register();
            }
        },
        unregister: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i].registered)
                    modules[i].close();
            }
        }
    });

    return new handler();
});
define('plugCubed/handlers/TickerHandler', ['jquery', 'plugCubed/Class'], function($, Class) {
    return Class.extend({
        // Time between each tick (in milliseconds)
        tickTime: 1E3,
        init: function() {
            this.proxy = $.proxy(this.handler, this);
            this.proxy();
        },
        handler: function() {
            this.tick();
            this.timeoutID = setTimeout(this.proxy, this.tickTime);
        },
        // The function that is called on each tick
        tick: function() {},
        close: function() {
            clearTimeout(this.timeoutID);
        }
    });
});
define('plugCubed/tickers/AFKTimer', ['jquery', 'plugCubed/handlers/TickerHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function($, TickerHandler, Settings, p3Utils, p3Lang) {
    var IgnoreCollection, handler;

    if (p3Utils.runLite) {
        IgnoreCollection = {
            _byId: {}
        };
    } else {
        IgnoreCollection = require('ce221/cfb6f/a1e34');
    }

    handler = TickerHandler.extend({
        tickTime: 1E3,
        tick: function() {
            if (Settings.moderation.afkTimers && (p3Utils.isPlugCubedDeveloper() || API.hasPermission(undefined, API.ROLE.BOUNCER)) && $('#waitlist-button').hasClass('selected')) {
                var a = API.getWaitList(),
                    b = $('#waitlist').find('.user');
                for (var c = 0; c < a.length; c++) {
                    var d, e, f;

                    d = Date.now() - p3Utils.getUserData(a[c].id, 'lastChat', p3Utils.getUserData(a[c].id, 'joinTime', Date.now()));
                    e = IgnoreCollection._byId[a[c].id] === true ? p3Lang.i18n('error.ignoredUser') : p3Utils.getTimestamp(d, d < 36E5 ? 'mm:ss' : 'hh:mm:ss');
                    f = $(b[c]).find('.afkTimer');

                    if (f.length < 1) {
                        f = $('<div>').addClass('afkTimer');
                        $(b[c]).find('.meta').append(f);
                    }

                    f.text(e);
                }
            }
        },
        close: function() {
            this._super();
            $('#waitlist').find('.user .afkTimer').remove();
        }
    });
    return handler;
});
define('plugCubed/tickers/AntiDangerousScripts', ['plugCubed/handlers/TickerHandler', 'plugCubed/bridges/Context'], function(TickerHandler, _$context) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var a = _$context._events['chat:receive'].concat(API._events[API.CHAT]),
                c = function() {
                    API.chatLog('plugCubed does not support one or more of the other scripts that are currently running because of potential dangerous behaviour', true);
                    plugCubed.close();
                };
            for (var b in a) {
                if (!a.hasOwnProperty(b)) continue;
                var script = a[b].callback.toString();
                if ((function(words) {
                    for (var i in words) {
                        if (words.hasOwnProperty(i) && script.indexOf(words[i]) > -1)
                            return true;
                    }
                    return false;
                })(['API.djLeave', 'API.djJoin', 'API.moderateLockWaitList', 'API.moderateForceSkip', '.getScript('])) {
                    c();
                    return;
                }
            }
            if (typeof startWooting === 'function' && startWooting.toString().indexOf('API.sendChat(') > -1)
                c();
        }
    });
});
define('plugCubed/tickers/AntiHideVideo', ['jquery', 'plugCubed/handlers/TickerHandler'], function($, TickerHandler) {
    return TickerHandler.extend({
        tickTime: 1E4,
        tick: function() {
            var a = $('#yt-frame').height() === null || $('#yt-frame').height() > 230,
                b = $('#yt-frame').width() === null || $('#yt-frame').width() > 412,
                c = $('#plug-btn-hidevideo,#hideVideoButton').length === 0;
            if (a && b && c) return;
            API.chatLog('plugCubed does not support hiding video', true);
            plugCubed.close();
        }
    });
});
define('plugCubed/Tickers', ['plugCubed/Class', 'plugCubed/tickers/AFKTimer', 'plugCubed/tickers/AntiDangerousScripts', 'plugCubed/tickers/AntiHideVideo'], function() {
    var modules, Class, instances;

    modules = $.makeArray(arguments);
    Class = modules.shift();
    instances = [];

    var handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                instances[i] = new modules[i]();
            }
        },
        unregister: function() {
            for (var i in instances) {
                if (!instances.hasOwnProperty(i)) continue;
                instances[i].close();
            }
        }
    });

    return new handler();
});
define('plugCubed/dialogs/panels/Background', ['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RSS'], function(Class, ControlPanel, Styles, RSS) {
    var handler, $contentDiv, $formDiv, $localFileInput;

    handler = Class.extend({
        register: function() {
            ControlPanel.addTab('Background');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room background.'));

            ControlPanel.addToTab('Background', $contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');

            if (window.File && window.FileReader && window.FileList && window.Blob) {
                $localFileInput = ControlPanel.inputField('file', undefined, 'Local file').change(function(e) {
                    if (!(function() {
                        var files = e.target.files;

                        for (var i = 0, f; f = files[i]; i++) {
                            // Only process image files.
                            if (!f.type.match('image.*')) {
                                continue;
                            }

                            var reader = new FileReader();

                            // Closure to capture the file information.
                            reader.onload = function(e) {
                                Styles.set('rss-background-image', '.room-background { background-image: url(' + e.target.result + ')!important; }');
                            };

                            // Read in the image file as a data URL.
                            reader.readAsDataURL(f);
                            return true;
                        }
                        return false;
                    })()) {
                        RSS.execute();
                    }
                });
                $formDiv.append($localFileInput);
            }

            ControlPanel.addToTab('Background', $formDiv);
        },
        close: function() {
            ControlPanel.removeTab('Background');
        }
    });
    return new handler();
});
define('plugCubed/dialogs/panels/Login', ['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/Socket'], function(Class, ControlPanel, Socket) {
    var handler, loggedIn, $loginDiv, $selectButton = '',
        $contentDiv;

    handler = Class.extend({
        register: function() {
            ControlPanel.addTab('Login');

            $contentDiv = $('<div>').append($('<p>').text('Login to your plugCubed account.')).append($('<p>').text('Using this system, you can validate and lock your userIDs to your plugCubed account.'));

            ControlPanel.addToTab('Login', $contentDiv);

            function checkLoggedIn() {
                $.getJSON('https://login.plugcubed.net/check', function(data) {
                    loggedIn = data.loggedIn;
                    $selectButton = ControlPanel.button(loggedIn ? 'Already logged in' : 'Login', loggedIn ? false : true, function() {
                        if (loggedIn)
                            return;
                        $selectButton.text('Please wait');
                        var loginWindow = window.open('https://login.plugcubed.net', 'p3Login_' + Date.now(), 'height=200,width=520,toolbar=0,scrollbars=0,status=0,resizable=0,location=1,menubar=0');
                        (function() {
                            var check = function() {
                                if (loginWindow.closed) {
                                    checkLoggedIn();
                                    return;
                                }
                                setTimeout(function() {
                                    check();
                                }, 500);
                            };
                            setTimeout(function() {
                                check();
                            }, 1000);
                        })();
                    });
                });
            }

            checkLoggedIn();

            $loginDiv = $('<div>').width(500).css('margin', '25px auto auto auto').append($selectButton);

            ControlPanel.addToTab('Login', $loginDiv);
        },
        close: function() {
            ControlPanel.removeTab('Login');
        }
    });
    return new handler();
});
define('plugCubed/dialogs/panels/Panels', ['plugCubed/Class', 'plugCubed/dialogs/panels/Background', 'plugCubed/dialogs/panels/Login'], function() {
    var modules, Class, handler;

    modules = $.makeArray(arguments);
    Class = modules.shift();

    handler = Class.extend({
        register: function() {
            this.unregister();
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && !modules[i].registered)
                    modules[i].register();
            }
        },
        unregister: function() {
            for (var i in modules) {
                if (modules.hasOwnProperty(i) && modules[i].registered)
                    modules[i].close();
            }
        }
    });

    return new handler();
});
define('plugCubed/Loader', ['module', 'plugCubed/Class', 'plugCubed/Notifications', 'plugCubed/Version', 'plugCubed/StyleManager', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang', 'plugCubed/Socket', 'plugCubed/RSS', 'plugCubed/dialogs/Menu', 'plugCubed/CustomChatColors', 'plugCubed/handlers/ChatHandler', 'plugCubed/handlers/CommandHandler', 'plugCubed/Features', 'plugCubed/Tickers', 'plugCubed/dialogs/panels/Panels'], function(module, Class, Notifications, Version, Styles, Settings, p3Utils, p3Lang, Socket, RSS, Menu, CustomChatColors, ChatHandler, CommandHandler, Features, Tickers, Panels) {
    var RoomUserListView, Loader, loaded = false;

    var p3RoomUserListRow, p3UserRolloverView;

    if (!p3Utils.runLite) {
        RoomUserListView = require('ce221/df202/bd7f7/e27dd/f1f3f');
        require(['plugCubed/RoomUserListRow', 'plugCubed/UserRolloverView'], function(a, b) {
            p3RoomUserListRow = a;
            p3UserRolloverView = b;
        });
    } else {
        RoomUserListView = function() {};
    }

    function __init() {
        p3Utils.chatLog(undefined, p3Lang.i18n('running', Version) + '</span><br><span class="chat-text" style="color:#66FFFF">' + p3Lang.i18n('commandsHelp'), Settings.colors.infoMessage1);
        if (p3Utils.runLite) {
            p3Utils.chatLog(undefined, p3Lang.i18n('runningLite') + '</span><br><span class="chat-text" style="color:#FFFFFF">' + p3Lang.i18n('runningLiteInfo'), Settings.colors.warningMessage);
        }

        window.addEventListener('pushState', onRoomJoin);
        $('head').append('<link rel="stylesheet" type="text/css" id="plugcubed-css" href="https://d1rfegul30378.cloudfront.net/alpha/plugCubed.css" />');

        var users = API.getUsers();
        for (var i in users) {
            if (users.hasOwnProperty(i) && p3Utils.getUserData(users[i].id, 'joinTime', -1) < 0)
                p3Utils.setUserData(users[i].id, 'joinTime', Date.now());
        }

        if (!p3Utils.runLite) {
            RoomUserListView.prototype.RowClass = p3RoomUserListRow;
            p3UserRolloverView.override();
        }

        initBody();

        Features.register();
        Notifications.register();
        Tickers.register();
        CommandHandler.register();
        ChatHandler.register();

        RSS.update();

        Socket.connect();
        Settings.load();

        require('plugCubed/dialogs/ControlPanel').addTab("Test Tab").addToTab("Test Tab", $('<div>').text('This is my testing content, how does it work?!'));
        Panels.register();

        loaded = true;
    }

    function initBody() {
        var rank = 'regular';
        if (p3Utils.hasPermission(undefined, API.ROLE.HOST, true)) {
            rank = 'admin';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER, true)) {
            rank = 'ambassador';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.HOST)) {
            rank = 'host';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.COHOST)) {
            rank = 'cohost';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.MANAGER)) {
            rank = 'manager';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER)) {
            rank = 'bouncer';
        } else if (p3Utils.hasPermission(undefined, API.ROLE.RESIDENTDJ)) {
            rank = 'residentdj';
        }
        $('body').addClass('rank-' + rank).addClass('id-' + API.getUser().id);
    }

    function onRoomJoin() {
        if (typeof plugCubed !== 'undefined') {
            setTimeout(function() {
                if (API.enabled) {
                    $.getScript('https://d1rfegul30378.cloudfront.net/alpha/plugCubed.' + (version.minified ? 'min.' : '') + 'js');
                } else {
                    plugCubed.onRoomJoin();
                }
            }, 500);
        }
    }

    Loader = Class.extend({
        init: function() {
            if (loaded) return;

            // Define UserData in case it's not already defined (reloaded p3 without refresh)
            if (typeof plugCubedUserData === 'undefined') plugCubedUserData = {};

            // Load language and begin script after language loaded
            p3Lang.load($.proxy(__init, this));
        },
        close: function() {
            if (!loaded) return;

            Menu.close();
            RSS.close();
            Socket.disconnect();
            Features.unregister();
            Notifications.unregister();
            Tickers.unregister();
            Panels.unregister();
            Styles.destroy();
            ChatHandler.close();
            CommandHandler.close();

            if (!p3Utils.runLite) {
                RoomUserListView.prototype.RowClass = require('ce221/df202/bd7f7/e27dd/b7ead');
                p3UserRolloverView.revert();
            }

            var mainClass = module.id.split('/')[0],
                modules = require.s.contexts._.defined;
            for (var i in modules) {
                if (!modules.hasOwnProperty(i)) continue;
                if (p3Utils.startsWith(i, mainClass))
                    requirejs.undef(i);
            }

            $('#plugcubed-css,#plugcubed-tracker').remove();

            delete plugCubed;
        }
    });
    return Loader;
});
define('plugCubed/RoomUserListRow', ['jquery', 'plugCubed/Lang', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function($, p3Lang, p3Utils, _$context) {
    var RoomUserListRow = require('ce221/df202/bd7f7/e27dd/b7ead');
    return RoomUserListRow.extend({
        vote: function() {
            if (this.model.get('grab') || this.model.get('vote') !== 0) {
                if (!this.$icon) {
                    this.$icon = $('<i>').addClass('icon');
                }
                this.$el.append(this.$icon);
                if (this.model.get('grab')) {
                    this.$icon.removeClass().addClass('icon icon-grab');
                } else if (this.model.get('vote') == 1) {
                    this.$icon.removeClass().addClass('icon icon-woot');
                } else {
                    this.$icon.removeClass().addClass('icon icon-meh');
                }
            } else if (this.$icon) {
                this.$icon.remove();
                this.$icon = undefined;
            }

            var id = this.model.get('id'),
                $voteIcon = this.$el.find('.icon-woot,.icon-meh,.icon-grab');

            if (p3Utils.havePlugCubedRank(id) || API.getUser(id).permission > API.ROLE.NONE) {
                var $icon = this.$el.find('.icon:not(.icon-woot,.icon-meh,.icon-grab)'),
                    specialIconInfo = p3Utils.getPlugCubedSpecial(id);
                if ($icon.length < 1) {
                    $icon = $('<i>').addClass('icon');
                    this.$el.append($icon);
                }

                if (p3Utils.havePlugCubedRank(id)) {
                    $icon.addClass('icon-is-p3' + p3Utils.getHighestRank(id));
                }

                $icon.mouseover(function() {
                    _$context.trigger('tooltip:show', $('<span>').html(p3Utils.getAllPlugCubedRanks(id)).text(), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                });

                if (specialIconInfo !== undefined) {
                    $icon.css('background-image', 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")');
                }
            }

            if ($voteIcon.length > 0) {
                $voteIcon.mouseover(function() {
                    _$context.trigger('tooltip:show', $('<span>').html(p3Lang.i18n('vote.' + ($voteIcon.hasClass('icon-grab') ? 'grab' : ($voteIcon.hasClass('icon-woot') ? 'woot' : 'meh')))).text(), $(this), true);
                }).mouseout(function() {
                    _$context.trigger('tooltip:hide');
                });
            }
        }
    });
});
define('plugCubed/UserRolloverView', ['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function(Class, p3Utils, _$context) {
    var UserRolloverView = require('ce221/df202/e27dd/b9891');

    var handler = Class.extend({
        override: function() {
            if (typeof UserRolloverView._showSimple !== 'function')
                UserRolloverView._showSimple = UserRolloverView.showSimple;
            if (typeof UserRolloverView._clear !== 'function')
                UserRolloverView._clear = UserRolloverView.clear;
            UserRolloverView.showSimple = function(a, b) {
                this._showSimple(a, b);
                var specialIconInfo = p3Utils.getPlugCubedSpecial(a.id);

                if (this.$p3Role === undefined) {
                    this.$p3Role = $('<span>').addClass('p3Role');
                    this.$meta.append(this.$p3Role);
                }

                if (p3Utils.havePlugCubedRank(a.id)) {
                    this.$meta.addClass('has-p3Role is-p3' + p3Utils.getHighestRank(a.id));
                    if (specialIconInfo !== undefined) {
                        this.$p3Role.text($('<span>').html(specialIconInfo.title).text()).css({
                            'background-image': 'url("https://d1rfegul30378.cloudfront.net/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")'
                        });
                    } else {
                        this.$p3Role.text($('<span>').html(p3Utils.getAllPlugCubedRanks(a.id, true)).text());
                    }
                }
            };
            UserRolloverView.clear = function() {
                this._clear();
                this.$meta.removeClass('has-p3Role is-p3developer is-p3sponsor is-p3special is-p3ambassador is-p3donatorDiamond is-p3donatorPlatinum is-p3donatorGold is-p3donatorSilver is-p3donatorBronze');
            };
        },
        revert: function() {
            if (typeof UserRolloverView._showSimple === 'function')
                UserRolloverView.showSimple = UserRolloverView._showSimple;
            if (typeof UserRolloverView._clear === 'function')
                UserRolloverView.clear = UserRolloverView._clear;
        }
    });
    return new handler();
});
require(['plugCubed/Loader'], function(Loader) {
    plugCubed = new Loader();
});
