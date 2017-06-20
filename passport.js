const LocalStrategy  = require('passport-local').Strategy
const user = require('./database.js')

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user)
        })
    })

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        process.nextTick(function() {

        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err)
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
            } else {
                const newUser = new User()
                newUser.local.email = email
                newUser.local.password = password

                newUser.save(function(err) {
                    if (err)
                        throw err
                    return done(null, newUser)
                })
            }

        })

        })

    }))
    const localLoginOptions = {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }
    passport.use('local-login', new LocalStrategy(localLoginOptions, configLocalLogin))

    function configLocalLogin (req, email, password, done) {
        User.getUsers({ 'local.email': email }, function (err, user) {
            if (err) { return done(err) }
            if (!user) {
                return done(null, false, req.flash('loginMessage', 'No user found.'))
            }
            if (!user.validPassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'))
            }
            return done(null, user)
        })
    }
  }
