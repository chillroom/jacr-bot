module.exports = function(bot) {
    var memes = [
        "http://38.media.tumblr.com/c36b7285b0c15b17c93eba873448cdb6/tumblr_inline_nw32a96HUC1t8es98_500.gif"
    ];
    var post = memes[Math.floor(Math.random() * memes.length)];
    bot.sendChat(post);
};