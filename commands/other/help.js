const { dbQuery, permLevelToRole, checkConfig } = require("../../coreFunctions");

const { colors, prefix } = require("../../config.json");

module.exports = {
	controls: {
		name: "help",
		permission: 10,
		aliases: ["command", "howto", "prefix"],
		usage: "help (command name)",
		description: "Shows command information",
		enabled: true,
		docs: "all/help",
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"],
		cooldown: 5
	},
	do: async (message, client, args, Discord) => {
		let qServerDB = await dbQuery("Server", { id: message.guild.id });
		let missingConfig = checkConfig(qServerDB);
		let serverPrefix = (qServerDB && qServerDB.config && qServerDB.config.prefix) || prefix;

		if (!args[0]) {
			let embed = new Discord.MessageEmbed()
				.setDescription("Please see https://suggester.js.org/ for a command list and usage information!")
				.setFooter(`My prefix in this server is ${serverPrefix}`)
				.setColor(colors.default);

			if (missingConfig.length >= 1) embed.addField("Missing Config!", `This server has an incomplete configuration.\nA server manager can run \`${serverPrefix}setup\` to configure it.`);
			return message.channel.send(embed);
		}

		let commandName = args[0].toLowerCase();

		const command = client.commands.find((c) => c.controls.name.toLowerCase() === commandName || c.controls.aliases && c.controls.aliases.includes(commandName));

		if (!command) return;

		let commandInfo = command.controls;

		let returnEmbed = new Discord.MessageEmbed()
			.setColor(colors.default)
			.setDescription(commandInfo.description)
			.addField("Permission Level", permLevelToRole(commandInfo.permission), true)
			.addField("Usage", `\`${serverPrefix}${commandInfo.usage}\``, true)
			.setAuthor(`Command: ${commandName}`, client.user.displayAvatarURL({dynamic: true, format: "png"}));

		commandInfo.aliases ? returnEmbed.addField(commandInfo.aliases.length > 1 ? "Aliases" : "Alias", commandInfo.aliases.join(", ")) : "";
		if (commandInfo.docs && commandInfo.docs !== "") returnEmbed.addField("Documentation", `https://suggester.js.org/#/${commandInfo.docs}`);
		if (!commandInfo.enabled) returnEmbed.addField("Additional Information", "⚠️ This command is currently disabled");

		return message.channel.send(returnEmbed);

	}
};
