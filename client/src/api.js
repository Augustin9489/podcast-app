import axios from 'axios'
export const api = axios.create({ baseURL: '' }) // same origin; Vite proxy can be set to server
