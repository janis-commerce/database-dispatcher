'use strict';

class DatabaseDispatcherError extends Error {

	static get codes() {

		return {
			// Settings
			SETTINGS_NOT_FOUND: 1, // settings not found
			INVALID_SETTINGS: 2, //  settings found with invalid format (not an object)

			// DBconfig
			DB_CONFIG_NOT_FOUND: 3, // when db config not found in settings
			INVALID_DB_CONFIG: 4, // when a db config has invliad format (not an object)
			DB_CONFIG_INVALID_HOST: 5, // when db host is invalid (not a string)
			DB_CONFIG_TYPE_INVALID: 6, // when db type is invlid (not a string)
			DB_CONFIG_TYPE_NOT_ALLOWED: 7, // when db type is invlid in options
			DB_CONFIG_INVALID_DATABASE: 8, // when db name is invalid (not a string)

			// DB Driver
			DB_DRIVER_NOT_INSTALLED: 9 // when driver is not installed
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
