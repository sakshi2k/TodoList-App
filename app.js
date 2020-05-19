const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = require('url');
const date = require(__dirname + "/date.js");

const app = express();

let defaultItems = [{name : "Keep smiling"}];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true} );
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

app.get("/", (req, res) => {
    let day = date.getDate();

    Item.find({}, function(err, itemsRecieved){
        res.render('list', {listHeading : "Hey, it's "+day, newListItems : itemsRecieved });
    });
});


app.get("/:UserListChoice", function(req, res) {
    const UserListChoice = req.params.UserListChoice.toLowerCase();

    const myURL = new URL('http://localhost:3000/');
    myURL.href = 'http://localhost:3000/'+UserListChoice;

        List.findOne({name : UserListChoice}, function(err,foundItem){
            if(!err){
                if(!foundItem){
                    const list = new List({
                        name: UserListChoice ,
                        listItems : defaultItems
                    }); 
                    list.save(); 
                    res.redirect("/" + UserListChoice);
                } else {
                    res.render('list', {listHeading : foundItem.name, newListItems : foundItem.listItems})
                }
            }
        })  
})

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

app.post("/delete", (req, res) => {
    let day = date.getDate();
    let listHeading = req.body.listHeading.toLowerCase();
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
                        res.redirect("/" + listHeading);
                    }
        });
        
    }
});


app.listen(3000, () => {
    console.log("Port started at 3000");
});

//
