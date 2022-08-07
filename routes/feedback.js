const express = require('express');
// Check is a routing middleware, it accepts the same request response and next signature like any other handler function. 
const {check, validationResult} = require('express-validator');
const router = express.Router();

module.exports = params => {

    const {feedbackService} = params;

    // In the GET route we can fetch erros from the session object if there were any errors when form submittion was done
    router.get('/', async (request, response) => {
        try {
            const feedback = await feedbackService.getList();

            const errors = request.session.feedback ? request.session.feedback.errors : false;
            const successMessage = request.session.feedback ? request.session.feedback.message : false;

            request.session.feedback = {} // After we stored the errors, we can reset the state

            // To pass these errors into the template we can just add it as template variable

            return response.render('layout', {pageTitle: 'Feedback', template: 'feedback', feedback, errors, successMessage});
        } catch (err) {
            return next(err);
        }
    });
    
    // The 2nd parameter (array) is for input validation
    // When a request comes into this route, all the checks will run & in the end the last next handler will lead 
    //  to the actual handler function that we created where we can then check if there were any errors.
    router.post('/', [
        check('name')
        .trim()
        .isLength({min: 3})
        .escape()   // Escape if there's any html/js embedded in the text
        .withMessage('A name is required'),
        
        check('email')
        .trim()
        .isEmail()
        .normalizeEmail()  
        .withMessage('A valid email address is required'),
        
        check('title')
        .trim()
        .isLength({min: 3})
        .escape()  
        .withMessage('A title is required'),
        
        check('message')
        .trim()
        .isLength({min: 5})
        .escape()  
        .withMessage('A message is required'),
    ], async (request, response) => {
        // If there we any errors from the checking, then express-validator puts some hints on the request object.
        const errors = validationResult(request);

        // If there were errs, we want to store them in our session object
        // Bcz to display the feedback page again, we will now redirect to the GET route again
        if (!errors.isEmpty()) {
            request.session.feedback = {
                errors: errors.array(),
            };
            return response.redirect('/feedback');
        }

        const {name, email, title, message} = request.body;
        await feedbackService.addEntry(name, email, title, message);
        request.session.feedback = {
            message: 'Thank you for your feedback!'
        }

        // console.log(request.body);
        return response.redirect('/feedback');
    });

    return router;
};
