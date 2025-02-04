/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: [Your Name] Student ID: [188383236]  Date: 2025-02-01
*
********************************************************************************/

const express = require("express");
const projectData = require("./modules/projects");

const app = express();
const PORT = process.env.PORT || 8080;

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
app.get("/", (req, res) => {
    res.send("Assignment 2: [Sarbesh Khadka] - [188383236]");
});

app.get("/solutions/projects", (req, res) => {
    projectData.getAllProjects()
        .then(projects => {
            res.json({
                student: "[Sarbesh Khadka]",
                studentId: "[188383236]",
                timestamp: new Date().toISOString(),
                projects
            });
        })
        .catch(err => res.status(500).send(err));
});

app.get("/solutions/projects/id-demo", (req, res) => {
    projectData.getProjectById(25)
        .then(project => {
            res.json({
                student: "[Sarbesh Khadka]",
                studentId: "[188383236]",
                timestamp: new Date().toISOString(),
                project
            });
        })
        .catch(err => res.status(404).send(err));
});

app.get("/solutions/projects/sector-demo", (req, res) => {
    projectData.getProjectsBySector("agriculture")
        .then(projects => {
            res.json({
                student: "[Sarbesh Khadka]",
                studentId: "[188383236]",
                timestamp: new Date().toISOString(),
                projects
            });
        })
        .catch(err => res.status(404).send(err));
});
