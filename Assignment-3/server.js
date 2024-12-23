const express  = require("express");

let app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req,res)=>{
    res.render("index.ejs")
})

app.listen(5001, ()=>{
    console.log("Server start");
})
