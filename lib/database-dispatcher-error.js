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

			// Client
			INVALID_CLIENT: 5, // when client object is invalid (not an object)

			// DB Driver
			DB_DRIVER_NOT_INSTALLED: 6, // when driver is not installed
			INVALID_DB_DRIVER: 7 // when driver can't create an instance
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
