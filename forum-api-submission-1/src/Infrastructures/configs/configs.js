const config = {
	app: {
		host: process.env.HOST,
		port: process.env.PORT,
	},
    
	token: {
		access: process.env.ACCESS_TOKEN_KEY,
		refresh: process.env.REFRESH_TOKEN_KEY,
		age: process.env.ACCESS_TOKEN_AGE,
	},
};

module.exports = config;
