const Petitions = require('../models/petitions.model');
const authenticate = require('../models/authenticate.model');
const helper = require('./helper');
const fs = require('mz/fs');

exports.list = async function(req, res){
    try {
        const queryValues = req.query;
        console.log(req.query);
        const allowedSortBy = ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC", "SIGNATURES_ASC", "SIGNATURES_DESC"];
        let startIndex = 0;
        let count = -1;
        if ("startIndex" in queryValues) {
            if (isNaN(queryValues.startIndex) || !(Number.isInteger(parseFloat(queryValues.startIndex))) || parseFloat(queryValues.startIndex) < 0) {
                res.status(400).send();
                return;
            } else {
                startIndex = parseInt(queryValues.startIndex);
            }
        }
        if ("count" in queryValues) {
            if (isNaN(queryValues.count) || !(Number.isInteger(parseFloat(queryValues.count))) || parseFloat(queryValues.count) < 0) {
                res.status(400).send();
                return;
            } else {
                count = parseInt(queryValues.count) + startIndex;
            }
        }
        if ("q" in queryValues) {
            if (typeof queryValues.q != "string") {
                res.status(400).send();
                return;
            }
        }
        if ("categoryId" in queryValues) {
            if (isNaN(queryValues.categoryId) || !(Number.isInteger(parseFloat(queryValues.categoryId)))) {
                res.status(400).send();
                return;
            } else {
                const petitionExists = await Petitions.checkCategoryExists(queryValues.categoryId);
                if (!petitionExists) {
                    res.status(400).send();
                    return;
                }
            }
        }
        if ("authorId" in queryValues) {
            if (isNaN(queryValues.authorId) || !(Number.isInteger(parseFloat(queryValues.authorId))) || parseFloat(queryValues.authorId) < 0) {
                res.status(400).send();
                return;
            }
        }
        if ("sortBy" in queryValues) {
            if (typeof queryValues.sortBy != "string" || !(allowedSortBy.includes(queryValues.sortBy))) {
                res.status(400).send();
                return;
            }
        }
        const result = await Petitions.getAll(queryValues);
        if (count == -1 || count > result.length) {
            count = result.length;
        }
        console.log(startIndex);
        console.log(count);
        let objectArray = [];
        for (let i = startIndex; i < count; i++) {
            let object = {
                petitionId: result[i].petition_id,
                title: result[i].title,
                category: result[i].category_name,
                authorName: result[i].author_name,
                signatureCount: result[i].signature_count
            }
            objectArray.push(object);
        }
        res.status(200).send(objectArray);
    } catch (err) {
        res.status(500)
            .send(`ERROR getting petitions ${err}`);
    }
};

