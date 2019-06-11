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
			assert.deepEqual(typeof DatabaseDispatcher.dbTypes, 'object');
		});


		it('should return database config path', function() {
			assert.deepEqual(typeof DatabaseDispatcher.configPath, 'string');
		});


		it('should return database config object', function() {
			assert.deepEqual(typeof databaseDispatcher.databaseConfig, 'object');
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
			assert.deepEqual(typeof databaseDispatcher.getDatabase('core'), 'object');
		});

		it('should return database connection (MongoDB)', function() {
			assert.deepEqual(typeof databaseDispatcher.getDatabase('foo'), 'object');
		});

		it('should return database connection (Default)', function() {
			assert.deepEqual(typeof databaseDispatcher.getDatabase(), 'object');
		});
	});

	describe('caches', function() {

		it('should return all databases connection object', function() {
			assert.deepEqual(typeof databaseDispatcher.databases, 'object');
		});

		it('should return core database connection object', function() {
			assert.deepEqual(typeof databaseDispatcher.databases.core, 'object');
		});

		it('should return config object', function() {
			assert.deepEqual(typeof databaseDispatcher.config, 'object');
		});

		it('should return database connections', function() {

			assert.deepEqual(typeof databaseDispatcher.getDatabase('core'), 'object');
			assert.deepEqual(typeof databaseDispatcher.getDatabase('foo'), 'object');
			assert.deepEqual(typeof databaseDispatcher.getDatabase(), 'object');
		});
	});

	describe('clearCaches', function() {

		it('should delete config and database caches', function() {


			let config = databaseDispatcher.databaseConfig;
			databaseDispatcher.getDatabase('core');

			databaseDispatcher.clearCaches();

			assert.deepEqual(databaseDispatcher.config, undefined);
			assert.deepEqual(databaseDispatcher.databases, undefined);
		});
	});

	describe('errors', function() {

		it('should throw when databaseKey is invalid', function() {

			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: 'sarasa' });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.INVALID_DB_KEY
			});
		});

		it('should throw when db driver package is not installed', function() {

			mock.stopAll();
			configMock();

			assert.throws(() => {
				DatabaseDispatcher.getDBDriver({ type: 'mysql' });
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED
			});
		});

		it('should throw when config json not found', function() {

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
