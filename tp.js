/*
    Copyright (c) 2013-2014 by Olivier Houle (Fungus)
    Legacy Chat option made by Git!
    Please do not copy or modify without my permission.
*/

Array.prototype.isArray = true;
var tastyPlugShutDown;
if (typeof tastyPlugShutDown != 'undefined') tastyPlugShutDown();
(function(){
    var sock, afktime = Date.now(), pms = false, drag = false, hidevideo = false, joincd = false, cd = false,
    version = '1.3.5.8', commands = {}, tos = {}, boothcd = false, reconnect = true, hover = false,
    room = location.pathname, lastchat, curvotes = {}, togglepm = true,
    emotes = {}, sounds = ['default','pin','meow','robot','lolping','lolbutton','skype','inception','ding','hardkick','custom'],
    settings = {
        show: true,
        autowoot: false,
        autojoin: false,
        chatmentions: false,
        joinnotifs: {toggle:false,ranks:false,friends:false,lvl1:false},
        msgs: [],
        lastPM: null,
        uipos: {'top':'54px','left':'0'},
        boothalert: false,
        boothnotify: 3,
        legacychat: false,
        histalert: false,
        mehtrack: false,
        chatimgs: false,
        emotes: false,
        hidden: false,
        mention: 0,
        customsound: ''
    };
    function socket() {
        function loadSocket() {
            SockJS.prototype.msg = function(a){this.send(JSON.stringify(a))};
            sock = new SockJS('https://fungustime.pw:4957/socket');
            sock.onopen = function() {
                reconint = 2;
                console.log('[TastyPlug v' + version + '] Connected to socket!');
                return sock.msg({z:'userjoin',a:API.getUser(),r:location.pathname});
            };
            sock.onmessage = function(data) {
                data = JSON.parse(data.data);
                switch (data.z) {
                    case 'cmderr':
                        return Chat('error', data.e);
                    case 'clientmsg':
                        if (data.beep) chatSound();
                        return Chat('info', data.a);
                    case 'pm':
                        if (!togglepm) return sock.msg({z:'pmdisabled',fun:API.getUser().username,tid:data.user.id});
                        settings.lastPM = data.user.username;
                        chatSound();
                        ChatPM(data.user.username, data.m);
                        return;
                    case 'reload':
                        return commands.reset();
                    default:
                        console.log('[TastyPlug v' + version + '] Unknown socket command');
                }
            };
            sock.onclose = function() {
                console.log('[TastyPlug v' + version + '] Disconnected from socket!');
                if (reconnect) tos.reconnect = setTimeout(function(){
                    if (sock && sock.readyState == 3) socket();
                },128000);
            };
        }
        if (typeof SockJS == 'undefined') {
            $.getScript('https://cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js', loadSocket);
        } else loadSocket();
    }
    function startup() {
        loadSettings();
        loadUI();
        loadEvents();
        loadEmotes();
        tos.roomcheck = setInterval(function(){
            if (location.pathname != room) {
                clearInterval(tos.roomcheck);
                a = function(){
                    if ($('#room-loader').length) setTimeout(a,200);
                    else $.getScript('https://fungustime.pw/tastyplug/tastyplug.js');
                };
                a();
            }
        },200);
        if (room == '/tastycat') eta();
        if (settings.autowoot) woot();
        if (settings.autojoin) {
            afkCheck();
            if (!getLocked() && API.getWaitListPosition() == -1 && API.getDJ() && API.getDJ().id != API.getUser().id) join();
        }
        legacyChat.toggle(settings.legacychat);
        if (room == '/tastycat') socket();
        Chat('init', 'TastyPlug v' + version + ' now running!<br>Type /commands for a list of commands.<br>Due to exploit abusers, PMs have temporarily been disabled.');
        console.log('[TastyPlug v' + version + '] Now running.');
    }
    function loadSettings() {
        var a = JSON.parse(localStorage.getItem('tastyPlugSettings'));
        if (a) {
            for (var i in settings) {
                if (typeof a[i] != 'undefined') {
                    if (a[i] !== null && a[i].isArray && settings[i] !== null && settings[i].isArray) settings[i] = a[i];
                    else if (typeof settings[i] == 'object' && settings[i] !== null) {
                        var j = undefined;
                        for (j in settings[i]) {
                            if (typeof a[i][j] != 'undefined') settings[i][j] = a[i][j];
                        }
                        if (typeof j == 'undefined') settings[i] = a[i];
                    } else settings[i] = a[i];
                }
            }
        }
    }
    function loadUI() {
        $('head').append('<style type=text/css id=tastyplug-css>#tastyplug-ui{-moz-user-select:none;-webkit-user-select:none;position:absolute;width:150px;border-radius:10px;background-color:#1C1F25;background-image:-webkit-gradient(linear,left bottom,left top,color-stop(0,#1C1F25),color-stop(1,#282D33));background-image:-o-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:-moz-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:-webkit-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:-ms-linear-gradient(top,#1C1F25 0,#282D33 100%);background-image:linear-gradient(to top,#1C1F25 0,#282D33 100%);z-index:9;padding-bottom:1.5px;color:#DDD}#tastyplug-ui a{color:inherit;text-decoration:none}.tastyplug-icon{position:relative;float:right}#tastyplug-ui .tp-toggle{color:#F04F30}#tastyplug-ui .tp-toggle.button-on{color:#1CC7ED}#tp-title{margin:0 15px;padding:3px 0;color:#A874FC;font-size:19px;cursor:move}.tp-mainbutton,.tp-secbutton{margin:0 15px;padding:2px 0 3px;font-size:15px;border-top:1px solid rgba(56,60,68,.85);cursor:pointer}.tp-highlight{background-color:rgba(168,116,252,.33)}.tp-secbutton{padding-left:8px}#tastyplug-ui .icon-drag-handle{position:relative;float:right;top:3px;height:14px;width:14px;background-position:-183px -113px}#waitlist-button .eta{left:45px;font-size:10px}#chat-messages .tastyplug-pm .icon{left:5.5px;top:6px}#chat-pm-button{left:-3px}#chat-messages div.tastyplug-pm.mention{background:linear-gradient(135deg,#FF00CB 0,#0a0a0a 13%,#0a0a0a 100%)}#chat-messages div.tastyplug-pm.mention:nth-child(2n+1){background:linear-gradient(135deg,#FF00CB 0,#111317 13%,#111317 100%)}#chat div[class*=" tp-"],#chat div[class^=tp-]{background-color:#0a0a0a}#chat div[class*=" tp-"]:nth-child(2n+1),#chat div[class^=tp-]:nth-child(2n+1){background-color:#111317}#chat-messages .tastyplug-pm .msg .from span.un{color:#FF00CB;font-weight:700}#user-lists .list.room .user .icon-meh{left:auto;right:8px;top:-1px}#chat-messages [data-cid|="3946454"]{background-color:#2D002D}#chat .mention:nth-child(2n+1)[data-cid|="3946454"],#chat .message:nth-child(2n+1)[data-cid|="3946454"],#chat-messages .emote:nth-child(2n+1)[data-cid|="3946454"]{background-color:#240024}#chat .emote[data-cid|="3946454"] .text,#chat .mention[data-cid|="3946454"] .text,#chat .message[data-cid|="3946454"] .text{font-weight:700;color:#CFCFCF}#chat .emote[data-cid|="3946454"] .text{font-style:normal}div.badge-box img.tastyplug-icon{padding:2px}#chat .cm.tp-info .text,#chat .cm.tp-info div.from.tastyplug span.un{color:#1CC7ED}#chat .cm.tp-info .text span{color:#EEE}#chat .cm.tp-error .text,#chat .cm.tp-error div.from.tastyplug span.un{color:#C42E3B}#chat .cm.tp-init .text,#chat .cm.tp-init div.from.tastyplug span.un{color:#D1D119}#chat .cm.tp-join-admin .text,#chat .cm.tp-join-admin div.from.tastyplug span.un{color:#1CC7ED}#chat .cm.tp-join-ba .text,#chat .cm.tp-join-ba div.from.tastyplug span.un{color:#088C30}#chat .cm.tp-join-host .text,#chat .cm.tp-join-host div.from.tastyplug span.un{color:#D1D119}#chat .cm.tp-join-cohost .text,#chat .cm.tp-join-cohost div.from.tastyplug span.un{color:#F59425}#chat .cm.tp-join-staff .text,#chat .cm.tp-join-staff div.from.tastyplug span.un{color:#C322E3}#chat .cm.tp-join-friend .text,#chat .cm.tp-join-friend div.from.tastyplug span.un{color:#009CDD}#chat .cm.tp-join-lvl1 .text,#chat .cm.tp-join-lvl1 div.from.tastyplug span.un{color:#FFDD6F}.tp-img.wide{width:270px;height:auto}.tp-img.high{height:300px;width:auto}.legacy-chat .tastyplug-img-delete{top:26px}.tastyplug-img-delete{position:absolute;top:42px;right:4px;background-color:#F04F30;padding:0 3px;cursor:pointer;z-index:1}#playback .tp-video-hide,#playback.tp-video-hide{height:0!important}.custom-emote{display:inline-block;vertical-align:top}.custom-emote-mid{display:inline-block;vertical-align:middle}#chat-messages [data-cid|="3946454"] .bdg{background:url(https://fungustime.pw/tastyplug/tbotbadge.png) no-repeat;left:2.5px;top:2.5px}.icon-tp-pm{background:url(https://fungustime.pw/tastyplug/tp-pm.png) no-repeat;}</style>');
        $('body').append('<div id=tp-room style=position:absolute;top:54px;left:0></div><div id=tastyplug-ui><div id=tp-title>TastyPlug <img class=tastyplug-icon src=https://fungustime.pw/tastyplug/tastyplug.png></div><div class="tp-mainbutton tp-toggle button-on" id=tp-autowoot><span>Autowoot</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-autojoin><span>Autojoin</span></div><div class="tp-mainbutton tp-toggle" id=tp-hidevideo><span>Hide Video</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-legacychat><span>Legacy Chat</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-boothalert><span>Booth Alert</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-histalert><span>History Alert</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-mehtrack><span>Meh Tracker</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-chatimgs><span>Chat Images</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-emotes><span>Cust. Emotes</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-mentions><div class="icon icon-drag-handle"></div><span>Chat Mentions</span></div><div class="tp-secbutton tp-secmention" id=tp-addmention><span>Add</span></div><div class="tp-secbutton tp-secmention" id=tp-delmention><span>Delete</span></div><div class="tp-secbutton tp-secmention" id=tp-listmention><span>List</span></div><div class="tp-mainbutton tp-toggle button-on" id=tp-joinnotifs><div class="icon icon-drag-handle"></div><span>Join Notifs.</span></div><div class="tp-secbutton tp-secjoin tp-toggle button-on" id=tp-joinranks><span>Ranks</span></div><div class="tp-secbutton tp-secjoin tp-toggle button-on" id=tp-joinfriends><span>Friends</span></div><div class="tp-secbutton tp-secjoin tp-toggle button-on" id=tp-joinlvl1><span>Level 1s</span></div><a href=http://fungustime.pw/tastyplug/emotes target=_blank><div class=tp-mainbutton id=tp-listemotes><span>Emotes List</span></div></a></div>');
        if (room == '/tastycat') $('#waitlist-button').append('<span class="eta"></span>');
        if (room == '/hummingbird-me') $('#tp-autojoin').remove();
        //$('#chat-header').append('<div id="chat-pm-button" class="chat-header-button"><i class="icon icon-ignore"></i></div>');
        if (!settings.autowoot) $('#tp-autowoot').removeClass('button-on');
        if (!settings.autojoin) $('#tp-autojoin').removeClass('button-on');
        if (!settings.automeh) $('#tp-automeh').removeClass('button-on');
        if (!settings.boothalert) $('#tp-boothalert').removeClass('button-on');
        if (!settings.legacychat) $('#tp-legacychat').removeClass('button-on');
        if (!settings.histalert) $('#tp-histalert').removeClass('button-on');
        if (!settings.mehtrack) $('#tp-mehtrack').removeClass('button-on');
        if (!settings.chatimgs) $('#tp-chatimgs').removeClass('button-on');
        if (!settings.emotes) $('#tp-emotes').removeClass('button-on');
        if (!settings.chatmentions) $('#tp-mentions').removeClass('button-on');
        if (!settings.joinnotifs.toggle) $('#tp-joinnotifs').removeClass('button-on');
        if (!settings.joinnotifs.ranks) $('#tp-joinranks').removeClass('button-on');
        if (!settings.joinnotifs.friends) $('#tp-joinfriends').removeClass('button-on');
        if (!settings.joinnotifs.lvl1) $('#tp-joinlvl1').removeClass('button-on');
        if (!settings.show) {
            $('.tp-mainbutton').hide();
            $('#tastyplug-ui').css('padding-bottom','0');
        }
        if (getRank(API.getUser()) < 2) {
            $('#tp-histalert').remove();
            $('#tp-mehtrack').remove();
            $('#tp-joinlvl1').remove();
        }
        $('.tp-secbutton').hide();
        $('#tastyplug-ui').css(settings.uipos);
        var uicont = {
            width: $('.app-right').position().left,
            height: $('.app-right').height()
        };
        $('#tp-room').css(uicont);
        resize();
        for (var i = 1; i < sounds.length - 1; i++) {
            $('body').append('<audio id="' + sounds[i] + '-sound"><source src="https://fungustime.pw/tastyplug/sounds/' + sounds[i] + '.mp3"></audio>');
        }
        $('body').append('<audio id="default-sound"><source src="https://cdn.plug.dj/_/static/sfx/badoop.801a12ca13864e90203193b2c83c019c03a447d1.mp3"></audio>');
        if (settings.mention == sounds.indexOf('custom')) $('body').append('<audio id="custom-sound"><source src="' + settings.customsound + '"></audio>');
    }
    function loadEvents() {
        API.on({
            'chat':eventChat,
            'userJoin':eventJoin,
            'waitListUpdate':eventWLUpd,
            'advance':eventDjAdv,
            'chatCommand':eventCommand
        });
        $(window).resize(resize);
        if (getRank(API.getUser()) >= 2) {
            API.on('voteUpdate',refreshMehs);
            API.on('voteUpdate',eventVote);
            $('#users-button:not(.selected)').click(refreshMehs);
        }
        //make it draggable
        var dragopts = {
            distance:20,
            handle:'#tp-title',
            containment:'#tp-room',
            scroll:false,
            start:function(){drag = true},
            stop:function(e,ui){
                drag = false;
                settings.uipos = ui.position;
                saveSettings();
            }
        };
        if ($.ui == undefined) {
            $.getScript('https://fungustime.pw/jquery-ui-1.10.4.custom.min.js',function(){
                $('#tastyplug-ui').draggable(dragopts);
            });
        } else $('#tastyplug-ui').draggable(dragopts);
        //hover over song title
        $('#now-playing-media').hover(
            function(){
                hover = true;
                if (API.getMedia()) {
                    var left = $('#now-playing-bar').position().left + 74;
                    $('body').append('<div id="tooltip" class="tp-songtitle" style="top:6px;left:' + left + 'px"><span>' + 
                        API.getMedia().author + ' - ' + API.getMedia().title + '</span><div class="corner"></div></div>');
                }
            },
            function(){
                hover = false;
                $('#tooltip.tp-songtitle').remove();
            }
        );
        //quick reply to pm
        $('#chat-messages').on('click','.pm.from',function(){
            if ($('#chat-input-field').val()) return;
            var a = '/pm @' + $(this).children("span.un.clickable").text();
            $('#chat-input-field').val(a);
            $('#chat-input-field').focus();
        });
        //pm button
        /*$('#chat-pm-button i').click(function(){
            if (!$('.icon-mention-off').length) return Chat('error', 'Don\'t use this button while the mentions button is on! (Button to the left)');
            pms = !pms;
            $('#chat-pm-button i').attr('class',(pms ? 'icon icon-unignore' : 'icon icon-ignore'));
            $('#chat-messages').children().not('.tastyplug-pm').toggle();
            $('#chat-messages').scrollTop(20000);
        });*/
        //highlight ui buttons
        $('.tp-mainbutton,.tp-secbutton').hover(
            function(){$(this).addClass('tp-highlight')},
            function(){$(this).removeClass('tp-highlight')}
        );
        //tp title
        $('#tp-title').mouseup(function(){
            if (!drag) {
                settings.show = !settings.show;
                if (!settings.show) {
                    $('#tastyplug-ui').css('padding-bottom','0');
                    $('.tp-mainbutton').css('border-top','0');
                    $('.tp-secbutton').css('border-top','0');
                }
                $('#tastyplug-ui .tp-mainbutton').slideToggle(function(){
                    if (settings.show) {
                        $('#tastyplug-ui').css('padding-bottom','');
                        $('.tp-mainbutton').css('border-top','');
                        $('.tp-secbutton').css('border-top','');
                    }
                });
                $('.tp-secbutton,.tp-infobutt').slideUp();
                saveSettings();
            }
        });
        //tp autowoot
        $('#tp-autowoot').click(function(){
            settings.autowoot = !settings.autowoot;
            $(this).toggleClass('button-on');
            if (settings.autowoot) woot();
            saveSettings();
        });
        $('#tp-automeh').click(function(){
            settings.automeh = !settings.automeh;
            $(this).toggleClass('button-on');
            if (settings.automeh) meh();
            saveSettings();
        });
        //autojoin
        $('#tp-autojoin').click(function(){
            settings.autojoin = !settings.autojoin;
            $(this).toggleClass('button-on');
            if (settings.autojoin && !getLocked() && API.getWaitListPosition() == -1) join();
            afkCheck();
            saveSettings();
        });
        //hide video
        $('#tp-hidevideo').click(function(){
            hidevideo = !hidevideo;
            $('#playback-container').toggleClass('tp-video-hide');
            $('#playback').toggleClass('tp-video-hide');
            hidevideo ? $('.background').hide() : $('.background').show();
            $(this).toggleClass('button-on');
        });
        //meh tracker
        $('#tp-mehtrack').click(function(){
            settings.mehtrack = !settings.mehtrack;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //booth alert
        $('#tp-boothalert').click(function(){
            settings.boothalert = !settings.boothalert;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //legacy chat
        $('#tp-legacychat').click(function(){
            settings.legacychat = !settings.legacychat;
            $(this).toggleClass('button-on');
            legacyChat.toggle(settings.legacychat);
            saveSettings();
        });
        //history alert
        $('#tp-histalert').click(function(){
            settings.histalert = !settings.histalert;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //chat images
        $('#tp-chatimgs').click(function(){
            settings.chatimgs = !settings.chatimgs;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //custom emotes
        $('#tp-emotes').click(function(){
            settings.emotes = !settings.emotes;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        //chat mentions
        $('#tp-mentions span').click(function(){
            settings.chatmentions = !settings.chatmentions;
            $(this).parent().toggleClass('button-on');
            saveSettings();
        });
        $('#tp-addmention').click(function(){
            var len = settings.msgs.length;
            var a = prompt('Add words to the chat mentions list! Separate them with a comma.').trim().split(',');
            if (!a) return Chat('error', 'Please enter at least one word!');
            for (var i = 0; i < a.length; i++) {
                a[i] = a[i].trim().toLowerCase();
                if (a[i].length < 3) Chat('error', 'Did not add: ' + _.escape(a[i]) + ' (too short)');
                else if (settings.msgs.indexOf(a[i]) > -1) Chat('error', 'Did not add: ' + _.escape(a[i]) + ' (already on list)');
                else settings.msgs.push(a[i]);
            }
            if (settings.msgs.length > len) {
                Chat('info', 'Added word(s) to chat mentions list');
                saveSettings();
            }
        });
        $('#tp-delmention').click(function(){
            var a = prompt('Which word would you like to remove from the mentions list?');
            if (settings.msgs.indexOf(a) > -1) {
                settings.msgs.splice(settings.msgs.indexOf(a),1);
                Chat('info', 'Removed "' + _.escape(a) + '" from the chat mentions list');
                saveSettings();
            } else Chat('error', 'That word isn\'t in the mentions list!');
        });
        $('#tp-listmention').click(function(){
            var a = settings.msgs;
            for (var i = 0; i < a.length; i++) a[i] = _.escape(a[i]);
            if (a.length) return Chat('info', 'Chat mentions list:<br>' + a.join('<br>'));
            return Chat('error', 'You don\'t have anything in your chat mentions list!');
        });
        $('#tp-mentions .icon-drag-handle').click(function(){
            $('.tp-secmention').slideToggle();
        });
        //join notifs
        $('#tp-joinnotifs span').click(function(){
            settings.joinnotifs.toggle = !settings.joinnotifs.toggle;
            $(this).parent().toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinranks').click(function(){
            settings.joinnotifs.ranks = !settings.joinnotifs.ranks;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinfriends').click(function(){
            settings.joinnotifs.friends = !settings.joinnotifs.friends;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinlvl1').click(function(){
            settings.joinnotifs.lvl1 = !settings.joinnotifs.lvl1;
            $(this).toggleClass('button-on');
            saveSettings();
        });
        $('#tp-joinnotifs .icon-drag-handle').click(function(){
            $('.tp-secjoin').slideToggle();
        });
    }
    function loadEmotes() {
        $.ajax({
            cache: false,
            url: "https://fungustime.pw/tastyplug/emotes/json/emotes.json",
            dataType: "json",
            success: function(a){
                for (var i in a) {
                    for (var j in a[i]) {
                        emotes[j] = a[i][j];
                    }
                }
            },
            error: function(){Chat('error','Could not load custom emotes. Refresh and/or try again later.')}
        });
    }
    tastyPlugShutDown = function() {
        API.off({
            'chat':eventChat,
            'userJoin':eventJoin,
            'waitListUpdate':eventWLUpd,
            'advance':eventDjAdv,
            'chatCommand':eventCommand,
            'voteUpdate':refreshMehs
        });
        API.off('voteUpdate',eventVote);
        $(window).off('resize',resize);
        $('#users-button').off('click',refreshMehs);
        $('#chat-messages .pm-from').off('click');
        $('.tp-img-delete').off('click');
        $('#chat-messages .message,#chat-messages .mention,#chat-messages .emote').has('img').off('mouseenter mouseleave');
        $('#now-playing-media').off('mouseenter mouseleave');
        $('#chat-pm-button').remove();
        $('#waitlist-button').find('.eta').remove();
        $('#playback-container').removeClass('tp-video-hide');
        $('.background').show();
        $('#playback').removeClass('tp-video-hide');
        $('#tastyplug-ui').remove();
        $('#tastyplug-css').remove();
        $('#legacy-chat-stylesheet').remove();
        $('#tp-room').remove();
        $('#tooltip.tp-songtitle').remove();
        for (var i = 1; i < sounds.length; i++) {
            $('#' + sounds[i] + '-sound').remove();
        }
        legacyChat.toggle(false);
        reconnect = false;
        for (var i in tos) clearInterval(tos[i]);
        saveSettings();
        if (sock) sock.close();
        console.log('[TastyPlug v' + version + '] Shut down.');
    };
    function eventChat(a) {
        if (!a.cid || a.cid == lastchat) return;
        lastchat = a.cid;
        var msg = $('.cid-'+a.cid).parent();
        //if (pms && !msg.hasClass('.tastyplug-pm')) msg.hide();
        if (settings.emotes) {
            var txt = msg.find('.text'), html = txt.html();
            var chat = $('#chat-messages'), d = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28;
            html = custEmotes(html);
            txt.html(html);
            if (d) chat.scrollTop(chat[0].scrollHeight);
        }
        if (settings.chatimgs && a.message.toLowerCase().indexOf('nsfw') == -1) {
            var txt = msg.find('.text'), txts = txt.text().trim().split(' ');
            for (var i = 0; i < txts.length; i++) if (/.(gif|png|jpe?g)/i.test(txts[i]) && /^https?:\/\//i.test(txts[i])) return checkImg(txts[i],txt);
        }
        var b = document.createElement('div');
        b.innerHTML = a.message;
        var message = b.textContent.replace(/  +/g, ' ').trim();
        if (a.uid == API.getUser().id) {
            afktime = Date.now();
        }
        if (!settings.chatmentions || a.uid == API.getUser().id || a.type == 'mention') return;
        b = message.toLowerCase().split(' ');
        for (var i = 0; i < settings.msgs.length; i++) {
            if (b.indexOf(settings.msgs[i]) > -1) return chatSound();
        }
    }
    function eventJoin(a) {
        if (!settings.joinnotifs.toggle) return;
        if (!a.username) return;
        if (!settings.joinnotifs.ranks && !settings.joinnotifs.friends && !settings.joinnotifs.lvl1) return;
        var b, rank = getRank(a), str = '';
        if (rank) switch (rank) {
            case 10: b = 'admin'; break;
            case 8: b = 'ba'; break;
            case 5: b = 'host'; break;
            case 4: b = 'cohost'; break;
            case 3:case 2:case 1: b = 'staff'; break;
            default: b = 'undef'; break;
        }
        else if (settings.joinnotifs.friends && a.friend) b = 'friend';
        else if (settings.joinnotifs.lvl1 && getRank(API.getUser()) >= 2 && a.level == 1) b = 'lvl1';
        if (b) {
            if (b == 'lvl1') str += '[Lvl 1 - ID: ' + a.id + '] ';
            str += _.escape(a.username) + ' joined the room';
            Chat('join-' + b, str);
        }
    }
    function eventWLUpd() {
        if (settings.autojoin && !getLocked() && API.getWaitListPosition() == -1) join();
        if (settings.boothalert && API.getWaitListPosition() < settings.boothnotify && API.getWaitListPosition() != -1 && !boothcd) {
            chatSound();
            Chat('info','[Booth Alert] It\'s almost your turn to DJ! Make sure to pick a song!');
            boothcd = true;
            if (room == '/tastycat' && sock.readyState == 1) commands.cs()
        }
    }
    function eventDjAdv(a) {
        if (settings.autojoin && !getLocked() && API.getWaitListPosition() == -1) join();
        if (settings.autowoot) setTimeout(woot,(Math.floor(Math.random()*10)+1)*1000);
        if (hidevideo) $('#tp-hidevideo').click();
        if (!a.dj) return;
        if (a.dj.id == API.getUser().id) boothcd = false;
        if (settings.histalert && getRank(API.getUser()) >= 2 && a.media) {
            var hist = API.getHistory();
            for (var i = 0; i < hist.length; i++) {
                if (hist[i].media.cid == a.media.cid) {
                    Chat('error','This song is on the history! (played ' + (i + 1) + ' song' + (i == 0 ? '' : 's') + ' ago)');
                    chatSound();
                    break;
                }
            }
        }
        if (hover) {
            $('#tooltip.tp-songtitle').remove();
            if (API.getMedia()) {
                var left = $('#now-playing-bar').position().left + 74;
                $('body').append('<div id="tooltip" class="tp-songtitle" style="top:6px;left:' + left + 'px"><span>' + 
                    API.getMedia().author + ' - ' + API.getMedia().title + '</span><div class="corner"></div></div>');
            }
        }
    }
    function eventVote(a) {
        if (settings.mehtrack && getRank(API.getUser()) >= 2 && a.vote == -1 && !curvotes[a.user.id]) {
            curvotes[a.user.id] = true;
            Chat('error', a.user.username + ' meh\'d the song!');
        }
    }
    function eventCommand(a) {
        var cmd = a.trim().substr(1).split(' ')[0].toLowerCase();
        var data = {
            uid: API.getUser().id,
            un: API.getUser().username,
            message: a.trim(),
            room: room
        }, a;
        if (cmd == 'opcheck' || cmd == 'check') a = commands.cs(data);
        else if (commands[cmd]) a = commands[cmd](data);
        else if (room == '/tastycat' && sock && sock.readyState == 1) {
            sock.msg({z:'command',a:data});
            a = true;
        }
        if (a) {
            cd = true;
            setTimeout(function(){cd = false},2E3);
        }
    }
    function refreshMehs() {
        if ($('#users-button').hasClass('selected') && $('.button.room').hasClass('selected')) {
            $('#user-lists .list.room i.icon.icon-meh').remove();
            var users = $(API.getUsers()).filter(function(){return this.vote == -1 && !this.curated;});
            users.each(function(i){
                $('#user-lists .list.room .user span').filter(function(){return $(this).text()==users[i].username;}).parent().append('<i class="icon icon-meh"></i>');
            });
        }
    }
    commands.lock = function() {
        if (getRank(API.getUser()) < 3) return;
        API.moderateLockWaitList(true);
    };
    commands.unlock = function() {
        if (getRank(API.getUser()) < 3) return;
        API.moderateLockWaitList(false);
    };
    commands.cycle = function() {
        if (getRank(API.getUser()) < 3) return;
        $('.cycle-toggle').click();
    };
    commands.ban = function(a) {
        if (getRank(API.getUser()) < 3) return;
        var user = getUser(a.message.substr(a.message.indexOf('@')+1));
        if (!user) return Chat('error', 'User not found.');
        if (getRank(API.getUser()) <= getRank(user)) return Chat('error', 'You can\'t ban people who are of equal or higher rank as you!');
        API.moderateBanUser(user.id,0,API.BAN.PERMA);
    };
    commands.kick = function(a) {
        if (getRank(API.getUser()) < 2) return;
        var msg = a.message.split(' '), user, dur;
        if (msg[msg.length-1] != 'day' && msg[msg.length-1] != 'hour') {
            user = getUser(a.message.substr(a.message.indexOf('@')+1));
            dur = API.BAN.HOUR;
        } else {
            user = getUser(msg.slice(1,msg.length-1).join(' ').substr(1));
            dur = msg[msg.length-1] == 'day' ? API.BAN.DAY : API.BAN.HOUR;
        }
        if (!user) return Chat('error', 'User not found.');
        if (getRank(API.getUser()) <= getRank(user)) return Chat('error', 'You can\'t kick people who are of equal or higher rank as you!');
        API.moderateBanUser(user.id,0,dur);
    };
    commands.skip = function() {
        if (getRank(API.getUser()) < 2) return;
        API.moderateForceSkip();
    };
    commands.pm = function(a) {
        if (!togglepm) return Chat('error', 'You toggled PMs off! To turn them back on, type /pmtoggle.');
        if (cd) return Chat('error', 'PMs have a 2 second slow-mode!');
        if (sock && sock.readyState != 1) return Chat('error', 'Not connected to TastyPlug\'s server!');
        if (a.message == '/pm') return Chat('info', 'Usage: /pm @user message<br>Sends a private message to the user if they are using Tastyplug and you are each other\'s fans');
        var str = a.message.substr(5).split(' '), user;
        for (var i = 1; i <= str.length; i++) {
            user = getUser(str.slice(0,i).join(' '));
            if (user) break;
        }
        if (!user) return Chat('error', 'User not found.');
        if (user.id == API.getUser().id) return Chat('error', 'You can\'t PM yourself!');
        var msg = str.slice(i).join(' ');
        if (!msg) return Chat('error', 'Please input a message to send!');
        sock.msg({z:'pm',m:msg,f:API.getUser(),t:user})
        ChatPM('To: ' + user.username,msg);
        return true;
    };
    commands.pmconnect = function() {
        if (room == '/tastycat' || (sock && sock.readyState == 1)) return;
        Chat('info', 'Connecting to TastyPlug server');
        socket();
    };
    commands.r = function(a) {
        if (settings.lastPM) eventCommand('/pm @' + settings.lastPM + ' ' + a.message.split(' ').slice(1).join(' '));
        else Chat('error', 'Nobody has PMed you yet!');
    };
    commands.cs = function() {
        if (cd) return Chat('error', '/opcheck has a 2 second slow-mode!');
        if (room != '/tastycat') return;
        if (sock && sock.readyState != 1) return Chat('error', 'Not connected to TastyPlug\'s server!');
        var b = API.getNextMedia().media;
        sock.msg({z:'songcheck',id:b.format+':'+b.cid,song:'Next on your playlist',author:b.author,title:b.title});
        return true;
    };
    commands.reset = function() {
        Chat('init', 'Reloading...');
        setTimeout(function(){$.getScript('https://fungustime.pw/tastyplug/tastyplug.js')},1000);
    };
    commands.commands = function() {
        if (room == '/tastycat') Chat('info', 'Tastybot commands: <a href="http://tastycat.net/tastybot/" target="_blank">Click Here</a>');
        Chat('info', 'TastyPlug commands: ' + Object.keys(commands).join(', '));
    };
    commands.whois = function(a) {
        var user = getUser(a.message.split(' ').slice(1).join(' ').substr(1)), rank;
        if (!user) return Chat('error','User not found.');
        var pos = API.getWaitListPosition(user.id);
        switch (getRank(user)) {
            case 10: rank = 'plug.dj Admin'; break;
            case 8: rank = 'Brand Ambassador'; break;
            case 5: rank = 'Host'; break;
            case 4: rank = 'Co-Host'; break;
            case 3: rank = 'Manager'; break;
            case 2: rank = 'Bouncer'; break;
            case 1: rank = 'Resident DJ'; break;
            case 0: rank = 'User'; break;
            default: rank = 'Unknown';
        }
        if (API.getDJ().id == user.id) pos = 'Currently DJing';
        else if (pos == -1) pos = 'Not on list';
        else pos++;
        Chat('info','Username: <span>' + user.username + '</span><br>ID: <span>' + user.id + 
            '</span><br>Rank: <span>' + rank + '</span><br>Level: <span>' + user.level + '</span><br>Wait List: <span>' + pos + '</span>');
    };
    commands.link = function() {
        var b = API.getMedia();
        if (b.format == '1') Chat('info', 'Current song: <a href="http://youtu.be/' + b.cid + '" target="_blank">Click Here</a>');
        else SC.get('/tracks/' + b.cid, function(c) {
            Chat('info', 'Current song: ' + (c.permalink_url ? ('<a href="' + c.permalink_url + '" target="_blank">Click Here') : 'Link not found'));
        });
    };
    commands.pic = function() {
        var b = API.getMedia();
        if (b.format == 1) Chat('info', 'Video image: <a href="http://i1.ytimg.com/vi/' + b.cid + '/maxresdefault.jpg" target="_blank">Click Here</a>');
        else SC.get('/tracks/' + b.cid, function(c) {
           Chat('info', 'Song art: ' + (c.artwork_url ? ('<a href="' + c.artwork_url + '" target="_blank">Click Here</a>') : 'Artwork unavailable'));
        });
    };
    commands.uireset = function() {
        settings.uipos = {'top':'54px','left':'0'};
        $('#tastyplug-ui').css(settings.uipos);
        saveSettings();
        Chat('info', 'UI position reset');
    };
    commands.hidden = function() {
        settings.hidden = !settings.hidden;
        saveSettings();
        Chat('info', 'Hidden emotes ' + (settings.hidden ? 'enabled!' : 'disabled!'));
    };
    commands.mentionsound = function(a) {
        var b = a.message.split(' ').slice(1);
        if (!b.length) return Chat('info', 'Usage: <span>/mentionsound [sound]</span><br>Available sounds: ' + sounds.join(', '));
        if (sounds.indexOf(b[0]) == -1) return Chat('error', 'Invalid sound. Available sounds: ' + sounds.join(', '));
        if (b[0] == 'custom') {
            if (!b[1] || !(/.(mp3|wav|ogg)/i.test(b[1])) || !(/^https?:\/\//i.test(b[1]))) return Chat('error', 'Please supply a direct link to a valid mp3, wav, or ogg file!<br>Usage: /mentionsound custom [link]');
            $('#custom-sound').remove();
            $('body').append('<audio id="custom-sound"><source src="' + b[1] + '"></audio>');
            settings.customsound = b[1];
        }
        settings.mention = sounds.indexOf(b[0]);
        saveSettings();
        chatSound();
        Chat('info', 'Mention sound set to <span>' + b[0] + '</span>.<br>Turn off mention sounds by changing to <span>default</span> or clicking the mention toggle at the top of the chat.');
    };
    commands.boothnotify = function(a) {
        var b = a.message.substr(13);
        settings.boothnotify = ~~b || 3;
        Chat('info', 'Booth Alert notification spot changed to spot <span>' + settings.boothnotify + '</span>.');
        saveSettings();
    };
    commands.pmtoggle = function() {
        if (!sock || sock.readyState != 1) return Chat('error', 'Not connected to TastyPlug\'s server!');
        togglepm = !togglepm;
        Chat('info', 'Receiving TastyPlug PMs ' + (togglepm ? 'enabled!' : 'disabled!'));
    };
    function Chat(type, m) {
        if ($('#chat-button').css('display') == 'block') {
            var chat = $('#chat-messages'), a = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28,
                d = $('#chat-timestamp-button .icon').attr('class').substr(21),
                user = "TastyPlug",
                f = new Date().toTimeString().substr(0,5);
            if (d == '12') {
                var g = parseInt(f),
                    h = g >= 12 ? 'pm' : 'am',
                    i = g%12 == 0 ? '12' : g%12;
                f = i + f.substr(2) + h;
            }
            if (f.charAt(0) == '0') f = f.substr(1);
            chat.append('<div class="cm message tastyplug-message tp-' + type + '"><div class="badge-box"><img class="tastyplug-icon" src="https://fungustime.pw/tastyplug/tastyplug.png"/></div><div class="msg"><div class="from tastyplug"><span class="un">' + user + '</span><span class="timestamp" style="display: inline;">' + f + '</span></div><div class="text">' + m + '</div></div></div>');
            if (a) chat.scrollTop(chat[0].scrollHeight);
            if (chat.children().length >= 512) chat.children().first().remove();
        } else API.chatLog(m.replace(/<br>/g,', ').replace(/<\/?span>/g,''),true);
    }
    function ChatPM(user, msg) {
        if ($('#chat-button').css('display') == 'block') {
            var chat = $('#chat-messages'), a = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28,
            c = !user.indexOf('To: ') ? '-to' : '-from clickable',
            d = $('#chat-timestamp-button .icon').attr('class').substr(21),
            e = d == 'off' ? 'none' : 'block',
            f = new Date().toTimeString().substr(0,5), j = false,
            k = !user.indexOf('To: ') ? ' message' : ' mention is-pm';
            header = !user.indexOf('To: ') ? '<span class="pm-header">To: </span>' : '';
            if (d == '12') {
                var g = parseInt(f),
                    h = g >= 12 ? 'pm' : 'am',
                    i = g%12 == 0 ? '12' : g%12;
                f = i + f.substr(2) + h;
            }
            if (f.charAt(0) == '0') f = f.substr(1);
            msg = urlFix(_.escape(msg));
            if (settings.emotes) msg = custEmotes(msg);
            if (!msg.indexOf('/me')) { msg = msg.replace('/me','<em>'); j = true; }
            else if (!msg.indexOf('/em')) { msg = msg.replace('/em','<em>'); j = true; }
            j = j ? '' : '&nbsp;';
            user = !user.indexOf('To: ') ? user.substring(4) : user;
            chat.append('<div class="cm tastyplug-pm' + k + '"><div class="badge-box"><i class="icon icon-tp-pm"></i></div><div class="msg"><div class="from pm">' + header + '<span class="un clickable">' + _.escape(user) + ' </span><span class="timestamp" style="display: inline;">' + f + '</span></div><div class="text">' + msg + '</div></div></div>');
            if (a) chat.scrollTop(chat[0].scrollHeight);
            if (chat.children().length >= 512) chat.children().first().remove();
        } else API.chatLog('[PM] ' + user + ': ' + msg);
    }
    function eta() {
        tos.eta = setInterval(function(){
            var pos = API.getWaitListPosition(); 
            var str = pos == -1 ? '' : ('ETA: ' + getTime(pos*1000*60*(25/6) + API.getTimeRemaining()*1000));
            $('#waitlist-button').find('.eta').text(str);
        },10000);
    }
    function resize() {
        var room = $('#tp-room'), rpos = room.position(), rwidth = room.width(), rheight = room.height(),
            ui = $('#tastyplug-ui'), uipos = ui.position(), uiwidth = ui.width(), uiheight = ui.height(),
            a = Object.keys(rpos),
            uicont = {
                width: $('.app-right').position().left,
                height: $('.app-right').height()
            };
        $('#tp-room').css(uicont);
        for (var i = 0; i < a.length; i++) if (uipos[a[i]] < rpos[a[i]]) ui.css(a[i], rpos[a[i]]);
        uipos = $('#tastyplug-ui').position();
        if (uiwidth + uipos.left > rwidth) ui.css('left', rwidth-uiwidth);
        if (uiheight + uipos.top > rheight) ui.css('top', rheight-uiheight);
        settings.uipos = ui.position();
        if (settings.fullscreen) fullScreen();
        saveSettings();
    }
    function getUser(a) {
        a = a.trim();
        var b = API.getUsers();
        for (var i = 0; i < b.length; i++) if (b[i].username == a) return b[i];
        return null;
    }
    function getTime(a) {
        a = Math.floor(a/60000);
        var minutes = (a-Math.floor(a/60)*60);
        var hours = (a-minutes)/60;
        var str = '';
        str += hours + 'h';
        str += minutes<10?'0':'';
        str += minutes;
        return str;
    }
    function getRank(a) {
        if (a.gRole) switch (a.gRole) {
            case 5: return 10;
            case 4:case 3:case 2: return 8;
            default:return 6;
        }
        return a.role;
    }
    function urlFix(a) {
        if (a.indexOf('http') == -1) return a;
        a = a.split(' ');
        for (var i = 0; i < a.length; i++) if (!a[i].indexOf('http')) a[i] = '<a href="' + a[i] + '" target="_blank">' + a[i] + '</a>';
        return a.join(' ');
    }
    function afkCheck() {
        if (settings.autojoin) tos.afkInt = setInterval(function(){
            if (Date.now() - afktime >= 12E5) {
                settings.autojoin = false;
                $('#tp-autojoin').removeClass('button-on');
                clearInterval(tos.afkInt);
            }
        },6E4);
        else clearInterval(tos.afkInt);
    }
    function checkImg(a,b) {
        var img = new Image();
        img.onload =  function() {
            img.className += 'tp-img';
            if (img.height > 300 && 270*img.height/img.width > 300) return;
            if (img.width > 270) img.className += ' wide';
            else if (img.height > 300) img.className += ' high';
            var c = b.html().replace('<a href="' + a + '" target="_blank">' + a + '</a>', '<br><a href="' + a + '" target="_blank">' + img.outerHTML + '</div></a>');
            b.parent().append('<div class="tastyplug-img-delete" style="display:none">X</div>');
            b.parent().parent().hover(
                function(){$(this).find('.tastyplug-img-delete').css('display','block')},
                function(){$(this).find('.tastyplug-img-delete').css('display','none')}
            );
            b.parent().find('.tastyplug-img-delete').click(function(){
                var a = $(this).parent().find('img')[0].src;
                $(this).parent().find('br').remove();
                $(this).parent().find('img').parent().append(a).find('img').remove();
                $(this).remove();
            });
            var chat = $('#chat-messages'), d = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28;
            b.html(c);
            if (d) chat.scrollTop(chat[0].scrollHeight);
        };
        img.src = a;
    }
    function custEmotes(txt) {
        if (!Object.keys(emotes).length || typeof txt != 'string') return;
        var em = txt.match(/:[^:\s]+:/g);
        if (!em) return txt;
        for (var i = 0; i < em.length; i++) {
            var emlow = em[i].substring(1, em[i].length-1);
            for (var j in emotes) {
                if (emlow == j.toLowerCase()) {
                    if (!settings.hidden && emotes[j].hidden) break;
                    var msg = txt.split(em[i]), res = msg[0];
                    for (var k = 1; k < msg.length; k++) {
                        var align = parseInt(emotes[j].height) < 20 ? '-mid' : '';
                        res += '<div class="custom-emote' + align + '" title="' + (emotes[j].hidden ? 'Hidden Emote!' : j) + '" style="background-image:url(' + emotes[j].url + ');width:' + emotes[j].width + ';height:' + emotes[j].height + ';"></div>';
                        res += msg[k];
                    }
                    txt = res;
                    break;
                }
            }
        }
        return txt;
    }
    function join() {
        if (!joincd && room != '/hummingbird-me') {
            API.djJoin();
            joincd = true;
            setTimeout(function(){joincd = false},5000);
        }
    }
    function chatSound(){
        if ($('.icon-chat-sound-on').length) {
            document.getElementById(sounds[settings.mention] + '-sound').play();
        }
    }
    function saveSettings(){localStorage.setItem('tastyPlugSettings',JSON.stringify(settings))}
    function getLocked(){return $('.lock-toggle .icon').hasClass('icon-locked')}
    function woot(){$('#woot').click()}
    function meh(){$('#meh').click()}

    // Original legacy chat author: @Git
    var legacyChat = (function() {
        "use strict";
        var legacyChatStylesheet = "div#chat-messages div.cm.legacy-chat{min-height:0;width:auto}div#chat div.cm.legacy-chat.mention{background:#0a0a0a}div#chat div.cm.legacy-chat.mention:nth-child(2n+1){background:#111317}div#chat-messages div.legacy-chat div.badge-box{height:0;overflow:hidden;position:absolute}#chat-messages div.from.pm span.pm-header{padding:0;color:#FF00CB}#chat-messages div.legacy-chat i.icon{margin:6px}#chat-messages div.legacy-chat i.icon.icon-tp-pm{margin:0}#chat-messages div.legacy-chat.is-admin{border-left:3px solid #42a5dc}#chat-messages div.legacy-chat.is-ambassador{border-left:3px solid #89be6c}#chat-messages div.legacy-chat.is-staff,#chat-messages div.legacy-chat.is-dj{border-left:3px solid #ac76ff}#chat-messages div.legacy-chat.is-you{border-left:3px solid #ffdd6f}#chat-messages div.legacy-chat.is-pm{border-left:3px solid #FF00CB}#chat-messages div.legacy-chat div.msg{padding:4px 5px 5px 27px}div.legacy-chat div.msg div.from span.un{padding-right:3px}#chat-messages div.text{display:inline}#chat-messages div.text:before{content:' '}div.legacy-chat.mention div.msg div.from div.text,div.legacy-chat.message div.msg div.from div.text{color:#eee}div.legacy-chat div.msg div.from:before{content:'';float:right;width:50px;height:1px}#chat-messages div.legacy-chat div.msg div.from span.timestamp{position:absolute;right:0;top:1px;float:right}.tastyplug-message.legacy-chat span.un{display:none}#chat-messages div.mention.legacy-chat i.icon,#chat-messages div.mention.legacy-chat i.icon.icon-tp-pm{left:-2px}#chat-messages div.mention div.msg{padding-left:24px}#chat-messages .legacy-chat .delete-button{padding:1px 7px}#chat-messages .tastyplug-pm.mention i.icon.icon-tp-pm.legacy-fake-icon{left:1px}#chat-messages i.icon.icon-tp-pm.legacy-fake-icon{left:4px}",
            legacyChatFile = '<style id="legacy-chat-stylesheet" type="text/css">' + legacyChatStylesheet + '</style>',
            toHideBadges = false;
        $('head').append(legacyChatFile);
        var convertToLegacy = function(node) {
            node.addClass("legacy-chat");
            var badge = node.find("div.badge-box"),
                message = node.find("div.msg"),
                messageData = message.find("div.from"),
                icon = messageData.children("i.icon"),
                messageText = message.find("div.text"),
                messageTime = messageData.find("span.timestamp"),
                messageUser = messageData.find("span.un");
            
                icon.hide();
            if(message.children("div.subscriber")[0]) {
                icon = $('<i class="icon icon-chat-subscriber legacy-fake-icon"></i>');

                icon.insertAfter(badge);
            } else if(message.children("div.staff, div.dj")[0]) {
                var staffIcon = icon.last().clone();
                staffIcon.addClass("legacy-fake-icon");
                staffIcon.insertAfter(badge);
                staffIcon.show();
            } else if(message.children("div.you")[0]){
                var baIcon = icon.filter(".icon-chat-ambassador");
                var legacyIcon = baIcon.length ? baIcon : icon.last();
                icon.not(legacyIcon).hide();
                legacyIcon.insertAfter(badge);
                legacyIcon.show();
            } else if(message.children("div.ambassador")[0]) {
                icon = $('<i class="icon icon-chat-ambassador legacy-fake-icon"></i>');
                icon.insertAfter(badge);
            } else if(message.children("div.from.pm")[0]) {
                icon = $('<i class="icon icon-tp-pm legacy-fake-icon"></i>');
                icon.insertAfter(badge);
            } else if(message.children("div.admin")[0]) {
                icon = $('<i class="icon icon-chat-admin legacy-fake-icon"></i>')
                icon.insertAfter(badge);
            }
            messageText.insertAfter(messageUser);
        };
         
        var convertFromLegacy = function(node) {
            var message = node.find("div.msg"),
                messageData = message.find("div.from"),
                messageUser = messageData.find("span.un"),
                messageText = message.find("div.text"),
                messageTime = message.find("span.timestamp"),
                icon = node.children("i.icon:not(.legacy-fake-icon)");
            if(icon.length) {
                messageData.prepend(icon);
            }
            messageData.children().show();
            messageText.insertAfter(messageData);
            node.removeClass("legacy-chat");
        };
         
        var legacyChatObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if(toHideBadges){
                    var nodes = mutation.addedNodes,
                        i = 0;
                    for (i = 0; i < nodes.length; ++i) {
                        if (nodes[i].nodeType === Node.ELEMENT_NODE) {
                            convertToLegacy($(nodes[i]).find('*').andSelf().filter("div.cm:not(.legacy-chat,.welcome,.update)"));
                        }
                    }
                }
            });    
        });
        // Calling it with bool parameter also sets legacy mode bool
        var toggle = function(on) {
            toHideBadges = (on !== undefined) ? on : !toHideBadges;

            if(toHideBadges) {
                // Convert regular chat to legacy chat
                var target = document.querySelector("#chat-messages");
                legacyChatObserver.observe(target, {childList:true});
                $("#chat-messages div.cm:not(.legacy-chat,.welcome,.update)").each(function() {
                        convertToLegacy($(this));
                });
            } else {
                // Conveting legacy chat to regular chat
                legacyChatObserver.disconnect();
                $("div.legacy-chat").each(function() {
                    convertFromLegacy($(this));
                });
                $("i.legacy-fake-icon").remove();
            }
            // Smooth scroll to bottom of chat div in case you're left high and dry in chat.
            $('#chat-messages').scrollTop($('#chat-messages')[0].scrollHeight);
        };
        return { toggle: toggle };
    }());

    var z = function() {
        if (typeof API === 'undefined' || !API.enabled) setTimeout(z,200);
        else startup();
    };
    z();
})();
