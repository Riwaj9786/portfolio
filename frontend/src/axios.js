import axios from "axios";

const axiosInstance = axios.create({
   // baseURL: 'http://192.168.1.18:8000/api/v1/',
   baseURL: 'http://172.16.100.81:8000/api/v1/',
   headers: {
      'Content-Type': 'application/json',
   },
});

export default axiosInstance;