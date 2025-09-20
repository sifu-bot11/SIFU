const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.6",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "Thêm, xóa, sửa quyền admin",
			en: "Add, remove, edit admin role"
		},
		category: "box chat",
		guide: {
			vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền admin cho người dùng'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Xóa quyền admin của người dùng'
				+ '\n	  {pn} [list | -l] [theme]: Liệt kê danh sách admin với theme đẹp'
				+ '\n	  Themes: royal, cyber, gaming, space, medieval, neon, ocean, forest, magic, steam',
			en: '   {pn} [add | -a] <uid | @tag>: Add admin role for user'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Remove admin role of user'
				+ '\n	  {pn} [list | -l] [theme]: List all admins with beautiful themes'
				+ '\n	  Themes: royal, cyber, gaming, space, medieval, neon, ocean, forest, magic, steam'
		}
	},

	langs: {
		vi: {
			added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
			alreadyAdmin: "\n⚠️ | %1 người dùng đã có quyền admin từ trước rồi:\n%2",
			missingIdAdd: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền admin",
			removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
			notAdmin: "⚠️ | %1 người dùng không có quyền admin:\n%2",
			missingIdRemove: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền admin",
			listAdmin: "👑 | Danh sách admin:\n%1"
		},
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
			missingIdAdd: "⚠️ | Please enter ID or tag user to add admin role",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠️ | Please enter ID or tag user to remove admin role",
			listAdmin: "👑 | List of admins:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.adminBot.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "-r": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions)[0];
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					for (const uid of adminIds)
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);
					const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				
				// Create multiple attractive design options
				const totalAdmins = getNames.length;
				const currentTime = new Date().toLocaleString();
				
				// Design 1: Mobile-Friendly Royal Theme
				const royalDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const crown = rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "💎";
						const status = rank === 1 ? "👑 SUPER" : rank <= 3 ? "⭐ SENIOR" : "🔧 ADMIN";
						return `${crown} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `╔══════════════════════════════════════╗
║        👑 ROYAL ADMIN COURT 👑        ║
╠══════════════════════════════════════╣
║ 📊 **Total:** ${totalAdmins}                    ║
║ 🕐 **Updated:** ${currentTime.split(',')[0]}     ║
║                                      ║
║ ${adminList} ║
║                                      ║
╚══════════════════════════════════════╝`;
				};
				
				// Design 2: Mobile-Friendly Cyberpunk Theme
				const cyberpunkDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🤖" : rank === 2 ? "⚡" : rank === 3 ? "🔥" : "💻";
						const status = rank === 1 ? "🔴 OVERLORD" : rank <= 3 ? "🟡 SENIOR" : "🟢 OPERATOR";
						return `${icon} **[${rank}]** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `┌──────────────────────────────────────┐
│  🤖 CYBER ADMIN MATRIX 🤖            │
├──────────────────────────────────────┤
│ 📊 **Admins:** ${totalAdmins}                    │
│ 🕐 **Scan:** ${currentTime.split(',')[0]}        │
│                                      │
│ ${adminList} │
│                                      │
└──────────────────────────────────────┘`;
				};
				
				// Design 3: Mobile-Friendly Gaming Theme
				const gamingDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🎮" : rank === 2 ? "🏆" : rank === 3 ? "🥇" : "🎯";
						const level = rank === 1 ? "MAX" : rank <= 3 ? "HIGH" : "MED";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   🎮 ${level} LEVEL`;
					}).join("\n\n");
					
					return `╭──────────────────────────────────────╮
│  🎮 ADMIN LEADERBOARD 🎮            │
├──────────────────────────────────────┤
│ 📊 **Players:** ${totalAdmins}                   │
│ 🕐 **Update:** ${currentTime.split(',')[0]}      │
│                                      │
│ ${adminList} │
│                                      │
│ 🏆 **Achievements:** ${totalAdmins}              │
╰──────────────────────────────────────╯`;
				};
				
				// Design 4: Mobile-Friendly Space Theme
				const spaceDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🚀" : rank === 2 ? "🛸" : rank === 3 ? "⭐" : "🌟";
						const status = rank === 1 ? "🌌 COMMANDER" : rank <= 3 ? "🪐 ADMIN" : "🌍 OPERATOR";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `┌──────────────────────────────────────┐
