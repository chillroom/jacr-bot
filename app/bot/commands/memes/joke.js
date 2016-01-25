module.exports = function(bot) {
    var jokes = [
        "Why was Pavlov's hair so soft? Classical conditioning!",
        "Did you hear about the two lawyers who set up shop under the old oak tree? I heard it was a pretty shady business.",
        "How many tickles does it take to make an octopus giggle? Ten tickles!",
        "http://i.imgur.com/eesajrE.jpg", "http://i.imgur.com/G8kf7HS.jpg"
    ];
    var joke = jokes[Math.floor(Math.random() * jokes.length)];
    bot.sendChat(joke);
};