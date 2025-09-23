module.exports = {
	config: {
		name: "banktop",
		aliases: ["topbank", "banklb", "topb"],
		version: "1.0.0",
		author: "GoatBot",
		countDown: 5,
		role: 0,
		category: "economy",
		description: {
			vi: "Xem bảng xếp hạng số dư ngân hàng",
			en: "Show leaderboard of bank balances"
		},
		guide: {
			vi: "{pn} [số lượng]",
			en: "{pn} [limit]"
		}
	},

	langs: {
		vi: {
			title: "🏦 TOP NGÂN HÀNG",
			none: "Chưa có ai gửi tiền vào ngân hàng",
			line: "%1. %2: %3$",
			total: "Tổng người có tiền ngân hàng: %1"
		},
		en: {
			title: "🏦 BANK LEADERBOARD",
			none: "No one has money in bank yet",
			line: "%1. %2: %3$",
			total: "Total users with bank money: %1"
		}
	},

	onStart: async function ({ message, args, usersData, getLang }) {
		const limitArg = parseInt(args[0]);
		const limit = Number.isInteger(limitArg) && limitArg > 0 ? Math.min(limitArg, 50) : 10;

		const allUsers = await usersData.getAll();
		const ranked = allUsers
			.map(u => ({
				userID: u.userID,
				name: u.name || u.userID,
				amount: (u.data && u.data.economy && typeof u.data.economy.bankBalance === "number") ? u.data.economy.bankBalance : 0
			}))
			.filter(u => u.amount > 0)
			.sort((a, b) => b.amount - a.amount);

		if (ranked.length === 0)
			return message.reply(getLang("none"));

		const lines = ranked.slice(0, limit).map((u, i) => getLang("line", i + 1, u.name, u.amount.toLocaleString("en-US")));
		const msg = [
			getLang("title"),
			"",
			...lines,
			"",
			getLang("total", ranked.length)
		].join("\n");

		message.reply(msg);
	}
};



