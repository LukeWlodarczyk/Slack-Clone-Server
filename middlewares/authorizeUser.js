import { refreshTokens } from '../helpers/auth';
import jwt from 'jsonwebtoken';

export default (secret, secret2, models) => async (req, res, next) => {
	const token = req.headers['x-token'];
	if (token && token !== 'null') {
		try {
			const { user } = jwt.verify(token, secret);
			req.user = user;
		} catch (err) {
			const refreshToken = req.headers['x-refresh-token'];

			const newTokens = await refreshTokens(
				token,
				refreshToken,
				models,
				secret,
				secret2
			);

			if (newTokens.token && newTokens.refreshToken) {
				res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
				res.set('x-token', newTokens.token);
				res.set('x-refresh-token', newTokens.refreshToken);
			}

			req.user = newTokens.user;
		}
	}
	next();
};
