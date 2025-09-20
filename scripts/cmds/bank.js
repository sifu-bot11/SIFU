const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "bank",
		aliases: ["b"],
		version: "1.0",
		author: "GoatBot",
		countDown: 5,
		role: 0,
		description: {
			vi: "Quản lý tài khoản ngân hàng - gửi tiền, rút tiền, chuyển khoản",
			en: "Manage bank account - deposit, withdraw, transfer money"
		},
		category: "economy",
		guide: {
			vi: "   {pn} deposit <số tiền>: Gửi tiền vào ngân hàng"
				+ "\n   {pn} withdraw <số tiền>: Rút tiền từ ngân hàng"
				+ "\n   {pn} balance: Xem số dư ngân hàng"
				+ "\n   {pn} transfer <@tag> <số tiền>: Chuyển tiền cho người khác"
				+ "\n   {pn} history: Xem lịch sử giao dịch",
			en: "   {pn} deposit <amount>: Deposit money to bank"
				+ "\n   {pn} withdraw <amount>: Withdraw money from bank"
				+ "\n   {pn} balance: View bank balance"
				+ "\n   {pn} transfer <@tag> <amount>: Transfer money to someone"
				+ "\n   {pn} history: View transaction history"
		}
	},

	langs: {
		vi: {
			depositSuccess: "✅ Đã gửi %1$ vào ngân hàng thành công!",
			withdrawSuccess: "✅ Đã rút %1$ từ ngân hàng thành công!",
			transferSuccess: "✅ Đã chuyển %1$ cho %2 thành công!",
			transferReceived: "💰 Bạn đã nhận được %1$ từ %2!",
			insufficientFunds: "❌ Không đủ tiền! Bạn chỉ có %1$",
			insufficientBankFunds: "❌ Không đủ tiền trong ngân hàng! Bạn chỉ có %1$ trong ngân hàng",
			invalidAmount: "❌ Số tiền không hợp lệ!",
			bankBalance: "🏦 Số dư ngân hàng: %1$",
			walletBalance: "💳 Số dư ví: %1$",
			noTransactions: "📋 Chưa có giao dịch nào",
			transactionHistory: "📋 Lịch sử giao dịch gần đây:",
			transactionItem: "• %1 - %2$ (%3)",
			missingAmount: "❌ Vui lòng nhập số tiền!",
			missingTarget: "❌ Vui lòng tag người muốn chuyển tiền!",
			cannotTransferSelf: "❌ Không thể chuyển tiền cho chính mình!",
			userNotFound: "❌ Không tìm thấy người dùng!",
			bankInterest: "💰 Lãi suất ngân hàng: %1$ (hàng ngày lúc 00:00)",
			bankLevel: "🏦 Cấp độ ngân hàng: %1",
			nextLevel: "📈 Cấp tiếp theo: %1$ cần thiết"
		},
		en: {
			depositSuccess: "✅ Successfully deposited %1$ to bank!",
			withdrawSuccess: "✅ Successfully withdrew %1$ from bank!",
			transferSuccess: "✅ Successfully transferred %1$ to %2!",
			transferReceived: "💰 You received %1$ from %2!",
			insufficientFunds: "❌ Insufficient funds! You only have %1$",
			insufficientBankFunds: "❌ Insufficient bank funds! You only have %1$ in bank",
			invalidAmount: "❌ Invalid amount!",
			bankBalance: "🏦 Bank Balance: %1$",
			walletBalance: "💳 Wallet Balance: %1$",
			noTransactions: "📋 No transactions yet",
			transactionHistory: "📋 Recent transaction history:",
			transactionItem: "• %1 - %2$ (%3)",
			missingAmount: "❌ Please enter amount!",
			missingTarget: "❌ Please tag the person to transfer money to!",
			cannotTransferSelf: "❌ Cannot transfer money to yourself!",
			userNotFound: "❌ User not found!",
			bankInterest: "💰 Bank interest: %1$ (daily at 00:00)",
			bankLevel: "🏦 Bank Level: %1",
			nextLevel: "📈 Next level: %1$ required"
		}
	},

	onStart: async function ({ message, args, event, usersData, getLang, api }) {
		const { senderID } = event;
		const action = args[0]?.toLowerCase();

		// Get or create economy data
		let economyData = await usersData.get(senderID, "economy");
		if (!economyData) {
			economyData = {
				bankBalance: 0,
				investments: {},
				transactions: [],
				lastDailyReward: "",
				bankLevel: 1,
				investmentLevel: 1
			};
			await usersData.set(senderID, { economy: economyData });
		}

		const userMoney = await usersData.get(senderID, "money");

		switch (action) {
			case "deposit":
			case "d": {
				const amount = parseInt(args[1]);
				if (!amount || amount <= 0) {
					return message.reply(getLang("invalidAmount"));
				}
				if (amount > userMoney) {
					return message.reply(getLang("insufficientFunds", userMoney));
				}

				// Update balances
				await usersData.set(senderID, {
					money: userMoney - amount,
					"economy.bankBalance": economyData.bankBalance + amount
				});

				// Add transaction
				const depositTransaction = {
					type: "deposit",
					amount: amount,
					description: "Bank Deposit",
					date: moment().format("DD/MM/YYYY HH:mm:ss"),
					relatedUser: null
				};
				economyData.transactions.unshift(depositTransaction);
				if (economyData.transactions.length > 20) economyData.transactions.pop();
				await usersData.set(senderID, { "economy.transactions": economyData.transactions });

				message.reply(getLang("depositSuccess", amount));
				break;
			}

			case "withdraw":
			case "w": {
				const amount = parseInt(args[1]);
				if (!amount || amount <= 0) {
					return message.reply(getLang("invalidAmount"));
				}
				if (amount > economyData.bankBalance) {
					return message.reply(getLang("insufficientBankFunds", economyData.bankBalance));
				}

				// Update balances
				await usersData.set(senderID, {
					money: userMoney + amount,
					"economy.bankBalance": economyData.bankBalance - amount
				});

				// Add transaction
				const withdrawTransaction = {
					type: "withdraw",
					amount: amount,
					description: "Bank Withdrawal",
					date: moment().format("DD/MM/YYYY HH:mm:ss"),
					relatedUser: null
				};
				economyData.transactions.unshift(withdrawTransaction);
				if (economyData.transactions.length > 20) economyData.transactions.pop();
				await usersData.set(senderID, { "economy.transactions": economyData.transactions });

				message.reply(getLang("withdrawSuccess", amount));
				break;
			}

			case "balance":
			case "b": {
				const bankBalance = economyData.bankBalance;
				const walletBalance = userMoney;
				const bankLevel = economyData.bankLevel;
				const nextLevelAmount = bankLevel * 10000;

				let msg = getLang("bankBalance", bankBalance) + "\n";
				msg += getLang("walletBalance", walletBalance) + "\n";
				msg += getLang("bankLevel", bankLevel) + "\n";
				msg += getLang("nextLevel", nextLevelAmount);

				// Calculate daily interest
				const dailyInterest = Math.floor(bankBalance * 0.01); // 1% daily interest
				if (dailyInterest > 0) {
					msg += "\n" + getLang("bankInterest", dailyInterest);
				}

				message.reply(msg);
				break;
			}

			case "transfer":
			case "t": {
				if (!args[1] || !args[2]) {
					return message.reply(getLang("missingTarget"));
				}

				const amount = parseInt(args[2]);
				if (!amount || amount <= 0) {
					return message.reply(getLang("invalidAmount"));
				}

				if (amount > userMoney) {
					return message.reply(getLang("insufficientFunds", userMoney));
				}

				// Get target user
				const targetID = Object.keys(event.mentions)[0];
				if (!targetID) {
					return message.reply(getLang("userNotFound"));
				}

				if (targetID === senderID) {
					return message.reply(getLang("cannotTransferSelf"));
				}

				// Get target user data
				const targetUserData = await usersData.get(targetID);
				if (!targetUserData) {
					return message.reply(getLang("userNotFound"));
				}

				// Update sender balance
				await usersData.set(senderID, {
					money: userMoney - amount
				});

				// Update receiver balance
				await usersData.set(targetID, {
					money: targetUserData.money + amount
				});

				// Add transactions for both users
				const transferTransaction = {
					type: "transfer_sent",
					amount: amount,
					description: `Transfer to ${event.mentions[targetID]}`,
					date: moment().format("DD/MM/YYYY HH:mm:ss"),
					relatedUser: targetID
				};

				const receiveTransaction = {
					type: "transfer_received",
					amount: amount,
					description: `Received from ${event.senderName}`,
					date: moment().format("DD/MM/YYYY HH:mm:ss"),
					relatedUser: senderID
				};

				// Update sender transactions
				economyData.transactions.unshift(transferTransaction);
				if (economyData.transactions.length > 20) economyData.transactions.pop();
				await usersData.set(senderID, { "economy.transactions": economyData.transactions });

				// Update receiver transactions
				let targetEconomyData = await usersData.get(targetID, "economy");
				if (!targetEconomyData) {
					targetEconomyData = {
						bankBalance: 0,
						investments: {},
						transactions: [],
						lastDailyReward: "",
						bankLevel: 1,
						investmentLevel: 1
					};
				}
				targetEconomyData.transactions.unshift(receiveTransaction);
				if (targetEconomyData.transactions.length > 20) targetEconomyData.transactions.pop();
				await usersData.set(targetID, { "economy.transactions": targetEconomyData.transactions });

				message.reply(getLang("transferSuccess", amount, event.mentions[targetID]));
				break;
			}

			case "history":
			case "h": {
				if (!economyData.transactions || economyData.transactions.length === 0) {
					return message.reply(getLang("noTransactions"));
				}

				let msg = getLang("transactionHistory") + "\n\n";
				const recentTransactions = economyData.transactions.slice(0, 10);
				
				for (const transaction of recentTransactions) {
					const typeText = {
						deposit: "Deposit",
						withdraw: "Withdraw",
						transfer_sent: "Transfer Sent",
						transfer_received: "Transfer Received",
						investment: "Investment",
						dividend: "Dividend",
						daily_reward: "Daily Reward",
						bank_interest: "Bank Interest"
					}[transaction.type] || transaction.type;

					msg += getLang("transactionItem", 
						transaction.date, 
						transaction.amount, 
						typeText
					) + "\n";
				}

				message.reply(msg);
				break;
			}

			default: {
				const bankBalance = economyData.bankBalance;
				const walletBalance = userMoney;
				const bankLevel = economyData.bankLevel;

				let msg = "🏦 **BANK SYSTEM** 🏦\n\n";
				msg += getLang("bankBalance", bankBalance) + "\n";
				msg += getLang("walletBalance", walletBalance) + "\n";
				msg += getLang("bankLevel", bankLevel) + "\n\n";
				msg += "📋 **Available Commands:**\n";
				msg += "• `bank deposit <amount>` - Deposit money\n";
				msg += "• `bank withdraw <amount>` - Withdraw money\n";
				msg += "• `bank transfer <@tag> <amount>` - Transfer money\n";
				msg += "• `bank history` - View transactions\n";
				msg += "• `bank balance` - View balances";

				message.reply(msg);
				break;
			}
		}
	}
};
