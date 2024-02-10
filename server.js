const fs = require('fs');
const https = require('https');   
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');


require('dotenv').config();

const PORT = 3000;

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
};


const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
};


function verifiyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile:', profile);
    done(null, profile);
}


passport.use(new Strategy(AUTH_OPTIONS, verifiyCallback));




const app = express();


app.use(helmet()); // every request passes through helmet middleware
app.use(passport.initialize());




function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'You must log in!'
        });
    }
    next();
}

app.get('/auth/google',
    passport.authenticate('google', {   
        scope: ['email'],
    }));



app.get('/auth/google/callback', 
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/',
        session: false,
    }), 
    (req, res) => {
        console.log('Logged in!');
    }
);



app.get('/auth/logout', (req, res) => {});


app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('Hello from server'); 
});


app.get('/failure', (req, res) => { 
    return res.send('Failed to log in!');
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});