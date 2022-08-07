// This is the Entry-Point File

// const { request } = require('express');
const express = require('express');
const path = require('path'); // Needed for serving static files

const cookieSession = require('cookie-session');
const createError = require('http-errors');

const bodyParser = require('body-parser');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

const routes = require('./routes');  // This will default to the index.js file in routes
const { request } = require('http');


// Create an instance of express
const app = express();

app.locals.siteName = 'ROUX Academy';

// This is the port the application shuold listen to
const port = 3000;

// console.log("Restarting...")

// Express.static() is a middleware. Middlewares are applied using app.use()
// This will instruct Express to look into the static folder for each request it receives
//  and if it finds a matching file, it'll send it to the browser.

// !!! >>> If you ever deploy this application to a web server and 
//     usually this runs behind a reverse proxy like NGINX, then
//     your whole cookie system might not work ('FAIL' in production) because you have to
//     add app.set('trust proxy', 1); And this makes express trust 
//     cookies that are passed through a reverse proxy.
//     This is really a hard to track down. <<<<
app.set('trust proxy', 1)


// Adding cookieSesison middleware to the request lifecycle (So we can work with them)
app.use(cookieSession(
    // Have to add a configuration obj here
    {
        name: 'session',
        keys: ['Ghudurd5456', 'dfsdf44sadf8956'], // Keys to encrypt cookies
    }
));

// The body-parser has several sub-modules included and we want to have url encoded because that is how such forms are sent.
// As a parameter to the urlencoded method we have to pass a configuration object.
app.use(bodyParser.urlencoded({extended: true})); // Set extended to true to have proper form parsing in place.

// Tell express to use EJS. No need to require because it'll be discovered automatically
app.set('view engine', 'ejs')
// Tell express where to find the views
app.set('views', path.join(__dirname, './views'))

app.locals.siteName = 'ROUX Meetups';



app.use(express.static(path.join(__dirname, './static')));


// app.get('/throw', (request, response, next) => {
//     setTimeout(()=>{
//         return next(new Error('Something is Thrown!'));
//     })
// });


app.use(async (request, response, next) => {
    try {
        const names = await speakersService.getNames();
        response.locals.speakerNames = names;
        return next();
    }catch(err) {
        return next(err);
    }
});

// app.get('/speakers', (request, response) => {
//     response.sendFile(path.join(__dirname, './static/speakers.html'));
// });

app.use('/', routes({
    feedbackService,
    speakersService,
}));


// If no other routes matches then
app.use((request, response, next) => {
    return next(createError(404, 'File not found'));
});

// Real error handler function
app.use((err, request, response, next) => {
    response.locals.message = err.message;
    console.log(err);   // Becuz it can contain sensetive information, which a client can misuse.
    const status = err.status || 500;  // 500 is the code for internal server error
    response.locals.status = status;
    response.status(status);   // Here we have also set the status on our http response.
    response.render('error');
});


// Start server and start listening at the specified port
app.listen(port, ()=> {
    console.log(`Express Server listening on port ${port}`);
})