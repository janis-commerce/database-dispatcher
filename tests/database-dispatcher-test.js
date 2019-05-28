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
		mock(path.join(process.cwd(), 'database.json'), {
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

	const databaseMock = () => {
		mock(path.join(process.cwd(), 'node_modules', '@janiscommerce/mysql'), './../mocks/database-mock');
		mock(path.join(process.cwd(), 'node_modules', '@janiscommerce/mongodb'), './../mocks/database-mock');
	};

	beforeEach(() => {
		configMock();
		databaseMock();
	});

	describe('getters', function() {

		it('should return db types', function() {

			assert.equal(typeof DatabaseDispatcher.dbTypes, 'object');

		});


		it('should return database config path', function() {

			assert.equal(typeof DatabaseDispatcher.configPath, 'string');

		});


		it('should return database config object', function() {

			assert.equal(typeof databaseDispatcher.databaseConfig, 'object');

		});
	});

	describe('getDBDriver', function() {

		it('should return MySQL module', function() {

			assert.equal(typeof DatabaseDispatcher.getDBDriver({ type: 'mysql' }), 'function');
		});

		it('should return MongoDB module', function() {

			assert.equal(typeof DatabaseDispatcher.getDBDriver({ type: 'mongodb' }), 'function');
		});
	});

	describe('getDatabase', function() {

		it('should return database connection (MySQL)', function() {
			assert.equal(typeof databaseDispatcher.getDatabase('core'), 'object');
		});

		it('should return database connection (MongoDB)', function() {
			assert.equal(typeof databaseDispatcher.getDatabase('foo'), 'object');
		});

		it('should return database connection (Default)', function() {
			assert.equal(typeof databaseDispatcher.getDatabase(), 'object');
		});
	});

	describe('caches', function() {

		it('should return all databases connection object', function() {
			assert.equal(typeof databaseDispatcher.databases, 'object');
		});

		it('should return core database connection object', function() {
			assert.equal(typeof databaseDispatcher.databases.core, 'object');
		});

		it('should return config object', function() {
			assert.equal(typeof databaseDispatcher.config, 'object');
		});

		it('should return database connections', function() {

			assert.equal(typeof databaseDispatcher.getDatabase('core'), 'object');
			assert.equal(typeof databaseDispatcher.getDatabase('foo'), 'object');
			assert.equal(typeof databaseDispatcher.getDatabase(), 'object');
		});
	});

	describe('clearCaches', function() {

		it('should delete config and database caches', function() {

			databaseDispatcher.clearCaches();

			assert.equal(databaseDispatcher.config, undefined);
			assert.equal(databaseDispatcher.databases, undefined);
		});
	});

	describe('errors', function() {

		it('should throw when databaseKey is invalid', function() {
			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: 'foo' });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.INVALID_DB_KEY
			});
		});

		it('should throw when db driver package is not installed', function() {

			mock.stopAll();

			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: 'mysql' });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED
			});

		});

		it('should throw when config json not found', function() {

			mock.stopAll();
			databaseDispatcher.clearCaches();

			assert.throws(() => {
				let foo = databaseDispatcher.databaseConfig; // eslint-disable-line
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.CONFIG_NOT_FOUND
			});
		});
	});
});
