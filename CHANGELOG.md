# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- `getDatabaseByClient()` method to return database instance from a client object

### Changed
- Settings to mapp aliases from client object
- Settings to have a default database, `databaseWriteType`
- Caché now stores by config properties

### Deprecated  
- `ENV` vars configs

### Removed
- Database Validation for `host`, `port`, `database`
- DBDrivers support limitation

## [1.4.0] - 2019-08-21
### Added
- `elasticsearch` DBDriver support

### Changed
- Database is now required or optional per DB Type

## [1.3.3] - 2019-07-17
### Fixed
- Updated Settings package to use correct settings path

## [1.3.2] - 2019-07-15
### Fixed
- Fixed cacheKey for database connections

## [1.3.1] - 2019-07-05
### Fixed
- `DBDriver` instance

## [1.3.0] - 2019-07-05
### Added
- `Settings` package for key 'database'

## [1.2.0] - 2019-07-04
### Added
- `ENV` vars for configs

### Changed
- `tests` big refactor

## [1.1.0] - 2019-06-18
- `lib` folder into `package.json` files

### Changed
- Changed modules files folder into `lib`

## [1.0.0] - 2019-06-13
### Added
- `Database dispatcher package`
- `Unit tests`
- `Docs`
- `badges in Readme`
- `Error handling` - Invalid config error
- `Error handling` - Invalid db type in config error
- Config validation methods