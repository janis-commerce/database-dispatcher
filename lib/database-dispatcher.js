'use strict';

const path = require('path');
const Settings = require('@janiscommerce/settings');
const md5 = require('md5');

const DatabaseDispatcherError = require('./database-dispatcher-error');

const JANISCOMMERCE_SCOPE = '@janiscommerce';

class DatabaseDispatcher {

	static get scope() {
		return JANISCOMMERCE_SCOPE;
	}

	static set config(config) {
		this._config = config;
	}

	static set clientConfig(config) {
		this._clientConfig = config;
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

	static get clientConfig() {

		if(typeof this._clientConfig === 'undefined') {

			const settings = Settings.get('clients');

			if(!settings || !settings.database || typeof settings.database.fields !== 'object' || Array.isArray(settings.database.fields))
				throw new DatabaseDispatcherError('Invalid client config file', DatabaseDispatcherError.codes.INVALID_SETTINGS);

			this.clientConfig = settings.database.fields;
		}

		return this._clientConfig;
	}

	static get databaseWriteType() {

		if(typeof this._databaseWriteType === 'undefined') {

			const settings = Settings.get('databaseWriteType');

			if(typeof settings !== 'string')
				throw new DatabaseDispatcherError('Invalid DB type in config', DatabaseDispatcherError.codes.DB_CONFIG_TYPE_INVALID);

			this._databaseWriteType = settings;
		}

		return this._databaseWriteType;
	}

	static get databaseReadType() {

		if(typeof this._databaseReadType === 'undefined') {

			const settings = Settings.get('databaseReadType');
			this._databaseReadType = settings;
		}

		return this._databaseReadType;
	}

	static getDatabaseByKey(key = '_default') {

		const dbConfig = this.config[key];

		if(!dbConfig) {

			if(Object.keys(this.config).length === 0)
				throw new DatabaseDispatcherError('Config not found', DatabaseDispatcherError.codes.SETTINGS_NOT_FOUND);

			throw new DatabaseDispatcherError(`DB Config not found for '${key}'`, DatabaseDispatcherError.codes.DB_CONFIG_NOT_FOUND);
		}

		return this.getDatabaseByConfig(dbConfig);
	}

	static getDatabaseByConfig(dbConfig) {

		if(typeof dbConfig !== 'object' || Array.isArray(dbConfig))
			throw new DatabaseDispatcherError('DB type setting not found in dbConfig', DatabaseDispatcherError.codes.INVALID_DB_CONFIG);

		dbConfig.type = dbConfig.type || this.databaseWriteType;

		return this._getDatabaseFromCache(dbConfig);
	}

	static _getDatabaseFromCache(dbConfig) {

		if(!this.databases)
			this.databases = {};

		const cacheKey = md5(JSON.stringify(dbConfig));

		if(!this.databases[cacheKey])
			this.databases[cacheKey] = this._getDBDriver(dbConfig);

		return this.databases[cacheKey];
	}

	/**
	 * Get Client Database
	 * @param {object} client Client Object
	 * @param {boolean} userReadDB If It's Read or Write Database
	 */
	static getDatabaseByClient(client, userReadDB) {

		if(typeof client !== 'object' || Array.isArray(client))
			throw new DatabaseDispatcherError('DB type setting not found in dbConfig', DatabaseDispatcherError.codes.INVALID_DB_CONFIG);

		const config = this._configMapper(client, userReadDB);

		config.type = !userReadDB ? this.databaseWriteType : this.databaseReadType || this.databaseWriteType;

		return this._getDatabaseFromCache(config);

	}

	static _configMapper(client, userReadDB) {

		const config = {};

		const configMap = !userReadDB ? this.clientConfig.write : this.clientConfig.read || this.clientConfig.write;

		if(typeof configMap !== 'object' || Array.isArray(configMap))
			throw new DatabaseDispatcherError('Config not found', DatabaseDispatcherError.codes.DB_CONFIG_NOT_FOUND);

		for(const [clientField, driverField] of Object.entries(configMap)) {
			if(client[clientField] !== undefined)
				config[driverField] = client[clientField];
		}

		if(!Object.keys(config).length)
			throw new DatabaseDispatcherError('Invalid client config, empty', DatabaseDispatcherError.codes.INVALID_SETTINGS);

		return config;
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
			DBDriver = require(path.join(process.cwd(), 'node_modules', this.scope , config.type)); //eslint-disable-line
		} catch(err) {
			throw new DatabaseDispatcherError(
				`Package "${config.type}" not installed or not exists`,
				DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED);
		}

		try {
			return new DBDriver(config);
		} catch(err) {
			throw new DatabaseDispatcherError(`Package "${config.type}" error creating instance`,
				DatabaseDispatcherError.codes.INVALID_DB_DRIVER);
		}
	}

	/**
	 * Clear config json and database connections caches
	 */
	static clearCache() {
		delete this.databases;
		this._config = undefined;
		this._clientConfig = undefined;
	}
}

module.exports = DatabaseDispatcher;
