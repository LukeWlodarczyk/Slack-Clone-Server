import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Query: {
		teamMembers: requiresAuth.createResolver(
			async (parent, { teamId }, { models }) =>
				models.sequelize.query(
					'select * from users as u join members as m on m.user_id = u.id where m.team_id = ?',
					{
						replacements: [teamId],
						model: models.User,
						raw: true,
					}
				)
		),
	},
	Mutation: {
		createTeam: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					const team = await models.sequelize.transaction(async transaction => {
						const team = await models.Team.create({ ...args }, { transaction });
						await models.Channel.create(
							{
								name: 'general',
								public: true,
								teamId: team.id,
							},
							{ transaction }
						);
						await models.Member.create(
							{
								teamId: team.id,
								userId: user.id,
								admin: true,
							},
							{ transaction }
						);
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
					const memberPromise = models.Member.findOne({
						where: { teamId, userId: user.id },
					});
					const userToAddPromise = models.User.findOne({
						where: { email },
					});

					const [member, userToAdd] = await Promise.all([
						memberPromise,
						userToAddPromise,
					]);

					if (!member.admin) {
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

					const memberExists = await models.Member.findOne({
						where: { teamId, userId: userToAdd.id },
					});

					if (memberExists) {
						return {
							success: false,
							errors: [
								{
									path: 'email',
									message: 'This user is already a member of this team',
								},
							],
						};
					}

					await models.Member.create({
						userId: userToAdd.id,
						teamId,
					});
					return {
						success: true,
						user: {
							username: userToAdd.username,
							id: userToAdd.id,
						},
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
		channels: async ({ id }, args, { channelLoader }) => channelLoader.load(id),
	},
};
