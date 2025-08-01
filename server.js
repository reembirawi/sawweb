require("dotenv").config();
const jwt = require("jsonwebtoken"); // used to generate and verify login tokens (JWTs).
const bcrypt = require("bcrypt"); // used to hash passwords securely.
const cookieParser = require("cookie-parser");  
const express = require("express"); // include express, creates the server and handles routes.
const db = require("better-sqlite3")("ourApp.db") // the name of our data base file, SQLite wrapper for fast, synchronous queries.
db.pragma("journal_mode = WAL") // improves concurrency and speed in SQLite.
 
const app = express();  
app.use(express.static("public")); // make public folder available, serve static files (CSS, JS, images)
app.set("view engine", "ejs");// use EJS for rendering HTML templates
app.use(express.urlencoded({ extended : false }));// parse URL-encoded form data 
app.use(express.static("public")); // make public folder available, serve static files (CSS, JS, images)
app.use(cookieParser()); 

// database setup here
const createTables = db.transaction(() => {
        db.prepare(
                `
                 CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        password STRING NOT NULL,
                        national_id STRING NOT NULL UNIQUE,
                        email STRING NOT NULL UNIQUE,
                        phone STRING NOT NULL
                )

                `
        ).run();
});  

createTables();
// database end here
 
const createMockTables = db.transaction(() => {
        db.prepare(`
                CREATE TABLE IF NOT EXISTS posts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        body TEXT NOT NULL,
                        authorid INTEGER NOT NULL,
                        createdDate TEXT NOT NULL
                )
        `).run();
});

createMockTables();

const seedMockData = db.transaction(() => {
        const rowCount = db.prepare("SELECT COUNT(*) as count FROM posts").get().count;
        if (rowCount > 0) return; // Table already has data, skip seeding

        const insertPost = db.prepare(`
                INSERT INTO posts (title, body, authorid, createdDate)
                VALUES (?, ?, ?, ?)
        `);

        const now = new Date().toISOString();

        insertPost.run("مشكلة في المياه", "تسرب شديد في أنابيب المياه أدى إلى انقطاعها عن الحي منذ الصباح الباك", 1, now);
        insertPost.run("عطل في الكهرباء", "انقطاع التيار الكهربائي المتكرر خلال الليل مما سبب إزعاجًا للسكان وتلفًا في بعض الأجهز", 1, now);
        insertPost.run("حفرة في الشارع", "حفرة كبيرة تعيق حركة المرور وقد تسببت بالفعل في أضرار لبعض السيارات المار", 2, now);
        insertPost.run("عطل في الإضاءة", "أعمدة الإنارة في الحي لا تعمل منذ أيام، مما يسبب ظلامًا تامًا ليلاً ويعرض السكان للخط", 2, now); 
}); 

seedMockData()

const createMockComplaints = db.transaction(() => {
        db.prepare(`
                CREATE TABLE IF NOT EXISTS complaints (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        body TEXT NOT NULL,
                        authorid INTEGER NOT NULL,
                        createdDate TEXT NOT NULL
                )
        `).run();
});

createMockComplaints();

const seedMockComplaints = db.transaction(() => {
        const rowCount = db.prepare("SELECT COUNT(*) as count FROM complaints").get().count;
        if (rowCount > 0) return; // Table already has data, skip seeding

        const insertPost = db.prepare(`
                INSERT INTO complaints (title, body, authorid, createdDate)
                VALUES (?, ?, ?, ?)
        `);

        const now = new Date().toISOString();

        insertPost.run("مشكلة في المياه", "تسرب شديد في أنابيب المياه أدى إلى انقطاعها عن الحي منذ الصباح الباك", 1, now);
        insertPost.run("عطل في الكهرباء", "انقطاع التيار الكهربائي المتكرر خلال الليل مما سبب إزعاجًا للسكان وتلفًا في بعض الأجهز", 1, now);
        insertPost.run("حفرة في الشارع", "حفرة كبيرة تعيق حركة المرور وقد تسببت بالفعل في أضرار لبعض السيارات المار", 2, now);
        insertPost.run("عطل في الإضاءة", "أعمدة الإنارة في الحي لا تعمل منذ أيام، مما يسبب ظلامًا تامًا ليلاً ويعرض السكان للخط", 2, now); 
}); 

seedMockComplaints();

app.use((req, res, next) => { // middleware to solve "errors no defined" problem
        res.locals.errors = [];

        try {
                const decoded = jwt.verify(req.cookies.sawweb, process.env.JWTSECRET);
                req.user = decoded;
        } catch (err) {
                req.user = false;
        }

        res.locals.user = req.user; // res.locals should exist here
        console.log(req.user);
        next();
})



app.get("/", (req, res) => { // "/" -> root of my project
        if(req.user) {
                return res.render("dashboard"); // render dashboard
        } 
        res.render('login'); // render homepage
}); 

app.get("/dashboard", (req, res) => { // "/" -> root of my project
        if(req.user) {
                return res.render("dashboard"); // render dashboard
        } 
        res.render('login'); // render homepage
}); 


app.get("/homepage", (req, res) => {
        res.render("homepage");
});


app.get("/login", (req, res) => {
        res.render('login'); // render login page
}); 

