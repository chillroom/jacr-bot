// jshint esversion: 6
// jshint strict: true
// jshint node: true
// jshint asi: true
// Copyright (c) Qais Patankar 2016 - MIT License
"use strict";

var Raffle = {
    raffleStartingMessage: "@djs Type \"!join\" to join the raffle and have a chance to get moved to spot 2! Good luck.",
    
    // Timer information
    timerStarted: false,
    warningTimer: null, // The timer started after it being announced (on trigger, says "20 seconds left!")
    finalTimer: null, // The timer after final warning (on trigger, says "you won the raffle!")
}

function finalTimerCallback(bot) {
    bot.db.models.settings.findOne({id: "s3tt1ng5"}, (err, doc) => {
        if (err) { bot.log("error", "MONGO", err); return; }

        var numberEntered = doc.raffle.users.length;
        if (numberEntered === 0) {
            bot.sendChat("No one entered the raffle! Be sure to pay attention for the next one!");
            Raffle.stop(bot, doc)
            return;
        }
        
        var randomWinner = doc.raffle.users[Math.floor(Math.random() * doc.raffle.users.length)];
        if (bot.getQueuePosition(randomWinner.id) > 0) {
            bot.moderateMoveDJ(randomWinner.id, 1);
        }
        
        if (numberEntered == 1) {
            bot.sendChat("The raffle has ended! 1 user participated and our lucky winner is: @" + randomWinner.username + "!");
        } else {
            bot.sendChat("The raffle has ended! " + numberEntered + " users participated and our lucky winner is: @" + randomWinner.username + "!");
        }

        Raffle.stop(bot, doc)
        doc.save((err) => {if (err) {bot.log("error", "MONGO", err);}});
    })
}

function warningTimerCallback(bot) {
    if (Raffle.finalTimer) {
        bot.log("error", "RAFFLE", "warningTimerCallback somehow being called again...")
        return
    }

    bot.db.models.settings.findOne({id: "s3tt1ng5"}, (err, doc) => {
        if (err) { bot.log("error", "MONGO", err); return; }

        var numberEntered = doc.raffle.users.length;
        bot.sendChat("The raffle expires in 20 seconds, " + numberEntered + " user" + (numberEntered == 1 ? " is" : "s are") + " participating! Hurry @djs and \"!join\"");

        Raffle.finalTimer = setTimeout(finalTimerCallback, 20000, bot)
    })
}

function docCover(processor, onSave) {
    return function(bot, doc) {
        // Were we already given a document?
        // It is the caller's responsibility to flush docs.
        if (doc != null) {
            return onSave || null, processor.apply(this, arguments)
        }

        bot.db.models.settings.findOne({id: "s3tt1ng5"}, (err, doc) => {
            if (err) { bot.log("error", "MONGO", err); return; }

            // update "doc"
            arguments[1] = doc

            var callback = processor.apply(this, arguments)

            doc.save((err) => {
                if (err) { bot.log("error", "MONGO", err); }
                if (onSave != null) { onSave(bot) }
            })  
        })
    }
}

Raffle.start = docCover(function(bot, doc) {
    doc.raffle.started = true;
    doc.raffle.nextRaffleSong = doc.songCount + 13
}, (bot) => Raffle.updateState(bot, true))

Raffle.stop = docCover(function(bot, doc) {
    doc.raffle.users = [];
    doc.raffle.started = false;

    if (Raffle.timerStarted) {
        Raffle.timerStarted = false
        
        clearTimeout(Raffle.warningTimer)
        Raffle.warningTimer = null
        
        clearTimeout(Raffle.finalTimer)
        Raffle.finalTimer = null
    }
})

Raffle.enable = docCover(function(bot, doc) {
    doc.raffle.enabled = true
}, (bot) => Raffle.updateState(bot))

Raffle.disable = docCover(function(bot, doc) {
    Raffle.stop(bot, doc)
    doc.raffle.enabled = false
})

Raffle.status = docCover(function(bot, doc) {
    return {
        started: doc.raffle.started,
        enabled: doc.raffle.enabled,
        songsLeft: doc.raffle.nextRaffleSong - doc.songCount
    }
})

// This checks whether we need to start any raffle timers
// Call it whenever the doc.raffle.started key is updated remotely
// You can also start the raffle without the database
// knowing it has started (users will still flush)
Raffle.updateState = function(bot, forceStart) {
    // Should we start any raffle timers?
    if (Raffle.timerStarted) { return }

    var startRaffleTimer = () => {
        if (Raffle.finalTimer || Raffle.warningTimer) {
            bot.log("error", "RAFFLE", "startRaffleTimer somehow being called again...")
            return
        }
        Raffle.timerStarted = true
        setTimeout(warningTimerCallback, 100000, bot)
    }

    if (forceStart) {
        startRaffleTimer()
        return
    }

    // We should check the database and see if we should start
    bot.db.models.settings.findOne( {id: "s3tt1ng5"}, (err, doc) => {
        if (err) { bot.log("error", "MONGO", err); return; }
        
        // Not enabled?
        if (!doc.raffle.enabled) { return }


        if (doc.raffle.started && !Raffle.finalTimer && !Raffle.warningTimer) {
            // Already started database side?
            // Silently start.
            bot.log("info", "raffle", "Silently continuing timers...")
            startRaffleTimer()
            return
        }

        // We should not start if we don't meet the interval requirements
        if (doc.songCount < doc.raffle.nextRaffleSong) { return }
        var raffleCallback = Raffle.start(bot, doc)
        bot.log("info", "raffle", "Automatically starting a raffle...")
        doc.save( (err) => {
            if (err) { bot.log("error", "MONGO", err); return; }
            bot.sendChat(Raffle.raffleStartingMessage);
            if (raffleCallback != null) {
                raffleCallback(bot)
            }
        } )
    } )
}

module.exports = Raffle