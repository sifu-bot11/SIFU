const { config } = global.GoatBot;
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
	config: {
		name: "spy",
		version: "1.0",
		author: "GoatBot",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem thông tin chi tiết của người dùng với card đẹp",
			en: "View detailed user information with beautiful profile card image"
		},
		category: "box chat",
		guide: {
			vi: '   {pn} [@tag | uid | empty]: Xem thông tin người dùng với card đẹp\n   {pn} [@tag | uid] [theme]: Chọn theme cho card\n   Themes: purple, neon, royal, cyber, gaming, space, ocean, forest, magic, steam, random',
			en: '   {pn} [@tag | uid | empty]: View user information with beautiful profile card image\n   {pn} [@tag | uid] [theme]: Choose theme for the card\n   Themes: purple, neon, royal, cyber, gaming, space, ocean, forest, magic, steam, random'
		}
	},

	langs: {
		vi: {
			missingTarget: "⚠️ | Vui lòng tag người dùng hoặc nhập UID",
			userNotFound: "❌ | Không tìm thấy người dùng",
			error: "❌ | Đã xảy ra lỗi khi lấy thông tin người dùng",
			generating: "🎨 | Đang tạo profile card..."
		},
		en: {
			missingTarget: "⚠️ | Please tag a user or enter UID",
			userNotFound: "❌ | User not found",
			error: "❌ | An error occurred while fetching user information",
			generating: "🎨 | Generating profile card..."
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		try {
			let targetUID;
			
			// Get target user ID
			if (Object.keys(event.mentions).length > 0) {
				targetUID = Object.keys(event.mentions)[0];
			} else if (event.messageReply) {
				targetUID = event.messageReply.senderID;
			} else if (args[0] && !isNaN(args[0])) {
				targetUID = args[0];
			} else if (args.length === 0) {
				targetUID = event.senderID; // Self info
			} else {
				return message.reply(getLang("missingTarget"));
			}

			// Get user data
			const userData = await usersData.get(targetUID);
			if (!userData) {
				return message.reply(getLang("userNotFound"));
			}

			// Get additional user information
			const userInfo = await global.client.getUserInfo(targetUID);
			if (userInfo && userInfo[targetUID]) {
				userData.avatar = userInfo[targetUID].thumbSrc;
				userData.name = userInfo[targetUID].name || userData.name;
			}

			// Get theme
			let theme = args[1]?.toLowerCase() || 'purple';
			
			// Handle random theme
			if (theme === 'random') {
				const themes = ['purple', 'neon', 'royal', 'cyber', 'gaming', 'space', 'ocean', 'forest', 'magic', 'steam'];
				theme = themes[Math.floor(Math.random() * themes.length)];
			}

			// Show generating message
			await message.reply(getLang("generating"));

			// Create profile card image
			const imagePath = await createProfileCardImage(userData, theme);
			
			// Send the image
			return message.reply({
				attachment: fs.createReadStream(imagePath)
			});

		} catch (error) {
			console.error('Spy command error:', error);
			return message.reply(getLang("error"));
		}
	}
};

