const express = require('express');
const os = require('os');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');



//////google authenticatin.////////////
const passportSetup = require('./config/passport-setup');
const authRoutes = require('./routes/auth_routes');
const profileRoutes = require('./routes/profile-routes');

const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');
const session = require('express-session')

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

//connect to mongodb
mongoose.connect(keys.mongoDB.dbURI, () => {
    console.log('connected to monodb');
});

//set the routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

////////google auth end//////////////////////////


//////backend part from here to down ///////////////////
//837945080167-2d174daavis4mfqhvnecjmstigtmvl8l.apps.googleusercontent.com
//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
const port = 3000;
const host = 'localhost';

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('start', { user: req.user });
});
app.get('/newMeeting', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
// app.get('/', (req, res) => {
//     console.log('request made');
//     res.redirect(`/${uuidv4()}`);

// });

app.get('/ended', (req, res) => {
    console.log('meeting ended');
    res.render('ended');
})

app.get('/:room', (req, res) => {
    res.render('index', { roomid: req.params.room, user: req.user }); //to get roomid in index.ejs
})





server.listen(port, host, () => {
    console.log(`listening to port:${port},host:${host}`);
});

io.on('connection', socket => {
    console.log('user connected');
    socket.on('join-room', (roomid, userid) => {
        console.log(roomid, userid);
        socket.join(roomid);
        //**below both lines are same as broadcast automatically to other users expect itself */
        //socket.to(roomid).emit('user-connected', roomid, userid);
        socket.broadcast.to(roomid).emit('user-connected', userid);

        ////messages
        socket.on('message', (message, finaluser) => {
            ///send message to same room
            console.log('here===' + message + finaluser);
            setTimeout(() => {
                socket.to(roomid).emit('createMessage', message, finaluser);
            }, 1000);


        })

        socket.on('disconnect', () => {
            console.log('userdisconnected :' + userid);
            socket.broadcast.to(roomid).emit('user-disconnected', userid);
        })


    })

});

// app.post('/invite', (req, res) => {
//     console.log(req.body);
//     res.send(req.body.xyz);

// })

///////////////mailing work/////////////////////
// ----------------------------------mailing--------------------------------------

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
var nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "dkps0081@gmail.com",
        pass: 'wfuqejuvnkxtpndt'
    },
    debug: false,
    logger: true
});



app.post('/invite', (req, res) => {
    var mailOptions = {
        from: 'dkps0081@gmail.com',
        to: req.body.xyz,
        subject: 'Sending Email using Node.js',
        text: 'That was easy! ----or bhailog kya halchal'
    };
    emailTransporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.redirect('/');
    // console.log(req.body)
    // console.log("came")
    // emailTransporter.sendMail(mailOptions);

})