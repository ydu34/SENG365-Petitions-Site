const Users = require('../models/users.model');
const authenticate = require('../models/authenticate.model');
const fs = require('mz/fs');
const process = require('process');
const path = require("path");
const helper = require("./helper");

exports.register = async function(req, res) {
    try {
        if (!("name" in req.body)) {
            res.statusMessage = 'Bad Request: data should have required property \'name\'';
            res.status(400).send();
        } else if (req.body.name.length < 1) {
            res.statusMessage = 'Bad Request: data.name should NOT be shorter than 1 characters';
            res.status(400).send();
        } else if (!("email" in req.body)) {
            res.statusMessage = "Bad Request: data should have required property 'email'";
            res.status(400).send();
        } else if (req.body.email.length < 1) {
            res.statusMessage = "Bad Request: data.email should NOT be shorter than 1 characters";
            res.status(400).send();
        } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email))) { //Not sure if proper pattern
            res.statusMessage = 'Bad Request: data.email should match format "email"';
            res.status(400).send();
        } else if (!("password" in req.body)) {
            res.statusMessage = "Bad Request: data should have required property 'password'";
            res.status(400).send();
        } else if (req.body.password < 1) {
            res.statusMessage = "Bad Request: data.password should NOT be shorter than 1 characters";
            res.status(400).send();
        } else {
            const name = req.body.name;
            const email = req.body.email;
            const password = authenticate.hash(req.body.password);
            const city = req.body.city ? req.body.city : null;
            const country = req.body.country ? req.body.country : null;
            const values = [
                name, email, password, city, country
            ]
            console.log(values);
            const result = await Users.insert(values);
            if (result == 0) {
                res.statusMessage = "Bad Request: email already in use";
                res.status(400).send();
            } else {
                const jsonObj = {userId: result}
                res.status(201).send(jsonObj);
            }
        }
    } catch (err) {
        res.status(500)
            .send(`${err}`);
    }
}

exports.login = async function(req, res) {
    try {
        if (!("email" in req.body)) {
            res.statusMessage = "Bad Request: data should have required property 'email'";
            res.status(400).send();
        } else if (req.body.email.length < 1) {
            res.statusMessage = "Bad Request: data.email should NOT be shorter than 1 characters";
            res.status(400).send();
        } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email))) { //Not sure if proper pattern
            res.statusMessage = 'Bad Request: data.email should match format "email"';
            res.status(400).send();
        } else if (!("password" in req.body)) {
            res.statusMessage = "Bad Request: data should have required property 'password'";
            res.status(400).send();
        } else if (req.body.password.length < 1) {
            res.statusMessage = "Bad Request: data.password should NOT be shorter than 1 characters";
            res.status(400).send();
        } else {
            const email = req.body.email;
            const password = authenticate.hash(req.body.password);
            const values = [
                email, password
            ]
            const result = await Users.addToken(values);
            if (result.length == 0) {
                res.statusMessage = "Bad Request: invalid email/password supplied";
                res.status(400)
                    .send();
            }
            const jsonObj = { userId: result[0].user_id, token: result[0].auth_token};
            res.status(200)
                .send(jsonObj);
        }
    } catch (err) {
        res.status(500).send();
    }
}

exports.logout = async function(req, res) {
    try {
        const token = req.header("x-authorization");
        const result = await Users.removeToken(token);
        if (result.changedRows == 0) {
            res.statusMessage = "Unauthorized";
            res.status(401).send()
        } else {
            res.status(200).send();
        }
    } catch (err) {
        res.statusMessage = "Unauthorized";
        res.status(401).send();
    }
}

exports.getOne = async function(req, res) {
    try {
        let token;
        if ("x-authorization" in req.headers) {
            token = req.header("x-authorization");
        }
        const id = req.params.id;
        const result = await Users.read(id);
        let jsonObj;
        if (token && result[0].auth_token == token) {
            jsonObj = {
                name: result[0].name,
                city: result[0].city,
                country: result[0].country,
                email: result[0].email
            }
        } else {
            jsonObj = {
                name: result[0].name,
                city: result[0].city,
                country: result[0].country
            }
        }
        res.status(200).send(jsonObj);
    } catch (err) {
        res.status(404).send();
    }
}

