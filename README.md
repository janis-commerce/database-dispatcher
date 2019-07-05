# database-dispatcher

[![Build Status](https://travis-ci.org/janis-commerce/database-dispatcher.svg?branch=master)](https://travis-ci.org/janis-commerce/database-dispatcher)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/database-dispatcher/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/database-dispatcher?branch=master)

**DatabaseDispatcher** is a package that returns the necessary DB driver from a received model.
Access to the databases configuration then returns the driver instance with the connection.
It caches the driver per host.

## Installation

```sh
npm install @janiscommerce/database-dispatcher

# Then install all the drivers that you need.
npm install --save @janiscommerce/mysql
npm install --save @janiscommerce/mongodb
```

## Settings
The package allows you to have 2 sources for configs.

### Config file with Settings Package
1. Using [Settings](https://www.npmjs.com/package/@janiscommerce/settings), with settings in JSON file `/path/to/root/.janiscommercerc.json` into the key `database`:

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
		}
	}
}
```

*Keys*

- `type [String]` (required): Database driver type, example `"mysql"`.
- `host [String]` (required): Database connection host.
- `database [String]` (required): Database name for connection, example `"myDB"`.
- `user [String]` (optional): Database login user name.
- `password [String]` (optional): Database login password.
- `port [Number]` (optional): Database connection port.

### Environment Variables
You can easly have the connection configs in environment variables using the followin structure.

#### Structure
Allows multiple DB connections having a group of varaibles per connection replacing `[KEY]` for your database identification.

```
DB_[KEY]_HOST
DB_[KEY]_TYPE
DB_[KEY]_DATABASE
DB_[KEY]_USER
DB_[KEY]_PASSWORD
DB_[KEY]_PORT
```

#### Required fields
* HOST
* TYPE
* DATABASE

#### Example
```bash
DB_CORE_HOST = "http://my-host.com";
DB_CORE_TYPE = "mysql";
DB_CORE_DATABASE = "my-mysql-db-name";
DB_CORE_USER = "me";
DB_CORE_PASSWORD = "sosecure123";

DB_SERVICE_HOST = "http://my-service-host.com";
DB_SERVICE_TYPE = "mongodb";
DB_SERVICE_DATABASE = "my-mongo-db-name";
DB_SERVICE_USER = "me";
DB_SERVICE_PASSWORD = "evenmoresecure123";
```

## API

* **getDatabaseByKey(databaseKey)**
Receives the database key `[String]` and returns the database driver instance associeted to a config.
If the `databaseKey` dosen't exists in any config source will throw a `DatabaseDispatcherError`.
The default value of `databaseKey` parameter is `"_default"`.

* **getDatabaseByConfig(config)**
Receives the config `[Object]` and returns the database driver instance.

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
| 5    | Invalid host                                         |
| 6    | DB Type (driver) not found or invalid                |
| 7    | Type not allowed (driver)                            |
| 8    | Database name not found or invalid                   |
| 9    | DB Driver not installed                              |
| 10   | Invalid DB Driver (not a valid Class)                |

## Usage

```js
const DatabaseDispatcher = require('@janiscommerce/database-dispatcher');

/*
	/path/to/database.json
    core: {
        type: 'mysql',
        host: 'foo',
        ...
    }
*/

const myDBConnection = DatabaseDispatcher.getDatabaseByKey('core'); // A new DBDriver instance is returned.

console.log(myDBConnection); // expected output: DBDriver see @janiscommerce/mysql and @janiscommerce/mongodb

DatabaseDispatcher.clearCache(); // cached connections and configs cleared.
```
