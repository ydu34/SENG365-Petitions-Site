const petitions = require('../controllers/petitions.controller');
const authenticate = require('../middleware/authenticate.middleware')

module.exports = function(app){
    app.route(app.rootUrl + '/petitions')
        .get(petitions.list)
        .post(petitions.create)
    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.listCategories)
    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.read)
        .patch(authenticate.loginRequired, petitions.update)
        .delete(authenticate.loginRequired, petitions.delete)
    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(petitions.readPhoto)
        .put(authenticate.loginRequired, petitions.updatePhoto)
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitions.listSignatures)
        .post(authenticate.loginRequired, petitions.createSignature)
        .delete(authenticate.loginRequired, petitions.deleteSignature)
};