'use strict';

const assert = require('assert');
const mock = require('mock-require');
const path = require('path');
const DatabaseDispatcher = require('./../index');
const DatabaseDispatcherError = require('./../database-dispatcher/database-dispatcher-error');

/* eslint-disable prefer-arrow-callback */

describe('DatabaseDispatcher', function() {

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

	const badConfigMock = returns => {
		mock(path.join(process.cwd(), 'config', 'database.json'), returns);
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
			assert.deepEqual(typeof DatabaseDispatcher.config, 'object');
			assert.deepEqual(DatabaseDispatcher.config.core.type, 'mysql');
		});
	});

	describe('getDBDriver', function() {

		it('should return MySQL module', function() {
			assert.deepEqual(typeof DatabaseDispatcher.getDBDriver({ type: 'mysql' }), 'function');
		});

		it('should return MongoDB module', function() {
			assert.deepEqual(typeof DatabaseDispatcher.getDBDriver({ type: 'mongodb' }), 'function');
		});
	});

	describe('getDatabase', function() {

		it('should return database connection (MySQL)', function() {
			assert.deepEqual(DatabaseDispatcher.getDatabase('core').testMethod(), true);
		});

		it('should return database connection (MongoDB)', function() {
			assert.deepEqual(DatabaseDispatcher.getDatabase('foo').testMethod(), true);
		});

		it('should return database connection (Default)', function() {
			assert.deepEqual(DatabaseDispatcher.getDatabase().testMethod(), true);
		});
	});

	describe('caches', function() {

		it('should return all databases connection object', function() {
			assert.deepEqual(typeof DatabaseDispatcher._databases, 'object');  // eslint-disable-line
		});

		it('should return core database connection object', function() {
			assert.deepEqual(DatabaseDispatcher._databases.core.testMethod(), true); // eslint-disable-line
		});

		it('should return config object', function() {
			assert.deepEqual(typeof DatabaseDispatcher.config, 'object');
			assert.deepEqual(DatabaseDispatcher.config.core.type, 'mysql');
		});
	});

	describe('clearCaches', function() {

		it('should delete config and database caches', function() {

			const foo = DatabaseDispatcher.config;
			assert.equal(foo.core.type, 'mysql');

			DatabaseDispatcher.getDatabase('core');

			DatabaseDispatcher.clearCaches();

			assert.deepEqual(DatabaseDispatcher._config, undefined); // eslint-disable-line
			assert.deepEqual(DatabaseDispatcher._databases, undefined); // eslint-disable-line
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

		it('should throw when the databaseKey config is invalid', function() {

			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: ['mysql', 'mongodb'] });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.INVALID_DB_TYPE_CONFIG
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

			DatabaseDispatcher.clearCaches();
			mock.stopAll();

			assert.throws(() => {
				return DatabaseDispatcher.config;
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.CONFIG_NOT_FOUND
			});
		});

		it('should throw when config json file is invalid', function() {

			DatabaseDispatcher.clearCaches();
			mock.stopAll();
			badConfigMock(['foobar']);

			assert.throws(() => {
				return DatabaseDispatcher.config;
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.INVALID_CONFIG
			});
		});

		it('should throw when db type setting not found in config', function() {

			DatabaseDispatcher.clearCaches();
			mock.stopAll();
			badConfigMock({
				core: { sarasa: 'sarasa' }
			});

			const foo = DatabaseDispatcher.config;

			assert.throws(() => {
				DatabaseDispatcher._validateConfig(foo); // eslint-disable-line
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.CONFIG_DB_TYPE_NOT_FOUND
			});

		});
	});
});
