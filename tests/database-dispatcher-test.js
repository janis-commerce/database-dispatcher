'use strict';

const assert = require('assert');
const mock = require('mock-require');
const path = require('path');
const DatabaseDispatcher = require('./../index');
const DatabaseDispatcherError = require('./../database-dispatcher/database-dispatcher-error');

/* eslint-disable prefer-arrow-callback */

describe('DatabaseDispatcher', function() {

	const databaseDispatcher = new DatabaseDispatcher();

	const configMock = () => {
		mock(path.join(process.cwd(), 'config', 'database.json'), {
			core: {
				type: 'mysql',
				host: 'foo',
				user: 'root',
				password: 'foobar',
				database: 'my_db',
				port: '1234'
			},

			foo: {
				type: 'mongodb',
				host: 'foo',
				user: 'root',
				password: 'foobar',
				database: 'my_db',
				port: '1234'
			},

			_default: {
				type: 'mysql',
				host: 'foo',
				user: 'root',
				password: 'foobar',
				database: 'my_db',
				port: '1234'
			}
		});
	};

	const badConfigMock = () => {
		mock(path.join(process.cwd(), 'config', 'database.json'), ['foobar']);
	};

	const databaseMock = () => {
		mock(path.join(process.cwd(), 'node_modules', '@janiscommerce/mysql'), './../mocks/database-mock');
		mock(path.join(process.cwd(), 'node_modules', '@janiscommerce/mongodb'), './../mocks/database-mock');
	};

	beforeEach(() => {
		configMock();
		databaseMock();
	});

	afterEach(() => {
		mock.stopAll();
	});

	describe('getters', function() {

		it('should return supported db drivers types object', function() {

			const dbTypes = {
				mysql: '@janiscommerce/mysql',
				mongodb: '@janiscommerce/mongodb'
			};

			assert.deepEqual(DatabaseDispatcher.dbTypes, dbTypes);
		});


		it('should return database config path', function() {

			const configPath = path.join(process.cwd(), 'config', 'database.json');

			assert.deepEqual(DatabaseDispatcher.configPath, configPath);
		});


		it('should return database config object', function() {
			assert.deepEqual(typeof databaseDispatcher.databaseConfig, 'object');
			assert.deepEqual(databaseDispatcher.databaseConfig.core.type, 'mysql');
		});

		it('should throw "Invalid config file" if the config json is not valid or have unexpected datatypes', function() {

			databaseDispatcher.clearCaches();
			mock.stopAll();
			badConfigMock();

			assert.throws(() => {
				databaseDispatcher.databaseConfig();
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.INVALID_CONFIG
			});
		});
	});

	describe('getDBDriver', function() {

		it('should return MySQL module', function() {
			assert.deepEqual(typeof DatabaseDispatcher.getDBDriver({ type: 'mysql' }), 'function');
		});

		it('should return MongoDB module', function() {
			assert.deepEqual(typeof DatabaseDispatcher.getDBDriver({ type: 'mongodb' }), 'function');
		});

		it('should throw "invalid databaseKey" if the database type config is in unexpected format', function() {
			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: ['mysql', 'mongodb'] });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.INVALID_DB_KEY
			});
		});
	});

	describe('getDatabase', function() {

		it('should return database connection (MySQL)', function() {
			assert.deepEqual(databaseDispatcher.getDatabase('core').testMethod(), true);
		});

		it('should return database connection (MongoDB)', function() {
			assert.deepEqual(databaseDispatcher.getDatabase('foo').testMethod(), true);
		});

		it('should return database connection (Default)', function() {
			assert.deepEqual(databaseDispatcher.getDatabase().testMethod(), true);
		});
	});

	describe('caches', function() {

		it('should return all databases connection object', function() {
			assert.deepEqual(typeof databaseDispatcher.databases, 'object');
		});

		it('should return core database connection object', function() {
			assert.deepEqual(databaseDispatcher.databases.core.testMethod(), true);
		});

		it('should return config object', function() {
			assert.deepEqual(typeof databaseDispatcher.config, 'object');
			assert.deepEqual(databaseDispatcher.config.core.type, 'mysql');
		});
	});

	describe('clearCaches', function() {

		it('should delete config and database caches', function() {

			const foo = databaseDispatcher.databaseConfig;
			assert.equal(foo.core.type, 'mysql');

			databaseDispatcher.getDatabase('core');

			databaseDispatcher.clearCaches();

			assert.deepEqual(databaseDispatcher.config, undefined);
			assert.deepEqual(databaseDispatcher.databases, undefined);
		});
	});

	describe('errors', function() {

		it('should throw when the databaseKey is invalid', function() {

			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: 'sarasa' });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.INVALID_DB_KEY
			});
		});

		it('should throw when required db driver package is not installed', function() {

			mock.stopAll();
			configMock();

			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: 'mysql' });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED
			});
		});

		it('should throw when config json file not found', function() {

			databaseDispatcher.clearCaches();
			mock.stopAll();

			assert.throws(() => {
				let foo = databaseDispatcher.databaseConfig; // eslint-disable-line
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.CONFIG_NOT_FOUND
			});
		});
	});
});
