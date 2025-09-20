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
				
				// Design 1: Royal Crown Theme
				const royalDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const crown = rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "💎";
						const status = rank === 1 ? "👑 **SUPER ADMIN**" : rank <= 3 ? "⭐ **SENIOR ADMIN**" : "🔧 **ADMIN**";
						const power = rank === 1 ? "🔥 MAX POWER" : rank <= 3 ? "⚡ HIGH POWER" : "💪 MEDIUM POWER";
						return `${crown} **${rank}.** ${name}\n   ├─ 🆔 ID: \`${uid}\`\n   ├─ ${status}\n   └─ ${power}`;
					}).join("\n\n");
					
					return `╔══════════════════════════════════════════════════════╗
║                    👑 ROYAL ADMIN COURT 👑                    ║
╠══════════════════════════════════════════════════════╣
║ 📊 **Total Admins:** ${totalAdmins}                              ║
║ 🕐 **Last Updated:** ${currentTime}                    ║
║                                                      ║
║ ${adminList} ║
║                                                      ║
╚══════════════════════════════════════════════════════╝`;
				};
				
				// Design 2: Cyberpunk Theme
				const cyberpunkDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🤖" : rank === 2 ? "⚡" : rank === 3 ? "🔥" : "💻";
						const level = rank === 1 ? "LEVEL ∞" : rank <= 3 ? "LEVEL 99" : "LEVEL 50";
						const status = rank === 1 ? "🔴 **SYSTEM OVERLORD**" : rank <= 3 ? "🟡 **SENIOR OPERATOR**" : "🟢 **OPERATOR**";
						return `${icon} **[${rank}]** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${status}\n   └─ ${level}`;
					}).join("\n\n");
					
					return `┌─────────────────────────────────────────────────────┐
│  ██████╗ ██╗   ██╗██████╗ ███████╗██████╗ ██████╗  │
│ ██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔══██╗██╔══██╗ │
│ ██║   ██║██║   ██║██████╔╝█████╗  ██████╔╝██████╔╝ │
│ ██║   ██║██║   ██║██╔══██╗██╔══╝  ██╔══██╗██╔══██╗ │
│ ╚██████╔╝╚██████╔╝██████╔╝███████╗██║  ██║██████╔╝ │
│  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝  │
├─────────────────────────────────────────────────────┤
│ 📊 **SYSTEM ADMINS:** ${totalAdmins}                    │
│ 🕐 **LAST SCAN:** ${currentTime}              │
│                                                     │
│ ${adminList} │
│                                                     │
└─────────────────────────────────────────────────────┘`;
				};
				
				// Design 3: Gaming Theme
				const gamingDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🎮" : rank === 2 ? "🏆" : rank === 3 ? "🥇" : "🎯";
						const level = rank === 1 ? "MAX LEVEL" : rank <= 3 ? "HIGH LEVEL" : "MEDIUM LEVEL";
						const xp = rank === 1 ? "∞ XP" : rank <= 3 ? "9999 XP" : "5000 XP";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ 🎮 ${level}\n   └─ ⭐ ${xp}`;
					}).join("\n\n");
					
					return `╭─────────────────────────────────────────────────────╮
