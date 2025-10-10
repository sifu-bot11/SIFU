const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "1.0",
		author: "SHIFAT",
		countDown: 5,
		role: 0,
		description: {
			vi: "Nhận quà hàng ngày",
			en: "Receive daily gift"
		},
		category: "game",
		guide: {
			vi: "   {pn}: Nhận quà hàng ngày"
				+ "\n   {pn} info: Xem thông tin quà hàng ngày",
			en: "   {pn}"
				+ "\n   {pn} info: View daily gift information"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 100000, // 1 lakh coin fixed
				exp: 1000     // 1000 exp fixed
			}
		}
	},

	langs: {
		vi: {
			monday: "Thứ 2",
			tuesday: "Thứ 3",
			wednesday: "Thứ 4",
			thursday: "Thứ 5",
			friday: "Thứ 6",
			saturday: "Thứ 7",
			sunday: "Chủ nhật",
			alreadyReceived: "Bạn đã nhận quà rồi",
			received: "Bạn đã nhận được %1 coin và %2 exp"
		},
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "You have already received the gift",
			received: "You have received %1 coin and %2 exp"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;

		if (args[0] == "info") {
			let msg = "";
			const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
			for (let i = 0; i < 7; i++) {
				const dayName = getLang(days[i]);
				msg += `${dayName}: ${reward.coin} coin, ${reward.exp} exp\n`;
			}
			return message.reply(msg);
		}

		const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
		const { senderID } = event;

		const userData = await usersData.get(senderID);
		if (userData.data.lastTimeGetReward === dateTime)
			return message.reply(getLang("alreadyReceived"));

		userData.data.lastTimeGetReward = dateTime;
		await usersData.set(senderID, {
			money: userData.money + reward.coin,
			exp: userData.exp + reward.exp,
			data: userData.data
		});
		message.reply(getLang("received", reward.coin, reward.exp));
	}
};
