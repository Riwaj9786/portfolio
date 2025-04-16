import axios from "axios";

const axiosInstance = axios.create({
   // baseURL: 'http://192.168.1.9:8000/api/v1/',
   baseURL: 'https://api.riwajbhurtel.com.np/api/v1/',
   headers: {
      'Content-Type': 'application/json',
   },
});

export default axiosInstance;