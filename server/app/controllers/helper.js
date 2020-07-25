exports.checkStringValue = function(value, res, req) {
    if (!(value in req.body)) {
        res.statusMessage = "Bad Request: data should have required property '" + value + "'";
        res.status(400).send();
        return true;
    }
    if (req.body[value].length < 1) {
        res.statusMessage = "Bad Request: data." + value + " should NOT be shorter than 1 characters";
        res.status(400).send();
        return true;
    }
    return false;
}

exports.isPetitionPastClosingDate = function (closingDate) {
    const date = new Date();
    console.log(date);
    console.log(Date.parse(closingDate));
    if (Date.parse(closingDate) < date) {
        return true;
    } else {
        return false;
    }
}

exports.getImageMimeType = function (filename) {
    const filenameArr = filename.split(".");
    let mimeType;
    if (filenameArr[1] == "jpeg" || filenameArr[1] == "jpg") {
        mimeType = "image/jpeg";
    } else if (filenameArr[1] == "png") {
        mimeType = "image/png";
    } else if (filenameArr[1] == "gif") {
        mimeType = "image/gif";
    } else {
        mimeType = null;
    }
    return mimeType;
}