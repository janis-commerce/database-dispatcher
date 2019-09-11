# database-dispatcher

[![Build Status](https://travis-ci.org/janis-commerce/database-dispatcher.svg?branch=master)](https://travis-ci.org/janis-commerce/database-dispatcher)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/database-dispatcher/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/database-dispatcher?branch=master)

**DatabaseDispatcher** is a package that returns the necessary DB driver from a received model.
Access to the databases configuration then returns the driver instance with the connection.
It caches the driver per config properties.

## Installation

```sh
npm install @janiscommerce/database-dispatcher

# Then install all the drivers that you need.
npm install --save @janiscommerce/mysql
npm install --save @janiscommerce/mongodb
npm install --save @janiscommerce/elasticsearch
# or any other DBDriver if it's exists
```

## Settings

Config file with [Settings package](https://www.npmjs.com/package/@janiscommerce/settings), with settings in JSON file `/path/to/root/.janiscommercerc.json` into the key `database`, `clients`, `databaseWriteType`, `databaseReadType`:

```json
{
	"database": {
		"core": {
			"type": "mysql",
			"host": "http://my-host-name.com",
			"database": "my-database"
			// ...
		},
		"other": {
			"type": "mongodb",
			"host": "http://other-host-name.com",
			"database": "my-database"
			// ...
		},
		"another": {
			"type": "elasticsearch",
			"host": "http://another-host-name.com",
			// ...
		}
	},
	"databaseWriteType": "mongodb",
	"databaseReadType": "mysql",
	"clients": {
		"database": {
			"fields": {
				"write": {
					"dbHost": "host",
					"database": "collection"
				},
				"read": {
					"url": "host",
					"dbDatabase": "database"
				}
			}
		}
	}
}
```

### Database Settings

- *Keys* validations depends on the *DBDriver*.
- `type`: if it's not exist, `databaseWriteType` will be use as *default*.

### Client Settings

To assign Read and Write types of DBDrivers.

- `databaseWriteType`: **Required**, Type of Write Database. It's the *default* DBDriver for every database.
- `databaseReadType`: *Optional*, Type of Read Database.

#### Mapped Aliases of Clients Objects

- `clients.database.fields.write`: For Write DB
- `clients.database.fields.read`: For Read DB

#### Structure:
- `key`: Field present in *Client object*
- `value`: Field needed in *DBDriver*

#### Example

In `.janiscommercerc.json`
```json
{
	"clients": {
		"database": {
			"fields": {
				"write": {
					"url": "host",
					"index": "database"
				}
			}
		}
	},
	"databaseWriteType": "elasticsearch"
}
```

Client Object getted from Client DB

```js
client = {
	id: '123'
	name: 'Company',
	url: 'http://company-host-name.com',
	index: 'company.index'
}
```

Config will be

```js
config = {
	host: 'http://company-host-name.com',
	databse: 'company.index'
}

```

## API

* **getDatabaseByKey(databaseKey)**
Receives the *database key* `[String]` and returns the database driver instance associeted to a config.
If the `databaseKey` dosen't exists in any config source will throw a `DatabaseDispatcherError`.
The default value of `databaseKey` parameter is `"_default"`.

* **getDatabaseByConfig(config)**
Receives the *config* `[Object]` and returns the database driver instance.

* **getDatabaseByClient(clientObject, useReadDB)**
Receives the *client object* `[Object]` and returns the database driver instance associeted to a config.
If `useReadDB` (`[Boolean]`) doesn't exists or it's `FALSE` will try to get *Write DBDriver Type* by default, if it's `TRUE` will try to get *Read DBDriver Type*.
If the `databaseReadType` doesn't exists will use `databaseWriteType`.
If the `databaseWriteType` doesn't exists will be throw a `DatabaseDispatcherError`.

* **clearCache()**
Clear the internal cache, including config and DB connections.

## Errors

The errors are informed with a `DatabaseDispatcherError`.
This object has a code that can be useful for a correct error handling.
The codes are the following:

| Code | Description                                          |
|------|------------------------------------------------------|
| 1    | Settings not found                                   |
| 2    | Invalid settings                                     |
| 3    | ConfigDB not found for databaseKey in Settings       |
| 4    | Invald ConfigDB found in Settings for a databaseKey  |
| 5    | Invalid Client Object                                |
| 6    | DB Driver not installed                              |
| 7    | Invalid DB Driver (not a valid Class)                |

## Usage

```js
const DatabaseDispatcher = require('@janiscommerce/database-dispatcher');

/*
	/path/to/.jannsicommercerc.json
    database: {
		core: {
        	type: 'mysql',
        	host: 'foo',
        	...
		},
		...
	},
	databaseWriteType: 'mongodb',
	databaseReadType: 'elasticsearch',
	clients: {
		database: {
			fields: {
				write: {
					dbHost: 'host'
				},
				read: {
					url: 'host',
					index: 'database'
				}
			}
		}
	},
	...
*/

// Get by Key
const myDBConnection = DatabaseDispatcher.getDatabaseByKey('core'); // A new DBDriver instance is returned.

console.log(myDBConnection); // expected output: DBDriver


// Get Write DB by Client
const client = model.getClientById('123') // Or Any method you use to get client's objects

const myDBWriteConnection = DatabaseDispatcher.getDatabaseByClient(client); // A new DBDriver instance is returned.

console.log(myDBWriteConnection.constructor.name); // expected output: MongoDB


// Get Read DB by Client
const otherClient = model.getClientById('1234') // Or Any method you use to get client's objects

const myDBWriteConnection = DatabaseDispatcher.getDatabaseByClient(otherClient, true); // A new DBDriver instance is returned.

console.log(myDBWriteConnection.constructor.name); // expected output: ElasticSearch

DatabaseDispatcher.clearCache(); // cached connections and configs cleared.
```
