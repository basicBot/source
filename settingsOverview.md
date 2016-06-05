Roomsettings
============

Settings explained
------------------

Try to keep numbers integers: no decimals. 
Strings go between " ", if you want to use " in your string, use \". 
Booleans are either 'true' or 'false', without the '.

- "language": choose one of the supported language packs, if no valid language is found, it will use the standard pack or a specified pack, type: string
- "chatLink": link to a json file containing a translated chat pack, type: string
- "maximumAfk": the amount of minutes a user can be afk for the afkCheck if it's enabled, type: a number
- "afkRemoval": turn afkCheck on or off, type: boolean             
- "maximumDc": users that disconnected not longer than this amount of minutes ago, can get their spot back, type: a number 
- "bouncerPlus": turn the bouncer+ mode on or off, type: boolean                
- "lockdownEnabled": turn lockdown on or off, lockdown means that only staff can chat, leave it false                
- "lockGuard": turn the lockguard on or off, lockguard makes sure the waitlist isn't locked longer than the maximum allowed time, type: a boolean: true/false
- "maximumLocktime": maximum time the waitlist can be locked if lockguard is enabled, type: a number                
- "cycleGuard": turn the cycleguard on or off, cycleguard makes sure DJ cycle isn't on longer than the allowed amount of minutes, type: boolean
- "maximumCycletime": maximum time DJ cycle can be enabled if cyleguard is enabled, type: a number                
- "timeGuard": turn the timeguard on or off, timeguard makes sure songs are not longer than the specified limit, if they are longer they are skipped immediately, type: boolean
- "maximumSongLength": maximum length of a track if timeguard is enabled, type: a number
- "autodisable": if enabled, the bot sends out !afkdisable and !joindisable every hour, this disables afkmessages and autojoining on plugcubed, type: boolean                
- "commandCooldown": the cooldown in seconds for commands for users (there will always be a few seconds cooldown to prevent spamming the servers), type: a number
- "usercommandsEnabled": turn commands for users on or off, type: boolean                
- "lockskipPosition": the position to which !lockskip adds users back to the waitlist, type: a number
- "lockskipReasons": possible reasons to add to !lockskip, format like this:
    	```
    	[
    		["reason1", "explanation1"],
    		["reason2", "explanation2"],
    		...
    		["reasonX", "explanationX"]
    	]
    	```
- "afkpositionCheck": only people below this waitlist position will be checked for afk, type: a number
- "afkRankCheck": only people below and with this rank will be checked for afk, possible ranks: 
	"user", "residentdj", "bouncer", "manager", "cohost", "host", "ambassador", "admin"
   	eg. "bouncer" will check all grey users, residentdj's and bouncers afk                
- "motdEnabled": Message of the Day, best to be left false and to be enabled and set using the commands, MotD displays a message every X songs. Use it for temporary imporant messages, type: boolean
- "motdInterval": standard interval for the MotD, every X songs, type: a number
- "motd": standard MotD, best to set using the !motd command, type: string                
- "filterChat": turns the chatfilter on or off, the filter checks for a range of invalid messages like just . 's, excessive caps, asking for skips, some spam and asking for fans, type: boolean
- "etaRestriction": enables the restriction on !eta, the restriction means that grey users can only use it once every hour, this would be used to prevent spamming the command, type: boolean
- "welcome": turn a welcome message for users on or off, type: boolean
- "opLink": an optional link to a list of OverPlayed songs, leave it null to leave it disabled, type: string
- "rulesLink": an optional link to a list of rules, leave it null to leave it disabled, type: string
- "themeLink": an optional link to the room's theme and allowed genres, leave it null to leave it disabled, type: string
- "fbLink": an optional link to a Facebook page, leave it null to leave it disabled, type: string,
- "youtubeLink": an optional link to a youtube, leave it null to leave it disabled, type: string,
- "website": an optional link to a website, leave it null to leave it disabled, type: string,
- "intervalMessages": an array of messages displayed every X songs, leave it empty to not have any default messages, format:
	`["message 1", "message 2", "message 3"]`
- "messageInterval": the interval X for the standard messages, type: a number
- "songstats": toggle message with statistics for the previous song, type: boolean
- "commandLiteral": symbol used to start commands, type: string
- "blacklists": list of blacklists and a link to their sources or a function to set them into the bot, see the readme for a more detailed how-to, type: string or function