│  🎮 ADMIN LEADERBOARD 🎮                              │
├─────────────────────────────────────────────────────┤
│ 📊 **Total Players:** ${totalAdmins}                    │
│ 🕐 **Last Update:** ${currentTime}              │
│                                                     │
│ ${adminList} │
│                                                     │
│ 🏆 **ACHIEVEMENTS UNLOCKED:** ${totalAdmins}              │
╰─────────────────────────────────────────────────────╯`;
				};
				
				// Design 4: Space Theme
				const spaceDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🚀" : rank === 2 ? "🛸" : rank === 3 ? "⭐" : "🌟";
						const status = rank === 1 ? "🌌 **GALAXY COMMANDER**" : rank <= 3 ? "🪐 **PLANET ADMIN**" : "🌍 **STATION OPERATOR**";
						const power = rank === 1 ? "∞ ENERGY" : rank <= 3 ? "9999 ENERGY" : "5000 ENERGY";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${status}\n   └─ ⚡ ${power}`;
					}).join("\n\n");
					
					return `┌─────────────────────────────────────────────────────┐
│  🚀 SPACE COMMAND CENTER 🚀                          │
├─────────────────────────────────────────────────────┤
│ 📊 **Crew Members:** ${totalAdmins}                      │
│ 🕐 **Mission Time:** ${currentTime}              │
│                                                     │
│ ${adminList} │
│                                                     │
│ 🌌 **MISSION STATUS:** ACTIVE                       │
└─────────────────────────────────────────────────────┘`;
				};
				
				// Design 5: Medieval Theme
				const medievalDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "👑" : rank === 2 ? "⚔️" : rank === 3 ? "🛡️" : "🗡️";
						const title = rank === 1 ? "👑 **KING/QUEEN**" : rank === 2 ? "⚔️ **KNIGHT COMMANDER**" : rank === 3 ? "🛡️ **ROYAL GUARD**" : "🗡️ **KNIGHT**";
						const power = rank === 1 ? "∞ POWER" : rank <= 3 ? "9999 POWER" : "5000 POWER";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${title}\n   └─ ⚡ ${power}`;
					}).join("\n\n");
					
					return `╔══════════════════════════════════════════════════════╗
║                🏰 ROYAL KINGDOM 🏰                    ║
╠══════════════════════════════════════════════════════╣
║ 📊 **Royal Court:** ${totalAdmins}                          ║
║ 🕐 **Court Session:** ${currentTime}                ║
║                                                      ║
║ ${adminList} ║
║                                                      ║
║ 🏰 **KINGDOM STATUS:** PROSPEROUS                    ║
╚══════════════════════════════════════════════════════╝`;
				};
				
				// Design 6: Neon Cyber Theme
				const neonDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "⚡" : rank === 2 ? "🔥" : rank === 3 ? "💫" : "✨";
						const status = rank === 1 ? "⚡ **NEON OVERLORD**" : rank <= 3 ? "🔥 **CYBER ELITE**" : "✨ **DIGITAL WARRIOR**";
						const power = rank === 1 ? "∞ NEON" : rank <= 3 ? "9999 NEON" : "5000 NEON";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${status}\n   └─ ⚡ ${power}`;
					}).join("\n\n");
					
					return `┌─────────────────────────────────────────────────────┐
│  ⚡ NEON ADMIN MATRIX ⚡                            │
├─────────────────────────────────────────────────────┤
│ 📊 **System Nodes:** ${totalAdmins}                      │
│ 🕐 **Matrix Time:** ${currentTime}              │
│                                                     │
│ ${adminList} │
│                                                     │
│ ⚡ **MATRIX STATUS:** ONLINE                        │
└─────────────────────────────────────────────────────┘`;
				};
				
				// Design 7: Ocean Theme
				const oceanDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🐋" : rank === 2 ? "🦈" : rank === 3 ? "🐙" : "🐠";
						const status = rank === 1 ? "🐋 **OCEAN KING**" : rank === 2 ? "🦈 **SHARK COMMANDER**" : rank === 3 ? "🐙 **OCTOPUS ADMIRAL**" : "🐠 **FISH CAPTAIN**";
						const power = rank === 1 ? "∞ DEPTH" : rank <= 3 ? "9999 DEPTH" : "5000 DEPTH";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${status}\n   └─ 🌊 ${power}`;
					}).join("\n\n");
					
					return `╭─────────────────────────────────────────────────────╮
