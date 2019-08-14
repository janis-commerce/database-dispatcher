'use strict';

const assert = require('assert');
const mock = require('mock-require');
const path = require('path');

const Settings = require('@janiscommerce/settings');

const sandbox = require('sinon').createSandbox();

const DatabaseDispatcher = require('./../index');
const DatabaseDispatcherError = require('./../lib/database-dispatcher-error');

/* eslint-disable prefer-arrow-callback */

describe('DatabaseDispatcher', function() {

	const envVars = {};

	const setEnvVar = (key, value) => {
		envVars[key] = value;
		process.env[key] = value;
	};

	const cleanEnvVars = () => {
		Object.keys(envVars).forEach(key => {
			delete process.env[key];
		});
	};

	afterEach(() => {
		cleanEnvVars();
		mock.stopAll();
		DatabaseDispatcher.clearCache();
		sandbox.restore();
	});

	class DBDriverMock {
		constructor(config = {}) {
			this.config = {
				host: config.host,
				user: config.user,
				password: config.password,
				database: config.database || null,
				port: config.port
			};
		}
	}

	const databaseMock = dbDriverMock => {
		mock(path.join(process.cwd(), 'node_modules', '@janiscommerce/mysql'), dbDriverMock || DBDriverMock);
		mock(path.join(process.cwd(), 'node_modules', '@janiscommerce/mongodb'), dbDriverMock || DBDriverMock);
		mock(path.join(process.cwd(), 'node_modules', '@janiscommerce/elasticsearch'), dbDriverMock || DBDriverMock);
	};

	const mockConfig = dbConfig => sandbox.stub(Settings, 'get').returns(dbConfig);

	const validConfig = {
		foo: {
			type: 'mongodb',
			host: 'foo',
			user: 'root',
			password: 'foobar',
			database: 'my_db',
			port: '1234'
		},

		bar: {
			type: 'elasticsearch',
			host: 'foo',
			user: 'root',
			password: 'foobar',
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
	};

	const assertThrows = (errorCode, dbKey = 'foo') => {
		assert.throws(() => DatabaseDispatcher.getDatabaseByKey(dbKey), {
			name: 'DatabaseDispatcherError',
			code: errorCode
		});
	};

	context('when no Settings for database', function() {

		context('when incomplete ENV vars setted and no Settings found for key', function() {

			const test = () => assertThrows(DatabaseDispatcherError.codes.SETTINGS_NOT_FOUND);

			it('should reject if all vars are missing', function() {
				test();
			});

			it('should reject if host is missing', function() {

				setEnvVar('DB_FOO_TYPE', 'mysql');
				setEnvVar('DB_FOO_DATABASE', 'db-name');

				test();
			});

			it('should reject if type is missing', function() {

				setEnvVar('DB_FOO_HOST', 'http://my-host.com');
				setEnvVar('DB_FOO_DATABASE', 'db-name');

				test();
			});

			it('should reject if database is missing', function() {

				setEnvVar('DB_FOO_HOST', 'http://my-host.com');
				setEnvVar('DB_FOO_TYPE', 'mysql');

				test();
			});
		});

		context('when ENV vars for key are setted', function() {

			it('should reject if type is not allowed', function() {

				setEnvVar('DB_FOO_HOST', 'my-host');
				setEnvVar('DB_FOO_TYPE', 'unknown-type');
				setEnvVar('DB_FOO_DATABASE', 'db-name');

				assertThrows(DatabaseDispatcherError.codes.DB_CONFIG_TYPE_NOT_ALLOWED);
			});

			it('should if driver is not installed', function() {

				setEnvVar('DB_FOO_HOST', 'my-host');
				setEnvVar('DB_FOO_TYPE', 'mysql');
				setEnvVar('DB_FOO_DATABASE', 'db-name');

				assertThrows(DatabaseDispatcherError.codes.DB_DRIVER_NOT_INSTALLED);
			});

			it('should return a driver class if is installed', function() {

				setEnvVar('DB_FOO_HOST', 'my-host');
				setEnvVar('DB_FOO_TYPE', 'mysql');
				setEnvVar('DB_FOO_DATABASE', 'db-name');

				databaseMock();

				let dbDriver;

				assert.doesNotThrow(() => {
					dbDriver = DatabaseDispatcher.getDatabaseByKey('foo');
				});

				assert(dbDriver instanceof DBDriverMock);
			});

			it('should return the cached driver instance on successive calls', function() {

				sandbox.spy(DatabaseDispatcher, '_getDBDriver');

				setEnvVar('DB_FOO_HOST', 'my-host');
				setEnvVar('DB_FOO_TYPE', 'mysql');
				setEnvVar('DB_FOO_DATABASE', 'db-name');

				databaseMock();

				let DBDriver;
				let SameDBDriver;

				assert.doesNotThrow(() => {
					DBDriver = DatabaseDispatcher.getDatabaseByKey('foo');
					SameDBDriver = DatabaseDispatcher.getDatabaseByKey('foo');
				});

				sandbox.assert.calledOnce(DatabaseDispatcher._getDBDriver); // eslint-disable-line
				sandbox.assert.calledWithExactly(DatabaseDispatcher._getDBDriver, { // eslint-disable-line
					host: 'my-host',
					type: 'mysql',
					database: 'db-name',
					user: undefined,
					password: undefined,
					port: undefined
				});

				assert.deepEqual(DBDriver, SameDBDriver);
			});
		});
	});

	context('when invalid Settings setted', function() {

		it('should reject', function() {

			mockConfig(['foo']);

			assertThrows(DatabaseDispatcherError.codes.INVALID_SETTINGS);
		});
	});

	context('when valid Settings setted', function() {

		it('should reject when database config not found for that key', function() {

			mockConfig(validConfig);

			assertThrows(DatabaseDispatcherError.codes.DB_CONFIG_NOT_FOUND, 'unknown-database-key');
		});

		it('should reject when database config miss the host', function() {

			['foo', 1, true, ['foo', 'bar']].forEach(invalidConfig => {

				mockConfig({
					'database-invalid-config': invalidConfig
				});

				assertThrows(DatabaseDispatcherError.codes.INVALID_DB_CONFIG, 'database-invalid-config');

				Settings.get.restore();

				DatabaseDispatcher.clearCache();
			});
		});

		it('should reject when database config miss the host', function() {

			mockConfig({
				'database-no-host': {}
			});

			assertThrows(DatabaseDispatcherError.codes.DB_CONFIG_INVALID_HOST, 'database-no-host');
		});

		it('should reject when database config miss the type', function() {

			mockConfig({
				'database-no-type': {
					host: 'my-host',
					database: 'db-name'
				}
			});

			assertThrows(DatabaseDispatcherError.codes.DB_CONFIG_TYPE_INVALID, 'database-no-type');
		});

		it('should reject when database config have a not allowed type', function() {

			mockConfig({
				'database-not-allowed-type': {
					host: 'my-host',
					type: 'not-allowed-type',
					database: 'db-name'
				}
			});

			assertThrows(DatabaseDispatcherError.codes.DB_CONFIG_TYPE_NOT_ALLOWED, 'database-not-allowed-type');
		});

		it('should reject when database config miss the database', function() {

			mockConfig({
				'database-no-database': {
					host: 'my-host',
					type: 'mysql'
				}
			});

			assertThrows(DatabaseDispatcherError.codes.DB_CONFIG_INVALID_DATABASE, 'database-no-database');
		});

		it('should reject when DBDriver is not a constructor', function() {

			mockConfig({
				'my-database': {
					host: 'my-host',
					type: 'mysql',
					database: 'db-name'
				}
			});

			databaseMock(['invalid driver']);

			assertThrows(DatabaseDispatcherError.codes.INVALID_DB_DRIVER, 'my-database');
		});

		it('should return a driver instance if is installed', function() {

			mockConfig({
				'my-database': {
					host: 'my-host',
					type: 'mysql',
					database: 'db-name'
				}
			});

			databaseMock();

			let dbDriver;

			assert.doesNotThrow(() => {
				dbDriver = DatabaseDispatcher.getDatabaseByKey('my-database');
			});

			assert(dbDriver.constructor.name === 'DBDriverMock');
		});

		it('should return a driver instance if is installed using _default key', function() {

			mockConfig({
				_default: {
					host: 'my-host',
					type: 'mysql',
					database: 'db-name'
				}
			});

			databaseMock();

			let dbDriver;

			assert.doesNotThrow(() => {
				dbDriver = DatabaseDispatcher.getDatabaseByKey();
			});

			assert(dbDriver.constructor.name === 'DBDriverMock');
		});

	});

});
