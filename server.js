require("dotenv").config();
const jwt = require("jsonwebtoken"); // used to generate and verify login tokens (JWTs).
const bcrypt = require("bcrypt"); // used to hash passwords securely.
const cookieParser = require("cookie-parser");  
const express = require("express"); // include express, creates the server and handles routes.
const db = require("better-sqlite3")("ourApp.db") // the name of our data base file, SQLite wrapper for fast, synchronous queries.
db.pragma("journal_mode = WAL") // improves concurrency and speed in SQLite.

app.set('view engine', 'ejs');
app.use(express.static("public")); // make public folder available, serve static files (CSS, JS, images)

app.get('/', (req, res) => {
        res.render('homepage');
});


app.post("/signup", (req, res) => { 
        const errors = [];

        if(typeof req.body.username !== "string") req.body.username = ""
        if(typeof req.body.password !== "string") req.body.password = ""

        req.body.username = req.body.username.trim()
        if(!req.body.username) errors.push("You must provide a username.")
        if(req.body.username && req.body.username.length < 3) errors.push("username must at lest 3 characters.")
        if(req.body.username && req.body.username.length > 10) errors.push("username cant exceed 10 characters.")
        if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("username can only contains letters and numbers.")
        
        const inQuestionuserNameStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?");
        const userNameStatement =  inQuestionuserNameStatement.get(req.body.username);
        
        if(userNameStatement) {
                errors.push("username is already taken.");
                return res.render("homepage", { errors });
        }



        if(!req.body.password) errors.push("You must provide a password.")
        if(req.body.password && req.body.password.length < 12) errors.push("Password must at lest 12 characters.")
        if(req.body.password && req.body.password.length > 70) errors.push("Password cant exceed 10 characters.") 
        
        if(errors.length) { 
                return res.render("homepage", {errors})
        } 
        // 

        
        // save new user to datbase
        const salt = bcrypt.genSaltSync(10);
        req.body.password = bcrypt.hashSync(req.body.password, salt);

        const ourStatement = db.prepare("INSERT INTO users(username, password) VALUES (?, ?)"); // '?' for protection from someone could be trying to input a malicious value
        const result = ourStatement.run(req.body.username, req.body.password);
        
        const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?");

        const ourUser = lookupStatement.get(result.lastInsertRowid);

        // log the user in by giving them a cookie
        const ourTokenValue = jwt.sign(
                {
                        exp: Math.floor(Date.now() / 1000) + 60 * 60 *  24, 
                        skyColor: "blue", userid: ourUser.id, 
                        username: ourUser.username
                },
                process.env.JWTSECRET
        );
        // exp: how long it should be valid 

        res.cookie("ourSimpleApp", ourTokenValue, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24
        });

        res.redirect("/");
 
});



app.listen(5000);