const express = require("express");
let router = express.Router();
let multer = require("multer");
const session = require("express-session");
// const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
    destination: function (req, file, ah) {
        ah(null, "./uploads"); //To save files
    },
    filename: function (req, file, ah) {
        ah(null, `${Date.now()}-${file.originalname}`); //Filename
    }
});

const upload = multer({ storage: storage });

let Product = require("../models/products.models");
let Category = require("../models/category.models");
const Order = require("../models/order.models");

router.use(
    session({
        secret: "your-secret-key", //Unique Session ID Cookie
        resave: false,// Prevents unnecessary session saves
        saveUninitialized: false, // Avoids storing empty sessions
        cookie: { secure: false } // Avoids storing empty sessions

    })
);


//Middleware for session
function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.redirect("/admin/login");
}

router.get("/admin/login", (req, res) => {
    if(req.session.isLoggedIn){
        res.redirect("/admin/dashboard");
    }
    else{
        res.render("Admin/login", { layout: false });
    }
})



router.get("/admin/categories", isAuthenticated, async (req, res) => {
    let category = await Category.find();
    res.render("Admin/category", { layout: "admin-layout.ejs", category });
})

router.get("/admin/categories/createCategory", async (req, res) => {
    res.render("Admin/createCategory", { layout: "admin-layout.ejs" });
})

router.post("/admin/categories/createCategory", async (req, res) => {
    let categoryProduct = new Category(req.body);
    categoryProduct.In_Stock = Boolean(req.body.In_Stock);
    await categoryProduct.save();
    return res.redirect("/admin/categories");
})

router.get("/admin/categories/delete/:id", async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    return res.redirect("back");
})

router.get("/admin/categories/edit/:id", async (req, res) => {
    let category = await Category.findById(req.params.id);
    return res.render("Admin/Edit-category", { layout: "admin-layout.ejs", category });
})

router.post("/admin/categories/edit/:id", async (req, res) => {
    let category = await Category.findById(req.params.id);
    category.category = req.body.category;
    category.description = req.body.description;
    category.price = req.body.price;
    category.src = req.body.src
    category.In_Stock = Boolean(req.body.In_Stock);
    await category.save();
    return res.redirect("/admin/categories");
})




router.get("/admin/products/create", isAuthenticated, async (req, res) => {
    let categories = await Category.find();
    res.render("Admin/create", { layout: "admin-layout.ejs", categories });
})

router.get("/admin/products/edit/:id", isAuthenticated, async (req, res) => {
    let product = await Product.findById(req.params.id);
    return res.render("Admin/edit-form", { layout: "admin-layout.ejs", product });
})
router.post("/admin/products/edit/:id", isAuthenticated, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        
        // Keep the existing values if not provided in the request
        product.title = req.body.title || product.title;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.quantity = req.body.quantity || product.quantity;
        // Preserve the existing categoryId if not provided
        product.categoryId = req.body.categoryId || product.categoryId;
        product.isFeatured = Boolean(req.body.isFeatured);
        // Handle sizes array
        product.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes].filter(Boolean);
        
        await product.save();
        return res.redirect("/admin/products");
    } catch (error) {
        console.error("Edit product error:", error);
        res.status(500).send("Error updating product");
    }
});

router.get("/admin/products/delete/:id", isAuthenticated, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    return res.redirect("back");
})

router.post("/admin/products/create", isAuthenticated, upload.single("file"), async (req, res) => {
    let newProduct = new Product(req.body);
    newProduct.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];
    if(req.file) newProduct.src = req.file.filename; 
    newProduct.isFeatured = Boolean(req.body.isFeatured);
    await newProduct.save();
    return res.redirect("/admin/products");
})


router.get("/admin/products/:page?/:sort?/:category?", isAuthenticated, async (req, res) => {
    try {
        const sort = req.params.sort;
        const category = req.params.category;
        let page = req.params.page ? Number(req.params.page) : 1;
        let pageSize = 4;
        let query = {};

        // Add category filter if specified
        if (category && category !== 'all') {
            query.categoryId = category;
        }

        // Get total count for pagination
        let totalRecords = await Product.countDocuments(query);
        let totalPages = Math.ceil(totalRecords / pageSize);

        // Get products with pagination and filtering
        let products = await Product.find(query)
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        // Apply sorting
        if (sort === "ASC") {
            products = products.sort((a, n) => a.price - n.price);
        } else if (sort === "DSC") {
            products = products.sort((a, n) => n.price - a.price);
        } else if (sort === "Quantity") {
            products = products.sort((a, n) => a.quantity - n.quantity);
        }

        res.render("Admin/products", {
            layout: "admin-layout.ejs",
            products,
            totalPages,
            page,
            totalRecords,
            sort: sort || 'Default',
            currentCategory: category || 'all'
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products!");
    }
});


router.get("/admin/dashboard", isAuthenticated, async (req, res) => {
    try {
        // Fetch all orders
        const orders = await Order.find().sort({ orderDate: -1 });
        
        // Calculate total revenue by summing up all order totals
        const totalRevenue = orders.reduce((sum, order) => {
            // Calculate total for each order by multiplying price with quantity
            const orderTotal = order.products.reduce((orderSum, product) => {
                return orderSum + (product.price * product.quantity);
            }, 0);
            return sum + orderTotal;
        }, 0);
        
        res.render("Admin/dashboard", {
            layout: "admin-layout.ejs",
            orders,
            totalRevenue: totalRevenue.toFixed(2)
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).send('Error loading dashboard');
    }
});



module.exports = router;