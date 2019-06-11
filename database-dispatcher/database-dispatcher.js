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

	get getConfig() {

		if(!this.constructor.config)
			this.constructor.setConfig();

		return this.constructor.config;
	}

	static setConfig() {

		try {
			this.config = require(this.configPath); // eslint-disable-line
		} catch(error) {
			throw new DatabaseDispatcherError('Config not found', DatabaseDispatcherError.codes.CONFIG_NOT_FOUND);
		}

		if(typeof this.config !== 'object' || Array.isArray(this.config))
			throw new DatabaseDispatcherError('Invalid config', DatabaseDispatcherError.codes.INVALID_CONFIG);
	}

	static _validateConfig(config) {
		if(!(config && config.type && typeof config.type === 'string'))
			throw new DatabaseDispatcherError('Invalid db type in config', DatabaseDispatcherError.codes.INVALID_DB_TYPE_CONFIG);

		if(!this.dbTypes[config.type])
			throw new DatabaseDispatcherError('Invalid databaseKey', DatabaseDispatcherError.codes.INVALID_DB_KEY);
	}

	/**
	 * Evaluates the config object then returns the selected DBDriver
	 * @param {Object} config database config json
	 * @returns DBDriver
	 */
	static getDBDriver(config) {

		this._validateConfig(config);

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

		if(!this.constructor.databases)
			this.constructor.databases = {};

		if(!this.constructor.databases[databaseKey]) {

			const config = this.getConfig[databaseKey];

			const DBDriver = this.constructor.getDBDriver(config);

			this.constructor.databases[databaseKey] = new DBDriver(config);
		}

		return this.constructor.databases[databaseKey];
	}

	/**
	 * Clear config json and database connections caches
	 */
	clearCaches() {
		delete this.constructor.databases;
		delete this.constructor.config;
	}
}

module.exports = DatabaseDispatcher;