async function createProfileCardImage(userData, theme) {
	const {
		name,
		userID,
		gender,
		exp,
		money,
		level,
		rank,
		birthday,
		location,
		nickname,
		avatar
	} = userData;

	// Canvas dimensions - larger for better quality
	const width = 800;
	const height = 1000;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	// Get theme colors
	const themeColors = getThemeColors(theme);
	
	// Create gradient background with better quality
	const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
	gradient.addColorStop(0, themeColors.backgroundStart);
	gradient.addColorStop(1, themeColors.backgroundEnd);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	// Add outer glow effect
	ctx.shadowColor = themeColors.border;
	ctx.shadowBlur = 20;
	ctx.strokeStyle = themeColors.border;
	ctx.lineWidth = 12;
	ctx.strokeRect(6, 6, width - 12, height - 12);
	ctx.shadowBlur = 0;

	// Add inner border with glow
	ctx.shadowColor = themeColors.innerBorder;
	ctx.shadowBlur = 10;
	ctx.strokeStyle = themeColors.innerBorder;
	ctx.lineWidth = 4;
	ctx.strokeRect(30, 30, width - 60, height - 60);
	ctx.shadowBlur = 0;

	// Profile picture area
	const profileSize = 120;
	const centerX = width / 2;
	const centerY = 180;
	
	// Try to load real profile picture
	let profileImage = null;
	if (avatar) {
		try {
			profileImage = await loadImage(avatar);
		} catch (error) {
			console.log('Could not load profile image:', error.message);
		}
	}

	// Draw profile picture background (hexagon)
	ctx.fillStyle = themeColors.profileBg;
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 3) * i;
		const x = centerX + profileSize * Math.cos(angle);
		const y = centerY + profileSize * Math.sin(angle);
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
	ctx.fill();

	// Add profile picture border with glow
	ctx.shadowColor = themeColors.profileBorder;
	ctx.shadowBlur = 15;
	ctx.strokeStyle = themeColors.profileBorder;
	ctx.lineWidth = 6;
	ctx.stroke();
	ctx.shadowBlur = 0;

	// Draw profile picture or placeholder
	if (profileImage) {
		// Create circular clipping path
		ctx.save();
		ctx.beginPath();
		ctx.arc(centerX, centerY, profileSize - 10, 0, 2 * Math.PI);
		ctx.clip();
		
		// Draw the image
		ctx.drawImage(profileImage, centerX - profileSize + 10, centerY - profileSize + 10, (profileSize - 10) * 2, (profileSize - 10) * 2);
		ctx.restore();
	} else {
		// Draw placeholder icon
		ctx.fillStyle = themeColors.profileIcon;
		ctx.font = 'bold 60px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('👤', centerX, centerY + 20);
	}

	// User name with better styling
	ctx.fillStyle = themeColors.nameColor;
	ctx.font = 'bold 36px Arial';
	ctx.textAlign = 'center';
	ctx.shadowColor = themeColors.nameColor;
	ctx.shadowBlur = 10;
	ctx.fillText(name || 'Unknown User', centerX, centerY + 200);
	ctx.shadowBlur = 0;

	// Get accurate user data
	const displayName = name || 'Unknown User';
	const displayUID = userID || 'Unknown';
	const displayGender = gender === 1 ? 'Boy' : gender === 2 ? 'Girl' : 'Unknown';
	const displayType = 'user';
	const displayBirthday = birthday || 'Private';
	const displayLocation = location || 'Private';
	const displayNickname = nickname || displayName;
	const displayMoney = `$${(money || 0).toLocaleString()}`;
	const displayExp = (exp || 0).toLocaleString();
	const displayLevel = level || 1;
	const displayExpRank = `#${rank || '??'}`;
	const displayMoneyRank = `#${rank || '??'}`;

	// Data fields with better design
	const fields = [
		{ icon: '🆔', label: 'UID:', value: displayUID },
		{ icon: '🌐', label: 'Username:', value: `@${displayName.replace(/\s+/g, '.').toUpperCase()}` },
		{ icon: gender === 1 ? '👨' : gender === 2 ? '👩' : '❓', label: 'Gender:', value: displayGender },
		{ icon: '🎓', label: 'Type:', value: displayType },
			{ icon: '🎂', label: 'Birthday:', value: displayBirthday },
		{ icon: '💬', label: 'Nickname:', value: displayNickname },
		{ icon: '📍', label: 'Location:', value: displayLocation },
		{ icon: '💰', label: 'Money:', value: displayMoney },
		{ icon: '📊', label: 'XP Rank:', value: displayExpRank },
		{ icon: '🏦', label: 'Money Rank:', value: displayMoneyRank },
		{ icon: '⭐', label: 'Level:', value: displayLevel.toString() },
		{ icon: '🎯', label: 'Experience:', value: `${displayExp} XP` }
	];

	// Draw data fields with improved design
	let yPos = 420;
	fields.forEach((field, index) => {
		// Field background with gradient
		const fieldGradient = ctx.createLinearGradient(50, yPos - 30, width - 50, yPos + 10);
		fieldGradient.addColorStop(0, themeColors.fieldBg);
		fieldGradient.addColorStop(1, 'rgba(0,0,0,0.3)');
		ctx.fillStyle = fieldGradient;
		ctx.fillRect(50, yPos - 30, width - 100, 50);
		
		// Field border with glow
		ctx.shadowColor = themeColors.fieldBorder;
		ctx.shadowBlur = 5;
		ctx.strokeStyle = themeColors.fieldBorder;
		ctx.lineWidth = 2;
		ctx.strokeRect(50, yPos - 30, width - 100, 50);
		ctx.shadowBlur = 0;

		// Icon with glow
		ctx.shadowColor = themeColors.iconColor;
		ctx.shadowBlur = 8;
		ctx.fillStyle = themeColors.iconColor;
		ctx.font = 'bold 24px Arial';
		ctx.textAlign = 'left';
		ctx.fillText(field.icon, 70, yPos);

		// Label
		ctx.shadowBlur = 0;
		ctx.fillStyle = themeColors.labelColor;
		ctx.font = 'bold 18px Arial';
		ctx.fillText(field.label, 120, yPos);

		// Value with glow
		ctx.shadowColor = themeColors.valueColor;
		ctx.shadowBlur = 5;
		ctx.fillStyle = themeColors.valueColor;
		ctx.font = 'bold 18px Arial';
		ctx.textAlign = 'right';
		ctx.fillText(field.value, width - 70, yPos);
		ctx.shadowBlur = 0;

		yPos += 60;
	});

	// Status with better styling
	ctx.shadowColor = themeColors.statusColor;
	ctx.shadowBlur = 15;
	ctx.fillStyle = themeColors.statusColor;
	ctx.font = 'bold 24px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('● ONLINE', centerX, height - 60);
	ctx.shadowBlur = 0;

	// Add decorative elements
	drawDecorativeElements(ctx, width, height, themeColors);

	// Save image with better quality
	const imagePath = path.join(__dirname, `../../temp/spy_${Date.now()}.png`);
	await fs.ensureDir(path.dirname(imagePath));
	const buffer = canvas.toBuffer('image/png');
	await fs.writeFile(imagePath, buffer);

	return imagePath;
}

