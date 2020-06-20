const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user_id})
    .then(favorite => {
        if(favorite) {
            req.body.forEach(fav => {
                if(!favorite.campsites.includes(fav.id)) {
                    favorite.campsites.push(fav.id);
                } else {
                    res.send(`Already a favorite`);
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            });
        } else {
            Favorite.create({user: req.user._id, campsites: req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            });
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported`);
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndRemove({user: req.user._id})
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send('Favorite has been deleted');
    })
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            if(!favorite.campsites.campsiteId.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            } else {
                res.send(`That campsite is already in the list of favorites`);
            }
        } else {
            Favorite.create({user: req.user._id, campsites: req.body})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            });
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported`);
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorites => {
        if (favorites.campsites.includes(req.params.campsiteId)) {
            favorites.campsites.remove(req.params.campsiteId);
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            });
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'plain/text');
            res.send('Campsite not found in your favorites.');
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;