const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

// Initialize projects by merging sector data
function initialize() {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(projectData) || !Array.isArray(sectorData)) {
            reject("Invalid or missing data.");
            return;
        }

        projects = projectData.map(project => {
            const sector = sectorData.find(s => s.id === project.sector_id);
            return { ...project, sector: sector ? sector.sector_name : "Unknown" };
        });

        resolve();
    });
}

// Get all projects
function getAllProjects() {
    return new Promise((resolve, reject) => {
        projects.length > 0 ? resolve(projects) : reject(new Error("No projects found."));
    });
}

// Get a project by ID
function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        if (isNaN(projectId)) {
            reject(new Error("Invalid project ID."));
            return;
        }

        const project = projects.find(p => p.id === projectId);
        project ? resolve(project) : reject(new Error("Project not found."));
    });
}

// Get projects filtered by sector
function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        if (!sector || typeof sector !== "string") {
            reject(new Error("Sector parameter is required and must be a string."));
            return;
        }

        const filteredProjects = projects.filter(p =>
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );

        filteredProjects.length > 0
            ? resolve(filteredProjects)
            : reject(new Error("No projects found in this sector."));
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
