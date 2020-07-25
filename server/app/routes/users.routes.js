const users = require('../controllers/users.controller');
const crypto = require('crypto');

module.exports = function(app){
    app.route(app.rootUrl + '/users/register')
        .post(users.register)
    app.route(app.rootUrl + '/users/login')
        .post(users.login)
    app.route(app.rootUrl + '/users/logout')
        .post(users.logout)
    app.route(app.rootUrl + '/users/:id')
        .get(users.getOne)
        .patch(users.edit)
    app.route(app.rootUrl + '/users/:id/photo')
        .get(users.getPhoto)
        .put(users.addPhoto)
        .delete(users.deletePhoto)
};

