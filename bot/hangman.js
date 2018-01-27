let bot;
const request = require("request");
const event = require('./events/chat-message.js');
const randomWord = require('random-word');
const Hangman = {
	state: null,
};


function onGuess(_, data) {
	if (Hangman.state == null) {
		bot.sendChat("Hangman is not currently running!");
		return;
	}

	if (data.params[0] == null) {
		bot.sendChat("Usage: !guess word OR !guess letter");
		return;
	}

	let forceSuccess = false;
	if (data.params[0].length === 1) {
		const letter = data.params[0].toLowerCase();
		if (Hangman.state.letters.indexOf(letter) !== -1) {
			bot.sendChat(`${data.user.username}, nope. ${Hangman.state.tempWord}`);
			bot.moderateDeleteChat(data.id);
			return;
		}

		Hangman.state.letters.push(letter);

		const indices = [];
		const word = Hangman.state.word;
		let tempWord = Hangman.state.tempWord;

		for (let i = word.length - 1; i >= 0; i--) {
			if (word.charAt(i) === letter) indices.push(i);
		}

		for (let i = indices.length - 1; i >= 0; i--) {
			const c = indices[i] * 2;
			tempWord = tempWord.substr(0, c) + letter + tempWord.substr(c + 1);
		}

		Hangman.state.word = word;
		Hangman.state.tempWord = tempWord;

		if (Hangman.state.tempWord.indexOf("◌") !== -1) {
			bot.sendChat(`${data.user.username} asked "${letter}": ${tempWord}`);
			bot.moderateDeleteChat(data.id);
			return;
		}
		
		forceSuccess = true;
	}
	
	if (!forceSuccess) {
		const word = data.params[0].toLowerCase();
		let valid = word.length === Hangman.state.word.length;

		if (valid) {
			for (let i = word.length - 1; i >= 0; i--) {
				const c = word.charAt(i);
				if (c < 'a' || c > 'z') {
					valid = false;
				}
			}
		}

		if (!valid) {
			return;
		}

		const pos = bot.getQueuePosition(data.user.id);
		if (Hangman.state.word !== word) {
			const shouldPush = (pos !== -1) && !(pos > bot.getQueue().length);
			bot.sendChat(`${data.user.username} guessed "${word}" incorrectly!${shouldPush ? " You get pushed back in the queue." : ""}`);
			bot.moderateDeleteChat(data.id);

			if (shouldPush) {
				bot.moderateMoveDJ(data.user.id, pos + 1);
				return;
			}
			return;
		}
	}

	const pos = bot.getQueuePosition(data.user.id);
	const link = `https://en.wiktionary.org/wiki/${Hangman.state.word}`;
	bot.sendChat(`Congratulations ${data.user.username}, you guessed "${Hangman.state.word}" correctly! ${(pos === -1) ? "" : "You get boosted a spot! "}Definition: ${link}`);
	bot.moderateDeleteChat(data.id);

	if (pos > 0) {
		bot.moderateMoveDJ(data.user.id, pos - 1);
	}

	Hangman.state = null;
	return;
}

// TODO: Don't update the entire state or all the settings!!
function onCommand(_, data) {
	// ensure we're a mod+
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}

	if (Hangman.state == null) {
        const body = randomWord();
		Hangman.state = {
			tempWord: Array(body.length + 1).join("◌ "),
			word: body.toLowerCase(),
			letters: [],
		};

		bot.sendChat(`We're playing Hangman: ${Hangman.state.tempWord} (${Hangman.state.word.length})! Use "!guess word" or "!guess letter" to play along!`);
		return;
	}

	onGuess(_, data);
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;

	// Add the command counter
	event.AddCommand('hangman', onCommand);
	event.AddCommand('guess', onGuess);
};
