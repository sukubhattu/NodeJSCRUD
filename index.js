const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
// Initialize app
const app = express();

// For Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Template engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Initialize database
mongoose.connect('mongodb://localhost:27017/nodeKnowledge3', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
// Check errors
db.on('error', (err) => {
	console.log(err);
});
// Check connection
db.once('open', () => {
	console.log('connected to mongodb');
});

// Bring up the models
let Article = require('./Models/Article');

// creating a view
// GET
app.get('/articles', (req, res) => {
	Article.find({}, (err, articles) => {
		// console.log(articles);
		if (err) {
			console.log(err);
		} else {
			// if no error
			// storing that query into another list
			const articlesCopy = {
				articles: articles.map((eachArticle) => {
					return {
						id: eachArticle.id,
						title: eachArticle.title,
						author: eachArticle.author,
						body: eachArticle.body
					};
				})
			};
			res.render('articles', {
				title: 'Articles',
				articles: articlesCopy.articles
			});
		}
	});
});

// Fuck to make POST url you have to make GET url
// let's get started with get url
app.get('/articles/add', (req, res) => {
	res.render('add_article', {
		title: 'Add Article'
	});
});
// POST method
app.post('/articles/add', (req, res) => {
	// let's grab data from form
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;
	// save this example
	article.save((err) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/articles');
		}
	});
});
// GET single article
app.get('/articles/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		if (err) {
			console.log(err);
		} else {
			let articleCopy = {};
			articleCopy.id = article._id;
			articleCopy.title = article.title;
			articleCopy.author = article.author;
			articleCopy.body = article.body;
			res.render('article_detail', {
				title: 'Article Detail',
				article: articleCopy
			});
		}
	});
});

// Update Route GET
// Update is similar to get single object
// passing that single item so that
// the original value is added to the form
app.get('/articles/:id/edit/', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		if (err) {
			console.log(err);
		} else {
			let articleCopy = {};
			articleCopy.id = article._id;
			articleCopy.title = article.title;
			articleCopy.author = article.author;
			articleCopy.body = article.body;
			res.render('article_update', {
				title: 'Update Article',
				article: articleCopy
			});
		}
	});
});

// update Route POST
app.post('/articles/:id/edit', (req, res) => {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	// finding the article to update
	let query = { _id: req.params.id };

	Article.update(query, article, (err) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/articles/' + req.params.id);
		}
	});
});

// DELETE
app.get('/articles/:id/delete', (req, res) => {
	Article.findByIdAndRemove(req.params.id, (err, article) => {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/articles');
		}
	});
});
// Initialize server
const port = process.env.port || 3000;
app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
