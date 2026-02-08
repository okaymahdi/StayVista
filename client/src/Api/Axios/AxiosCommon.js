import axios from 'axios';

/** 7. Axios Common Instance */
const axiosCommon = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const AxiosCommon = () => {
  return axiosCommon;
};

export { AxiosCommon };
