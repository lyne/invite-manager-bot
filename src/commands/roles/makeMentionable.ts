import {
	Command,
	CommandDecorators,
	Logger,
	logger,
	Message,
	Middleware
} from '@yamdbf/core';
import { Role } from 'discord.js';

import { IMClient } from '../../client';
import { sendReply } from '../../functions/Messaging';
import { checkProBot, checkRoles } from '../../middleware';
import { BotCommand } from '../../types';

const { resolve } = Middleware;
const { using } = CommandDecorators;

export default class extends Command<IMClient> {
	@logger('Command')
	private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'make-mentionable',
			aliases: ['makeMentionable', 'mm'],
			desc: 'Make a role mentionable for 60 seconds or until it was used.',
			usage: '<prefix>make-mentionable Role',
			info: '',
			clientPermissions: ['MANAGE_ROLES'],
			guildOnly: true
		});
	}

	@using(checkProBot)
	@using(checkRoles(BotCommand.makeMentionable))
	@using(resolve('role: Role'))
	public async action(message: Message, [role]: [Role]): Promise<any> {
		this._logger.log(
			`${message.guild ? message.guild.name : 'DM'} (${
				message.author.username
			}): ${message.content}`
		);

		await message.delete();

		if (!role.editable) {
			return sendReply(
				message,
				`Cannot edit ${role}. Make sure the role is lower than the bots role.`
			);
		} else if (role.mentionable) {
			return sendReply(message, `${role} is already mentionable.`);
		} else {
			await role.setMentionable(true, 'Pinging role');

			(await message.channel.awaitMessages(
				(m: Message) => {
					return m.mentions.roles.has(role.id);
				},
				{ max: 1, time: 60000 }
			)).first();

			await role.setMentionable(false, 'Done pinging role');
		}
	}
}
