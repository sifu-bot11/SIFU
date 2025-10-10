const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "invest",
		aliases: ["inv"],
		version: "1.0",
		author: "GoatBot",
		countDown: 5,
		role: 0,
		description: {
			vi: "Hệ thống đầu tư - mua bán cổ phiếu, crypto, vàng",
			en: "Investment system - buy/sell stocks, crypto, gold"
		},
		category: "economy",
		guide: {
			vi: "   {pn} market: Xem thị trường đầu tư"
				+ "\n   {pn} buy <loại> <số lượng>: Mua cổ phiếu/crypto/vàng"
				+ "\n   {pn} sell <loại> <số lượng>: Bán cổ phiếu/crypto/vàng"
				+ "\n   {pn} portfolio: Xem danh mục đầu tư"
				+ "\n   {pn} price <loại>: Xem giá hiện tại",
			en: "   {pn} market: View investment market"
				+ "\n   {pn} buy <type> <amount>: Buy stocks/crypto/gold"
				+ "\n   {pn} sell <type> <amount>: Sell stocks/crypto/gold"
				+ "\n   {pn} portfolio: View investment portfolio"
				+ "\n   {pn} price <type>: View current price"
		}
	},

	langs: {
		vi: {
			marketTitle: "📈 **THỊ TRƯỜNG ĐẦU TƯ** 📈",
			stockPrice: "💰 %1: %2$ (Thay đổi: %3%)",
			cryptoPrice: "₿ %1: %2$ (Thay đổi: %3%)",
			goldPrice: "🥇 %1: %2$/oz (Thay đổi: %3%)",
			buySuccess: "✅ Đã mua %1 %2 với giá %3$!",
			sellSuccess: "✅ Đã bán %1 %2 với giá %3$!",
			insufficientFunds: "❌ Không đủ tiền! Cần %1$, bạn có %2$",
			insufficientShares: "❌ Không đủ cổ phiếu! Bạn có %1 %2",
			invalidAmount: "❌ Số lượng không hợp lệ!",
			invalidType: "❌ Loại đầu tư không hợp lệ!",
			portfolioTitle: "💼 **DANH MỤC ĐẦU TƯ** 💼",
			portfolioItem: "• %1: %2 shares - %3$ (Lãi/lỗ: %4$)",
			noInvestments: "📋 Chưa có khoản đầu tư nào",
			investmentLevel: "📊 Cấp độ đầu tư: %1",
			totalValue: "💰 Tổng giá trị: %1$",
			totalProfit: "📈 Tổng lãi/lỗ: %1$",
			priceInfo: "💰 Giá %1 hiện tại: %2$",
			marketVolatility: "⚠️ Thị trường biến động mạnh!",
			marketStable: "✅ Thị trường ổn định",
			missingAmount: "❌ Vui lòng nhập số lượng!",
			missingType: "❌ Vui lòng chọn loại đầu tư!",
			marketClosed: "❌ Thị trường đã đóng cửa!",
			nextLevel: "📈 Cấp tiếp theo: %1$ cần thiết"
		},
		en: {
			marketTitle: "📈 **INVESTMENT MARKET** 📈",
			stockPrice: "💰 %1: %2$ (Change: %3%)",
			cryptoPrice: "₿ %1: %2$ (Change: %3%)",
			goldPrice: "🥇 %1: %2$/oz (Change: %3%)",
			buySuccess: "✅ Bought %1 %2 for %3$!",
			sellSuccess: "✅ Sold %1 %2 for %3$!",
			insufficientFunds: "❌ Insufficient funds! Need %1$, you have %2$",
			insufficientShares: "❌ Insufficient shares! You have %1 %2",
			invalidAmount: "❌ Invalid amount!",
			invalidType: "❌ Invalid investment type!",
			portfolioTitle: "💼 **INVESTMENT PORTFOLIO** 💼",
			portfolioItem: "• %1: %2 shares - %3$ (P/L: %4$)",
			noInvestments: "📋 No investments yet",
			investmentLevel: "📊 Investment Level: %1",
			totalValue: "💰 Total Value: %1$",
			totalProfit: "📈 Total P/L: %1$",
			priceInfo: "💰 %1 current price: %2$",
			marketVolatility: "⚠️ Market is highly volatile!",
			marketStable: "✅ Market is stable",
			missingAmount: "❌ Please enter amount!",
			missingType: "❌ Please select investment type!",
			marketClosed: "❌ Market is closed!",
			nextLevel: "📈 Next level: %1$ required"
		}
	},

	onStart: async function ({ message, args, event, usersData, getLang }) {
		const { senderID } = event;
		const action = args[0]?.toLowerCase();

		// Investment types with base prices and volatility
		const investmentTypes = {
			stocks: {
				AAPL: { basePrice: 150, volatility: 0.05, name: "Apple Inc." },
				GOOGL: { basePrice: 2800, volatility: 0.06, name: "Google" },
				MSFT: { basePrice: 300, volatility: 0.04, name: "Microsoft" },
				TSLA: { basePrice: 200, volatility: 0.08, name: "Tesla" },
				AMZN: { basePrice: 3200, volatility: 0.05, name: "Amazon" }
			},
			crypto: {
				BTC: { basePrice: 45000, volatility: 0.1, name: "Bitcoin" },
				ETH: { basePrice: 3000, volatility: 0.12, name: "Ethereum" },
				ADA: { basePrice: 0.5, volatility: 0.15, name: "Cardano" },
				SOL: { basePrice: 100, volatility: 0.2, name: "Solana" },
				DOGE: { basePrice: 0.08, volatility: 0.25, name: "Dogecoin" }
			},
			gold: {
				GOLD: { basePrice: 2000, volatility: 0.03, name: "Gold" },
				SILVER: { basePrice: 25, volatility: 0.05, name: "Silver" },
				PLATINUM: { basePrice: 1000, volatility: 0.04, name: "Platinum" }
			}
		};

		// Generate current prices with volatility
		const getCurrentPrice = (type, symbol) => {
			const investment = investmentTypes[type][symbol];
			if (!investment) return null;
			
			const volatility = investment.volatility;
			const change = (Math.random() - 0.5) * 2 * volatility;
			const currentPrice = investment.basePrice * (1 + change);
			
			return {
				price: Math.round(currentPrice * 100) / 100,
				change: Math.round(change * 10000) / 100
			};
		};

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
			case "market":
			case "m": {
				let msg = getLang("marketTitle") + "\n\n";
				
				// Stocks
				msg += "📊 **STOCKS:**\n";
				for (const [symbol, data] of Object.entries(investmentTypes.stocks)) {
					const current = getCurrentPrice("stocks", symbol);
					msg += getLang("stockPrice", symbol, current.price, current.change) + "\n";
				}
				
				msg += "\n₿ **CRYPTO:**\n";
				for (const [symbol, data] of Object.entries(investmentTypes.crypto)) {
					const current = getCurrentPrice("crypto", symbol);
					msg += getLang("cryptoPrice", symbol, current.price, current.change) + "\n";
				}
				
				msg += "\n🥇 **PRECIOUS METALS:**\n";
				for (const [symbol, data] of Object.entries(investmentTypes.gold)) {
					const current = getCurrentPrice("gold", symbol);
					msg += getLang("goldPrice", symbol, current.price, current.change) + "\n";
				}

				message.reply(msg);
				break;
			}

			case "buy":
			case "b": {
				const type = args[1]?.toLowerCase();
				const amount = parseInt(args[2]);

				if (!type || !amount || amount <= 0) {
					return message.reply(getLang("invalidAmount"));
				}

				// Find investment type
				let investmentCategory = null;
				let symbol = null;
				for (const [cat, investments] of Object.entries(investmentTypes)) {
					if (investments[type.toUpperCase()]) {
						investmentCategory = cat;
						symbol = type.toUpperCase();
						break;
					}
				}

				if (!investmentCategory) {
					return message.reply(getLang("invalidType"));
				}

				const current = getCurrentPrice(investmentCategory, symbol);
				const totalCost = current.price * amount;

				if (totalCost > userMoney) {
					return message.reply(getLang("insufficientFunds", totalCost, userMoney));
				}

				// Update user money
				await usersData.set(senderID, {
					money: userMoney - totalCost
				});

				// Update investments
				const investmentKey = `${investmentCategory}_${symbol}`;
				if (!economyData.investments[investmentKey]) {
					economyData.investments[investmentKey] = {
						amount: 0,
						price: 0,
						date: moment().format("DD/MM/YYYY"),
						type: investmentCategory
					};
				}

				const investment = economyData.investments[investmentKey];
				const newAmount = investment.amount + amount;
				const newAveragePrice = ((investment.amount * investment.price) + (amount * current.price)) / newAmount;

				investment.amount = newAmount;
				investment.price = newAveragePrice;
				investment.date = moment().format("DD/MM/YYYY");

				await usersData.set(senderID, { "economy.investments": economyData.investments });

				// Add transaction
				const buyTransaction = {
					type: "investment",
					amount: totalCost,
					description: `Bought ${amount} ${symbol}`,
					date: moment().format("DD/MM/YYYY HH:mm:ss"),
					relatedUser: null
				};
				economyData.transactions.unshift(buyTransaction);
				if (economyData.transactions.length > 20) economyData.transactions.pop();
				await usersData.set(senderID, { "economy.transactions": economyData.transactions });

				message.reply(getLang("buySuccess", amount, symbol, totalCost));
				break;
			}

			case "sell":
			case "s": {
				const type = args[1]?.toLowerCase();
				const amount = parseInt(args[2]);

				if (!type || !amount || amount <= 0) {
					return message.reply(getLang("invalidAmount"));
				}

				// Find investment type
				let investmentCategory = null;
				let symbol = null;
				for (const [cat, investments] of Object.entries(investmentTypes)) {
					if (investments[type.toUpperCase()]) {
						investmentCategory = cat;
						symbol = type.toUpperCase();
						break;
					}
				}

				if (!investmentCategory) {
					return message.reply(getLang("invalidType"));
				}

				const investmentKey = `${investmentCategory}_${symbol}`;
				const investment = economyData.investments[investmentKey];

				if (!investment || investment.amount < amount) {
					return message.reply(getLang("insufficientShares", investment?.amount || 0, symbol));
				}

				const current = getCurrentPrice(investmentCategory, symbol);
				const totalValue = current.price * amount;

				// Update user money
				await usersData.set(senderID, {
					money: userMoney + totalValue
				});

				// Update investments
				investment.amount -= amount;
				if (investment.amount === 0) {
					delete economyData.investments[investmentKey];
				}

				await usersData.set(senderID, { "economy.investments": economyData.investments });

				// Add transaction
				const sellTransaction = {
					type: "investment",
					amount: totalValue,
					description: `Sold ${amount} ${symbol}`,
					date: moment().format("DD/MM/YYYY HH:mm:ss"),
					relatedUser: null
				};
				economyData.transactions.unshift(sellTransaction);
				if (economyData.transactions.length > 20) economyData.transactions.pop();
				await usersData.set(senderID, { "economy.transactions": economyData.transactions });

				message.reply(getLang("sellSuccess", amount, symbol, totalValue));
				break;
			}

			case "portfolio":
			case "p": {
				let msg = getLang("portfolioTitle") + "\n\n";
				msg += getLang("investmentLevel", economyData.investmentLevel) + "\n\n";

				if (!economyData.investments || Object.keys(economyData.investments).length === 0) {
					msg += getLang("noInvestments");
				} else {
					let totalValue = 0;
					let totalCost = 0;

					for (const [key, investment] of Object.entries(economyData.investments)) {
						const [category, symbol] = key.split('_');
						const current = getCurrentPrice(category, symbol);
						const currentValue = current.price * investment.amount;
						const cost = investment.price * investment.amount;
						const profit = currentValue - cost;

						totalValue += currentValue;
						totalCost += cost;

						msg += getLang("portfolioItem", 
							symbol, 
							investment.amount, 
							currentValue.toFixed(2),
							profit.toFixed(2)
						) + "\n";
					}

					msg += "\n" + getLang("totalValue", totalValue.toFixed(2));
					msg += "\n" + getLang("totalProfit", (totalValue - totalCost).toFixed(2));
				}

				message.reply(msg);
				break;
			}

			case "price":
			case "p": {
				const type = args[1]?.toLowerCase();
				if (!type) {
					return message.reply(getLang("missingType"));
				}

				// Find investment type
				let investmentCategory = null;
				let symbol = null;
				for (const [cat, investments] of Object.entries(investmentTypes)) {
					if (investments[type.toUpperCase()]) {
						investmentCategory = cat;
						symbol = type.toUpperCase();
						break;
					}
				}

				if (!investmentCategory) {
					return message.reply(getLang("invalidType"));
				}

				const current = getCurrentPrice(investmentCategory, symbol);
				message.reply(getLang("priceInfo", symbol, current.price));
				break;
			}

			default: {
				let msg = "💼 **INVESTMENT SYSTEM** 💼\n\n";
				msg += "📋 **Available Commands:**\n";
				msg += "• `invest market` - View market prices\n";
				msg += "• `invest buy <type> <amount>` - Buy investments\n";
				msg += "• `invest sell <type> <amount>` - Sell investments\n";
				msg += "• `invest portfolio` - View your portfolio\n";
				msg += "• `invest price <type>` - Check specific price\n\n";
				msg += "💰 **Investment Types:**\n";
				msg += "• **Stocks:** AAPL, GOOGL, MSFT, TSLA, AMZN\n";
				msg += "• **Crypto:** BTC, ETH, ADA, SOL, DOGE\n";
				msg += "• **Metals:** GOLD, SILVER, PLATINUM";

				message.reply(msg);
				break;
			}
		}
	}
};
