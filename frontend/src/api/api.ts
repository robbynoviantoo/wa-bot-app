import axios from 'axios';

// Tipe untuk response dari API
interface MenuResponse {
  commands: string[];
}

interface SetResponseParams {
  groupWaId: string;
  command: string;
  response: string;
}

// API untuk mendapatkan menu berdasarkan group ID
export const getMenu = async (groupWaId: string): Promise<MenuResponse> => {
  try {
    const response = await axios.get(`/api/menu/${groupWaId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    return { commands: [] }; // Return empty array jika ada error
  }
};

// API untuk menyimpan response untuk command tertentu
export const setResponse = async (params: SetResponseParams): Promise<void> => {
  try {
    await axios.post('/api/response', params);
  } catch (error) {
    console.error('Error setting response:', error);
  }
};

// API untuk menambahkan command baru ke dalam menu (misalnya untuk "/addcommand")
export const addCommand = async (groupWaId: string, command: string): Promise<void> => {
  try {
    await axios.post('/api/commands', { groupWaId, command });
  } catch (error) {
    console.error('Error adding command:', error);
  }
};

// API untuk menghapus command dari menu
export const removeCommand = async (groupWaId: string, command: string): Promise<void> => {
  try {
    await axios.delete(`/api/commands/${groupWaId}`, { data: { command } });
  } catch (error) {
    console.error('Error removing command:', error);
  }
};
