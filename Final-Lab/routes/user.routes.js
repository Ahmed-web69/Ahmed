const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Customer = require("../models/user.models");

router.use((req, res, next) => {
    console.log('User Routes - Path:', req.path);
    next();
});

// Get login page
router.get("/user/login", (req, res) => {
    console.log('Attempting to render login page');
    try {
        if (req.session.isUserLoggedIn) {
            console.log('User already logged in, redirecting');
            return res.redirect("/");
        }
        console.log('Rendering login page');
        return res.render("Website/user-login", { 
            layout: false,
            registered: req.query.registered === 'true'
        });
    } catch (error) {
        console.error("Login page error:", error);
        res.status(500).send("Error loading login page");
    }
});

// User Registration
router.post("/user/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await Customer.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username or email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new Customer({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.redirect("/user/login?registered=true");

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Error registering user"
        });
    }
});

// User Login
router.post("/user/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await Customer.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Set user session
        req.session.isUserLoggedIn = true;
        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        res.redirect("/wishlist");

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Error logging in"
        });
    }
});

// User Logout
router.get("/user/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error logging out"
            });
        }
        res.redirect("/");
    });
});

// Add this temporary test route
router.get("/test-login", (req, res) => {
    res.send("Login route is working");
});

module.exports = router; 