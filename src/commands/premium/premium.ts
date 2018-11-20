import { Message } from 'eris';
import moment from 'moment';
import { MoreThan } from 'typeorm';

import { IMClient } from '../../client';
import { BotCommand, CommandGroup } from '../../types';
import { Command, Context } from '../Command';

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: BotCommand.premium,
			aliases: ['patreon', 'donate'],
			group: CommandGroup.Premium,
			guildOnly: true,
			strict: true
		});
	}

	public async action(
		message: Message,
		args: any[],
		{ guild, t, settings, isPremium }: Context
	): Promise<any> {
		// TODO: Create list of premium features (also useful for FAQ)
		const lang = settings.lang;

		const embed = this.createEmbed();

		if (!isPremium) {
			embed.title = t('cmd.premium.noPremium.title');
			embed.description = t('cmd.premium.noPremium.text');

			embed.fields.push({
				name: t('cmd.premium.feature.embeds.title'),
				value: t('cmd.premium.feature.embeds.text', {
					link:
						'https://docs.invitemanager.co/bot/custom-messages/join-message-examples'
				})
			});

			embed.fields.push({
				name: t('cmd.premium.feature.export.title'),
				value: t('cmd.premium.feature.export.text')
			});
		} else {
			const sub = await this.repo.premium.findOne({
				where: {
					guildId: guild.id,
					validUntil: MoreThan(new Date())
				}
			});

			embed.title = t('cmd.premium.premium.title');

			let description = '';
			if (sub) {
				const date = moment(sub.validUntil)
					.locale(lang)
					.fromNow(true);
				description = t('cmd.premium.premium.text', {
					date,
					link: 'https://docs.invitemanager.co/bot/premium/features'
				});
			} else {
				description += t('cmd.premium.premium.notFound');
			}
			embed.description = description;
		}

		return this.sendReply(message, embed);
	}
}
