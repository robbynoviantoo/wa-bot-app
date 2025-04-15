import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMenu, setMenu, removeCommand } from '../api/menu';

const MenuPage: React.FC = () => {
  const { groupWaId } = useParams<{ groupWaId: string }>();
  const [commands, setCommands] = useState<string[]>([]);
  const [newCommand, setNewCommand] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (groupWaId) {
      const fetchMenu = async () => {
        setIsLoading(true);
        try {
          console.log("🔍 Fetching menu for group:", groupWaId);
          const fetchedCommands = await getMenu(groupWaId);
          console.log("📦 Received commands:", fetchedCommands);
          
          // Pastikan data yang diterima adalah array
          if (Array.isArray(fetchedCommands)) {
            setCommands(fetchedCommands);
          } else {
            console.error("⚠️ Expected array but got:", fetchedCommands);
            setError('Format data tidak valid');
          }
        } catch (err) {
          console.error("❌ Error fetching menu:", err);
          setError(`Gagal mengambil menu: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMenu();
    }
  }, [groupWaId]);

  const handleAddCommand = async () => {
    if (!newCommand.trim()) {
      setError('Perintah tidak boleh kosong');
      return;
    }

    if (!groupWaId) {
      setError('Group ID tidak valid');
      return;
    }

    try {
      await setMenu({ groupWaId, command: newCommand.trim() });
      setCommands((prev) => [...prev, newCommand.trim()]);
      setNewCommand('');
      setError('');
    } catch (err) {
      console.error("❌ Error adding command:", err);
      setError(`Gagal menambahkan perintah: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRemoveCommand = async (command: string) => {
    if (!groupWaId) {
      setError('Group ID tidak valid');
      return;
    }

    try {
      await removeCommand({ groupWaId, command });
      setCommands((prev) => prev.filter((cmd) => cmd !== command));
      setError('');
    } catch (err) {
      console.error("❌ Error removing command:", err);
      setError(`Gagal menghapus perintah: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Memuat menu...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Menu Grup: {groupWaId}</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Masukkan command baru (contoh: !menu)"
          value={newCommand}
          onChange={(e) => {
            setNewCommand(e.target.value);
            setError('');
          }}
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddCommand}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Tambah
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Daftar Command</h2>
        
        {commands.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada command yang terdaftar</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {commands.map((command, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {command}
                </span>
                <button
                  onClick={() => handleRemoveCommand(command)}
                  className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  title="Hapus command"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MenuPage;