'use strict';

const path = require('path');

/* const codependency = require('codependency');

const requirePeer = codependency.register(module, { strictCheck: false }); */

const MySQL = require('@janiscommerce/mysql');
const MongoDB = require('@janiscommerce/mongodb');

const DatabaseDispatcherError = require('./database-dispatcher-error');

const DB_TYPES = ['mysql', 'mongodb'];

class DatabaseDispatcher {

	static get dbTypes() {
		return DB_TYPES;
	}

	static get configPath() {
		return path.join(process.cwd(), 'database.json');
	}

	static get databaseConfig() {

		try {
			/* eslint-disable global-require, import/no-dynamic-require */
			const config = require(this.configPath);
			return config;
		} catch(error) {
			throw new DatabaseDispatcherError('Config not found', DatabaseDispatcherError.codes.CONFIG_NOT_FOUND);
		}
	}

	/**
	 * Evaluates the config object then returns the selected DBDriver
	 * @param {Object} config database config json
	 * @returns DBDriver
	 */
	static getDBDriver(config) {

		const type = config.type && this.dbTypes.includes(config.type) ? config.type : 'mysql';

		switch(type) {
			case 'mongodb':
				return MongoDB;
				// return requirePeer('@janiscommerce/mongodb');
			default:
				return MySQL;
				// return requirePeer('@janiscommerce/mysql;
		}
	}

	constructor(databaseKey) {
		this.databaseKey = !databaseKey ? '_default' : databaseKey;
	}

	/**
	 * Get database with correct driver and configuratios
	 * @returns DBDriver instance with connection settings from database config json
	 */
	getDatabase() {

		const config = this.constructor.databaseConfig[this.databaseKey];

		const DBDriver = this.constructor.getDBDriver(config);

		return new DBDriver(config);
	}
}

module.exports = DatabaseDispatcher;
