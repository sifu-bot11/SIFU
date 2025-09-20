const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "casino",
		aliases: ["gamble", "bet"],
		version: "1.0",
		author: "GoatBot",
		countDown: 5,
		role: 0,
		description: {
			vi: "Sòng bạc - chơi các trò chơi may rủi để kiếm tiền",
			en: "Casino - play games of chance to earn money"
		},
		category: "economy",
		guide: {
			vi: "   {pn} coin <số tiền>: Chơi tung đồng xu"
				+ "\n   {pn} dice <số tiền> <số dự đoán>: Chơi xúc xắc"
				+ "\n   {pn} slots <số tiền>: Chơi máy đánh bạc"
				+ "\n   {pn} blackjack <số tiền>: Chơi blackjack"
				+ "\n   {pn} roulette <số tiền> <màu>: Chơi roulette",
			en: "   {pn} coin <amount>: Play coin flip"
				+ "\n   {pn} dice <amount> <guess>: Play dice game"
				+ "\n   {pn} slots <amount>: Play slot machine"
				+ "\n   {pn} blackjack <amount>: Play blackjack"
				+ "\n   {pn} roulette <amount> <color>: Play roulette"
		}
	},

	langs: {
		vi: {
			coinWin: "🪙 **TUNG ĐỒNG XU** 🪙\nKết quả: %1\n🎉 Bạn thắng %2$!",
			coinLose: "🪙 **TUNG ĐỒNG XU** 🪙\nKết quả: %1\n😢 Bạn thua %2$!",
			diceWin: "🎲 **XÚC XẮC** 🎲\nKết quả: %1\n🎉 Bạn thắng %2$!",
			diceLose: "🎲 **XÚC XẮC** 🎲\nKết quả: %1\n😢 Bạn thua %2$!",
			slotsWin: "🎰 **MÁY ĐÁNH BẠC** 🎰\n%1\n🎉 Bạn thắng %2$!",
			slotsLose: "🎰 **MÁY ĐÁNH BẠC** 🎰\n%1\n😢 Bạn thua %2$!",
			blackjackWin: "🃏 **BLACKJACK** 🃏\nBạn: %1\nBot: %2\n🎉 Bạn thắng %3$!",
			blackjackLose: "🃏 **BLACKJACK** 🃏\nBạn: %1\nBot: %2\n😢 Bạn thua %3$!",
			blackjackTie: "🃏 **BLACKJACK** 🃏\nBạn: %1\nBot: %2\n🤝 Hòa! Hoàn tiền %3$!",
			rouletteWin: "🎯 **ROULETTE** 🎯\nKết quả: %1\n🎉 Bạn thắng %2$!",
			rouletteLose: "🎯 **ROULETTE** 🎯\nKết quả: %1\n😢 Bạn thua %2$!",
			insufficientFunds: "❌ Không đủ tiền! Bạn chỉ có %1$",
			invalidAmount: "❌ Số tiền không hợp lệ!",
			invalidGuess: "❌ Số dự đoán không hợp lệ! (1-6)",
			invalidColor: "❌ Màu không hợp lệ! (red/black/green)",
			missingAmount: "❌ Vui lòng nhập số tiền!",
			missingGuess: "❌ Vui lòng nhập số dự đoán!",
			missingColor: "❌ Vui lòng chọn màu!",
			tooMuch: "❌ Số tiền quá lớn! Tối đa 10000$",
			tooLittle: "❌ Số tiền quá nhỏ! Tối thiểu 10$",
			blackjackBust: "💥 BUST! Bạn thua!",
			blackjackHit: "🃏 Bạn rút thêm: %1\nTổng: %2",
			blackjackStand: "✋ Bạn dừng lại với %1",
			rouletteColors: "🔴 Red: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36\n⚫ Black: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35\n🟢 Green: 0"
		},
		en: {
			coinWin: "🪙 **COIN FLIP** 🪙\nResult: %1\n🎉 You won %2$!",
			coinLose: "🪙 **COIN FLIP** 🪙\nResult: %1\n😢 You lost %2$!",
			diceWin: "🎲 **DICE GAME** 🎲\nResult: %1\n🎉 You won %2$!",
			diceLose: "🎲 **DICE GAME** 🎲\nResult: %1\n😢 You lost %2$!",
			slotsWin: "🎰 **SLOT MACHINE** 🎰\n%1\n🎉 You won %2$!",
			slotsLose: "🎰 **SLOT MACHINE** 🎰\n%1\n😢 You lost %2$!",
			blackjackWin: "🃏 **BLACKJACK** 🃏\nYou: %1\nBot: %2\n🎉 You won %3$!",
			blackjackLose: "🃏 **BLACKJACK** 🃏\nYou: %1\nBot: %2\n😢 You lost %3$!",
			blackjackTie: "🃏 **BLACKJACK** 🃏\nYou: %1\nBot: %2\n🤝 Tie! Refund %3$!",
			rouletteWin: "🎯 **ROULETTE** 🎯\nResult: %1\n🎉 You won %2$!",
			rouletteLose: "🎯 **ROULETTE** 🎯\nResult: %1\n😢 You lost %2$!",
			insufficientFunds: "❌ Insufficient funds! You only have %1$",
			invalidAmount: "❌ Invalid amount!",
			invalidGuess: "❌ Invalid guess! (1-6)",
			invalidColor: "❌ Invalid color! (red/black/green)",
			missingAmount: "❌ Please enter amount!",
			missingGuess: "❌ Please enter guess!",
			missingColor: "❌ Please choose color!",
			tooMuch: "❌ Amount too high! Maximum 10000$",
			tooLittle: "❌ Amount too low! Minimum 10$",
			blackjackBust: "💥 BUST! You lose!",
			blackjackHit: "🃏 You drew: %1\nTotal: %2",
			blackjackStand: "✋ You stand with %1",
			rouletteColors: "🔴 Red: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36\n⚫ Black: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35\n🟢 Green: 0"
		}
	},

	onStart: async function ({ message, args, event, usersData, getLang }) {
		const { senderID } = event;
		const action = args[0]?.toLowerCase();

		const userMoney = await usersData.get(senderID, "money");

		// Validate amount
		const validateAmount = (amount) => {
			if (!amount || amount < 10) return getLang("tooLittle");
			if (amount > 10000) return getLang("tooMuch");
			if (amount > userMoney) return getLang("insufficientFunds", userMoney);
			return null;
		};

		switch (action) {
			case "coin":
			case "c": {
				const amount = parseInt(args[1]);
				const error = validateAmount(amount);
				if (error) return message.reply(error);

				const result = Math.random() < 0.5 ? "Heads" : "Tails";
				const win = Math.random() < 0.5;
				const winnings = win ? amount * 1.8 : 0;

				await usersData.set(senderID, {
					money: userMoney + (winnings - amount)
				});

				if (win) {
					message.reply(getLang("coinWin", result, winnings));
				} else {
					message.reply(getLang("coinLose", result, amount));
				}
				break;
			}

			case "dice":
			case "d": {
				const amount = parseInt(args[1]);
				const guess = parseInt(args[2]);

				const error = validateAmount(amount);
				if (error) return message.reply(error);

				if (!guess || guess < 1 || guess > 6) {
					return message.reply(getLang("invalidGuess"));
				}

				const result = Math.floor(Math.random() * 6) + 1;
				const win = result === guess;
				const winnings = win ? amount * 5 : 0;

				await usersData.set(senderID, {
					money: userMoney + (winnings - amount)
				});

				if (win) {
					message.reply(getLang("diceWin", result, winnings));
				} else {
					message.reply(getLang("diceLose", result, amount));
				}
				break;
			}

			case "slots":
			case "s": {
				const amount = parseInt(args[1]);
				const error = validateAmount(amount);
				if (error) return message.reply(error);

				const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎", "7️⃣"];
				const reels = [
					symbols[Math.floor(Math.random() * symbols.length)],
					symbols[Math.floor(Math.random() * symbols.length)],
					symbols[Math.floor(Math.random() * symbols.length)]
				];

				const display = `[ ${reels.join(" | ")} ]`;
				
				let winnings = 0;
				if (reels[0] === reels[1] && reels[1] === reels[2]) {
					// Three of a kind
					winnings = amount * 10;
				} else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
					// Two of a kind
					winnings = amount * 2;
				}

				await usersData.set(senderID, {
					money: userMoney + (winnings - amount)
				});

				if (winnings > 0) {
					message.reply(getLang("slotsWin", display, winnings));
				} else {
					message.reply(getLang("slotsLose", display, amount));
				}
				break;
			}

			case "blackjack":
			case "bj": {
				const amount = parseInt(args[1]);
				const error = validateAmount(amount);
				if (error) return message.reply(error);

				// Simple blackjack implementation
				const getCard = () => {
					const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
					return cards[Math.floor(Math.random() * cards.length)];
				};

				const getValue = (card) => {
					if (card === "A") return 11;
					if (["J", "Q", "K"].includes(card)) return 10;
					return parseInt(card);
				};

				const playerCards = [getCard(), getCard()];
				const dealerCards = [getCard(), getCard()];

				const playerTotal = playerCards.reduce((sum, card) => sum + getValue(card), 0);
				const dealerTotal = dealerCards.reduce((sum, card) => sum + getValue(card), 0);

				let result = "";
				let winnings = 0;

				if (playerTotal === 21 && dealerTotal !== 21) {
					// Blackjack
					winnings = amount * 2.5;
					result = "Blackjack!";
				} else if (playerTotal > 21) {
					// Bust
					result = "Bust!";
				} else if (dealerTotal > 21) {
					// Dealer bust
					winnings = amount * 2;
					result = "Dealer bust!";
				} else if (playerTotal > dealerTotal) {
					// Player wins
					winnings = amount * 2;
					result = "You win!";
				} else if (playerTotal < dealerTotal) {
					// Dealer wins
					result = "Dealer wins!";
				} else {
					// Tie
					winnings = amount;
					result = "Tie!";
				}

				await usersData.set(senderID, {
					money: userMoney + (winnings - amount)
				});

				const playerDisplay = playerCards.join(", ") + ` (${playerTotal})`;
				const dealerDisplay = dealerCards.join(", ") + ` (${dealerTotal})`;

				if (winnings > amount) {
					message.reply(getLang("blackjackWin", playerDisplay, dealerDisplay, winnings));
				} else if (winnings === amount) {
					message.reply(getLang("blackjackTie", playerDisplay, dealerDisplay, winnings));
				} else {
					message.reply(getLang("blackjackLose", playerDisplay, dealerDisplay, amount));
				}
				break;
			}

			case "roulette":
			case "r": {
				const amount = parseInt(args[1]);
				const color = args[2]?.toLowerCase();

				const error = validateAmount(amount);
				if (error) return message.reply(error);

				if (!color || !["red", "black", "green"].includes(color)) {
					return message.reply(getLang("invalidColor"));
				}

				const number = Math.floor(Math.random() * 37); // 0-36
				let actualColor = "green";
				if (number > 0) {
					const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
					actualColor = redNumbers.includes(number) ? "red" : "black";
				}

				let winnings = 0;
				if (color === actualColor) {
					if (color === "green") {
						winnings = amount * 35; // Green pays 35:1
					} else {
						winnings = amount * 2; // Red/Black pays 2:1
					}
				}

				await usersData.set(senderID, {
					money: userMoney + (winnings - amount)
				});

				const result = `${number} (${actualColor})`;
				if (winnings > 0) {
					message.reply(getLang("rouletteWin", result, winnings));
				} else {
					message.reply(getLang("rouletteLose", result, amount));
				}
				break;
			}

			default: {
				let msg = "🎰 **CASINO SYSTEM** 🎰\n\n";
				msg += "💰 **Available Games:**\n";
				msg += "• `casino coin <amount>` - Coin flip (1.8x payout)\n";
				msg += "• `casino dice <amount> <guess>` - Dice game (5x payout)\n";
				msg += "• `casino slots <amount>` - Slot machine (2x-10x payout)\n";
				msg += "• `casino blackjack <amount>` - Blackjack (2x-2.5x payout)\n";
				msg += "• `casino roulette <amount> <color>` - Roulette (2x-35x payout)\n\n";
				msg += "⚠️ **Rules:**\n";
				msg += "• Minimum bet: 10$\n";
				msg += "• Maximum bet: 10000$\n";
				msg += "• House always has edge!\n\n";
				msg += getLang("rouletteColors");

				message.reply(msg);
				break;
			}
		}
	}
};
