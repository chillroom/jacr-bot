module.exports = function(bot) {
    var animals = [
        "http://www.welikeviral.com/files/2014/12/Funniest-Animals-1.gif",
        "http://www.drodd.com/images10/funny-animal-gifs6.gif",
        "https://s-media-cache-ak0.pinimg.com/originals/bf/75/0b/bf750b997fdc50479b3e2bc22703a3fd.gif",
        "http://media.galaxant.com/000/112/302/funny-animal-003.gif",
        "https://terri0729.files.wordpress.com/2012/04/funny-animal-gifs-animal-gifs-retro-nuts.gif",
        "http://31.media.tumblr.com/tumblr_m953yqX9fp1rvp30m.gif",
        "http://data.whicdn.com/images/24421589/large.gif",
        "http://38.media.tumblr.com/1f98a3a7f611e901d1e6d6565c357484/tumblr_n1ypzdtyxy1sodo64o1_250.gif",
        "https://assets-animated.rbl.ms/454314/980x.gif",
        "http://s3.amazonaws.com/barkpost-assets/50+GIFs/15.gif",
        "http://mac.h-cdn.co/assets/cm/14/49/5482da9ba1cf4_-_mcx-13-animal-gifs-96121069.gif",
        "http://25.media.tumblr.com/f40b050fb4d6ab87a2d94dc7f27a72ef/tumblr_mwpjq4Tq2U1slwrsuo1_400.gif",
        "http://4.bp.blogspot.com/-Pp1tRFgB75U/VRFgn8Ir5GI/AAAAAAAAI2Q/BhjIByViBWM/s1600/dog.gif",
        "https://heavyeditorial.files.wordpress.com/2014/03/animals-staring-funny-gifs-41.gif",
        "https://s-media-cache-ak0.pinimg.com/originals/2b/b2/01/2bb20129e3eab0229a07fe5fd74ddb22.gif",
        "http://www.thinknice.com/wp-content/uploads/2013/08/Real-Angry-Bird-Animated-GIF.gif",
        "http://acidcow.com/pics/20130724/animal_gifs_01.gif",
        "http://38.media.tumblr.com/f786234818fb4224dabd4a46ee2495e0/tumblr_mun3l5afcf1shdotdo1_400.gif",
        "http://img.photobucket.com/albums/v296/eledhwenlin/cute/funny-animal-gifs-animal-gifs-let-s.gif",
        "http://data.whicdn.com/images/135594271/original.gif"
    ];
    var animal = animals[Math.floor(Math.random() * animals.length)];
    bot.sendChat(bot.identifier + "Your spirit animal is a " + animal);
};