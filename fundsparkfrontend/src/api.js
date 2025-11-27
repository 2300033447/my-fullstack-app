import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const getProjects = async () => {
  const response = await axios.get(`${API_BASE_URL}/projects`);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await axios.post(`${API_BASE_URL}/projects`, projectData);
  return response.data;
};
