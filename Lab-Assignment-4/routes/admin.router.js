const express = require("express");
let router = express.Router();
const session = require("express-session");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin_schema");

let newAdmin = null;


router.get("/admin/permission", (req,res)=>{

    res.render("Admin/permission",{layout:false});
})

// Register Admin
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if admin already exists
        var existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).send("Admin already exists!");
        }

        // Hash password
        var hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        newAdmin = new Admin({ username, password: hashedPassword });

        //Check for Permission
        const firstadmin = await Admin.countDocuments();
        if(firstadmin > 0){
            res.redirect("/admin/permission");
        }
        else{
            await newAdmin.save();
            res.redirect("/admin/login");
        }

    } catch (error) {
        res.status(500).send("Error registering admin!");
    }
});

router.post("/permission", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).send("Invalid username or password!");
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid username or password!");
        }

        if(admin && isMatch){
            await newAdmin.save();
            res.redirect("/admin/login");
        }
        else{
            res.status(500).send("You are not Admin!!!");
        }

    } catch (error) {
        res.status(500).send("Error logging in admin!");
    }
});

// Login Admin
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).send("Invalid username or password!");
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send("Invalid username or password!");
        }

        //Session Data
        req.session.isLoggedIn = true;
        req.session.admin = { username: admin.username };

        // Redirect to dashboard
        res.redirect("/admin/dashboard");
    } catch (error) {
        res.status(500).send("Error logging in admin!");
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error logging out!");
        }
        res.redirect("/admin/login");
    });
});

module.exports = router;