│  🚀 SPACE COMMAND CENTER 🚀          │
├──────────────────────────────────────┤
│ 📊 **Crew:** ${totalAdmins}                      │
│ 🕐 **Mission:** ${currentTime.split(',')[0]}     │
│                                      │
│ ${adminList} │
│                                      │
│ 🌌 **STATUS:** ACTIVE                │
└──────────────────────────────────────┘`;
				};
				
				// Design 5: Mobile-Friendly Medieval Theme
				const medievalDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "👑" : rank === 2 ? "⚔️" : rank === 3 ? "🛡️" : "🗡️";
						const title = rank === 1 ? "👑 KING/QUEEN" : rank === 2 ? "⚔️ COMMANDER" : rank === 3 ? "🛡️ GUARD" : "🗡️ KNIGHT";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${title}`;
					}).join("\n\n");
					
					return `╔══════════════════════════════════════╗
║        🏰 ROYAL KINGDOM 🏰            ║
╠══════════════════════════════════════╣
║ 📊 **Court:** ${totalAdmins}                      ║
║ 🕐 **Session:** ${currentTime.split(',')[0]}      ║
║                                      ║
║ ${adminList} ║
║                                      ║
║ 🏰 **STATUS:** PROSPEROUS            ║
╚══════════════════════════════════════╝`;
				};
				
				// Design 6: Mobile-Friendly Neon Theme
				const neonDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "⚡" : rank === 2 ? "🔥" : rank === 3 ? "💫" : "✨";
						const status = rank === 1 ? "⚡ OVERLORD" : rank <= 3 ? "🔥 ELITE" : "✨ WARRIOR";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `┌──────────────────────────────────────┐
│  ⚡ NEON ADMIN MATRIX ⚡              │
├──────────────────────────────────────┤
│ 📊 **Nodes:** ${totalAdmins}                      │
│ 🕐 **Matrix:** ${currentTime.split(',')[0]}       │
│                                      │
│ ${adminList} │
│                                      │
│ ⚡ **STATUS:** ONLINE                 │
└──────────────────────────────────────┘`;
				};
				
				// Design 7: Mobile-Friendly Ocean Theme
				const oceanDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🐋" : rank === 2 ? "🦈" : rank === 3 ? "🐙" : "🐠";
						const status = rank === 1 ? "🐋 KING" : rank === 2 ? "🦈 COMMANDER" : rank === 3 ? "🐙 ADMIRAL" : "🐠 CAPTAIN";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `╭──────────────────────────────────────╮
│  🌊 DEEP SEA COMMAND 🌊              │
├──────────────────────────────────────┤
│ 📊 **Crew:** ${totalAdmins}                      │
│ 🕐 **Dive:** ${currentTime.split(',')[0]}        │
│                                      │
│ ${adminList} │
│                                      │
│ 🌊 **STATUS:** CALM                  │
╰──────────────────────────────────────╯`;
				};
				
				// Design 8: Mobile-Friendly Forest Theme
				const forestDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🌳" : rank === 2 ? "🦅" : rank === 3 ? "🐺" : "🦌";
						const status = rank === 1 ? "🌳 ELDER" : rank === 2 ? "🦅 SCOUT" : rank === 3 ? "🐺 LEADER" : "🦌 GUARDIAN";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `┌──────────────────────────────────────┐
│  🌲 FOREST COUNCIL 🌲                │
├──────────────────────────────────────┤
│ 📊 **Council:** ${totalAdmins}                  │
│ 🕐 **Gathering:** ${currentTime.split(',')[0]}  │
│                                      │
│ ${adminList} │
│                                      │
│ 🌲 **STATUS:** THRIVING              │
└──────────────────────────────────────┘`;
				};
				
				// Design 9: Mobile-Friendly Magic Theme
				const magicDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🧙‍♂️" : rank === 2 ? "🧙‍♀️" : rank === 3 ? "🔮" : "✨";
						const status = rank === 1 ? "🧙‍♂️ ARCHMAGE" : rank === 2 ? "🧙‍♀️ SORCERESS" : rank === 3 ? "🔮 MASTER" : "✨ APPRENTICE";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `╔══════════════════════════════════════╗
║      🧙‍♂️ MAGIC ACADEMY 🧙‍♂️            ║
╠══════════════════════════════════════╣
║ 📊 **Wizards:** ${totalAdmins}                  ║
║ 🕐 **Spell:** ${currentTime.split(',')[0]}      ║
║                                      ║
║ ${adminList} ║
║                                      ║
║ 🧙‍♂️ **STATUS:** ENCHANTED            ║
╚══════════════════════════════════════╝`;
				};
				
				// Design 10: Mobile-Friendly Steampunk Theme
				const steampunkDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "⚙️" : rank === 2 ? "🔧" : rank === 3 ? "⚡" : "🔩";
						const status = rank === 1 ? "⚙️ CHIEF" : rank === 2 ? "🔧 MASTER" : rank === 3 ? "⚡ OPERATOR" : "🔩 SPECIALIST";
						return `${icon} **${rank}.** ${name}\n   🆔 \`${uid}\`\n   ${status}`;
					}).join("\n\n");
					
					return `┌──────────────────────────────────────┐
│  ⚙️ STEAMPUNK FOUNDRY ⚙️              │
├──────────────────────────────────────┤
│ 📊 **Engineers:** ${totalAdmins}                │
│ 🕐 **Factory:** ${currentTime.split(',')[0]}    │
│                                      │
│ ${adminList} │
│                                      │
│ ⚙️ **STATUS:** OPERATIONAL           │
└──────────────────────────────────────┘`;
				};
				
				// Check if user wants a specific theme
				const themeArg = args[1]?.toLowerCase();
				let selectedDesign;
				
				if (themeArg) {
					switch (themeArg) {
						case 'royal': selectedDesign = royalDesign; break;
						case 'cyber': case 'cyberpunk': selectedDesign = cyberpunkDesign; break;
						case 'gaming': case 'game': selectedDesign = gamingDesign; break;
						case 'space': case 'cosmic': selectedDesign = spaceDesign; break;
						case 'medieval': case 'kingdom': selectedDesign = medievalDesign; break;
						case 'neon': case 'cyber': selectedDesign = neonDesign; break;
						case 'ocean': case 'sea': selectedDesign = oceanDesign; break;
						case 'forest': case 'nature': selectedDesign = forestDesign; break;
						case 'magic': case 'wizard': selectedDesign = magicDesign; break;
						case 'steam': case 'steampunk': selectedDesign = steampunkDesign; break;
						default: selectedDesign = royalDesign; break;
					}
				} else {
					// Randomly select a design
					const designs = [royalDesign, cyberpunkDesign, gamingDesign, spaceDesign, medievalDesign, neonDesign, oceanDesign, forestDesign, magicDesign, steampunkDesign];
					selectedDesign = designs[Math.floor(Math.random() * designs.length)];
				}
				
				return message.reply(selectedDesign());
			}
			default:
				return message.SyntaxError();
		}
	}
};