exports.create = async function(req, res) {
    try {
        if (!("x-authorization" in req.headers)) {
            res.status(401).send();
            return;
        }
        const token = req.header("x-authorization");
        const idData = await authenticate.getId(token)
        console.log(idData);
        if (idData.length == 0) {
            res.status(401).send();
            return;
        }
        const date = new Date();
        console.log(date);
        if (Date.parse(req.body.closingDate) < date) {
            res.status(400).send();
            return;
        }
        if (helper.checkStringValue("title", res, req)) {
            return;
        }
        const values = [req.body.title, req.body.description, req.body.categoryId, req.body.closingDate, date, idData[0].user_id, req.body.categoryId];
        const result = await Petitions.insert(values);
        if (result != 0) {
            res.status(201)
                .json({
                    petitionId: result
                });
        } else {
            res.status(400).send();
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR creating petition ${err}`);
    }
}

exports.read = async function(req, res){
    try {
        const id = req.params.id;
        const result = await Petitions.getOne(id);
        console.log(result);
        if (result != null) {
            res.status(200)
                .json(result);
        } else {
            res.status(404)
                .send();
        }
    } catch (err) {
        res.status(500)
            .send();
    }
}

exports.update = async function(req, res) {
    try {
        let sql;
        const setClauses = [];
        const idData = await authenticate.getAuthorIdFromPetition(req.params.id);
        if (idData.length == 0) {
            res.status(404).send();
            return;
        }
        if (req.authenticatedUserId != idData[0].author_id) {
            res.status(403).send();
            return;
        }

        if ("title" in req.body) {
            if (req.body.title.length < 1) {
                res.status(400).send();
                return;
            }
            setClauses.push('title = "' + req.body.title + '"');
        }
        if ("description" in req.body) {
            setClauses.push('description = "' + req.body.description + '"');
        }
        if ("categoryId" in req.body) {
            setClauses.push("category_id = " + req.body.categoryId);
        }
        if ("closingDate" in req.body) {
            if (helper.isPetitionPastClosingDate(req.body.closingDate)) {
                res.status(400).send();
                return;
            }
            setClauses.push('closing_date = "' + req.body.closingDate + '"');
        }
        if (setClauses.length > 0) {
            sql = "UPDATE Petition SET ";
            sql += setClauses.join(", ") + " ";
            sql += "WHERE petition_id = " + req.params.id;
            sql += " AND EXISTS (SELECT 1 FROM Category WHERE Category.category_id = " + req.body.categoryId + ")"
        } else {
            res.status(400).send();
            return;
        }
        const result = await Petitions.update(sql);
        if (result.affectedRows == 0) {
            res.status(400).send();
            return;
        }
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.delete = async function(req, res) {
    try {
        const idData = await authenticate.getAuthorIdFromPetition(req.params.id);
        if (idData.length == 0) {
            res.status(404).send();
            return;
        }
        if (req.authenticatedUserId != idData[0].author_id) {
            res.status(403).send();
            return;
        }
        await Petitions.remove(req.params.id);
        res.status(200).send();
    } catch (err) {
        res.status(500)
            .send(err);
    }
}

exports.listCategories = async function(req, res){
    try {
        const result = await Petitions.getCategories();
        let objectArray = [];
        for (let i = 0; i < result.length; i++) {
            let object = {
                categoryId: result[i].category_id,
                name: result[i].name
            }
            objectArray.push(object);
        }
        res.status(200)
            .send(objectArray);
    } catch (err) {
        res.status(500)
            .send(err);
    }
};

exports.readPhoto = async function(req, res) {
    try {
        const filename = await Petitions.getPhotoFilename(req.params.id);
        console.log(filename);
        if (filename == null) {
            res.status(404).send();
        } else if (filename != null) {


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
        } else {
            res.status(500)
                .send();
        }

    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

exports.updatePhoto = async function(req, res) {
    try {
        const petitionId = req.params.id;
        const petitionResult = await Petitions.getOne(petitionId);
        console.log(petitionResult);
        if (petitionResult == null) {
            res.status(404)
                .send();
            return;
        } else if (petitionResult.authorId != req.authenticatedUserId) {
            res.status(403)
                .send();
            return;
        }

        let contentType;
        const validContentTypes = ['image/png', 'image/jpeg', 'image/gif']
        if ('content-type' in req.headers) {
            contentType = req.header('content-type');
            if (!(validContentTypes.includes(contentType))) {
                res.statusMessage = "Bad Request: photo must be image/jpeg, image/png, image/gif type";
                res.status(400).send();
                return;
            }
        } else {
            res.statusMessage = "Bad Request: photo must be image/jpeg, image/png, image/gif type";
            res.status(400).send();
            return;
        }
        const photoType = contentType.slice(6);
        const photoFilename = "petition_" + petitionId + "." + photoType;
        const photoPath = "./storage/photos/" + photoFilename;
        fs.writeFileSync(photoPath, req.body);
        const oldFilename = await Petitions.getPhotoFilename(petitionId);
        await Petitions.insertPhotoFilename(petitionId, photoFilename);
        if (oldFilename != null) {
            res.status(200).send();
        } else if (oldFilename == null) {
            res.status(201).send();
        } else {
            res.status(500).send();
        }

    } catch (err) {
        res.status(500)
            .send(err);
    }
}

exports.listSignatures = async function(req, res) {
    try {
        const id = req.params.id;
        const result = await Petitions.getSignatures(id);
        console.log(result);
        if (result.length == 0) {
            res.status(404).send();
            return;
        }
        const objectArray = [];
        for (let i = 0; i < result.length; i++) {
            let object = {
                signatoryId: result[i].signatory_id,
                name: result[i].name,
                city: result[i].city,
                country: result[i].country,
                signedDate: result[i].signed_date
            }
            objectArray.push(object);
        }
        res.status(200).send(objectArray);
    } catch (err) {
        res.status(500)
            .send(err);
    }
}

exports.createSignature = async function (req, res) {
    try {
        const petitionResult = await Petitions.getOne(req.params.id);
        console.log(petitionResult);
        if (petitionResult == null) {
            res.status(404)
                .send();
            return;
        }

        if (petitionResult.closingDate != null){
            if (helper.isPetitionPastClosingDate(petitionResult.closingDate)) {
                res.status(403)
                    .send();
                return;
            }
        }


        const date = new Date();

        const values = [req.authenticatedUserId, req.params.id, date, req.authenticatedUserId, req.params.id];
        const result = await Petitions.insertSignature(values);

        if (result.affectedRows == 0) {
            res.status(403)
                .send();
        } else {
            res.status(201).send();
        }
    } catch (err) {
        res.status(500)
            .send(err);
    }
}

exports.deleteSignature = async function (req, res) {
    try {
        const petitionResult = await Petitions.getOne(req.params.id);
        console.log(petitionResult);
        if (petitionResult == null) {
            res.status(404)
                .send();
            return;
        } else if (petitionResult.authorId == req.authenticatedUserId) {
            res.status(403)
                .send();
            return;
        } else if (petitionResult.closingDate != null){
            if (helper.isPetitionPastClosingDate(petitionResult.closingDate)) {
                res.status(403)
                    .send();
                return;
            }
        }
        const values = [req.authenticatedUserId, req.params.id, req.authenticatedUserId, req.params.id];
        const result = await Petitions.removeSignature(values);
        if (result.affectedRows == 0) {
            res.status(403)
                .send();
        } else {
            res.status(200).send();
        }
    } catch (err) {
        res.status(500)
            .send(err);
    }
}
