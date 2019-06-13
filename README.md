# database-dispatcher

[![Build Status](https://travis-ci.org/janis-commerce/database-dispatcher.svg?branch=master)](https://travis-ci.org/janis-commerce/database-dispatcher)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/database-dispatcher/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/database-dispatcher?branch=master)

**DatabaseDispatcher** is a package that returns the necessary DB driver from a received model. Access to the databases configuration then returns the driver instance with the connection. It caches the connections and configs.

## Installation

```sh
npm install @janiscommerce/database-dispatcher

# Then install all the drivers that you need.
npm install --save @janiscommerce/mysql
npm install --save @janiscommerce/mongodb
```

## Configs

This package requires a config file: `/path/to/root/config/database.json`

### Structure

- Root key: the model `databaseKey`
Includes the driver type and connections settings.

```js
{
    "databaseKey": {
        "type": "mysql"
        // ...
    }
}
```

Keys

- `type [String]` (required): Database driver type, example `"mysql"`.
- `host [String]` (required): Database connection host.
- `port [Number]` (required): Database connection port.
- `user [String]` (optional): Database login user name.
- `password [String]` (optional): Database login password.
- `database [String]` (required): Database name for connection, example `"myDB"`.
- `connectionLimit [Number]` (optional): Connection limit.
- `prefix [String]` (optional): Prefix for values.

### Example

```json
{
    "core": {
        "type": "mysql",
        "host": "localhost",
        "user": "root",
        "database": "myDB",
        "port": 3306
    },
    "services": {
        "type": "mongodb",
        "host": "mongodb://localhost",
        "user": "sarasa",
        "password": "foobar",
        "database": "myDB",
        "port": 27017
    }
}
```

## API

- `config`
Returns the loaded database config json.
- `getDatabase("databaseKey")`
Receives the database key `[String]` then returns the database driver instance with the connection from the config json.
If the `databaseKey` not exists on the config json will throw a `DatabaseDispatcherError`.
The default value of `databaseKey` parameter is `"_default"`.
- `clearCaches()`
Clear all caches, including configs and DB connections.

## Errors

The errors are informed with a `DatabaseDispatcherError`.
This object has a code that can be useful for a correct error handling.
The codes are the following:

| Code | Description                        |
|------|------------------------------------|
| 1    | Config not found                   |
| 2    | Invalid databaseKey                |
| 3    | Database driver not installed      |
| 4    | Invald config                      |
| 5    | Invalid db type in config          |
| 6    | DB type setting not found in config|

## Usage

```js
const DatabaseDispatcher = require('@janiscommerce/database-dispatcher');

const DBConfig = DatabaseDispatcher.config;

/*
    core: {
        type: 'mysql',
        host: 'foo',
        ...
    },
    services: {
        type: 'mongodb',
        host: 'foo',
        ...
    }
*/

const myDBConnection = DatabaseDispatcher.getDatabase('core'); // A new DBDriver instance is returned.

let fields = myDBConnection.get(model, { item: 'sarasa' }); // should connect to db driver and return the items...

DatabaseDispatcher.clearCaches(); // cached connections and configs cleared.
```
