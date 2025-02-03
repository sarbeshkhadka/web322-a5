const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        if (!projectData || !sectorData) {
            reject("Data loading failed.");
        } else {
            projects = projectData.map(project => {
                let sector = sectorData.find(s => s.id === project.sector_id);
                return { ...project, sector: sector ? sector.sector_name : "Unknown" };
            });
            resolve();
        }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) {
            resolve(projects);
        } else {
            reject("No projects found.");
        }
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        let project = projects.find(p => p.id === projectId);
        if (project) {
            resolve(project);
        } else {
            reject("Project not found.");
        }
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        let filteredProjects = projects.filter(p => 
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );
        if (filteredProjects.length > 0) {
            resolve(filteredProjects);
        } else {
            reject("No projects found in this sector.");
        }
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
