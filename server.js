const express = require('express')
const bodyParser = require('body-parser')
const database = require('./database')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const app = express()

require('ejs')
app.set('view engine', 'ejs');

app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

require('./passport')(passport);
app.use(passport.initialize())
app.use(passport.session())
app.use(passport.session({ secret: 'kitties' }))

app.get('/', (request, response) => {
  database.getAlbums((error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      response.render('index', { albums: albums })
    }
  })
})

app.get('/login', (request, response) => {

  database.getUsers((error, users) => {
    if(error){
      response.status(500).render('error', {error: error })
    } else {
      response.render('login', { users: users })
    }
  })
})

app.get('/signup', (request, response) => {
  database.getUsers((error, users) => {
    if(error){
      response.status(500).render('error', {error: error })
    } else {
      response.render('signup', { users: users })
    }
  })
})

app.get('/user', (request, response) => {
  database.getUsers((error, users) => {
    if(error){
      response.status(500).render('error', {error: error })
    } else {
      response.render('user', { users: users })
    }
  })
})

app.get('/albums/:albumID', (request, response) => {
  const albumID = request.params.albumID

  database.getAlbumsByID(albumID, (error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      const album = albums[0]
      response.render('album', { album: album })
    }
  })
})

app.use((request, response) => {
  response.status(404).render('not_found')
})

app.post('/signup', passport.authenticate('local-signup', {
     successRedirect : '/user',
     failureRedirect : '/signup'
 }));

function isLoggedIn(request, response, next) {
  if(request.isAuthenticated())
  return next
  response.redirect('/user')
}

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}...`)
})
