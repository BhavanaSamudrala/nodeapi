const express = require('express');
const router = express.Router();
// const {database} = require('../config/helpers');

var dbConn  = require('../server');

/* GET users listing. */
router.get('/', function (req, res) {
    dbConn.table('users')
        .withFields([ 'username' , 'email', 'id' ])
        .getAll().then((list) => {
        if (list.length > 0) {
            res.json({users: list});
        } else {
            res.json({message: 'NO USER FOUND'});
        }
    }).catch(err => res.json(err));
});

router.get('/:userId', (req, res) => {
    let userId = req.params.userId;
    dbConn.table('users').filter({id: userId})
        .withFields([ 'username' , 'email', 'id' ])
        .get().then(user => {
        if (user) {
            res.json({user});
        } else {
            res.json({message: `NO USER FOUND WITH ID : ${userId}`});
        }
    }).catch(err => res.json(err) );
});

router.patch('/:userId', async (req, res) => {
    let userId = req.params.userId;     // Get the User ID from the parameter

  // Search User in Database if any
    let user = await dbConn.table('users').filter({id: userId}).get();
    if (user) {

        let userEmail = req.body.email;
        let userPassword = req.body.password;
        let userUsername = req.body.username;

        // Replace the user's information with the form data ( keep the data as is if no info is modified )
        dbConn.table('users').filter({id: userId}).update({
            email: userEmail !== undefined ? userEmail : user.email,
            password: userPassword !== undefined ? userPassword : user.password,
            username: userUsername !== undefined ? userUsername : user.username,
        }).then(result => res.json('User updated successfully')).catch(err => res.json(err));
    }
});

module.exports = router;