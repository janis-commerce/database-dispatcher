# database-dispatcher

**DatabaseDispatcher** is a package that returns the necessary DB driver from a recieved model. Access to the databases configuration then returns the driver instance with the connection. It caches the connections and configs.

## Installation
```
npm install @janiscommerce/database-dispatcher
```

## API
- `new DatabaseDispatcher()`  
Constructs the database-dispatcher.  
- `databaseConfig()`  
Returns the loaded database config json.  
- `getDatabase( "databaseKey" )`  
Recieves the database key `[String]` then returns the database driver instance with the connection from the config json.  
If the `databaseKey` not exists on the config json will throw a `DatabaseDispatcherError`.  
The default value of `databaseKey` parameter is `"_default"`.  
- `clearCaches()`  
Clear all caches, including configs and DB connections.

## Errors
The errors are informed with a SchemaValidatorError.  
This object has a code that can be useful for a correct error handling.  
The codes are the following:  

| Code | Description         |
|------|---------------------|
| 1    | Config not found    |
| 2    | Invalid databaseKey |

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