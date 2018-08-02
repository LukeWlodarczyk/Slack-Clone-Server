import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Query: {
		myTeamsAsOwner: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				return await models.Team.findAll({
					where: {
						owner: user.id,
					},
				});
			}
		),
		myTeamsAsMember: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				return await models.Team.findAll({
					include: [{ model: models.User, where: { id: user.id } }],
				});
			}
		),
	},
	Mutation: {
		createTeam: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					const team = await models.sequelize.transaction(async () => {
						const team = await models.Team.create({ ...args, owner: user.id });
						await models.Channel.create({
							name: 'general',
							public: true,
							teamId: team.id,
						});
						return team;
					});

					return {
						success: true,
						team,
					};
				} catch (err) {
					return {
						success: false,
						errors: formatErrors(err, models),
					};
				}
			}
		),
		addTeamMember: requiresAuth.createResolver(
			async (parent, { email, teamId }, { models, user }) => {
				try {
					const teamPromise = models.Team.findOne({
						where: { id: teamId },
					});
					const userToAddPromise = models.User.findOne({
						where: { email },
					});

					const [team, userToAdd] = await Promise.all([
						teamPromise,
						userToAddPromise,
					]);

					if (team.owner !== user.id) {
						return {
							success: false,
							errors: [
								{
									path: 'email',
									message:
										'You cannot add members to the team. (You are not the team owner)',
								},
							],
						};
					}

					if (!userToAdd) {
						return {
							success: false,
							errors: [
								{
									path: 'email',
									message: 'User with that email does not exists',
								},
							],
						};
					}

					await models.Member.create({ userId: userToAdd.id, teamId });
					return {
						success: true,
					};
				} catch (err) {
					return {
						success: false,
						errors: formatErrors(err, models),
					};
				}
			}
		),
	},
	Team: {
		channels: ({ id }, args, { models }) =>
			models.Channel.findAll({
				where: {
					teamId: id,
				},
			}),
	},
};
