const authenticate = require('../models/authenticate.model');

exports.loginRequired = async function (req, res, next) {
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
        } else {
            req.authenticatedUserId = idData[0].user_id.toString();
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR creating petition ${err}`);
    }
}