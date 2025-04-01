/*************************************************
 * Data Service Module for Projects and Sectors
 *************************************************/
const { Op, Sector, Project, initialize } = require("../models/projects");

/**
 * Initialize the database (calls sequelize sync).
 * Returns a promise that resolves if successful.
 */
function initializeDB() {
  return initialize();
}

/**
 * Retrieve all projects from the database, including their Sector data.
 * Resolves to an array of project objects.
 */
function getAllProjects() {
  return Project.findAll({ include: Sector });
}

/**
 * Retrieve a single project by its ID (primary key), including Sector info.
 * Resolves to the project object if found, otherwise rejects with an error.
 */
function getProjectById(id) {
  return Project.findOne({ where: { id: id }, include: Sector }).then(project => {
    if (!project) {
      throw new Error("Unable to find requested project");
    }
    return project;
  });
}

/**
 * Retrieve all projects whose Sector name contains the given string (case-insensitive).
 * Resolves to an array of matching projects.
 */
function getProjectsBySector(sectorName) {
  return Project.findAll({ 
    include: Sector,
    where: { '$Sector.sector_name$': { [Op.iLike]: `%${sectorName}%` } }
  }).then(projects => {
    if (!projects || projects.length === 0) {
      throw new Error("Unable to find requested projects");
    }
    return projects;
  });
}

/**
 * Retrieve all sectors from the database.
 * Resolves to an array of Sector objects.
 */
function getAllSectors() {
  return Sector.findAll();
}

/**
 * Add a new project to the database.
 * `projectData` should be an object containing title, feature_img_url, summary_short, intro_short, impact, original_source_url, and sector_id.
 * Resolves to the created project.
 */
function addProject(projectData) {
  return Project.create(projectData);
}

/**
 * Update an existing project identified by `id` with the new data in `projectData`.
 * Resolves when update is successful, or rejects with an error message if not.
 */
function editProject(id, projectData) {
  return Project.findByPk(id).then(project => {
    if (!project) {
      throw new Error("Project not found");
    }
    // Update fields
    Object.assign(project, projectData);
    return project.save();  // save changes
  });
}

/**
 * Delete the project with the given `id` from the database.
 * Resolves when deletion is successful, otherwise rejects with error.
 */
function deleteProject(id) {
  return Project.destroy({ where: { id: id } }).then(deletedCount => {
    if (!deletedCount) {
      throw new Error("Project not found or already deleted");
    }
    return; // deletion successful (resolve with no data)
  });
}

// Export all functions for use in server routes
module.exports = {
  initializeDB,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};
