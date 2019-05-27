'use strict';

const assert = require('assert');
const mock = require('mock-require');

const MySQL = require('@janiscommerce/mysql');
const MongoDB = require('@janiscommerce/mongodb');

const DatabaseDispatcher = require('./../index');
const DatabaseDispatcherError = require('./../database-dispatcher/database-dispatcher-error');

/* eslint-disable prefer-arrow-callback */

describe('DatabaseDispatcher', function() {

	const databaseDispatcher = new DatabaseDispatcher();

	const configMock = configPath => {
		mock(configPath, {
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

	describe('getters', function() {

		it('should return db types', function() {

			assert.equal(typeof DatabaseDispatcher.dbTypes, 'object');
		});


		it('should return database config path', function() {

			assert.equal(typeof databaseDispatcher.configPath, 'string');
		});


		it('should return database config object', function() {

			configMock(databaseDispatcher.configPath);

			assert.equal(typeof databaseDispatcher.databaseConfig, 'object');
		});
	});

	describe('getDBDriver', function() {

		it('should return MySQL module', function() {

			assert.equal(DatabaseDispatcher.getDBDriver({ type: 'mysql' }), MySQL);
		});

		it('should return MongoDB module', function() {

			assert.equal(DatabaseDispatcher.getDBDriver({ type: 'mongodb' }), MongoDB);
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

		it('should throw when config json not found', function() {

			mock.stop(databaseDispatcher.configPath);

			assert.throws(() => {
				let foo = databaseDispatcher.databaseConfig; // eslint-disable-line
			}, {
				name: 'DatabaseDispatcherError',
				code: DatabaseDispatcherError.codes.CONFIG_NOT_FOUND
			});
		});
	});
});
