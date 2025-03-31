const { Project, Sector, sequelize } = require('../models/projects');
const Sequelize = require('sequelize');

// Initialize Sequelize
async function initialize() {
    try {
        // Test the connection first
        await sequelize.authenticate();
        console.log("Database connection established successfully.");
        
        // Then sync the models
        await sequelize.sync();
        console.log("Database synchronized successfully.");
        return Promise.resolve();
    } catch (err) {
        console.error("Database initialization failed:", err);
        return Promise.reject(err);
    }
}

// Get all projects with associated sector data
async function getAllProjects(sector) {
    try {
        const projects = await Project.findAll({
            include: [{
                model: Sector,
                required: false
            }],
            where: sector ? {
                '$Sector.sector_name$': {
                    [Sequelize.Op.iLike]: `%${sector}%`
                }
            } : {}
        });
        
        return projects;
    } catch (err) {
        console.error("Error in getAllProjects:", err);
        throw new Error("Unable to retrieve projects: " + err.message);
    }
}

// Get project by id with associated sector data
async function getProjectById(projectId) {
    try {
        const project = await Project.findOne({
            where: { id: projectId },
            include: [{
                model: Sector,
                required: false
            }],
        });
        
        if (!project) {
            throw new Error("Project not found");
        }
        
        return project;
    } catch (err) {
        console.error("Error in getProjectById:", err);
        throw new Error("Unable to retrieve project: " + err.message);
    }
}

// Get projects by sector name with associated sector data
async function getProjectsBySector(sector) {
    try {
        const projects = await Project.findAll({
            include: [{
                model: Sector,
                required: false
            }],
            where: {
                '$Sector.sector_name$': {
                    [Sequelize.Op.iLike]: `%${sector}%`
                }
            }
        });
        
        return projects;
    } catch (err) {
        console.error("Error in getProjectsBySector:", err);
        throw new Error("Unable to retrieve projects: " + err.message);
    }
}

// Get all sectors
async function getAllSectors() {
    try {
        const sectors = await Sector.findAll();
        return sectors;
    } catch (err) {
        console.error("Error in getAllSectors:", err);
        throw new Error("Unable to retrieve sectors: " + err.message);
    }
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
    getAllSectors
};
