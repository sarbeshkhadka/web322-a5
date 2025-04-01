/**************************************************
 * WEB322 – Assignment 05 
 * (Express server configuration and routes)
 **************************************************/
const express = require("express");
const path = require("path");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcryptjs");

// Import data service module and models
const projectService = require("./modules/projects");
const { User } = require("./models/projects");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// Set EJS as the view engine and point to views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing request bodies and serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
// File upload middleware
app.use(fileUpload());

// Session middleware for login sessions
app.use(session({
  secret: process.env.SESSION_SECRET || "assignment5-secret",
  resave: false,
  saveUninitialized: false
}));

// Make session user data available in all EJS views as variable `user`
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Database initialization before handling requests
let dbInitialized = false;
projectService.initializeDB().then(() => {
  console.log("Database synced successfully");
  dbInitialized = true;
}).catch(err => {
  console.error("Database initialization failed:", err);
  dbInitialized = false;
});

// Ensure DB is initialized for non-GET requests
app.use((req, res, next) => {
  if (!dbInitialized && req.method !== 'GET') {
    return res.status(503).render('500', { message: "Database not initialized. Please try again later." });
  }
  next();
});

/********************
 *  Route Handlers  *
 ********************/

// Home Page – list all projects (used to show featured projects)
app.get("/", async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.render("index", { projects });
  } catch (err) {
    console.error("Error fetching projects for home:", err);
    res.render("index", { projects: [] });
  }
});

// About Page
app.get("/about", (req, res) => {
  res.render("about");
});

// Projects List Page (Inventory) – shows all projects grouped by sector
app.get("/solutions/projects", async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.render("projects", { projects });
  } catch (err) {
    console.error("Error fetching projects list:", err);
    res.status(500).render("500", { message: "Error loading projects." });
  }
});

// Individual Project Details Page
app.get("/solutions/projects/:id", async (req, res) => {
  try {
    const project = await projectService.getProjectById(parseInt(req.params.id));
    res.render("project", { project });
  } catch (err) {
    console.error("Error fetching project details:", err);
    res.status(404).render("404", { message: "Project not found" });
  }
});

// Add Project Form (GET) – protected route
app.get("/solutions/addProject", ensureDataEntryClerk, async (req, res) => {
  try {
    const sectors = await projectService.getAllSectors();
    res.render("addProject", { sectors });
  } catch (err) {
    console.error("Error fetching sectors for addProject:", err);
    res.status(500).render("500", { message: "Error loading form" });
  }
});

// Add Project (POST) – protected route for adding new project
app.post("/solutions/addProject", ensureDataEntryClerk, async (req, res) => {
  try {
    let { title, feature_img_url, sector_id, intro_short, summary_short, impact, original_source_url } = req.body;
    // If an image file was uploaded, use it instead of feature_img_url
    if (req.files && req.files.feature_img_file) {
      const imgFile = req.files.feature_img_file;
      // Save file to public/images directory
      const uploadPath = path.join(__dirname, "public", "images", imgFile.name);
      await imgFile.mv(uploadPath);
      feature_img_url = "/images/" + imgFile.name;  // use relative path to static image
    }
    const newProject = await projectService.addProject({
      title, feature_img_url, sector_id, intro_short, summary_short, impact, original_source_url
    });
    res.redirect(`/solutions/projects/${newProject.id}`);
  } catch (err) {
    console.error("Error adding project:", err);
    res.status(500).render("500", { message: "Error adding project" });
  }
});

// Delete Project (POST) – protected route to delete
app.post("/solutions/projects/:id/delete", ensureDataEntryClerk, async (req, res) => {
  try {
    await projectService.deleteProject(parseInt(req.params.id));
    res.redirect("/solutions/projects");
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).render("500", { message: err.message || "Error deleting project" });
  }
});

// Edit Project Form (GET) – protected route
app.get("/solutions/projects/:id/edit", ensureDataEntryClerk, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const [project, sectors] = await Promise.all([
      projectService.getProjectById(projectId),
      projectService.getAllSectors()
    ]);
    res.render("editProject", { project, sectors });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(404).render("404", { message: "Project not found" });
  }
});

