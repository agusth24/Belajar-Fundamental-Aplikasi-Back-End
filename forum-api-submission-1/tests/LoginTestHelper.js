/* istanbul ignore file */
const Jwt = require('@hapi/jwt');

const JwtTokenManager = require('../src/Infrastructures/security/JwtTokenManager');
const AuthHelper = require('./AuthenticationsTableTestHelper');

const LoginTestHelper = {
	async login(payload) {
		const tokenManager = new JwtTokenManager(Jwt.token);

		const accessToken = tokenManager.createAccessToken(payload);
		const refreshToken = tokenManager.createRefreshToken(payload);

		await AuthHelper.addToken(refreshToken);

		return accessToken;
	}
};

module.exports = LoginTestHelper;
