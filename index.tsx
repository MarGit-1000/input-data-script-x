import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, X, Save, Eye, EyeOff, Menu, Database, FileText, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [scripts, setScripts] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('scripts');
  const [editingItem, setEditingItem] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initFirebase();
  }, []);

  const initFirebase = async () => {
    try {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
      script.onload = () => {
        const firestoreScript = document.createElement('script');
        firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
        firestoreScript.onload = () => {
          const firebaseConfig = {
            apiKey: "AIzaSyCldbqiZLTRvtQCfO9_2EiBGeND9fxALCE",
            authDomain: "x-website-script.firebaseapp.com",
            projectId: "x-website-script",
            storageBucket: "x-website-script.firebasestorage.app",
            messagingSenderId: "848346981755",
            appId: "1:848346981755:web:aff6aa81591ff35f2509de"
          };
          
          window.firebase.initializeApp(firebaseConfig);
          setDb(window.firebase.firestore());
          fetchData();
        };
        document.head.appendChild(firestoreScript);
      };
      document.head.appendChild(script);
    } catch (err) {
      setError('Failed to initialize Firebase: ' + err.message);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!db) return;
    
    setLoading(true);
    setError(null);
    try {
      const scriptsSnapshot = await db.collection('scripts').get();
      const scriptsData = scriptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setScripts(scriptsData);

      const statsSnapshot = await db.collection('stats').get();
      const statsData = statsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStats(statsData);
    } catch (err) {
      setError('Error fetching data: ' + err.message);
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem || !db) return;
    
    try {
      const collectionName = activeTab;
      const { id, ...dataToUpdate } = editingItem;
      await db.collection(collectionName).doc(id).update(dataToUpdate);
      await fetchData();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError('Gagal menyimpan perubahan: ' + err.message);
      console.error('Error updating document:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    if (!db) return;
    
    try {
      await db.collection(activeTab).doc(id).delete();
      await fetchData();
    } catch (err) {
      setError('Gagal menghapus data: ' + err.message);
      console.error('Error deleting document:', err);
    }
  };

  const handleAdd = () => {
    const newItem = activeTab === 'scripts' 
      ? {
          category: '',
          content: '',
          description: '',
          latest: '',
          name: '',
          password: '',
          status: '',
          youtubeShowcase: '',
          linkdownload: ''
        }
      : { count: 0 };
    setEditingItem(newItem);
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editingItem || !db) return;
    
    try {
      await db.collection(activeTab).add(editingItem);
      await fetchData();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError('Gagal menambah data: ' + err.message);
      console.error('Error creating document:', err);
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredData = (activeTab === 'scripts' ? scripts : stats).filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === 'scripts') {
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }
    return item.id?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-black bg-opacity-50 backdrop-blur-xl border-r border-gray-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-40`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">Dashboard</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200">
              <Menu size={24} />
            </button>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('scripts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'scripts' 
                  ? 'bg-gray-800 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <FileText size={20} />
              {sidebarOpen && <span>Scripts</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'stats' 
                  ? 'bg-gray-800 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Database size={20} />
              {sidebarOpen && <span>Stats</span>}
            </button>
          </nav>

          {sidebarOpen && (
            <div className="mt-8 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Total Data</div>
              <div className="text-2xl font-bold">{activeTab === 'scripts' ? scripts.length : stats.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-3xl font-bold mb-2">{activeTab === 'scripts' ? 'Script Management' : 'Statistics'}</h2>
            <p className="text-gray-400">Kelola data {activeTab} Anda</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-xl text-red-200 animate-slideDown">
              {error}
            </div>
          )}

          {/* Search & Actions */}
          <div className="mb-6 flex gap-4 animate-slideDown">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
              />
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 hover:shadow-lg"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Tambah</span>
            </button>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
              <Database size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Tidak ada data ditemukan</p>
            </div>
          ) : (
            <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 bg-opacity-50">
                    <tr>
                      {activeTab === 'scripts' ? (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Latest</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Password</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Script ID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Count</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                        {activeTab === 'scripts' ? (
                          <>
                            <td className="px-6 py-4 font-medium">{item.name}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">{item.category}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm ${item.status === 'yes' ? 'bg-green-900 text-green-200' : 'bg-gray-700'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{item.latest}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{showPassword[item.id] ? item.password : '••••••'}</span>
                                <button
                                  onClick={() => togglePasswordVisibility(item.id)}
                                  className="p-1 hover:bg-gray-700 rounded transition-all duration-200"
                                >
                                  {showPassword[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 hover:bg-red-900 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 font-mono">{item.id}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-gray-700 rounded-full">{item.count}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 hover:bg-red-900 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingItem.id ? 'Edit Data' : 'Tambah Data'}</h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'scripts' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Category</label>
                    <input
                      type="text"
                      value={editingItem.category || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Content</label>
                    <textarea
                      value={editingItem.content || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Description</label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Latest</label>
                    <input
                      type="text"
                      value={editingItem.latest || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, latest: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Password</label>
                    <input
                      type="text"
                      value={editingItem.password || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Status</label>
                    <select
                      value={editingItem.status || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    >
                      <option value="">Pilih Status</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">YouTube Showcase</label>
                    <input
                      type="text"
                      value={editingItem.youtubeShowcase || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, youtubeShowcase: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Link Download</label>
                    <input
                      type="text"
                      value={editingItem.linkdownload || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, linkdownload: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Count</label>
                  <input
                    type="number"
                    value={editingItem.count || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, count: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-gray-500 transition-all duration-200"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={editingItem.id ? handleSave : handleCreate}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 hover:shadow-lg"
              >
                <Save size={20} />
                <span>{editingItem.id ? 'Simpan' : 'Tambah'}</span>
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingItem(null);
                }}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