exports.edit = async function(req, res) {
    try {
        let sql;
        const values = [];
        const setClauses = [];
        if (!("x-authorization" in req.headers)) {
            res.status(401).send();
            return;
        }
        const token = req.header("x-authorization");
        const idData = await authenticate.getId(token);
        const userId = idData[0].user_id;
        if (!(userId == req.params.id)) {
            res.status(401).send();
            return;
        }
        if (userId != req.params.id) {
            res.status(403).send();
            return;
        }
        if ("name" in req.body) {
            setClauses.push("name = ?");
            values.push(req.body.name);
        }
        if ("email" in req.body) {
            if (req.body.email.length < 1) {
                res.statusMessage = "Bad Request: data.email should NOT be shorter than 1 characters";
                res.status(400).send();
                return;
            } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email))) { //Not sure if proper pattern
                res.statusMessage = 'Bad Request: data.email should match format "email"';
                res.status(400).send();
                return;
            } else {
                setClauses.push("email = ?");
                values.push(req.body.email);
            }
        }
        if ("password" in req.body && "currentPassword" in req.body) {
            if (req.body.password < 1) {
                res.statusMessage = "Bad Request: data.password should NOT be shorter than 1 characters";
                res.status(400).send();
                return;
            } else {
                setClauses.push("password = ?");
                values.push(authenticate.hash(req.body.password));
            }
        }
        if ("password" in req.body && !("currentPassword" in req.body)) {
            res.status(400).send();
            return;
        }
        if ("city" in req.body) {
            setClauses.push("city = ?");
            values.push(req.body.city);
        }
        if ("country" in req.body) {
            setClauses.push("country = ?");
            values.push(req.body.country);
        }
        if (setClauses.length > 0) {
            sql = "UPDATE User SET ";
            sql += setClauses.join(", ") + " ";
        } else {
            res.statusMessage = "Bad Request: you must provide some details to update";
            res.status(400).send();
            return;
        }
        if (req.headers && setClauses.length > 0) {
            sql += "WHERE auth_token = ? AND user_id = ? ";
            values.push(token);
            values.push(req.params.id);
        }
        if ("password" in req.body && "currentPassword" in req.body) {
            const passwordData = await Users.getPassword(req.header("x-authorization"));
            const currentPassword = authenticate.hash(req.body.currentPassword)
            if (passwordData[0].password != currentPassword) {
                res.status(400).send();
                return;
            } else {
                sql += "AND password = ? ";
                values.push(currentPassword);
            }
        }
        if ("email" in req.body) {
            sql += "AND NOT EXISTS (SELECT 1 FROM User WHERE email = ?) ";
            values.push(req.body.email);
        }
        if (sql) {
            sql += ";";
        }
        await Users.update(values, sql);
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getPhoto = async function(req, res) {
    try {
        const filename = await Users.readPhotoFilename(req.params.id);
        if (filename == null) {
            res.status(404).send();
        } else {
            const photoPath = "./storage/photos/" + filename;
            const image = await fs.readFile(photoPath);
            if (await fs.exists(photoPath)) {
                const mimeType = helper.getImageMimeType(filename);
                res.status(200)
                    .contentType(mimeType)
                    .send(image);
            } else {
                res.status(404).send();
            }
        }
    } catch(err) {
        res.status(500).send(err);
    }
}

exports.addPhoto = async function(req, res) {
    try {
        if (!("x-authorization" in req.headers)) {
            res.status(401).send();
            return;
        }
        const token = req.header("x-authorization");
        const idData = await authenticate.getId(token)
        if (idData.length == 0) {
            res.status(401).send();
            return;
        }
        const userData = await Users.read(req.params.id);
        if (userData.length == 0) {
            res.status(404).send();
        }
        const userId = idData[0].user_id;
        if (!(userId == req.params.id)) {
            res.status(403).send();
            return;
        }

        let contentType;
        const validContentTypes = ['image/png', 'image/jpeg', 'image/gif']
        if ('content-type' in req.headers) {
            contentType = req.header('content-type');
            console.log(contentType);
            if (!(validContentTypes.includes(contentType))) {
                res.statusMessage = "Bad Request: photo must be image/jpeg, image/png, image/gif type, but it was: image/bmp";
                res.status(400).send();
                return;
            }
        } else {
            res.statusMessage = "Bad Request: photo must be image/jpeg, image/png, image/gif type, but it was: image/bmp";
            res.status(400).send();
            return;
        }
        const photoType = contentType.slice(6);
        const photoFilename = "user_" + userId + "." + photoType;
        const photoPath = "./storage/photos/" + photoFilename;
        fs.writeFileSync(photoPath, req.body);
        const oldFilename = await Users.readPhotoFilename(userId);
        await Users.insertPhotoFilename(userId, photoFilename);
        if (oldFilename != null) {
            res.status(200).send();
        } else if (oldFilename == null) {
            res.status(201).send();
        } else {
            res.status(500).send();
        }
    } catch(err) {
        res.status(500).send(err);
    }
}

exports.deletePhoto = async function(req, res) {

    try {
        if (!("x-authorization" in req.headers)) {
            res.status(401).send();
            return;
        }
        const token = req.header("x-authorization");
        const idData = await authenticate.getId(token)
        if (idData.length == 0) {
            res.status(401).send();
            return;
        }
        const userData = await Users.read(req.params.id);
        if (userData.length == 0) {
            res.status(404).send();
            return;
        }
        const userId = idData[0].user_id;
        if (!(userId == req.params.id)) {
            res.status(403).send();
            return;
        }
        const filename = await Users.readPhotoFilename(userId);
        if (filename == null) {
            res.status(404).send();
            return;
        } else {
            const result = await Users.removePhotoFilename(userId);
            await fs.unlink("./storage/photos/" + filename);
            res.status(200).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
}