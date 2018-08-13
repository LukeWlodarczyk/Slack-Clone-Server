import _ from 'lodash';
export const formatErrors = (e, models) => {
	if (e instanceof models.sequelize.ValidationError) {
		return e.errors.map(x => _.pick(x, ['path', 'message']));
	}

	return [{ path: 'ServerError', message: 'Something went wrong' }];
};
