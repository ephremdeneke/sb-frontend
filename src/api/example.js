/**
 * Example usage of Axios in this project
 * You can delete this file once you're comfortable using axios
 */

import api from './axios';

// GET request
export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

// POST request
export async function createUser(userData) {
  const response = await api.post('/users', userData);
  return response.data;
}

// PUT request (update)
export async function updateUser(id, userData) {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
}

// DELETE request
export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}

// Using in a React component:
// import { getUsers } from './api/example';
// const users = await getUsers();
