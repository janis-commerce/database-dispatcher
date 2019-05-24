'use strict';

class DatabaseDispatcherError extends Error {

	static get codes() {

		return {
			CONFIG_NOT_FOUND: 1,
			INVALID_DB_TYPE: 2
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
