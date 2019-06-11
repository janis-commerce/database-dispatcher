'use strict';

const path = require('path');

const DatabaseDispatcherError = require('./database-dispatcher-error');

const DB_DRIVERS = {
	mysql: '@janiscommerce/mysql',
	mongodb: '@janiscommerce/mongodb'
};

class DatabaseDispatcher {

	static get dbTypes() {
		return DB_DRIVERS;
	}

	static get configPath() {
		return path.join(process.cwd(), 'config', 'database.json');
	}

	get databaseConfig() {

		if(!this.config) {
			try {
				const config = require(this.constructor.configPath); // eslint-disable-line
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

		if(!config || !this.dbTypes[config.type])
			throw new DatabaseDispatcherError('Invalid databaseKey', DatabaseDispatcherError.codes.INVALID_DB_KEY);

		try {

			return require(path.join(process.cwd(), 'node_modules', this.dbTypes[config.type])); //eslint-disable-line

		} catch(error) {
			throw new DatabaseDispatcherError(`Package "${this.dbTypes[config.type]}" not installed.\nPlease run: npm install ${this.dbTypes[config.type]}`,
				DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED);
		}
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
