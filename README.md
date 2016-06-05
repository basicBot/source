Orginal basicBot [link](https://github.com/basicBot/source)

# changelog
[0.0.1] - 2016-06-04 Added:
- !clearchat changed into !cc
- !thor changed into !slots
- New languages Lithuanian (Completed) and Swedish (Working on it)
- !help link added for commands page

# basicBot v2 (source)

[![Gitter](https://badges.gitter.im/javascripto/basicBot-v2.svg)](https://gitter.im/javascripto/basicBot-v2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Slack](https://basicbot.herokuapp.com/badge.svg)](https://basicbot.herokuapp.com/) [![facebook group](https://img.shields.io/badge/facebook-group-3b5998.svg?style=flat)](https://facebook.com/groups/basicBot) [![twitter](https://img.shields.io/twitter/follow/bscbt.svg?style=social)](https://twitter.com/bscbt)



Usage
-----
Bookmark the following code. To run the bot, run the bookmark.
`javascript:(function(){$.getScript('https://rawgit.com/javascripto/basicBot-v2/master/basicBot.js');})();`

If this does not work, go to https://rawgit.com/javascripto/basicBot-v2/master/basicBot.js and copy paste its content into your console (accessible in chrome by pressing F12) when on plug.dj in your community.


Commands
--------
These can be found in [the commands file](https://github.com/javascripto/basicBot-v2/blob/master/commands.md).


Blacklists
----------
Blacklists can be added in the settings through either links to raw json files with the same format as those in the examples provided (forking and using rawgit's development link is a great way to do this), or replacing the link with a custom function that loads your lists into the bot (this option requires extensive knowledge of javascript and a good understanding of the bot's inner workings).

To update your lists manually, you can use the details specified in chat messages after a song is blacklisted, or use either of these in the console periodically:

bot.getNewBlacklistedSongs(); //get a javascript object

bot.logNewBlacklistedSongs(); //get a list


Developers
----------
 - [Benzi](https://github.com/Benzi) __(basicBot Maintainer)__
 - [Javascript:](https://github.com/javascripto) __(basicBot-V2 Creator/Editor)__


Credits
--------

I would like to thank the following people:

- Fungus: His Tastybot has been a source of inspiration for most of the features, and his help with coding problems has been invaluable to make this bot.
- TAT, Origin and other Litebot contributors: Their Litebot has inspired features like Roulette.
- Henchman: Never knew this undertaking would give me a friend too.

|Language | Translator|
|:------:|:---------:|
|Portuguese|[Motel Bible](https://github.com/motelbible)|
|French|[NDA](https://github.com/NDAthereal)|
|Lithuanian|[DontTakeItSerious](https://github.com/DontTakeItSerious) + [Javascript:](https://github.com/javascripto)

### Copyright

Copyright &copy; 2016 basicBot v2

Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.


Disclaimer
----------

This bot is developed independently. Changes may be made without notice. There is no guarantee for the bot to be functioning perfectly.
plug.dj admins have the right to request changes.
By using this chatbot you agree to not use it for violating plug.dj's Terms of Service.
You also agree not to alter the bot's code, unless in the cases explicitly stated above, for personal use, or for the sole purpose of submitting a pull request with a bug fix or a feature update, at which point it will be looked at and decided by the authors of the project.
Please refer to the original author/repository at all times, even on personal forks that are not private.
Any requests for changes can be requested via email, through github or via plug.dj.
