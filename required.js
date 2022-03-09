
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const mysql = require('mysql');
// create here mysql connection
const dbConn = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'mypass',
    database: 'Ecommerce_db'
});
dbConn.connect(function(error){
    if(error) throw error;
    console.log('Database Connected Successfully!!!');
})
module.exports = dbConn;

let db = dbConn.emit(false, '');

const secret = "1SBz93MsqTs7KgwARcB0I0ihpILIjk3w";

module.exports = {
    database: db,
    secret: secret,
    checkAuth: (req, res, next) => {
        if (req.headers['authorization']) {
            try {
                let authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    req.jwt = jwt.verify(authorization[1], secret);
                    return next();
                }
            } catch (err) {
                return res.status(403).send("Authentication failed");
            }
        } else {
            return res.status(401).send("No authorization header found.");
        }
    },    
    checkAuthFields: (req, res, next) => {
        let errors = [];

        if (req.body) {
            if (!req.body.email) {
                errors.push('Missing email field');
            }
            if (!req.body.password) {
                errors.push('Missing password field');
            }

            if (errors.length) {
                return res.status(400).send({errors: errors.join(',')});
            } else {
                return next();
            }
        } else {
            return res.status(400).send({errors: 'Missing email and password fields'});
        }
    },
    verifyAuthMatch: async (req, res, next) => {
        const myPassword = req.body.password;
        const myEmail = req.body.email;          
              
        const user = await db.table('users').filter({$or:[{ email : myEmail },{ username : myEmail }]}).get();
        if (user) {
            const match = await bcrypt.compare(myPassword, user.password);
            
            if (match) {
                req.username = user.username;
                req.email = user.email;
                next();
            } else {
                res.status(401).send("Username or password incorrect");
            }
            
        } else {
            res.status(401).send("Username or password incorrect");
        }
        
        
        

    }
};