'use strict';

const CONNECTION_LIMIT = 10;

class DatabaseMock {
	constructor(config) {
		this.config = {
			host: config.host,
			user: config.user,
			password: config.password,
			database: config.database || null,
			port: config.port,
			connectionLimit: config.connectionLimit || CONNECTION_LIMIT,
			multipleStatements: true,
			prefix: config.prefix || ''
		};
	}
}

module.exports = DatabaseMock;
