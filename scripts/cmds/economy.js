const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "economy",
		aliases: ["eco", "money"],
		version: "1.0",
		author: "GoatBot",
		countDown: 5,
		role: 0,
		description: {
			vi: "Tổng quan hệ thống kinh tế - xem tất cả thông tin tài chính",
			en: "Economy overview - view all financial information"
		},
		category: "economy",
		guide: {
			vi: "   {pn}: Xem tổng quan kinh tế\n   {pn} leaderboard: Xem bảng xếp hạng giàu nhất",
			en: "   {pn}: View economy overview\n   {pn} leaderboard: View richest leaderboard"
		}
	},

	langs: {
		vi: {
			overviewTitle: "💰 **TỔNG QUAN KINH TẾ** 💰",
			walletBalance: "💳 Ví: %1$",
			bankBalance: "🏦 Ngân hàng: %2$",
			totalWealth: "💎 Tổng tài sản: %3$",
			workLevel: "💼 Cấp độ làm việc: %4",
			bankLevel: "🏦 Cấp độ ngân hàng: %5",
			investmentLevel: "📈 Cấp độ đầu tư: %6",
			investments: "📊 Đầu tư: %7$",
			workCount: "🔨 Số lần làm việc: %8",
			lastWork: "⏰ Lần làm việc cuối: %9",
			leaderboardTitle: "🏆 **BẢNG XẾP HẠNG GIÀU NHẤT** 🏆",
			leaderboardItem: "%1. %2 - %3$",
			noData: "❌ Không có dữ liệu!",
			loading: "⏳ Đang tải dữ liệu...",
			never: "Chưa bao giờ",
			minutesAgo: "%1 phút trước",
			hoursAgo: "%1 giờ trước",
			daysAgo: "%1 ngày trước"
		},
		en: {
			overviewTitle: "💰 **ECONOMY OVERVIEW** 💰",
			walletBalance: "💳 Wallet: %1$",
			bankBalance: "🏦 Bank: %2$",
			totalWealth: "💎 Total Wealth: %3$",
			workLevel: "💼 Work Level: %4",
			bankLevel: "🏦 Bank Level: %5",
			investmentLevel: "📈 Investment Level: %6",
			investments: "📊 Investments: %7$",
			workCount: "🔨 Work Count: %8",
			lastWork: "⏰ Last Work: %9",
			leaderboardTitle: "🏆 **RICHEST LEADERBOARD** 🏆",
			leaderboardItem: "%1. %2 - %3$",
			noData: "❌ No data available!",
			loading: "⏳ Loading data...",
			never: "Never",
			minutesAgo: "%1 minutes ago",
			hoursAgo: "%1 hours ago",
			daysAgo: "%1 days ago"
		}
	},

	onStart: async function ({ message, args, event, usersData, getLang, api }) {
		const { senderID } = event;
		const action = args[0]?.toLowerCase();

		// Get user economy data
		let economyData = await usersData.get(senderID, "economy");
		if (!economyData) {
			economyData = {
				bankBalance: 0,
				investments: {},
				transactions: [],
				lastDailyReward: "",
				bankLevel: 1,
				investmentLevel: 1,
				workLevel: 1,
				workCount: 0,
				lastWorkTime: 0
			};
			await usersData.set(senderID, { economy: economyData });
		}

		const userMoney = await usersData.get(senderID, "money");
		const bankBalance = economyData.bankBalance || 0;
		const totalWealth = userMoney + bankBalance;

		// Calculate investment value
		let investmentValue = 0;
		if (economyData.investments) {
			// This is a simplified calculation - in a real system you'd get current market prices
			for (const [key, investment] of Object.entries(economyData.investments)) {
				investmentValue += investment.amount * investment.price;
			}
		}

		const workLevel = economyData.workLevel || 1;
		const bankLevel = economyData.bankLevel || 1;
		const investmentLevel = economyData.investmentLevel || 1;
		const workCount = economyData.workCount || 0;

		// Format last work time
		let lastWorkText = getLang("never");
		if (economyData.lastWorkTime && economyData.lastWorkTime > 0) {
			const timeDiff = Date.now() - economyData.lastWorkTime;
			const minutes = Math.floor(timeDiff / (1000 * 60));
			const hours = Math.floor(minutes / 60);
			const days = Math.floor(hours / 24);

			if (days > 0) {
				lastWorkText = getLang("daysAgo", days);
			} else if (hours > 0) {
				lastWorkText = getLang("hoursAgo", hours);
			} else if (minutes > 0) {
				lastWorkText = getLang("minutesAgo", minutes);
			}
		}

		switch (action) {
			case "leaderboard":
			case "lb":
			case "top": {
				message.reply(getLang("loading"));

				try {
					// Get all users and sort by total wealth
					const allUsers = await usersData.getAll();
					const userWealths = [];

					for (const user of allUsers) {
						const walletMoney = user.money || 0;
						const bankMoney = user.economy?.bankBalance || 0;
						const total = walletMoney + bankMoney;

						if (total > 0) {
							userWealths.push({
								name: user.name || "Unknown",
								wealth: total
							});
						}
					}

					// Sort by wealth (descending)
					userWealths.sort((a, b) => b.wealth - a.wealth);

					let msg = getLang("leaderboardTitle") + "\n\n";
					
					if (userWealths.length === 0) {
						msg += getLang("noData");
					} else {
						const topUsers = userWealths.slice(0, 10);
						for (let i = 0; i < topUsers.length; i++) {
							msg += getLang("leaderboardItem", 
								i + 1, 
								topUsers[i].name, 
								topUsers[i].wealth
							) + "\n";
						}
					}

					message.reply(msg);
				} catch (error) {
					message.reply("❌ Error loading leaderboard data!");
				}
				break;
			}

			default: {
				let msg = getLang("overviewTitle") + "\n\n";
				msg += getLang("walletBalance", userMoney) + "\n";
				msg += getLang("bankBalance", bankBalance) + "\n";
				msg += getLang("totalWealth", totalWealth) + "\n\n";
				
				msg += "📊 **STATS:**\n";
				msg += getLang("workLevel", workLevel) + "\n";
				msg += getLang("bankLevel", bankLevel) + "\n";
				msg += getLang("investmentLevel", investmentLevel) + "\n";
				msg += getLang("investments", investmentValue.toFixed(2)) + "\n";
				msg += getLang("workCount", workCount) + "\n";
				msg += getLang("lastWork", lastWorkText) + "\n\n";

				msg += "💡 **QUICK COMMANDS:**\n";
				msg += "• `bank` - Manage bank account\n";
				msg += "• `invest` - Investment system\n";
				msg += "• `work` - Work to earn money\n";
				msg += "• `casino` - Play casino games\n";
				msg += "• `daily` - Daily rewards\n";
				msg += "• `economy leaderboard` - View top players";

				message.reply(msg);
				break;
			}
		}
	}
};