│  🌊 DEEP SEA COMMAND 🌊                            │
├─────────────────────────────────────────────────────┤
│ 📊 **Crew Members:** ${totalAdmins}                      │
│ 🕐 **Dive Time:** ${currentTime}              │
│                                                     │
│ ${adminList} │
│                                                     │
│ 🌊 **OCEAN STATUS:** CALM                           │
╰─────────────────────────────────────────────────────╯`;
				};
				
				// Design 8: Forest Theme
				const forestDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🌳" : rank === 2 ? "🦅" : rank === 3 ? "🐺" : "🦌";
						const status = rank === 1 ? "🌳 **FOREST ELDER**" : rank === 2 ? "🦅 **EAGLE SCOUT**" : rank === 3 ? "🐺 **WOLF PACK LEADER**" : "🦌 **DEER GUARDIAN**";
						const power = rank === 1 ? "∞ NATURE" : rank <= 3 ? "9999 NATURE" : "5000 NATURE";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${status}\n   └─ 🌿 ${power}`;
					}).join("\n\n");
					
					return `┌─────────────────────────────────────────────────────┐
│  🌲 FOREST COUNCIL 🌲                              │
├─────────────────────────────────────────────────────┤
│ 📊 **Council Members:** ${totalAdmins}                  │
│ 🕐 **Gathering Time:** ${currentTime}              │
│                                                     │
│ ${adminList} │
│                                                     │
│ 🌲 **FOREST STATUS:** THRIVING                      │
└─────────────────────────────────────────────────────┘`;
				};
				
				// Design 9: Magic Theme
				const magicDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "🧙‍♂️" : rank === 2 ? "🧙‍♀️" : rank === 3 ? "🔮" : "✨";
						const status = rank === 1 ? "🧙‍♂️ **ARCHMAGE**" : rank === 2 ? "🧙‍♀️ **HIGH SORCERESS**" : rank === 3 ? "🔮 **CRYSTAL MASTER**" : "✨ **MAGIC APPRENTICE**";
						const power = rank === 1 ? "∞ MANA" : rank <= 3 ? "9999 MANA" : "5000 MANA";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${status}\n   └─ ⚡ ${power}`;
					}).join("\n\n");
					
					return `╔══════════════════════════════════════════════════════╗
║                🧙‍♂️ MAGIC ACADEMY 🧙‍♂️                    ║
╠══════════════════════════════════════════════════════╣
║ 📊 **Wizards:** ${totalAdmins}                              ║
║ 🕐 **Spell Time:** ${currentTime}                    ║
║                                                      ║
║ ${adminList} ║
║                                                      ║
║ 🧙‍♂️ **ACADEMY STATUS:** ENCHANTED                    ║
╚══════════════════════════════════════════════════════╝`;
				};
				
				// Design 10: Steampunk Theme
				const steampunkDesign = () => {
					const adminList = getNames.map(({ uid, name }, index) => {
						const rank = index + 1;
						const icon = rank === 1 ? "⚙️" : rank === 2 ? "🔧" : rank === 3 ? "⚡" : "🔩";
						const status = rank === 1 ? "⚙️ **CHIEF ENGINEER**" : rank === 2 ? "🔧 **MECHANICAL MASTER**" : rank === 3 ? "⚡ **STEAM OPERATOR**" : "🔩 **GEAR SPECIALIST**";
						const power = rank === 1 ? "∞ STEAM" : rank <= 3 ? "9999 STEAM" : "5000 STEAM";
						return `${icon} **${rank}.** ${name}\n   ├─ 🆔 \`${uid}\`\n   ├─ ${status}\n   └─ ⚙️ ${power}`;
					}).join("\n\n");
					
					return `┌─────────────────────────────────────────────────────┐
│  ⚙️ STEAMPUNK FOUNDRY ⚙️                            │
├─────────────────────────────────────────────────────┤
│ 📊 **Engineers:** ${totalAdmins}                        │
│ 🕐 **Factory Time:** ${currentTime}              │
│                                                     │
│ ${adminList} │
│                                                     │
│ ⚙️ **FOUNDRY STATUS:** OPERATIONAL                  │
└─────────────────────────────────────────────────────┘`;
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