// Edit Project (POST) – protected route to save changes
app.post("/solutions/projects/:id/edit", ensureDataEntryClerk, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    let { title, feature_img_url, sector_id, intro_short, summary_short, impact, original_source_url } = req.body;
    // Handle new image upload if provided
    if (req.files && req.files.feature_img_file) {
      const imgFile = req.files.feature_img_file;
      const uploadPath = path.join(__dirname, "public", "images", imgFile.name);
      await imgFile.mv(uploadPath);
      feature_img_url = "/images/" + imgFile.name;
    }
    // Update project
    await projectService.editProject(projectId, {
      title, feature_img_url, sector_id, intro_short, summary_short, impact, original_source_url
    });
    res.redirect(`/solutions/projects/${projectId}`);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).render("500", { message: "Error updating project" });
  }
});

// User Registration (GET)
app.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");  // if already logged in, redirect home
  }
  res.render("sign-up");
});

// User Registration (POST)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if email already exists
    const existing = await User.findOne({ where: { email: email } });
    if (existing) {
      return res.render("sign-up", { error: "Email is already in use." });
    }
    // Create new user with hashed password
    const hashed = bcrypt.hashSync(password, 10);
    const newUser = await User.create({ email: email, password: hashed, role: 'user' });
    // Auto-login the user after registration
    req.session.user = { id: newUser.id, email: newUser.email, role: newUser.role };
    res.redirect("/");
  } catch (err) {
    console.error("Error registering user:", err);
    res.render("sign-up", { error: "Failed to register. Please try again." });
  }
});

// User Login (GET)
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("log-in");
});

// User Login (POST)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.render("log-in", { error: "Invalid email or password." });
    }
    // Compare password
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.render("log-in", { error: "Invalid email or password." });
    }
    // Successful login, set session
    req.session.user = { id: user.id, email: user.email, role: user.role };
    res.redirect("/");
  } catch (err) {
    console.error("Error during login:", err);
    res.render("log-in", { error: "Login failed. Please try again." });
  }
});

// User Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Load Initial Data (Route to bulk insert projects and sectors) – protected
app.get("/load-data/products", ensureDataEntryClerk, async (req, res) => {
    try {
      const sectorCount = await User.sequelize.models.Sector.count();
      if (sectorCount === 0) {
        const sectorData = [
          { sector_name: "Energy" },
          { sector_name: "Forestry" },
          { sector_name: "Transportation" },
          { sector_name: "Agriculture" },
          { sector_name: "Waste Management" }
        ];
        await User.sequelize.models.Sector.bulkCreate(sectorData);
        console.log("Sectors inserted.");
      }
  
      const projCount = await projectService.getAllProjects().then(arr => arr.length);
      if (projCount === 0) {
        const sectors = await User.sequelize.models.Sector.findAll();
        const sectorMap = {};
        sectors.forEach(sec => { sectorMap[sec.sector_name] = sec.id; });
  
        const projectData = [ /* all your project objects here, same as before */ ];
  
        await User.sequelize.models.Project.bulkCreate(projectData);
        console.log("Projects inserted.");
      }
  
      const adminCount = await User.count({ where: { role: 'dataEntryClerk' } });
      if (adminCount === 0) {
        const hashedPass = bcrypt.hashSync("password", 10);
        await User.create({ email: "admin@climate.dev", password: hashedPass, role: "dataEntryClerk" });
        console.log("Admin created.");
      }
  
      res.send("Initial data load completed.");
    } catch (err) {
      console.error("Error loading initial data:", err);
      res.status(500).send("Error loading data: " + err);
    }
  });
  

// Helper middleware to protect routes (only allow dataEntryClerk user)
function ensureDataEntryClerk(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'dataEntryClerk') {
    return res.status(403).send("Forbidden: You do not have access to this resource.");
  }
  next();
}

// Global Error Handler (for any uncaught errors in routes)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).render("500", { message: "An unexpected error occurred." });
});

// 404 Handler (for any unmatched routes)
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// Export app for Vercel (Serverless)
module.exports = app;

// Start server if not in a serverless (production) environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}
