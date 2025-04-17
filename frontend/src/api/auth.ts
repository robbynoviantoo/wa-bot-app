// src/api/auth.ts
import axios from 'axios';

export const login = async (username: string, password: string) => {
  const response = await axios.post(
    "http://103.23.198.66:3009/api/auth/login",
    { username, password },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const logout = async () => {
    const response = await axios.post("http://localhost:3009/api/auth/logout", {}, { withCredentials: true });
    return response.data;
  };
