import React, { useState } from 'react';
import { AdminConfig, RiceVariety } from '../../types';

interface AdminSettingsPageProps {
  config: AdminConfig;
  onSaveConfig: (newConfig: AdminConfig) => void;
  darkMode: boolean;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  config,
  onSaveConfig,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'varieties' | 'locations' | 'trucks' | 'operators' | 'htx'>('varieties');
  const [toastMsg, setToastMsg] = useState('');

  // Form states
  const [newVarietyName, setNewVarietyName] = useState('');
  const [newVarietyPrice, setNewVarietyPrice] = useState('8500');
  const [newVarietyDesc, setNewVarietyDesc] = useState('');

  const [newLocation, setNewLocation] = useState('');
  const [newTruck, setNewTruck] = useState('');
  const [newOperator, setNewOperator] = useState('');

  const [htxName, setHtxName] = useState(config.htxInfo.name);
  const [htxAddress, setHtxAddress] = useState(config.htxInfo.address);
  const [htxPhone, setHtxPhone] = useState(config.htxInfo.phone);
  const [htxEmail, setHtxEmail] = useState(config.htxInfo.email);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddVariety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarietyName.trim()) return;

    const newV: RiceVariety = {
      name: newVarietyName.trim(),
      code: newVarietyName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: newVarietyDesc.trim() || `Giống lúa ${newVarietyName.trim()} canh tác tại Hòa Tiến, Đà Nẵng.`,
      defaultPrice: parseFloat(newVarietyPrice) || 8500,
    };

    const updated = { ...config, varieties: [...config.varieties, newV] };
    onSaveConfig(updated);
    setNewVarietyName('');
    setNewVarietyDesc('');
    showToast(`🌾 Đã thêm giống lúa mới: ${newV.name}`);
  };

  const handleDeleteVariety = (nameToDelete: string) => {
    if (config.varieties.length <= 1) return alert('Phải giữ ít nhất 1 giống lúa!');
    if (window.confirm(`Xóa giống lúa "${nameToDelete}"?`)) {
      const updated = { ...config, varieties: config.varieties.filter((v) => v.name !== nameToDelete) };
      onSaveConfig(updated);
      showToast('Đã xóa giống lúa!');
    }
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    const updated = { ...config, locations: [...config.locations, newLocation.trim()] };
    onSaveConfig(updated);
    setNewLocation('');
    showToast(`📍 Đã thêm cánh đồng: ${newLocation.trim()}`);
  };

  const handleDeleteLocation = (loc: string) => {
    if (window.confirm(`Xóa cánh đồng "${loc}"?`)) {
      const updated = { ...config, locations: config.locations.filter((l) => l !== loc) };
      onSaveConfig(updated);
      showToast('Đã xóa cánh đồng!');
    }
  };

  const handleAddTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruck.trim()) return;
    const updated = { ...config, trucks: [...config.trucks, newTruck.trim()] };
    onSaveConfig(updated);
    setNewTruck('');
    showToast(`🚛 Đã thêm xe nhận: ${newTruck.trim()}`);
  };

  const handleDeleteTruck = (truck: string) => {
    if (window.confirm(`Xóa xe nhận "${truck}"?`)) {
      const updated = { ...config, trucks: config.trucks.filter((t) => t !== truck) };
      onSaveConfig(updated);
      showToast('Đã xóa xe nhận!');
    }
  };

  const handleSaveHtxInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...config,
      htxInfo: {
        ...config.htxInfo,
        name: htxName.trim(),
        address: htxAddress.trim(),
        phone: htxPhone.trim(),
        email: htxEmail.trim(),
      },
    };
    onSaveConfig(updated);
    showToast('⚙️ Đã lưu cài đặt thông tin HTX!');
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl font-lexend font-bold text-xs sm:text-sm animate-bounce border border-emerald-400">
          ✓ {toastMsg}
        </div>
      )}

      {/* Settings Sub-Nav */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('varieties')}
          className={`px-4 py-2 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
            activeTab === 'varieties' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          🌾 Cài Đặt Giống Lúa ({config.varieties.length})
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
            activeTab === 'locations' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          📍 Cánh Đồng HTX ({config.locations.length})
        </button>

        <button
          onClick={() => setActiveTab('trucks')}
          className={`px-4 py-2 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
            activeTab === 'trucks' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          🚛 Xe Nhận Lúa ({config.trucks.length})
        </button>

        <button
          onClick={() => setActiveTab('htx')}
          className={`px-4 py-2 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
            activeTab === 'htx' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          ⚙️ Cấu Hình Đơn Vị HTX
        </button>
      </div>

      {/* Varieties Settings */}
      {activeTab === 'varieties' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3">Thêm Giống Lúa Mới</h3>
            <form onSubmit={handleAddVariety} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Tên giống lúa (HG12, J02...)"
                value={newVarietyName}
                onChange={(e) => setNewVarietyName(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <input
                type="number"
                placeholder="Đơn giá (đ/kg)"
                value={newVarietyPrice}
                onChange={(e) => setNewVarietyPrice(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-800'
                }`}
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-2.5 rounded-xl shadow text-xs">
                + Thêm Giống
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">Danh Sách Giống Lúa</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {config.varieties.map((v) => (
                <div key={v.name} className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="font-lexend font-black text-emerald-700 dark:text-emerald-400">🌾 {v.name}</span>
                    <span className="ml-2 text-slate-500 font-normal">({v.defaultPrice.toLocaleString()}đ/kg)</span>
                  </div>
                  <button onClick={() => handleDeleteVariety(v.name)} className="p-1 text-rose-500 hover:text-rose-700 text-xs font-black">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Locations Settings */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3">Thêm Cánh Đồng Mới</h3>
            <form onSubmit={handleAddLocation} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="VD: Cánh đồng Gò Tháp..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-2.5 rounded-xl shadow text-xs">
                + Thêm Cánh Đồng
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">Danh Sách Cánh Đồng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {config.locations.map((loc) => (
                <div key={loc} className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span>📍 {loc}</span>
                  <button onClick={() => handleDeleteLocation(loc)} className="p-1 text-rose-500 hover:text-rose-700 text-xs font-black">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trucks Settings */}
      {activeTab === 'trucks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3">Thêm Xe Nhận Mới</h3>
            <form onSubmit={handleAddTruck} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="VD: Xe 43C-123.45..."
                value={newTruck}
                onChange={(e) => setNewTruck(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-2.5 rounded-xl shadow text-xs">
                + Thêm Xe Nhận
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">Danh Sách Xe Nhận</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {config.trucks.map((truck) => (
                <div key={truck} className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span>🚛 {truck}</span>
                  <button onClick={() => handleDeleteTruck(truck)} className="p-1 text-rose-500 hover:text-rose-700 text-xs font-black">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HTX Info Settings */}
      {activeTab === 'htx' && (
        <div className={`max-w-2xl mx-auto p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <h3 className="font-lexend font-black text-base text-emerald-700 dark:text-emerald-400 mb-4">Cấu Hình Đơn Vị HTX</h3>
          <form onSubmit={handleSaveHtxInfo} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Tên Hợp Tác Xã:</label>
              <input
                type="text"
                value={htxName}
                onChange={(e) => setHtxName(e.target.value)}
                className={`w-full p-3 rounded-2xl border font-lexend font-black text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Địa Chỉ HTX:</label>
              <input
                type="text"
                value={htxAddress}
                onChange={(e) => setHtxAddress(e.target.value)}
                className={`w-full p-3 rounded-2xl border font-bold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Số Điện Thoại:</label>
                <input
                  type="text"
                  value={htxPhone}
                  onChange={(e) => setHtxPhone(e.target.value)}
                  className={`w-full p-3 rounded-2xl border font-bold text-sm ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Email Liện Hệ:</label>
                <input
                  type="email"
                  value={htxEmail}
                  onChange={(e) => setHtxEmail(e.target.value)}
                  className={`w-full p-3 rounded-2xl border font-bold text-sm ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3.5 px-4 rounded-2xl shadow-lg text-sm"
            >
              💾 Lưu Cài Đặt HTX
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
