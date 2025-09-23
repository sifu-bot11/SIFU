const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

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
				const dailyInterest = Math.floor(bankBalance * 0.01);

				// Create Shizuka-themed digital receipt image
				const W = 900, H = 1200;
				const canvas = createCanvas(W, H);
				const ctx = canvas.getContext("2d");

				// Background image (Shizuka themed)
				try {
					const bg = await loadImage("https://i.postimg.cc/ryHfwpLJ/ezgif-22bfaf4827830f.jpg");
					ctx.drawImage(bg, 0, 0, W, H);
				}
				catch (e) {
					// fallback to solid background if image fails
					ctx.fillStyle = "#ffd6e7";
					ctx.fillRect(0, 0, W, H);
				}
				// Soft pink overlay for theme consistency
				ctx.fillStyle = "rgba(255, 214, 231, 0.85)";
				ctx.fillRect(0, 0, W, H);
				// hearts pattern
				ctx.globalAlpha = 0.15;
				ctx.fillStyle = "#ff5ca8";
				for (let i = 0; i < 40; i++) {
					const x = Math.random() * W;
					const y = Math.random() * H;
					const r = 10 + Math.random() * 20;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.bezierCurveTo(x - r, y - r, x - 2 * r, y + r, x, y + 2 * r);
					ctx.bezierCurveTo(x + 2 * r, y + r, x + r, y - r, x, y);
					ctx.fill();
				}
				ctx.globalAlpha = 1;

				// Receipt card
				const cardX = 60, cardY = 80, cardW = W - 120, cardH = H - 160, radius = 26;
				ctx.fillStyle = "#ffffff";
				ctx.beginPath();
				ctx.moveTo(cardX + radius, cardY);
				ctx.lineTo(cardX + cardW - radius, cardY);
				ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
				ctx.lineTo(cardX + cardW, cardY + cardH - radius);
				ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
				ctx.lineTo(cardX + radius, cardY + cardH);
				ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
				ctx.lineTo(cardX, cardY + radius);
				ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
				ctx.fill();

				// Header
				ctx.fillStyle = "#ff3f93";
				ctx.font = "bold 44px Arial";
				ctx.textAlign = "center";
				ctx.fillText("Shizuka Bank", W / 2, cardY + 70);
				ctx.font = "22px Arial";
				ctx.fillStyle = "#777";
				ctx.fillText(moment().format("YYYY-MM-DD HH:mm:ss"), W / 2, cardY + 110);

				// Optional photo (use replied image if exists)
				try {
					const replyAttach = event.messageReply?.attachments?.[0];
					const url = replyAttach?.url;
					if (url) {
						const img = await loadImage(url);
						const imgSize = 260;
						ctx.save();
						ctx.beginPath();
						ctx.arc(W / 2, cardY + 260, imgSize / 2, 0, Math.PI * 2);
						ctx.closePath();
						ctx.clip();
						ctx.drawImage(img, W / 2 - imgSize / 2, cardY + 260 - imgSize / 2, imgSize, imgSize);
						ctx.restore();
					}
				}
				catch (e) { }

				// Info lines
				const startY = cardY + 360;
				const lineH = 52;
				ctx.textAlign = "left";
				ctx.fillStyle = "#111";
				ctx.font = "bold 28px Arial";
				ctx.fillText("Account Holder", cardX + 60, startY);
				ctx.fillText("Account ID", cardX + 60, startY + lineH);
				ctx.fillText("Wallet Balance", cardX + 60, startY + lineH * 2);
				ctx.fillText("Bank Balance", cardX + 60, startY + lineH * 3);
				ctx.fillText("Total Assets", cardX + 60, startY + lineH * 4);
				ctx.fillText("Bank Level", cardX + 60, startY + lineH * 5);
				ctx.fillText("Next Level Need", cardX + 60, startY + lineH * 6);
				ctx.fillText("Daily Interest", cardX + 60, startY + lineH * 7);

				ctx.textAlign = "right";
				ctx.fillStyle = "#444";
				ctx.font = "24px Arial";
				const holderName = await usersData.getName(senderID) || senderID;
				ctx.fillText(holderName, cardX + cardW - 60, startY);
				ctx.fillText(String(senderID), cardX + cardW - 60, startY + lineH);
				ctx.fillText(`${walletBalance}$`, cardX + cardW - 60, startY + lineH * 2);
				ctx.fillText(`${bankBalance}$`, cardX + cardW - 60, startY + lineH * 3);
				ctx.fillText(`${walletBalance + bankBalance}$`, cardX + cardW - 60, startY + lineH * 4);
				ctx.fillText(`#${bankLevel}`, cardX + cardW - 60, startY + lineH * 5);
				ctx.fillText(`${nextLevelAmount}$`, cardX + cardW - 60, startY + lineH * 6);
				ctx.fillText(`${dailyInterest}$`, cardX + cardW - 60, startY + lineH * 7);

				// Footer note
				ctx.textAlign = "center";
				ctx.fillStyle = "#ff3f93";
				ctx.font = "italic 22px Arial";
				ctx.fillText("Thank you for banking with Shizuka Bank", W / 2, cardY + cardH - 40);

				// Send attachment
				const outPath = path.join(__dirname, "cache", `bank_receipt_${senderID}.png`);
				await fs.ensureDir(path.dirname(outPath));
				await fs.writeFile(outPath, canvas.toBuffer("image/png"));
				await message.reply({ attachment: fs.createReadStream(outPath) });
				try { await fs.remove(outPath); } catch (e) {}

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
