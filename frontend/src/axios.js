import axios from "axios";

const axiosInstance = axios.create({
   // baseURL: 'http://127.0.0.1:8000/api/v1/',
   // baseURL: 'http://192.168.1.7:8000/api/v1/',
   baseURL: 'http://172.16.100.81:8000/api/v1/',
   headers: {
      'Content-Type': 'application/json',
   },
});

export default axiosInstance;