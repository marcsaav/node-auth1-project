const db = require('../../database/dbConfig')

function get() {
    return db('users')
}

module.exports = {
    get
}