require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const request = require('request');

const app = express()
const port = process.env.PORT || 3000;
const apiKey = process.env.AUTHENTICATION_TOKEN


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(express.static('public'));


app.get('/', function (req, res) {
  res.render('index', {plantList: null, error: null});
})

app.get('/:word', function (req, res) {
  const word = req.params.word
  if(apiKey && isSecure(word)) {
    const plantUrl = 'https://trefle.io/api/v1/plants/search?token=' + apiKey + '&q=' + word + '&page=1';
    
    request(plantUrl, function (err, response, body) {
      if(err){
        res.render('index', {plantList: null, error: 'Error, please try again', speciesInfo: null, genusInfo: null, id: null});
      } else {
        let plantList = JSON.parse(body)
        if(plantList.data == undefined){
          res.render('index', {plantList: null, error: 'Error, please try again', speciesInfo: null, genusInfo: null, id: null});
        } else {
          const slug = req.query.slug
          const id = req.query.id

          if(slug && id) {
            const speciesUrl = 'https://trefle.io/api/v1/species/' + slug + '?token=' + apiKey

            request(speciesUrl, function (err, response, body) {
              if(err){
                res.render('index', {plantList: null, error: 'Error, please try again', speciesInfo: null, genusInfo: null, id: null});            
              } else {
                let speciesInfo = JSON.parse(body)
                if(speciesInfo.data == undefined){
                  res.render('index', {plantList: null, error: 'Error, please try again', speciesInfo: null, genusInfo: null, id: null});
                } else {
                  const splittedSlug = slug.split("-")[0]
                  const genusUrl = 'https://trefle.io/api/v1/genus/' + splittedSlug + '?token=' + apiKey

                  request(genusUrl, function (err, response, body) {
                    if(err){
                      res.render('index', {plantList: null, error: 'Error, please try again', speciesInfo: null, genusInfo: null, id: null});            
                    } else {
                      let genusInfo = JSON.parse(body)
                      if(genusInfo.data == undefined){
                        res.render('index', {plantList: null, error: 'Error, please try again', speciesInfo: null, genusInfo: null, id: null});
                      } else {
                        res.render('index', {plantList: plantList.data, error: null, speciesInfo: speciesInfo.data, genusInfo: genusInfo.data, id: id});
                      }
                    }
                  });
                }
              }
            });
            } else {
            res.render('index', {plantList: plantList.data, error: null, speciesInfo: null, genusInfo: null, id: null});
          }
        }
      }
    });
   
  } else {
    res.render('index', {plantList: null, error: 'Error, no api key or search valid', speciesInfo: null, genusInfo: null});
  }
})


app.listen(port, () => console.log(`Server listening on port: ${port}`))

function isSecure(word) {
  return /^[A-Za-z\s]*$/.test(word)
}


