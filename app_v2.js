const express = require("express");
const bodyParser = require("body-parser");
// const ejs = require("ejs");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

let items = [{name : "ABC"}, {name: "DEF"}];
let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true} );

            /************************* Mongoose *****************************/                                               
const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({name: "code"})
const item2 = new Item({name: "dance"})
let defaultItems = [item1, item2];

            /************************* ROUTES *****************************/                                               

app.get("/", (req, res) => {
    let day = date.getDate();

    Item.find({}, function(err, itemsRecieved){
        // if(itemsRecieved.length === 0){
        //     Item.insertMany(defaultItems, function(err){
        //         if(err){console.log("ERROR : " + err);}
        //         else {console.log("Successfully saved to default list");} });
        //     res.redirect("/");
        // } else {
            res.render('list', {listHeading : "Hey, it's "+ day, newListItems : itemsRecieved });
        // }
        });
});

app.post("/", (req, res) =>{
    let item = req.body.newItem;
    
    let newItem  = new Item({
        name: item
    })    
    newItem.save();
    res.redirect("/");
});

app.post("/delete", (req, res) => {
    console.log(req.body.crossout);
    let toDeleteItem = req.body.crossout;
    Item.findByIdAndRemove(toDeleteItem, function(err){
        if(!err){
            res.redirect("/");
        } else {
            console.log(err);
        }
    });
});


app.listen(3000, () => {
    console.log("Port started at 3000");
});