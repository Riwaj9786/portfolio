import axios from "axios";

const axiosInstance = axios.create({
   baseURL: 'https://riwajbhurtel.com.np/api/v1/',
   headers: {
      'Content-Type': 'application/json',
   },
});

export default axiosInstance;