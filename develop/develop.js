'use strict';

/* eslint-disable */

const DatabaseDispatcher = require('./../index');


const Dispatcher = new DatabaseDispatcher('core');

const Driver = Dispatcher.getDatabase();

if(Driver.insert)
    console.log('Success!');
else
    console.log('RIP');
