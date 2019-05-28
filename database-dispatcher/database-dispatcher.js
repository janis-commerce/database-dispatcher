'use strict';

const path = require('path');

const DatabaseDispatcherError = require('./database-dispatcher-error');

const DB_DRIVERS = {
	mysql: '@janiscommerce/mysql',
	mongodb: '@janiscommerce/mongodb'
};

class DatabaseDispatcher {

	static get dbTypes() {
		return Object.keys(DB_DRIVERS);
	}

	static get configPath() {
		return path.join(process.cwd(), 'database.json');
	}

	get databaseConfig() {

		if(!this.config) {
			try {
				/* eslint-disable global-require, import/no-dynamic-require */
				const config = require(this.constructor.configPath);
				this.config = config;

			} catch(error) {
				throw new DatabaseDispatcherError('Config not found', DatabaseDispatcherError.codes.CONFIG_NOT_FOUND);
			}
		}

		return this.config;
	}

	/**
	 * Evaluates the config object then returns the selected DBDriver
	 * @param {Object} config database config json
	 * @returns DBDriver
	 */
	static getDBDriver(config) {

		if(config && config.type && this.dbTypes.includes(config.type)) {

			try {

				return require(path.join(process.cwd(),'node_modules',DB_DRIVERS[config.type]));

			} catch(error) {

				throw new DatabaseDispatcherError(`Package "${DB_DRIVERS[config.type]}" not installed.\nPlease run: npm install -save ${DB_DRIVERS[config.type]}`,
					DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED);

			}

		} else
			throw new DatabaseDispatcherError('Invalid databaseKey', DatabaseDispatcherError.codes.INVALID_DB_KEY);
	}

	/**
	 * Get a database connection
	 * @param {String} databaseKey databaseKey for configuration
	 * @returns DBDriver instance with connection settings from database config json
	 */
	getDatabase(databaseKey) {

		if(!databaseKey)
			databaseKey = '_default';

		if(!this.databases)
			this.databases = {};

		if(!this.databases[databaseKey]) {

			const config = this.databaseConfig[databaseKey];

			const DBDriver = this.constructor.getDBDriver(config);

			this.databases[databaseKey] = new DBDriver(config);
		}

		return this.databases[databaseKey];
	}

	/**
	 * Clear config json and database connections caches
	 */
	clearCaches() {
		delete this.databases;
		delete this.config;
	}
}

module.exports = DatabaseDispatcher;
