'use strict';

const assert = require('assert');

const DatabaseDispatcher = require('./../index');

const { MySQL, MongoDB } = require('./../database-dispatcher/database');

/* eslint-disable prefer-arrow-callback */

describe('DatabaseDispatcher', function() {

	/*
		afterEach(() => {
			MicroserviceCallMock.restore();
		});
	*/

	describe('getters', function() {

		it('should return db types', function() {
			assert.equal(typeof DatabaseDispatcher.dbTypes, 'object');
		});

		/*
		it('should return database config path', function() {
			assert.equal(DatabaseDispatcher.configPath, path);
		});
		*/

		it('should return database config', function() {

			const config = {
				core: {
					type: 'mysql',
					host: 'foo',
					user: 'foo',
					password: 'foo',
					database: 'foo',
					port: 1234
				},
				solr: {
					url: 'http://foo.com/solr/'
				}
			};

			assert.equal(DatabaseDispatcher.databaseConfig, config);
		});
	});

	describe('getDBDriver', function() {

		it('should return MySQL driver', function() {
			assert.equal(DatabaseDispatcher.getDBDriver(
				{
					type: 'mysql'
				}
			), MySQL);
		});

		it('should return MongoDB driver', function() {
			assert.equal(DatabaseDispatcher.getDBDriver(
				{
					type: 'mongodb'
				}
			), MongoDB);
		});

	});


});
