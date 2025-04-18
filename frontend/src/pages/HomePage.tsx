import React, { useEffect, useState } from 'react';
import { getGroups } from '../api/menu';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';  // Impor fungsi logout

interface Group {
  groupWaId: string;
  commands: string[];  // Menyimpan array dari commands
}

const HomePage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);  // Pastikan inisialisasi dengan array kosong
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);  // Status loading
  const navigate = useNavigate();  // Untuk navigasi programatik

  useEffect(() => {
    document.title = "BOT - Home";
    const fetchGroups = async () => {
      try {
        const groupsList = await getGroups();
        setGroups(groupsList);
      } catch (err) {
        setError('Gagal mengambil daftar grup');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();  // Memanggil API logout
      localStorage.removeItem('token');  // Menghapus token di localStorage
      navigate('/login');  // Arahkan ke halaman login
    } catch (err) {
      console.error('Logout gagal:', err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;  // Menampilkan loading saat data di-fetch
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Daftar Grup WhatsApp</h1>
      
      {/* Tombol Logout */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white p-2 rounded mb-4"
      >
        Logout
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {/* Pastikan groups tidak undefined atau null */}
      {Array.isArray(groups) && groups.length > 0 ? (
        <ul className="list-disc ml-6">
          {groups.map((group) => (
            <li key={group.groupWaId} className="flex items-center justify-between">
              <span>{group.groupWaId}</span> {/* Menampilkan groupWaId */}
              <span className="text-sm text-gray-600">
                Commands: {group.commands.join(', ')} {/* Menampilkan daftar commands */}
              </span>
              <Link
                to={`/menu/${group.groupWaId}`}
                className="bg-blue-500 text-white p-2 rounded ml-4"
              >
                Lihat Menu
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada grup yang tersedia</p>  // Jika tidak ada grup
      )}
    </div>
  );
};

export default HomePage;