function drawDecorativeElements(ctx, width, height, themeColors) {
	// Add corner decorations
	const cornerSize = 40;
	
	// Top-left corner
	ctx.strokeStyle = themeColors.border;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(50, 50);
	ctx.lineTo(50 + cornerSize, 50);
	ctx.lineTo(50, 50 + cornerSize);
	ctx.stroke();
	
	// Top-right corner
	ctx.beginPath();
	ctx.moveTo(width - 50, 50);
	ctx.lineTo(width - 50 - cornerSize, 50);
	ctx.lineTo(width - 50, 50 + cornerSize);
	ctx.stroke();
	
	// Bottom-left corner
	ctx.beginPath();
	ctx.moveTo(50, height - 50);
	ctx.lineTo(50 + cornerSize, height - 50);
	ctx.lineTo(50, height - 50 - cornerSize);
	ctx.stroke();
	
	// Bottom-right corner
	ctx.beginPath();
	ctx.moveTo(width - 50, height - 50);
	ctx.lineTo(width - 50 - cornerSize, height - 50);
	ctx.lineTo(width - 50, height - 50 - cornerSize);
	ctx.stroke();
}

function getThemeColors(theme) {
	const themes = {
		purple: {
			backgroundStart: '#1A0E3A',
			backgroundEnd: '#0F0A1F',
			border: '#FF6B9D',
			innerBorder: '#FF6B9D',
			profileBg: '#2D1B69',
			profileBorder: '#FF6B9D',
			profileIcon: '#FF6B9D',
			nameColor: '#FF6B9D',
			fieldBg: 'rgba(255, 107, 157, 0.15)',
			fieldBorder: '#FF6B9D',
			iconColor: '#FF6B9D',
			labelColor: '#FFFFFF',
			valueColor: '#00FF88',
			statusColor: '#00FF88'
		},
		neon: {
			backgroundStart: '#0A0A0A',
			backgroundEnd: '#1A1A1A',
			border: '#00FFFF',
			innerBorder: '#FF00FF',
			profileBg: '#2A2A2A',
			profileBorder: '#00FFFF',
			profileIcon: '#00FFFF',
			nameColor: '#00FFFF',
			fieldBg: 'rgba(0, 255, 255, 0.1)',
			fieldBorder: '#00FFFF',
			iconColor: '#00FFFF',
			labelColor: '#FFFFFF',
			valueColor: '#00FF00',
			statusColor: '#00FF00'
		},
		royal: {
			backgroundStart: '#8B4513',
			backgroundEnd: '#4A2C2A',
			border: '#FFD700',
			innerBorder: '#FFA500',
			profileBg: '#654321',
			profileBorder: '#FFD700',
			profileIcon: '#FFD700',
			nameColor: '#FFD700',
			fieldBg: 'rgba(255, 215, 0, 0.1)',
			fieldBorder: '#FFD700',
			iconColor: '#FFD700',
			labelColor: '#FFFFFF',
			valueColor: '#FFA500',
			statusColor: '#FFA500'
		},
		cyber: {
			backgroundStart: '#000000',
			backgroundEnd: '#1A1A2E',
			border: '#00FF41',
			innerBorder: '#008F11',
			profileBg: '#16213E',
			profileBorder: '#00FF41',
			profileIcon: '#00FF41',
			nameColor: '#00FF41',
			fieldBg: 'rgba(0, 255, 65, 0.1)',
			fieldBorder: '#00FF41',
			iconColor: '#00FF41',
			labelColor: '#FFFFFF',
			valueColor: '#00FFFF',
			statusColor: '#00FFFF'
		},
		gaming: {
			backgroundStart: '#1E3A8A',
			backgroundEnd: '#0F172A',
			border: '#F59E0B',
			innerBorder: '#EF4444',
			profileBg: '#1E40AF',
			profileBorder: '#F59E0B',
			profileIcon: '#F59E0B',
			nameColor: '#F59E0B',
			fieldBg: 'rgba(245, 158, 11, 0.1)',
			fieldBorder: '#F59E0B',
			iconColor: '#F59E0B',
			labelColor: '#FFFFFF',
			valueColor: '#10B981',
			statusColor: '#10B981'
		},
		space: {
			backgroundStart: '#0F0F23',
			backgroundEnd: '#1A1A2E',
			border: '#4A90E2',
			innerBorder: '#7B68EE',
			profileBg: '#16213E',
			profileBorder: '#4A90E2',
			profileIcon: '#4A90E2',
			nameColor: '#4A90E2',
			fieldBg: 'rgba(74, 144, 226, 0.1)',
			fieldBorder: '#4A90E2',
			iconColor: '#4A90E2',
			labelColor: '#FFFFFF',
			valueColor: '#00FFFF',
			statusColor: '#00FFFF'
		},
		ocean: {
			backgroundStart: '#0B1426',
			backgroundEnd: '#1E3A8A',
			border: '#06B6D4',
			innerBorder: '#0891B2',
			profileBg: '#0F172A',
			profileBorder: '#06B6D4',
			profileIcon: '#06B6D4',
			nameColor: '#06B6D4',
			fieldBg: 'rgba(6, 182, 212, 0.1)',
			fieldBorder: '#06B6D4',
			iconColor: '#06B6D4',
			labelColor: '#FFFFFF',
			valueColor: '#00FFFF',
			statusColor: '#00FFFF'
		},
		forest: {
			backgroundStart: '#0F4C3C',
			backgroundEnd: '#1B4332',
			border: '#52C41A',
			innerBorder: '#73D13D',
			profileBg: '#2D5A27',
			profileBorder: '#52C41A',
			profileIcon: '#52C41A',
			nameColor: '#52C41A',
			fieldBg: 'rgba(82, 196, 26, 0.1)',
			fieldBorder: '#52C41A',
			iconColor: '#52C41A',
			labelColor: '#FFFFFF',
			valueColor: '#95F985',
			statusColor: '#95F985'
		},
		magic: {
			backgroundStart: '#4C1D95',
			backgroundEnd: '#2D1B69',
			border: '#A855F7',
			innerBorder: '#C084FC',
			profileBg: '#6B21A8',
			profileBorder: '#A855F7',
			profileIcon: '#A855F7',
			nameColor: '#A855F7',
			fieldBg: 'rgba(168, 85, 247, 0.1)',
			fieldBorder: '#A855F7',
			iconColor: '#A855F7',
			labelColor: '#FFFFFF',
			valueColor: '#F0ABFC',
			statusColor: '#F0ABFC'
		},
		steam: {
			backgroundStart: '#374151',
			backgroundEnd: '#1F2937',
			border: '#F59E0B',
			innerBorder: '#D97706',
			profileBg: '#4B5563',
			profileBorder: '#F59E0B',
			profileIcon: '#F59E0B',
			nameColor: '#F59E0B',
			fieldBg: 'rgba(245, 158, 11, 0.1)',
			fieldBorder: '#F59E0B',
			iconColor: '#F59E0B',
			labelColor: '#FFFFFF',
			valueColor: '#FCD34D',
			statusColor: '#FCD34D'
		}
	};

	return themes[theme] || themes.purple;
}
