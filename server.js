const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const path = require ('path')
const axios = require('axios')
const cheerio = require('cheerio')

const db = require("./models");

const app = express();

//mongoose.connect('mongodb://localhost/scraper', {useNewUrlParser: true})
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())


app.listen(process.env.PORT || 3000, _ => console.log('http://localhost:3000'))

String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};  

app.get("/scrape/new", function(req, res) {
    db.Article.deleteMany({}, (err, data) => {
        if (err) { console.log(err) }

        let arr = []
        axios.get('https://www.nytimes.com/section/world')
            .then(r => {
                $ = cheerio.load(r.data)
                $('.story-body').each(
                    (i, elem) => {

                        db.Saved.findOne({link: $(elem).children('.headline').children().attr('href')})
                            .then( r => {
                                let _saved = false
                                if(r){
                                    _saved = true
                                }
                                // console.log(`Link ${i}: ` + $(elem).children('.headline').children().attr('href'))
                                // console.log(`Title: ` + $(elem).children('.headline').children().html())
                                // console.log(`Summary: ` + $(elem).children('.summary').html())
                                // console.log(`Saved: ` + _saved)
                                // console.log(' ')
                                arr.push(
                                    {
                                        link: $(elem).children('.headline').children().attr('href').trim(), 
                                        title: $(elem).children('.headline').children().html(),
                                        summary: $(elem).children('.summary').html(),
                                        saved: _saved
                                    }
                                )
                                db.Article.create({
                                    link: $(elem).children('.headline').children().attr('href').trim(),
                                    title: $(elem).children('.headline').children().html(),
                                    summary: $(elem).children('.summary').html(),
                                    saved: _saved
                                })              
                                if(i === 10){
                                    res.json(arr)
                                }   
                            })
                            if(i === 10) return false
                    }
                );
            })
            .catch(e => console.log(e))
    })

});

app.get("/scrape", function(req, res) {
    db.Article.find({}, (err, data) => {
        if (err) { console.log(err) }
        else {
            res.json(data)
        }
    })
});


app.delete("/saved", function(req, res) {
    db.Saved.deleteMany({}, (err, data) => {
        if (err) { console.log(err) }
        else {
            res.sendStatus(200)
        }
    })

    db.Article.update({}, {$set: {saved: false}})
});

app.post("/saved", function(req, res) {
    // console.log('saving article ' + req.body.link)
    // console.log('saving article ' + req.body.title)
    // console.log('saving article ' + req.body.summary)
    db.Saved.create({
        link: req.body.link,
        title: req.body.title,
        summary: req.body.summary
    })
    console.log(req.body.link)
    db.Article.update({link: req.body.link}, {$set: {saved: true}}, (err, data) => {
        if (err) { console.log(err) }
        else {
            console.log(data)
            res.sendStatus(200)
        }
    })
});



app.get("/saved", function(req, res) {
    db.Saved.find({}, (err, data) => {
        if (err) { console.log(err) }
        else {
            res.json(data)
        }
    })
});

app.delete("/saved/article", function(req, res) {
    db.Saved.deleteOne({link: req.body.link}, (err, data) => {
        if (err) { console.log(err) }
    })

    db.Article.update({link: req.body.link}, {$set: {saved: false}}, (err, data) => {
        if (err) { console.log(err) }
        else {
            console.log(data)
            res.sendStatus(200)
        }
    })
});

app.post("/note", function(req, res) {

    db.Note.create({
        sid: req.body.sid,
        body: req.body.body
    })

    res.sendStatus(200)
});

app.get("/notes/:sid", function(req, res) {
    db.Note.find({sid: req.params.sid}, (err, data) => {
        if (err) { console.log(err) }
        else {
            res.json(data)
        }
    })
});

app.delete("/note/:sid", function(req, res) {
    console.log(req.params.sid)
    let monid = (req.params.sid).toObjectId()
    db.Note.deleteOne({_id: monid}, (err, data) => {
        if (err) { console.log(err) }
        else {
            res.sendStatus(200)
        }
    })
});