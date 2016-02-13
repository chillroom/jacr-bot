module.exports.raffle = null;
module.exports.raffleStarted = false;
module.exports.lockedNumberOne = false;
module.exports.usersThatPropped = [];
module.exports.usersThatHearted = [];
module.exports.usersInRaffle = [];
var vm = this;

module.exports.startRaffle = function startRaffle(bot) {
    if (vm.raffle) {
        clearTimeout(vm.raffle); //don't have multiple raffle timeouts running at once
    }
    //start another raffle in 45 min - 1 hour
    setTimeout(function() {
        vm.startRaffle(bot);
    }, (Math.floor(Math.random() * (1000*60*60)) + (1000*60*45)));
    if (bot.getQueue().length <= 4 || vm.raffleStarted === true) {
        return;
    }
    vm.raffleStarted = true;
    bot.sendChat(bot.identifier + "@djs Starting raffle! To be in with a chance of winning the raffle and move to spot 2, please type: \"!join\" within the next 2 minutes. Good Luck!");
    vm.raffle = setTimeout(function() {
        var numberEntered = vm.usersInRaffle.length + (vm.lockedNumberOne ? 1 : 0);
        bot.sendChat(bot.identifier + "The raffle expires in 20 seconds, " + numberEntered + " user" + (numberEntered == 1 ? " is" : "s are") + " participating! Hurry @djs and \"!join\"");
        setTimeout(function() {
            var min = 0;
            var numberEntered = vm.usersInRaffle.length + (vm.lockedNumberOne ? 1 : 0); //add the person that locked number one
            if (numberEntered == 0) {
                bot.sendChat(bot.identifier + "No one entered the raffle! Be sure to pay attention for the next one!");
                vm.usersInRaffle = [];
                vm.raffleStarted = false;
                vm.lockedNumberOne = false;
                return;
            }
            else if (numberEntered == 1 && vm.lockedNumberOne) {
                bot.sendChat(bot.identifier + "The raffle ended and only the next DJ, @" + vm.lockedNumberOne + ", participated; therefore, the queue stays the same!");
                vm.usersInRaffle = [];
                vm.raffleStarted = false;
                vm.lockedNumberOne = false;
                return;
            }
            var randomWinner = vm.usersInRaffle[Math.floor(Math.random() * (vm.usersInRaffle.length - min)) + min];
            if (bot.getQueuePosition(randomWinner.id) > 0) {
                bot.moderateMoveDJ(randomWinner.id, !vm.lockedNumberOne ? 0 : 1);
            }
            if (numberEntered == 1) {
                bot.sendChat(bot.identifier + "The raffle has ended! 1 user participated and our lucky winner is: @" + randomWinner.username + "!");
            }
            else {
                bot.sendChat(bot.identifier + "The raffle has ended! " + numberEntered + " users participated and our lucky winner is: @" + randomWinner.username + "!");
            }
            vm.usersInRaffle = [];
            vm.raffleStarted = false;
            vm.lockedNumberOne = false;
        }, 20000);
    }, 100000);
};
