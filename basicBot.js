/**
 *Copyright 2014 Yemasthui
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 */


(function(){

    var msg = "basicBot is currently under maintenance to work under plug's new update, please try again later.";

    if(typeof API !== "undefined" && typeof API.chatLog === "function"){
        API.chatLog(msg);
    }
    console.warn(msg);

}).call(this);