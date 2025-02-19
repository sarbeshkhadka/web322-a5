/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: [Your Name] Student ID: [188383236] Date: [2025-02-19]
*
*  Published URL: [Your Vercel URL]
*
********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS and other assets)
app.use(express.static(path.join(__dirname, "public")));

// Initialize project data before starting the server
projectData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("Initialization failed:", err);
    });

// Routes

// Home Route - Serve home.html from public/css folder
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "home.html"));
});

// About Route - Serve about.html from public/css folder
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "about.html"));
});

// Projects Route - Filter by sector if present
app.get("/solutions/projects", (req, res) => {
    const sector = req.query.sector;
    const timestamp = new Date().toISOString();
    projectData.getProjects(sector)
        .then(projects => {
            res.json({
                student: "[Sarbesh Khadka]",
                studentId: "[188383236]",
                timestamp,
                projects
            });
        })
        .catch(err => {
            res.status(404).json({
                student: "[Sarbesh Khadka]",
                studentId: "[188383236]",
                timestamp,
                error: err.message
            });
        });
});

// Projects ID Route - Return project by ID
app.get("/solutions/projects/:id", (req, res) => {
    const projectId = parseInt(req.params.id);
    const timestamp = new Date().toISOString();
    projectData.getProjectById(projectId)
        .then(project => {
            res.json({
                student: "[Sarbesh Khadka]",
                studentId: "[188383236]",
                timestamp,
                project
            });
        })
        .catch(err => {
            res.status(404).json({
                student: "[Sarbesh Khadka]",
                studentId: "[188383236]",
                timestamp,
                error: err.message
            });
        });
});

// Custom 404 Route - Serve 404.html from public/css folder
app.get("*", (req, res) => {
    const timestamp = new Date().toISOString();
    res.status(404).sendFile(path.join(__dirname, "public", "views", "404.html"));
});

// POST Route - Handle POST requests
app.post("/post-request", (req, res) => {
    const timestamp = new Date().toISOString();
    res.json({
        student: "[Sarbesh Khadka]",
        studentId: "[188383236]",
        timestamp,
        requestBody: req.body
    });
});
