const cookies = [
	"a chocolate chip cookie!",
	"a soft homemade oatmeal cookie!",
	"a plain, dry, old cookie. It was the last one in the bag. Gross.",
	"a sugar cookie. What, no frosting and sprinkles? 0/10 would not touch.",
	"a chocolate chip cookie. Oh wait, those are raisins. Bleck!",
	"an enormous cookie. Poking it gives you more cookies. Weird.",
	"a fortune cookie. It reads \"Why aren't you working on any projects?\"",
	"a fortune cookie. It reads \"Give that special someone a compliment\"",
	"a fortune cookie. It reads \"Take a risk!\"",
	"a fortune cookie. It reads \"Go outside.\"",
	"a fortune cookie. It reads \"Don't forget to eat your veggies!\"",
	"a fortune cookie. It reads \"Do you even lift?\"",
	"a fortune cookie. It reads \"m808 pls\"",
	"a fortune cookie. It reads \"If you move your hips, you'll get all the ladies.\"",
	"a fortune cookie. It reads \"I love you.\"",
	"a Golden Cookie. You can't eat it because it is made of gold. Dammit.",
	"an Oreo cookie with a glass of milk!",
	"a rainbow cookie made with love :heart:",
	"an old cookie that was left out in the rain, it's moldy.",
	"freshly baked cookies, they smell amazing.",
];

module.exports = (bot, data) => {
	if (data.params[0] == null) {
		bot.sendChat("Usage: !cookie @user");
		return;
	}

	const cookie = cookies[Math.floor(Math.random() * cookies.length)];
	bot.sendChat(`@${data.user.username} just sent ${data.params[0]} ${cookie}`);
};
