# database-dispatcher

[![Build Status](https://travis-ci.org/janis-commerce/database-dispatcher.svg?branch=JCN-68-database-dispatcher)](https://travis-ci.org/janis-commerce/database-dispatcher)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/database-dispatcher/badge.svg?branch=JCN-68-database-dispatcher)](https://coveralls.io/github/janis-commerce/database-dispatcher?branch=JCN-68-database-dispatcher)

**DatabaseDispatcher** is a package that returns the necessary DB driver from a received model. Access to the databases configuration then returns the driver instance with the connection. It caches the connections and configs.

## Installation

```sh
npm install @janiscommerce/database-dispatcher

# Then add one of the following:
npm install --save @janiscommerce/mysql
npm install --save @janiscommerce/mongodb
```

## Configs

This package requires a config file: `/path/to/root/config/database.json`  

### Structure

- Root key: the model `databaseKey`  
Includes the driver type and connections settings.  

```json
{
    "databaseKey": {}
}
```

Keys  

- `type [String]`: Database driver type, example `"mysql"`.  
- `host [String]`: Database connection host.  
- `port [Number]`: Database connection port.  
- `user [String]`: Database login user name.  
- `password [String]`: Database login password.  
- `database [String]`: Database name for connection, example `"myDB"`.  
- `connectionLimit [Number]`: Connection limit.  
- `prefix [String]`: Prefix for values.  

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

- `new DatabaseDispatcher()`  
Constructs the database-dispatcher.  
- `databaseConfig`  
Returns the loaded database config json.  
- `getDatabase( "databaseKey" )`  
Receives the database key `[String]` then returns the database driver instance with the connection from the config json.  
If the `databaseKey` not exists on the config json will throw a `DatabaseDispatcherError`.  
The default value of `databaseKey` parameter is `"_default"`.  
- `clearCaches()`  
Clear all caches, including configs and DB connections.

## Errors

The errors are informed with a `DatabaseDispatcherError`.  
This object has a code that can be useful for a correct error handling.  
The codes are the following:  

| Code | Description                   |
|------|-------------------------------|
| 1    | Config not found              |
| 2    | Invalid databaseKey           |
| 3    | Database driver not installed |

## Usage

```js
const DatabaseDispatcher = require('@janiscommerce/database-dispatcher');

const dispatcher = new DatabaseDispatcher();

const DBConfig = dispatcher.databaseConfig;

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

const myDBConnection = dispatcher.getDatabase('core'); // A new DBDriver instance is returned.

let fields = myDBConnection.getFields(model); // should connect to db driver and return the fields...

dispatcher.clearCaches(); // cached connections and configs cleared.
```
