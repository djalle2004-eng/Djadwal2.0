const { dbService } = require('@djadwal/database');

module.exports = {
    executeQuery: (query, params) => dbService.executeQuery(query, params),
    initDatabaseConnection: () => dbService.init()
};
