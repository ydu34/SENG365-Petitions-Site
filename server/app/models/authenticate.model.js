const Crypto = require('crypto-js');
const db = require('../../config/db');


exports.hash = function (password) {
        return Crypto.SHA256(password).toString();
};

exports.getId = async function(token) {
        const connection = await db.getPool().getConnection();
        const sql = 'SELECT user_id FROM User WHERE auth_token = ?';
        const [rows, fields] = await connection.query(sql, token);
        connection.release();
        return rows;
}

exports.getAuthorIdFromPetition = async function(petitionId) {
        const connection = await db.getPool().getConnection();
        const sql = 'SELECT author_id FROM Petition WHERE petition_id = ?';
        const [rows, fields] = await connection.query(sql, petitionId);
        connection.release();
        return rows;
}
