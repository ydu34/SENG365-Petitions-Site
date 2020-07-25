const db = require('../../config/db');

exports.getAll = async function(queryValues){
    const connection = await db.getPool().getConnection();
    let sql = 'SELECT p.petition_id, p.title, c.name as category_name, u.name as author_name, signature_count ' +
        'FROM Petition p LEFT JOIN User u on (p.author_id = u.user_id) LEFT JOIN Category c on (c.category_id = p.category_id) ' +
        'LEFT JOIN (SELECT petition_id, COUNT(signatory_id) AS signature_count FROM Signature GROUP BY petition_id) AS tmp ' +
        'on (p.petition_id = tmp.petition_id)';

    let whereClauses = [];
    if ("q" in queryValues) {
        whereClauses.push("p.title LIKE '%" + queryValues.q + "%'");
    }
    if ("categoryId" in queryValues) {
        whereClauses.push("c.category_id = " + queryValues.categoryId);
    }
    if ("authorId" in queryValues) {
        whereClauses.push("p.author_id = " + queryValues.authorId);
    }
    if (whereClauses.length > 0) {
        sql += " WHERE "
        sql += whereClauses.join(" AND ");
    }

    if ("sortBy" in queryValues) {
        if (queryValues.sortBy == "ALPHABETICAL_ASC") {
            sql += " ORDER BY p.title asc";
        } else if (queryValues.sortBy == "ALPHABETICAL_DESC") {
            sql += " ORDER BY p.title desc";
        } else if (queryValues.sortBy == "SIGNATURES_ASC") {
            sql += " ORDER BY signature_count asc";
        } else if (queryValues.sortBy == "SIGNATURES_DESC") {
            sql += " ORDER BY signature_count desc";
        }
    } else {
        sql += " ORDER BY signature_count desc";
    }
    sql += ", p.petition_id asc";

    console.log(sql);
    const [rows, fields] = await connection.query(sql);
    connection.release();
    return rows;
};

exports.checkCategoryExists = async function(id) {
    const connection = await db.getPool().getConnection();
    const sql = 'SELECT * FROM Category WHERE category_id = ?';
    const [rows, fields] = await connection.query(sql, id);
    connection.release();
    if (rows.length == 0 ) {
        return false;
    } else {
        return true;
    }
}

exports.insert = async function(values){
    const connection = await db.getPool().getConnection();
    const sql = 'INSERT INTO Petition (title, description, category_id, closing_date, created_date, author_id) ' +
        'SELECT * FROM (SELECT ? as col1, ? as col2, ? as col3, ? as col4, ? as col5, ? as col6) AS tmp ' +
        'WHERE EXISTS (SELECT 1 FROM Category WHERE category_id = ?)';
    const [rows, fields] = await connection.query(sql, values);
    connection.release();
    return rows.insertId;
}

exports.getOne = async function(id){
    const connection = await db.getPool().getConnection();
    console.log(id);
    const sql = 'SELECT p.petition_id, p.title, c.name as category_name, u.name as author_name, signature_count, ' +
        'p.description, p.author_id, u.city, u.country, p.created_date, p.closing_date ' +
        'FROM Petition p JOIN User u on (p.author_id = u.user_id) LEFT JOIN Category c on (c.category_id = p.category_id) ' +
        'LEFT JOIN (SELECT petition_id, COUNT(signatory_id) AS signature_count FROM Signature GROUP BY petition_id) AS tmp ' +
        'on (p.petition_id = tmp.petition_id) WHERE p.petition_id = ?';
    const [rows] = await connection.query(sql, id);
    connection.release();
    console.log(rows);
    let jsonObj = null;
    if (rows.length > 0) {
        jsonObj = {
            petitionId: rows[0].petition_id,
            title: rows[0].title,
            description: rows[0].description,
            authorId: rows[0].author_id,
            authorName: rows[0].author_name,
            authorCity: rows[0].city,
            authorCountry: rows[0].country,
            signatureCount: rows[0].signature_count,
            category: rows[0].category_name,
            createdDate: rows[0].created_date,
            closingDate: rows[0].closing_date
        }
    }
    return jsonObj;
};

exports.update = async function(sql) {
    const connection = await db.getPool().getConnection();
    const [rows, fields] = await connection.query(sql);
    connection.release();
    return rows;
}

exports.remove = async function(petitionId) {
    const connection = await db.getPool().getConnection();
    const sql = "DELETE FROM Petition WHERE petition_id = ?";
    const [rows, fields] = await connection.query(sql, petitionId);
    connection.release();
    return rows;

}

exports.getCategories = async function() {
    const connection = await db.getPool().getConnection();
    const sql = 'SELECT * FROM Category';
    const [rows, fields] = await connection.query(sql);
    connection.release();
    return rows;
}

exports.getPhotoFilename = async function(id) {
    const connection = await db.getPool().getConnection();
    const sql = 'SELECT photo_filename FROM Petition where petition_id = ?';
    const [rows] = await connection.query(sql, id);
    connection.release();
    let filename;
    console.log(rows);
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
    const sql = 'UPDATE Petition SET photo_filename = ? WHERE petition_id = ?';
    const [rows, fields] = await connection.query(sql, [photoFilename, id]);
    connection.release();
    return rows.changedRows;
}

exports.getSignatures = async function(id) {
    const connection = await db.getPool().getConnection();
    const sql = 'SELECT signatory_id, name, city, country, signed_date FROM Signature ' +
        'LEFT JOIN User ON Signature.signatory_id = User.user_id WHERE petition_id = ? GROUP BY signed_date';
    const [rows, fields] = await connection.query(sql, id);
    connection.release();
    return rows;
}

exports.insertSignature = async function(values) {
    const connection = await db.getPool().getConnection();
    const sql = 'INSERT INTO Signature (signatory_id, petition_id, signed_date) ' +
        'SELECT * FROM (SELECT ? as col1, ? as col2, ? as col3) AS tmp ' +
        'WHERE NOT EXISTS (SELECT 1 FROM Signature WHERE signatory_id = ? AND petition_id = ?)';
    const [rows, fields] = await connection.query(sql, values);
    connection.release();
    return rows;
}

exports.removeSignature = async function(values) {
    const connection = await db.getPool().getConnection();
    const sql = 'DELETE FROM Signature WHERE signatory_id = ? AND petition_id = ? ' +
        'AND EXISTS (SELECT 1 FROM Signature WHERE signatory_id = ? AND petition_id = ?)';
    const [rows, fields] = await connection.query(sql, values);
    connection.release();
    return rows;
}
