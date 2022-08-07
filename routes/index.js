// Express router let us create SAP applications that listens on specific routes
const express = require('express');

const speakersRoute = require('./speakers');
const feedbackRoute = require('./feedback');
// const { request } = require('express');

const router = express.Router();



// Return the router object defined here from this module
module.exports = params => {
    const { speakersService } = params;

    router.get('/', async (request, response, next) => {
    
        // >>>> A simple visitCounter to test if cookies are working
        // // If does not exit then initializing it
        // if (!request.session.visitcount) {
        //     // It increases seperately for each users
        //     request.session.visitcount = 0;
        // }
        // request.session.visitcount += 1;
        // console.log(`Number of visits: ${request.session.visitcount}`);

        
        // response.sendFile(path.join(__dirname, './static/index.html'));  // Serving a html file
        // return next(new Error('Some Error!'));
        try {
            const artwork = await speakersService.getAllArtwork();
            const topSpeakers = await speakersService.getList();
            // render( pathToATemplate, ObjectContainingLocalVariablesAvailableToTheTemplate )
            return response.render('layout', {pageTitle: 'Welcome', template: 'index', topSpeakers, artwork });
        } catch (err) {
            return next(err);
        }
        
    });

    router.use('/speakers', speakersRoute(params));
    router.use('/feedback', feedbackRoute(params));

    return router;
};
