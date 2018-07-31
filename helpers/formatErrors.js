import _ from 'lodash';
export const formatErrors = (e, models) => {
	if (e instanceof models.sequelize.ValidationError) {
		//  _.pick({a: 1, b: 2}, 'a') => {a: 1}
		return e.errors.map(x => _.pick(x, ['path', 'message']));
	}

	return [{ path: 'ServerError', message: 'Something went wrong' }];
};
