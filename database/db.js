const Database = require('better-sqlite3');
const db = new Database('simpledairy.db');

module.exports = {db:db}
