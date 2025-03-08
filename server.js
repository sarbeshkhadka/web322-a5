/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: [Sarbesh Khadka] Student ID: [188383236] Date: [2025-03-08]
*
*  Published URL: []
*
********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");
const sectorData = require("./data/sectorData");  

const app = express();
const PORT = process.env.PORT || 8080;

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Initialize project data
projectData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Initialization failed:", err);
    });

// Routes

// Home Page
app.get("/", async (req, res) => {
    try {
        const projects = await projectData.getAllProjects();
        res.render("index", { projects });
    } catch (err) {
        res.render("index", { projects: [] });
    }
});

// About Page
app.get("/about", (req, res) => {
    res.render("about");
});

// Projects List (Filter by sector if present)
app.get("/solutions/projects", async (req, res) => {
    const sector = req.query.sector;  // Get the sector parameter from the query string
    try {
        let projects;
        if (sector) {
            // Get projects filtered by the sector
            projects = await projectData.getProjectsBySector(sector);
        } else {
            // If no sector is provided, get all projects
            projects = await projectData.getAllProjects();
        }

        // Pass sectorData to the view
        res.render("projects", { projects, sector, sectorData });
    } catch (err) {
        console.error(err);
        res.render("projects", { projects: [], sector, sectorData });
    }
});



// Individual Project Page
app.get("/solutions/projects/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    try {
        const project = await projectData.getProjectById(projectId);
        res.render("project", { project });
    } catch (err) {
        res.status(404).render("error");
    }
});

// 404 Page
app.use((req, res) => {
    res.status(404).render("error");
});
