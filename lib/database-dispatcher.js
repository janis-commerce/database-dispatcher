'use strict';

const path = require('path');
const Settings = require('@janiscommerce/settings');

const DatabaseDispatcherError = require('./database-dispatcher-error');

const DB_DRIVERS = {
	mysql: '@janiscommerce/mysql',
	mongodb: '@janiscommerce/mongodb',
	elasticsearch: '@janiscommerce/elasticsearch'
};

class DatabaseDispatcher {

	static get dbTypes() {
		return DB_DRIVERS;
	}

	static set config(config) {
		this._config = config;
	}

	static get config() {

		if(typeof this._config === 'undefined') {

			const settings = Settings.get('database') || {};

			if(typeof settings !== 'object' || Array.isArray(settings))
				throw new DatabaseDispatcherError('Invalid config file, should be an object', DatabaseDispatcherError.codes.INVALID_SETTINGS);

			this.config = settings;
		}

		return this._config;
	}

	static _getConfigFromEnvVars(key) {

		key = key.toUpperCase();

		const dbConfig = {};

		dbConfig.host = process.env[`DB_${key}_HOST`];
		dbConfig.type = process.env[`DB_${key}_TYPE`];
		dbConfig.database = process.env[`DB_${key}_DATABASE`];

		if(!dbConfig.host || !dbConfig.type || !dbConfig.database)
			return;

		dbConfig.user = process.env[`DB_${key}_USER`];
		dbConfig.password = process.env[`DB_${key}_PASSWORD`];
		dbConfig.port = process.env[`DB_${key}_PORT`];

		return dbConfig;
	}

	static getDatabaseByKey(key = '_default') {

		let dbConfig = this._getConfigFromEnvVars(key);

		if(!dbConfig)
			dbConfig = this.config[key];

		if(!dbConfig) {

			if(Object.keys(this.config).length === 0)
				throw new DatabaseDispatcherError('Config not found', DatabaseDispatcherError.codes.SETTINGS_NOT_FOUND);

			throw new DatabaseDispatcherError(`DB Config not found for '${key}'`, DatabaseDispatcherError.codes.DB_CONFIG_NOT_FOUND);
		}

		return this.getDatabaseByConfig(dbConfig);
	}

	static getDatabaseByConfig(dbConfig) {

		this._validateConfig(dbConfig);

		return this._getDatabaseByConfig(dbConfig);
	}

	static _getDatabaseByConfig(dbConfig) {

		if(!this.databases)
			this.databases = {};

		const cacheKey = `${dbConfig.host}-${dbConfig.database}`;

		if(!this.databases[cacheKey])
			this.databases[cacheKey] = this._getDBDriver(dbConfig);

		return this.databases[cacheKey];
	}

	static _validateConfig(dbConfig) {

		if(typeof dbConfig !== 'object' || Array.isArray(dbConfig))
			throw new DatabaseDispatcherError('DB type setting not found in dbConfig', DatabaseDispatcherError.codes.INVALID_DB_CONFIG);

		if(typeof dbConfig.host !== 'string')
			throw new DatabaseDispatcherError('Invalid DB host in config', DatabaseDispatcherError.codes.DB_CONFIG_INVALID_HOST);

		if(typeof dbConfig.type !== 'string')
			throw new DatabaseDispatcherError('Invalid DB type in config', DatabaseDispatcherError.codes.DB_CONFIG_TYPE_INVALID);

		if(!this.dbTypes[dbConfig.type])
			throw new DatabaseDispatcherError(`DB type '${dbConfig.type}' is not allowed`, DatabaseDispatcherError.codes.DB_CONFIG_TYPE_NOT_ALLOWED);

		if(typeof dbConfig.database !== 'string')
			throw new DatabaseDispatcherError('Invalid DB database in config', DatabaseDispatcherError.codes.DB_CONFIG_INVALID_DATABASE);
	}

	/**
	 * Evaluates the config object then returns the selected DBDriver
	 *
	 * @param {object} database config
	 * @returns DBDriver
	 */
	static _getDBDriver(config) {

		let DBDriver;

		try {
			DBDriver = require(path.join(process.cwd(), 'node_modules', this.dbTypes[config.type])); //eslint-disable-line
		} catch(err) {
			throw new DatabaseDispatcherError(`Package "${this.dbTypes[config.type]}" not installed.\nPlease run: npm install ${this.dbTypes[config.type]}`,
				DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED);
		}

		try {
			return new DBDriver(config);
		} catch(err) {
			throw new DatabaseDispatcherError(`Package "${this.dbTypes[config.type]}" error creating instance`,
				DatabaseDispatcherError.codes.INVALID_DB_DRIVER);
		}
	}

	/**
	 * Clear config json and database connections caches
	 */
	static clearCache() {
		delete this.databases;
		this._config = undefined;
	}
}

module.exports = DatabaseDispatcher;
