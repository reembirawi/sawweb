const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public")); // make public folder available, serve static files (CSS, JS, images)

app.get('/', (req, res) => {
        res.render('homepage');
});
app.listen(5000);