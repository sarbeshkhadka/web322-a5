// •	Add the following declaration at the top of your server.js file:
/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Sarbesh Khadka Student ID: 188383236 Date: 2025/03/25
 *
 *  Published URL: ___________________________________________________________
 *
 ********************************************************************************/

// server.js
const { Project, Sector, sequelize } = require("./models/projects"); // Import Project and Sector models
const express = require("express");
const path = require("path");
const projectData = require("./modules/projects"); // Correctly handling both Project and Sector
// const { Sector } = require("./models/projects");  // Alternatively, import Sector directly if needed
require("dotenv").config();

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
let isInitialized = false;
let initializationPromise = null;

async function ensureInitialized() {
  if (!isInitialized) {
    if (!initializationPromise) {
      initializationPromise = projectData.initialize()
        .then(() => {
          isInitialized = true;
          console.log("Database initialized successfully");
        })
        .catch((err) => {
          console.error("Database initialization failed:", err);
          isInitialized = false;
          initializationPromise = null;
          throw err;
        });
    }
    await initializationPromise;
  }
}

// Wrap all route handlers with error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("Route handler error:", err);
    next(err);
  });
};

// Home Page
app.get("/", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const projects = await projectData.getAllProjects();
  res.render("index", { projects });
}));

// About Page
app.get("/about", (req, res) => {
  res.render("about");
});

// Projects List (Filter by sector if present)
app.get("/solutions/projects", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const sector = req.query.sector;
  let projects;
  const sectors = await projectData.getAllProjects();

  if (sector) {
    projects = await projectData.getProjectsBySector(sector);
  } else {
    projects = await projectData.getAllProjects();
  }

  res.render("projects", { projects, sector, sectorData: sectors });
}));

// Individual Project Page
app.get("/solutions/projects/:id", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const projectId = parseInt(req.params.id);
  const project = await projectData.getProjectById(projectId);
  if (!project) {
    return res.status(404).render("error");
  }
  res.render("project", { project });
}));

// Add Project Page
app.get("/solutions/addProject", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const sectors = await projectData.getAllSectors();
  res.render("addProject", { sectors });
}));

// Add Project Route
app.post("/solutions/addProject", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const {
    title,
    feature_img_url,
    sector_id,
    intro_short,
    summary_short,
    impact,
    original_source_url,
  } = req.body;

  const newProject = await Project.create({
    title,
    feature_img_url,
    sector_id,
    intro_short,
    summary_short,
    impact,
    original_source_url,
  });

  res.redirect(`/solutions/projects/${newProject.id}`);
}));

// Delete Project Route
app.post("/solutions/projects/:id/delete", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const projectId = req.params.id;
  const project = await Project.findByPk(projectId);

  if (!project) {
    return res.status(404).send("Project not found");
  }

  await project.destroy();
  res.redirect("/solutions/projects");
}));

// Edit Project Page
app.get("/solutions/projects/:id/edit", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const projectId = parseInt(req.params.id);
  const project = await projectData.getProjectById(projectId);
  const sectors = await projectData.getAllSectors();
  
  if (!project) {
    return res.status(404).render("error");
  }
  
  res.render("editProject", { project, sectors });
}));

// Update Project Route
app.post("/solutions/projects/:id/edit", asyncHandler(async (req, res) => {
  await ensureInitialized();
  const projectId = parseInt(req.params.id);
  const {
    title,
    feature_img_url,
    sector_id,
    intro_short,
    summary_short,
    impact,
    original_source_url,
  } = req.body;

  const project = await Project.findByPk(projectId);
  if (!project) {
    return res.status(404).send("Project not found");
  }

  await project.update({
    title,
    feature_img_url,
    sector_id,
    intro_short,
    summary_short,
    impact,
    original_source_url,
  });

  res.redirect(`/solutions/projects/${project.id}`);
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).render("error", { 
    message: "An error occurred while processing your request.",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Page
app.use((req, res) => {
  res.status(404).render("error");
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  projectData.initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("Initialization failed:", err);
  });
}

module.exports = app;
