'use strict';

class DatabaseDispatcherError extends Error {

	static get codes() {

		return {
			CONFIG_NOT_FOUND: 1,
			INVALID_DB_KEY: 2,
			DB_DRIVER_NOT_INSTALLED: 3,
			INVALID_CONFIG: 4,
			INVALID_DB_TYPE_CONFIG: 5
		};
	}

	constructor(err, code) {
		super(err);
		this.message = err.message || err;
		this.code = code;
		this.name = 'DatabaseDispatcherError';
	}
}

module.exports = DatabaseDispatcherError;
