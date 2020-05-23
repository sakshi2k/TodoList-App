const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = require('url');
const date = require(__dirname + "/date.js");

require('dotenv').config()

const app = express();

let defaultItems = [{name : "Keep smiling"}];

const DB_Password = process.env.DB_Password;
const DB_Username = process.env.DB_Username;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-"+DB_Username+":"+DB_Password+"@cluster0-2xnk3.gcp.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true} );
mongoose.set('useFindAndModify', false)

            /************************* Mongoose *****************************/                                               
const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name : String,
    listItems : [itemsSchema]
}

const List = mongoose.model("List", listSchema);

            /************************* ROUTES *****************************/                                               
// List of the home route
app.get("/", (req, res) => {
    let day = date.getDate();

    Item.find({}, function(err, itemsRecieved){
        res.render('list', {listHeading : "Hey, it's "+day, newListItems : itemsRecieved });
    });
});

// List to the custom route
app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({name : customListName}, function(err,foundItem){
        if(!err){
            if(!foundItem){
                const list = new List({
                    name: customListName,
                    listItems : defaultItems
                }); 
                list.save(); 
                res.redirect("/" + customListName);
            } else {
                res.render('list', {listHeading : foundItem.name, newListItems : foundItem.listItems})
            }
        }
    })       
})

// Adding items to list.
app.post("/", (req, res) =>{
    let item = req.body.newItem;
    let listHeading = req.body.listHeading;
    const day = date.getDate();
    
    let newItem  = new Item({
        name: item
    });    

    if (listHeading === "Hey, it's " + day){                
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name : listHeading}, function(err, foundItem){
            if(!err){
                if(foundItem){
                    foundItem.listItems.push(newItem);
                    foundItem.save();
                    res.redirect("/" + listHeading);
                } else {
                    console.log("Item not found in list array. Error!!!");
                }
            }
        });
    }
});

// Deleting items from list
app.post("/delete", (req, res) => {
    let day = date.getDate();
    let listHeading = req.body.listHeading;
    let toDeleteItemById = req.body.crossout;
    
    if(listHeading === "Hey, it's "+day){
        Item.findByIdAndRemove(toDeleteItemById,function(err){
            if(!err){
                console.log("Successfully deleted from " + listHeading);
                res.redirect("/");
            } else {
                console.log(err);
            }
        });
    } else {

        List.findOneAndUpdate({name: listHeading}, {$pull: {listItems : {_id : toDeleteItemById} } } ,
             function(err, foundItem) {
                    if(!err){
                        res.redirect("/" + listHeading.toLowerCase());
                    }
        });
        
    }
});

// To change List
app.post("/changeList", function(req, res) {
    const listName = req.body.listName;
    res.redirect("/"+listName);
})

app.listen(3000, () => {
    console.log("Port started at 3000");
});