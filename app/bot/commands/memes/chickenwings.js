module.exports = function(bot) {
    var memes = [
        "https://api.plugable.info/image/569d7131d593cd62e99b3417.jpg",
        "https://api.plugable.info/image/569d7181d593cd62e99b3418.jpg",
        "https://api.plugable.info/image/569d71b3d593cd62e99b3419.jpg",
        "https://api.plugable.info/image/569d7221d593cd62e99b341b.jpg"
    ];
    var post = memes[Math.floor(Math.random() * memes.length)];
    bot.sendChat(post);
};