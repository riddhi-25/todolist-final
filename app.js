//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
mongoose.set('strictQuery', false);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://riddhi25:riddhi17@cluster0.p6rc5zl.mongodb.net/todolistDB")

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item=mongoose.model("item",itemsSchema);
const Item1=new Item({
  name:"welcome to your todolist"
})
const Item2=new Item({
  name:"hi + to add a new item"
})
const Item3=new Item({
  name:"<-- to delete an item"
})

const defaultItems= [Item1, Item2, Item3];

const listSchema= {
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }
        else{
          console.log("successfully saved default items")
        }
      })
      res.redirect("/")
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName)
      }
      else{
        // show existing list
        res.render("list",{
          listTitle:foundList.name,
          newListItems:foundList.items
        });
      }
    }
  })
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
  res.redirect("/")
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName )
    })
  }  
});

app.post("/delete", function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("del successful")
        res.redirect("/")
      }                              
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
