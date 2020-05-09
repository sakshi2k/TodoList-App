const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");

const app = express();

let items = [];
let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

            /************************* ROUTES *****************************/                                               

app.get("/", (req, res) => {
    let day = date.getDate();
    res.render('list', {listHeading : day, newListItems : items});
});

app.post("/", (req, res) =>{
    let item = req.body.newItem;
    
    if(req.body.button === "WORK"){             // key value pair of button clicked .
        workItems.push(item);
        res.redirect("/work");
    }else {
        items.push(item);
        res.redirect("/");
    }
});

app.get("/work", (req, res) => {
    res.render('list', {listHeading : 'WORK', newListItems: workItems});
})

app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(3000, () => {
    console.log("Port started at 3000");
});