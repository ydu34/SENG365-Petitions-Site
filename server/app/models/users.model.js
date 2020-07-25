const db = require('../../config/db');
var randtoken = require('rand-token');

exports.insert = async function(values){
    const connection = await db.getPool().getConnection();
    values.push(values[1]);
    const sql =
        'INSERT INTO User (name, email, password, city, country) SELECT * FROM (SELECT ? as col1, ? as col2, ? as col3, ? as col4, ? as col5) AS tmp WHERE NOT EXISTS (SELECT 1 FROM User WHERE email = ?)';
    const [rows, fields] = await connection.query(sql, values);
    connection.release();
    return rows.insertId;
}

exports.addToken = async function(values){
    const connection = await db.getPool().getConnection();
    const token = randtoken.generate(32);
    const sql1 = 'UPDATE User SET auth_token = ? where email = ? and password = ?';
    await connection.query(sql1, [token, values[0], values[1]]);
    const sql2 = 'SELECT user_id, auth_token FROM User where email = ? and password = ?';
    const [rows, fields] = await connection.query(sql2, values);
    connection.release();
    return rows;
}

exports.removeToken = async function(token) {
    const connection = await db.getPool().getConnection();
    const sql = 'UPDATE User SET auth_token = null where auth_token = ?';
    const [rows, fields] = await connection.query(sql, token);
    connection.release();
    return rows;
}

exports.read = async function(id) {
    const connection = await db.getPool().getConnection();
    const sql = 'SELECT * FROM User where user_id = ?'
    const [rows, fields] = await connection.query(sql, id);
    connection.release();
    return rows;
}

exports.update = async function(values, sql) {
    const connection = await db.getPool().getConnection();
    const [rows, fields] = await connection.query(sql, values);
    connection.release();
    return rows;
}

exports.getPassword = async function(token) {
    const connection = await db.getPool().getConnection();
    const sql = 'SELECT password FROM User where auth_token = ?';
    const [rows, fields] = await connection.query(sql, token);
    connection.release();
    return rows;
}

exports.readPhotoFilename = async function(id) {
    const connection = await db.getPool().getConnection();
    const sql = 'SELECT photo_filename FROM User where user_id = ?';
    const [rows, fields] = await connection.query(sql, id);
    connection.release();
    let filename;
    if (rows.length == 0) {
        filename = null;
    } else if (rows[0].photo_filename == null) {
        filename = null;
    } else {
        filename = rows[0].photo_filename;
    }
    return filename;
}

exports.insertPhotoFilename = async function(id, photoFilename) {
    const connection = await db.getPool().getConnection();
    const sql = 'UPDATE User SET photo_filename = ? WHERE user_id = ?';
    const [rows, fields] = await connection.query(sql, [photoFilename, id]);
    connection.release();
    return rows.changedRows;
}

exports.removePhotoFilename = async function(id) {
    const connection = await db.getPool().getConnection();
    const sql = 'UPDATE User SET photo_filename = null WHERE user_id = ?';
    const [rows, fields] = await connection.query(sql, id);
    connection.release();
    return rows.changedRows;
}