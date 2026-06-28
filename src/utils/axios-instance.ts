import axios, { type CreateAxiosDefaults } from "axios";

const config: CreateAxiosDefaults = {
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
  timeoutErrorMessage: "Erro ao conectar com o servidor",
  headers: {
    "Content-Type": "application/json",
  },
};

const axiosInstance = axios.create(config);

export { axiosInstance };
