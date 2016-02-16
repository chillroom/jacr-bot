module.exports = (bot) => {
    bot.raffle = () => {
        bot.db.models.settings.findOne({
            id: "s3tt1ng5"
        }, (err, doc) => {
            if (err) {
                bot.log("error", "MONGO", err);
            } else {
                if (doc.raffle.enabled && doc.songCount % doc.raffle.interval === 0 && !bot.getQueue().length <= 4) {
                    doc.raffle.started = true;
                    doc.save((err) => {
                        if (err) {
                            bot.log("error", "MONGO", err);
                        } else {
                            bot.sendChat(bot.identifier + "@djs Starting raffle! To be in with a chance of winning the raffle and move to spot 2, please type: \"!join\" within the next 2 minutes. Good Luck!");
                            setTimeout(() => {
                                bot.db.models.settings.findOne({
                                    id: "s3tt1ng5"
                                }, (err, doc) => {
                                    if (err) {
                                        bot.log("error", "MONGO", err);
                                    } else {
                                        var numberEntered = doc.raffle.users.length + (doc.raffle.lockedNumberOne ? 1 : 0);
                                        bot.sendChat(bot.identifier + "The raffle expires in 20 seconds, " + numberEntered + " user" + (numberEntered == 1 ? " is" : "s are") + " participating! Hurry @djs and \"!join\"");
                                        setTimeout(() => {
                                            var min = 0;
                                            var numberEntered = doc.raffle.users.length + (doc.raffle.lockedNumberOne ? 1 : 0); //add the person that locked number one
                                            if (numberEntered == 0) {
                                                bot.sendChat(bot.identifier + "No one entered the raffle! Be sure to pay attention for the next one!");
                                                doc.raffle.users = [];
                                                doc.raffle.started = false;
                                                doc.raffle.lockedNumberOne = "";
                                                doc.save((err) => {
                                                    if (err) {
                                                        bot.log("error", "MONGO", err);
                                                    }
                                                });
                                                return;
                                            }
                                            else if (numberEntered == 1 && doc.raffle.lockedNumberOne) {
                                                bot.sendChat(bot.identifier + "The raffle ended and only the next DJ, @" + doc.lockedNumberOne + ", participated; therefore, the queue stays the same!");
                                                doc.raffle.users = [];
                                                doc.raffle.started = false;
                                                doc.raffle.lockedNumberOne = "";
                                                doc.save((err) => {
                                                    if (err) {
                                                        bot.log("error", "MONGO", err);
                                                    }
                                                });
                                                return;
                                            }
                                            var randomWinner = doc.raffle.users[Math.floor(Math.random() * (doc.raffle.users.length - min)) + min];
                                            if (bot.getQueuePosition(randomWinner.id) > 0) {
                                                bot.moderateMoveDJ(randomWinner.id, !doc.raffle.lockedNumberOne ? 0 : 1);
                                            }
                                            if (numberEntered == 1) {
                                                bot.sendChat(bot.identifier + "The raffle has ended! 1 user participated and our lucky winner is: @" + randomWinner.username + "!");
                                            }
                                            else {
                                                bot.sendChat(bot.identifier + "The raffle has ended! " + numberEntered + " users participated and our lucky winner is: @" + randomWinner.username + "!");
                                            }
                                            doc.raffle.users = [];
                                            doc.raffle.started = false;
                                            doc.raffle.lockedNumberOne = "";
                                            doc.save((err) => {
                                                if (err) {
                                                    bot.log("error", "MONGO", err);
                                                }
                                            });
                                        }, 20000);
                                    }
                                });
                            }, 100000);
                        }
                    });
                }
            }
        });
    };
};
