const passport = require('passport');
const { v4: uuidv4 } = require('uuid');

const router = require('express').Router();

router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
    console.log('login page');
});
// router.get('/google', (req, res) => {
//     //handle with passport
//     console.log('google auth page');
//     res.send('login to google');
// });
router.get('/google', passport.authenticate('google', {
    scope: ['profile']

}));

router.get('/logout', (req, res) => {
    //handle with passport
    console.log('logout');
    //res.send('loging out');
    req.logOut();
    res.redirect('/');
});

// callback route for google to redirect to
///this take you to the meet
router.get('/google/me', passport.authenticate('google'), (req, res) => {
    //res.send(req.user);
    //res.redirect(`/${uuidv4()}`);
    res.redirect('/profile');
});

module.exports = router;