app.get("/logout", (req, res) => {
        res.clearCookie("sawweb");
        res.redirect("/");
});


app.get("/complaints", (req, res) => {
        const complaints = db.prepare("SELECT * FROM complaints").all(); 
        console.log(complaints);
        res.render("complaints", { complaints }); 
});

app.get("/suggestion", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts").all(); 
    console.log(posts);
    res.render("suggestion", { posts }); 
});

app.get("/setting", (req, res) => {
        res.render("setting"); 
});
app.get("/profile", (req, res) => {
        res.render("profile"); 
});
 

// .............................................
// const mustBeLoggIn = (req, res, next) => {
//         if(req.user) {
//                 return next();
//         }

//         res.redirect("/");
//         next();
// }

// app.get('/create-post', mustBeLoggIn, (req, res) => {
//         res.render("create-post");
// })

// const sharedPostValidation = (req) => {
//         const errors = [];

//         if (typeof req.body.title !== "string") req.body.title = "";
//         if (typeof req.body.body !== "string") req.body.body = "";

//         req.body.title = sanitizeHTML(req.body.title.trim(), {
//                 allowedTags: [],
//                 allowedAttributes: {},
//         });
//         req.body.body = sanitizeHTML(req.body.body.trim(), {
//                 allowedTags: [],
//                 allowedAttributes: {},
//         });

//         if (!req.body.title) errors.push("You must provide a title");
//         if (!req.body.body) errors.push("You must provide content");

//         return errors;
// };

// app.get("/post/:id", (req, res) => {
//         const statement = db.prepare("SELECT posts.*, users.username FROM posts INNER JOIN users ON posts.authorid = users.id WHERE posts.id = ?");
//         const post = statement.get(req.params.id);// params somthing from url

//         if(!post) {
//                 return res.redirect("/");
//         }

//         res.render("single-post", {post});

// })

// app.post("/create-post", mustBeLoggIn, (req, res) => {
//         const errors = sharedPostValidation(req)

//         if(errors.length) {
//                 return res.render("create-post", {errors});
//         }

//         // save into database

//         const ourStatement = db.prepare("INSERT INTO posts  (title, body, authorid, createdDate) VALUES (?, ?, ?, ?) ")
//         const result = ourStatement.run(req.body.title, req.body.body, req.user.userid, new Date().toISOString());

//         const getPostStatement = db.prepare("SELECT * FROM posts WHERE ROWID = ?")
//         const realPost = getPostStatement.get(result.lastInsertRowid)

//         res.redirect(`/post/${realPost.id}`)

// })

// .............................................
app.post("/login", (req, res) => {
    let errors = [];

    const nationalId = typeof req.body.nationalId === "string" ? req.body.nationalId.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (nationalId === "" || password === "") {
        errors.push("Invalid national ID / password");
        return res.render("login", { errors });
    }

    // Check if user with the given national ID exists
    const userInQuestionStatement = db.prepare("SELECT * FROM users WHERE national_id = ?");
    const userInQuestion = userInQuestionStatement.get(nationalId);

    if (!userInQuestion) {
        errors.push("Invalid national ID / password");
        return res.render("login", { errors });
    }

    // Check if password matches
    const matchOrNot = bcrypt.compareSync(password, userInQuestion.password);
    if (!matchOrNot) {
        errors.push("Invalid national ID / password");
        return res.render("login", { errors });
    }

    // Issue login token
    const ourTokenValue = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            userid: userInQuestion.id,
            national_id: userInQuestion.national_id,
            email: userInQuestion.email
        },
        process.env.JWTSECRET
    );

    res.cookie("sawweb", ourTokenValue, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24
    });

    res.redirect("/");
});

app.post("/signup", (req, res) => { 
        const errors = [];

        const password = typeof req.body.password === "string" ? req.body.password : "";
        const nationalId = typeof req.body.nationalId === "string" ? req.body.nationalId.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
        const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";

        // Validate inputs
        if (!nationalId) errors.push("You must provide a national ID.");
        if (db.prepare("SELECT * FROM users WHERE national_id = ?").get(nationalId)) {
        errors.push("This national ID is already registered.");
        }

        if (!email) errors.push("You must provide an email.");
        if (db.prepare("SELECT * FROM users WHERE email = ?").get(email)) {
        errors.push("This email is already registered.");
        }

        if (!phone) errors.push("You must provide a phone number.");

        if (!password) errors.push("You must provide a password.");
        if (password.length < 12) errors.push("Password must be at least 12 characters.");
        if (password.length > 70) errors.push("Password can't exceed 70 characters.");

        if (errors.length) return res.render("homepage", { errors });

        // Hash password and insert user
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const insert = db.prepare("INSERT INTO users (password, national_id, email, phone) VALUES (?, ?, ?, ?)");
        const result = insert.run(hashedPassword, nationalId, email, phone);

        const user = db.prepare("SELECT * FROM users WHERE ROWID = ?").get(result.lastInsertRowid);

        // Issue login token
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            userid: user.id,
            national_id: user.national_id,
            email: user.email
        }, process.env.JWTSECRET);

        res.cookie("sawweb", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24
        });

        res.redirect("/");
});



app.listen(5001);