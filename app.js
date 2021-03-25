var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var root = require('./value').root;

var linksRouter = require('./routes/links');
var addSubtitles = require('./routes/addSubtitles');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static(root));

app.use('/links', linksRouter);
app.use('/add', addSubtitles);

module.exports = app;
