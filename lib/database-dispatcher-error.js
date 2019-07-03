'use strict';

class DatabaseDispatcherError extends Error {

	static get codes() {

		return {
			// file
			CONFIG_NOT_FOUND: 1, // config file not found
			INVALID_CONFIG_FILE: 2, //  config file found with invalid format (not an object)
			// database config
			DB_CONFIG_NOT_FOUND: 3, // when db config not found
			INVALID_DB_CONFIG: 4, // when a database config has invliad format (not an object)
			DB_CONFIG_INVALID_HOST: 5, // when db host is invalid (not a string)
			DB_CONFIG_TYPE_INVALID: 6, // when db type is invlid (not a string)
			DB_CONFIG_TYPE_NOT_ALLOWED: 7, // when db type is invlid in options
			// DB Driver
			DB_DRIVER_NOT_INSTALLED: 8 // when driver is not installed
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
