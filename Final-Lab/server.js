const express  = require("express");

let app = express();

app.use(express.urlencoded());
app.use(express.json());

const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cookieParser());
app.use(session({
    secret: "My session secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

var expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);

app.use(express.static("public"));
app.use(express.static("uploads"));

app.set("view engine", "ejs");
app.set("views", "./views");

const userRoutes = require('./routes/user.routes');
app.use('/', userRoutes);

let routesItem = require("./routes/routes_items");
app.use(routesItem);

let adminroutes = require("./routes/admin.router");
app.use(adminroutes);

const mongoose = require("mongoose");
const category = require("./models/category.models");
let connectionString = "mongodb://127.0.0.1:27017/Zullbery";// ipv4 version of mongodb
// let connectionString = "mongodb://localhost:27017/Zullbery"; //  ipv6 version
mongoose.connect(connectionString)
.then(()=>{
    console.log(`Connected To:${connectionString}`)
})
.catch((err)=>{
    console.log("Error in Mongoose Connecting!!");
})

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get("/add-to-cart/:id", async (req, res) => {
    let cart = req.cookies.cart;
    cart = cart ? cart : [];
    cart.push(req.params.id);
    res.cookie("cart", cart);
    res.redirect("/");
  });
  
  app.get("/cart", async (req, res) => {
    let cart = req.cookies.cart;
    cart = cart ? cart : [];
    let products = await Product.find({ _id: { $in: cart } });
    if (products && products.length > 0) { // Check if products array has items
        return res.render("cart", { layout: false, products:products });
    } else {
        return res.status(400).send("Cart is empty.");
    }
  });

  app.get("/cart/delete/:id",(req,res)=>{
    let cart = req.cookies.cart;
    let id = req.params.id;

    for(let i=0; i<=cart.length;i++){
        if(id == cart[i]){
            delete cart[i];
        }
    }
    res.cookie("cart", cart);
    res.redirect("/cart");
})

app.post("/cart", async (req, res) => {
    try {
        let cart = req.cookies.cart;
        if (!cart || cart.length === 0) {
            return res.status(400).send("Cart is empty.");
        }

        // Get products from database
        let products = await Product.find({ _id: { $in: cart } });
        
        if (!products || products.length === 0) {
            return res.status(400).send("No valid products found in cart.");
        }

        // Create order products array with proper number conversion
        let orderProducts = products.map(product => {
            return {
                description: product.description,
                price: Number(product.price), // Convert to number
                quantity: parseInt(req.body.Quantity) || 1
            };
        });

        // Calculate total with proper number conversion
        const total = orderProducts.reduce((sum, product) => {
            return sum + (product.price * product.quantity);
        }, 0);

        // Create new order
        let order = new Order({
            products: orderProducts,
            Total: Number(total).toFixed(2),
            UserName: req.body.Username,
            Email: req.body.Email,
            Address: req.body.Address,
            orderDate: new Date(),
        });

        await order.save();
        res.clearCookie("cart");
        res.redirect("/");

    } catch (err) {
        console.error("Error processing order:", err);
        res.status(500).send("Error processing order");
    }
});

app.get("/", (req, res) => {
    res.render("Website/index.ejs", {
        layout: false,
        user: req.session.user
    });
});

app.get("/:ProductPages/:page?", async (req, res) => {
    let product = await Product.find({categoryId: req.params.ProductPages});
    res.render("Website/ProductPages", {
        layout: false,
        product,
        user: req.session.user
    });
});

app.listen(5001, ()=>{
    console.log("Server start");
})


