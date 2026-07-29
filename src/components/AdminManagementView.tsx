import React, { useState } from 'react';
import { AdminConfig, RiceVariety } from '../types';

interface AdminManagementViewProps {
  config: AdminConfig;
  onSaveConfig: (newConfig: AdminConfig) => void;
  darkMode: boolean;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  config,
  onSaveConfig,
  darkMode,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'varieties' | 'locations' | 'trucks' | 'operators' | 'htx_info'>('varieties');
  const [toastMsg, setToastMsg] = useState('');

  // Form states for adding items
  const [newVarietyName, setNewVarietyName] = useState('');
  const [newVarietyPrice, setNewVarietyPrice] = useState('8500');
  const [newVarietyDesc, setNewVarietyDesc] = useState('');

  const [newLocation, setNewLocation] = useState('');
  const [newTruck, setNewTruck] = useState('');
  const [newOperator, setNewOperator] = useState('');

  // Form state for HTX Info
  const [htxName, setHtxName] = useState(config.htxInfo.name);
  const [htxAddress, setHtxAddress] = useState(config.htxInfo.address);
  const [htxPhone, setHtxPhone] = useState(config.htxInfo.phone);
  const [htxEmail, setHtxEmail] = useState(config.htxInfo.email);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // --- Handlers for Varieties ---
  const handleAddVariety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarietyName.trim()) return;

    const newV: RiceVariety = {
      name: newVarietyName.trim(),
      code: newVarietyName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: newVarietyDesc.trim() || `Giống lúa ${newVarietyName.trim()} canh tác tại Hòa Tiến, Đà Nẵng.`,
      defaultPrice: parseFloat(newVarietyPrice) || 8500,
    };

    const updated = {
      ...config,
      varieties: [...config.varieties, newV],
    };

    onSaveConfig(updated);
    setNewVarietyName('');
    setNewVarietyDesc('');
    showToast(`🌾 Đã thêm giống lúa mới: ${newV.name}`);
  };

  const handleDeleteVariety = (nameToDelete: string) => {
    if (config.varieties.length <= 1) {
      return alert('Phải giữ ít nhất 1 giống lúa trong hệ thống!');
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa giống lúa "${nameToDelete}"?`)) {
      const updated = {
        ...config,
        varieties: config.varieties.filter((v) => v.name !== nameToDelete),
      };
      onSaveConfig(updated);
      showToast(`Đã xóa giống lúa: ${nameToDelete}`);
    }
  };

  // --- Handlers for Locations ---
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    const updated = {
      ...config,
      locations: [...config.locations, newLocation.trim()],
    };
    onSaveConfig(updated);
    setNewLocation('');
    showToast(`📍 Đã thêm cánh đồng mới: ${newLocation.trim()}`);
  };

  const handleDeleteLocation = (locToDelete: string) => {
    if (window.confirm(`Xóa cánh đồng "${locToDelete}"?`)) {
      const updated = {
        ...config,
        locations: config.locations.filter((l) => l !== locToDelete),
      };
      onSaveConfig(updated);
      showToast('Đã xóa cánh đồng!');
    }
  };

  // --- Handlers for Trucks ---
  const handleAddTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruck.trim()) return;

    const updated = {
      ...config,
      trucks: [...config.trucks, newTruck.trim()],
    };
    onSaveConfig(updated);
    setNewTruck('');
    showToast(`🚛 Đã thêm xe nhận mới: ${newTruck.trim()}`);
  };

  const handleDeleteTruck = (truckToDelete: string) => {
    if (window.confirm(`Xóa xe nhận "${truckToDelete}"?`)) {
      const updated = {
        ...config,
        trucks: config.trucks.filter((t) => t !== truckToDelete),
      };
      onSaveConfig(updated);
      showToast('Đã xóa xe nhận!');
    }
  };

  // --- Handlers for Operators ---
  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperator.trim()) return;

    const updated = {
      ...config,
      operators: [...config.operators, newOperator.trim()],
    };
    onSaveConfig(updated);
    setNewOperator('');
    showToast(`👤 Đã thêm cán bộ cân mới: ${newOperator.trim()}`);
  };

  const handleDeleteOperator = (opToDelete: string) => {
    if (window.confirm(`Xóa cán bộ cân "${opToDelete}"?`)) {
      const updated = {
        ...config,
        operators: config.operators.filter((o) => o !== opToDelete),
      };
      onSaveConfig(updated);
      showToast('Đã xóa cán bộ cân!');
    }
  };

  // --- Save HTX Info ---
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
    showToast('⚙️ Đã lưu cấu hình thông tin HTX!');
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl font-lexend font-bold text-xs sm:text-sm animate-bounce border border-emerald-400">
          ✓ {toastMsg}
        </div>
      )}

      {/* Top Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-emerald-200/90'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl text-2xl shadow-lg">
            ⚙️
          </div>
          <div>
            <h2 className="font-lexend font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100">
              TRANG QUẢN TRỊ ADMIN HTX
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Thêm, bớt, sửa, xóa danh mục giống lúa, cánh đồng, xe nhận, cán bộ cân & cấu hình HTX Hòa Tiến 2
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveAdminTab('varieties')}
            className={`px-4 py-2.5 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
              activeAdminTab === 'varieties'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🌾 Giống Lúa ({config.varieties.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('locations')}
            className={`px-4 py-2.5 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
              activeAdminTab === 'locations'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            📍 Cánh Đồng ({config.locations.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('trucks')}
            className={`px-4 py-2.5 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
              activeAdminTab === 'trucks'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🚛 Xe Nhận ({config.trucks.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('operators')}
            className={`px-4 py-2.5 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
              activeAdminTab === 'operators'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            👤 Cán Bộ Cân ({config.operators.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('htx_info')}
            className={`px-4 py-2.5 rounded-2xl font-lexend font-extrabold text-xs transition-all ${
              activeAdminTab === 'htx_info'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            ⚙️ Cấu Hình HTX
          </button>
        </div>
      </div>

      {/* TAB 1: VARIETIES MANAGEMENT */}
      {activeAdminTab === 'varieties' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Form */}
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <span>➕</span> Thêm Giống Lúa Mới
            </h3>
            <form onSubmit={handleAddVariety} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Tên Giống Lúa (*):</label>
                <input
                  type="text"
                  placeholder="VD: HG12, J02, HT1..."
                  value={newVarietyName}
                  onChange={(e) => setNewVarietyName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-lexend font-black text-sm ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Đơn Giá Chuẩn (đ/kg):</label>
                <input
                  type="number"
                  step="100"
                  value={newVarietyPrice}
                  onChange={(e) => setNewVarietyPrice(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-bold text-sm ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-800'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Mô Tả Giống Lúa:</label>
                <textarea
                  rows={2}
                  placeholder="Đặc tính dẻo mềm, năng suất..."
                  value={newVarietyDesc}
                  onChange={(e) => setNewVarietyDesc(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3 rounded-xl shadow-lg transition-all text-xs"
              >
                + Thêm Giống Lúa
              </button>
            </form>
          </div>

          {/* List Table */}
          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">
              Danh Sách Giống Lúa Đang Dùng ({config.varieties.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {config.varieties.map((v) => (
                <div
                  key={v.name}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <h4 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400">
                      🌾 {v.name} <span className="text-xs text-slate-500 font-bold">({v.defaultPrice.toLocaleString()}đ/kg)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{v.description}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteVariety(v.name)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all font-black text-xs shrink-0"
                    title="Xóa giống lúa này"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCATIONS MANAGEMENT */}
      {activeAdminTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3">
              ➕ Thêm Cánh Đồng Mới
            </h3>
            <form onSubmit={handleAddLocation} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="VD: Cánh đồng Gò Tháp..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-semibold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3 rounded-xl shadow-lg text-xs"
              >
                + Thêm Cánh Đồng
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">
              Danh Sách Cánh Đồng HTX Hòa Tiến 2 ({config.locations.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {config.locations.map((loc) => (
                <div
                  key={loc}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <span>📍 {loc}</span>
                  <button
                    onClick={() => handleDeleteLocation(loc)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded-lg text-xs font-black"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRUCKS MANAGEMENT */}
      {activeAdminTab === 'trucks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3">
              ➕ Thêm Xe Nhận Mới
            </h3>
            <form onSubmit={handleAddTruck} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="VD: Xe 43C-123.45 (Xe tải 5 tấn)..."
                value={newTruck}
                onChange={(e) => setNewTruck(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-semibold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3 rounded-xl shadow-lg text-xs"
              >
                + Thêm Xe Nhận
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">
              Danh Sách Xe Nhận Lúa ({config.trucks.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {config.trucks.map((truck) => (
                <div
                  key={truck}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <span>🚛 {truck}</span>
                  <button
                    onClick={() => handleDeleteTruck(truck)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded-lg text-xs font-black"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPERATORS MANAGEMENT */}
      {activeAdminTab === 'operators' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-emerald-700 dark:text-emerald-400 mb-3">
              ➕ Thêm Cán Bộ Cân Mới
            </h3>
            <form onSubmit={handleAddOperator} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="VD: Nguyễn Văn C (Cán bộ Điểm 2)..."
                value={newOperator}
                onChange={(e) => setNewOperator(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-semibold text-sm ${
                  darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                required
              />
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3 rounded-xl shadow-lg text-xs"
              >
                + Thêm Cán Bộ Cân
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-3xl border shadow-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <h3 className="font-lexend font-black text-sm text-slate-800 dark:text-slate-100 mb-3">
              Danh Sách Cán Bộ Cân HTX ({config.operators.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {config.operators.map((op) => (
                <div
                  key={op}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <span>👤 {op}</span>
                  <button
                    onClick={() => handleDeleteOperator(op)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded-lg text-xs font-black"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HTX CONFIG INFO */}
      {activeAdminTab === 'htx_info' && (
        <div className={`max-w-2xl mx-auto p-6 rounded-3xl border shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <h3 className="font-lexend font-black text-base text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <span>⚙️</span> Cấu Hình Thông Tin Đơn Vị HTX
          </h3>

          <form onSubmit={handleSaveHtxInfo} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-600 dark:text-slate-300">Tên Tên Hợp Tác Xã:</label>
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3.5 px-4 rounded-2xl shadow-lg transition-all text-sm"
            >
              💾 Lưu Cấu Hình HTX
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
