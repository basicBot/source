# Commands List

- **X** specifies a number
- Arguments between **( )** are optional

### Manager

| Command | Arguments | Description |
|:-------:|:---------:|:-----------:|
| !afklimit | X | sets the maximum AFK time. |
| !botname | (botname) | change the default bot name. |
| !bouncer+ | — | toggle bouncer+. |
| !clearchat | — | clears the chat. |
| !clearlocalstorage | — | clears basicBot data stored on the browser. |
| !cycle | — | toggle DJ cycle. |
| !cycletimer | X | set the maximum DJ cycle time for when cycleguard is enabled. |
| !language | (language) | specify the language you would like the bot to use. |
| !locktimer | X | set the maximum time the waitlist can be locked if lockguard is enabled. |
| !logout | — | logs out account bot is hosted on. |
| !maxlength | X | specify the maximum length a song can be when timeguard is enabled. |
| !refresh | — | refreshes the browser of whoever runs the bot. |
| !skippos | X | set the position to which skip and lockskip moves the dj. |
| !usercmdcd | X | set the cooldown on commands by grey users. |
| !usercommands | — | toggle user commands. |
| !voteskip | (X) | when no argument is specified, returns the current voteskip limit, when X is specified, voteskip limit is updated to the new specified limit. |

### Bouncer+

| Command | Arguments | Description |
|:-------:|:---------:|:-----------:|
| !add | @user | add user to the waitlist. |
| !afkremoval | — | toggles the AFK check. |
| !autoskip | — | skips songs automatically when they're done (use when the circles-bug happens). |
| !deletechat | @user | delete all the chats by a certain user. |
| !lock | — | lock the waitlist. |
| !lockdown | — | lock down the room: only staff can chat. |
| !meh | — | makes the bot meh the current song. |
| !move | @user (X) | moves user to position X on the waitlist, default is position 1. |
| !remove | @user | remove user from the waitlist. |
| !roulette | — | start a roulette. |
| !songstats | — | toggle song statistics. |
| !swap | @user1 @user2 | swaps the position of two users in the waitlist. |
| !unlock | — | unlock the waitlist. |
| !welcome | — | toggle the welcome message on user join. |
| !woot | — | makes the bot woot the current song. |

### Bouncer

| Command | Arguments | Description |
|:-------:|:---------:|:-----------:|
| !active | (X) | shows how many users chatted in the past X minutes. If no X specified, 60 is set as default. |
| !afkreset | @user | resets the AFK time of user. |
| !afktime | @user | shows how long user has been AFK. |
| !autodisable | — | toggle the autodisable. |
| !ban | @user | bans user for 1 day. |
| !blacklist / !bl | blacklistname | add the song to the specified blacklist. |
| !blinfo | — | get information required to blacklist a song. |
| !commanddeletion / !cmddeletion / !cmddel | — | toggles if bot commands gets deleted. |
| !cycleguard | — | toggles the cycleguard. |
| !dclookup / !dc | (@user) | do dclookup on a user. |
| !english | @user | ask user to speak english (asked in the language they set plug to). |
| !eta | (@user) | shows when user will reach the booth. |
| !filter | — | toggles the chat filter. |
| !forceskip / !fs | — | forceskips the current song. |
| !grab | - | Tells the bot to grab the current song and add to their current playlist. (See Bot DJ section of README.md) |
| !historyskip | — | toggles the history skip. |
| !jointime | @user | shows how long the user has been in the room. |
| !kick | (X) | kicks user for X minutes, default is 0.25 minutes (15 seconds). |
| !kill | — | shut down the bot. |
| !listjoin / !jumpup | - | Tell the bot to start djing or join the wait list. (See Bot DJ section of README.md) |
| !listleave / !jumpdown | - | Tell the bot to stop djing or leave the wait list. (See Bot DJ section of README.md) |
| !listtoggle / !botdj / !dj | - | Shortcut to do !listjoin or !listleave as appropriate. (See Bot DJ section of README.md) |
| !lockguard | — | toggle the lockguard. |
| !lockskip | (reason) | skips, locks and moves the dj back up (the position can be set with `!skippos)`. |
| !motd | (X)/(message) | when no argument is specified, returns the Message of the Day, when X is specified, the MotD is given every X songs, when "message" is given, it sets the MotD to message. |
| !mute | @user/(X) | mute user, for X minutes if X is specified, otherwise for an undefined period. |
| !reload | — | reload the bot. |
| !restricteta | — | toggles the restriction on eta: grey users can use it once an hour. |
| !sessionstats | — | display stats for the current session. |
| !showplaylists / !botpls | - | makes the bot list its playlists. (See Bot DJ section of README.md) |
| !shuffle | - | Tell the bot to shuffle their playlist, useful after !grab if the bot is djing. (See Bot DJ section of README.md) |
| !skip / !smartskip | (reason) | skips the dj using smartskip. actions such as locking and moving user depends on various factors (the position the dj is moved to can be set with `!skippos`). |
| !status | — | display the bot's status and some settings. |
| !switchplaylist / !botpl | @playlistID | playlistID can be either the full playlist name, or the id of the playlist in the list displayed by !showplaylists (See Bot DJ section of README.md) |
| !timeguard | — | toggle the timeguard. |
| !togglebl | — | toggle the blacklist. |
| !togglemotd | — | toggle the motd. |
| !togglevoteskip | — | toggle the voteskip. |
| !unban | @user | unban user. |
| !unmute | @user/all | unmute user. |
| !uptime | — | displays how long the bot has been running. |
| !voteratio | @user | display the vote statistic for a user. |
| !whois | @user | returns plug related information about user. |

### Resident DJ

| Command | Arguments | Description |
|:-------:|:---------:|:-----------:|
| !link | — | give a link to the current song. |

### User

| Command | Arguments | Description |
|:-------:|:---------:|:-----------:|
| !8ball / !ask | (message) | ask the bot a question, the bot will return random variations of a yes or no answer. |
| !autowoot | — | links to PlugCubed, the advised script/plugin to use for autowooting. |
| !ba | — | explains the Brand Ambassador rank. |
| !commands | — | gives a link to the commands. |
| !cookie | (@user) | give a cookie to user. |
| !dclookup / !dc | — | use dclookup on yourself. |
| !emoji | — | returns a link the emoji list. |
| !eta | — | shows how long before you will reach the booth. |
| !fb | — | links to the room's Facebook page (if set in the settings). |
| !ghostbuster | @user | checks if user is ghosting. |
| !gif / !giphy | (message) | returns gif (from giphy) related to the tag provided. Returns a random gif if no tags are provided. |
| !help | — | links to an image to help get people started on plug. |
| !join | — | join the roulette if it's up. |
| !leave | — | leave the roulette if you joined. |
| !link | — | when the user is the DJ, give a link to the current song. |
| !op | — | links to the OverPlayed list (if set in the settings). |
| !ping | — | returns pong! |
| !rules | — | links to the rules (if set in the settings). |
| !source | — | returns a link to the basicBot repository on GitHub. |
| !theme | — | links to the room's theme (if set in the settings). |
| !thor | — | users get moved to position 1 in the waitlist if they're worthy of Thor's hammer. |
| !website | — | links to the room's website (if set in the settings). |
| !youtube | — | links to the room's youtube page (if set in the settings). |
