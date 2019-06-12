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

	static get config() {

		if(!this._config)
			this._setConfig();

		return this._config;
	}

	static set config(config) {
		this._config = config;
	}

	static _setConfig() {

		let config;

		try {
			config = require(this.configPath); // eslint-disable-line
		} catch(error) {
			throw new DatabaseDispatcherError('Config not found', DatabaseDispatcherError.codes.CONFIG_NOT_FOUND);
		}

		if(typeof config !== 'object' || Array.isArray(config))
			throw new DatabaseDispatcherError('Invalid config', DatabaseDispatcherError.codes.INVALID_CONFIG);

		this.config = config;
	}

	static _validateConfig(config) {
		if(!(config && config.type))
			throw new DatabaseDispatcherError('DB type setting not found in config', DatabaseDispatcherError.codes.CONFIG_DB_TYPE_NOT_FOUND);

		if(typeof config.type !== 'string')
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
	static getDatabase(databaseKey) {

		if(!databaseKey)
			databaseKey = '_default';

		if(!this._databases)
			this._databases = {};

		if(!this._databases[databaseKey]) {

			const config = this.config[databaseKey];

			const DBDriver = this.getDBDriver(config);

			this._databases[databaseKey] = new DBDriver(config);
		}

		return this._databases[databaseKey];
	}

	/**
	 * Clear config json and database connections caches
	 */
	static clearCaches() {
		delete this._databases;
		delete this._config;
	}
}

module.exports = DatabaseDispatcher;
