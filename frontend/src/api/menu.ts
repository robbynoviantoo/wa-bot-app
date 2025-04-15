import axios from "axios";

const API_URL = "http://localhost:3009/api/menu"; // Sesuaikan dengan URL API kamu

interface Group {
  groupWaId: string;
  commands: string[]; // Daftar commands yang dimiliki grup
}

interface SetMenuParams {
  groupWaId: string;
  command: string;
}

interface CommandResponse {
  commands: string[];
}

export const getMenu = async (groupWaId: string): Promise<string[]> => {
  try {
    const response = await axios.get<CommandResponse>(`${API_URL}/${groupWaId}`, {
      withCredentials: true,  // Menyertakan cookies dalam permintaan
    });
    return response.data.commands;
  } catch (error) {
    console.error("Error fetching menu:", error);
    throw error;
  }
};


export const setMenu = async ({
  groupWaId,
  command,
}: SetMenuParams): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/set`, { groupWaId, command });
    return response.data;
  } catch (error) {
    console.error("Error setting menu:", error);
    throw error;
  }
};

export const removeCommand = async ({
  groupWaId,
  command,
}: SetMenuParams): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/remove`, {
      groupWaId,
      command,
    });
    return response.data;
  } catch (error) {
    console.error("Error removing command:", error);
    throw error;
  }
};

export const getGroups = async (): Promise<Group[]> => {
  try {
    const response = await axios.get(`${API_URL}/groups`);
    return response.data.groups; 
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};