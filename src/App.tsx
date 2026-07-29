import React, { useState, useEffect, useRef } from 'react';
import { WeighingSession, OcrResult, User, AdminConfig } from './types';
import { calculateTotals, generateZaloShareText } from './utils/formatters';
import { playBase64PcmAudio } from './utils/audioUtils';
import { fetchSessions, saveSession as saveSessionToService, deleteSession as deleteSessionFromService } from './services/sessionService';
import { fetchAdminConfig, saveAdminConfig, DEFAULT_ADMIN_CONFIG, getLocalUsers, saveLocalUsers } from './services/adminService';
import { isSupabaseConfigured } from './lib/supabase';

import { Sidebar } from './components/Sidebar';
import { FarmerInfoForm } from './components/FarmerInfoForm';
import { WeighingPanel } from './components/WeighingPanel';
import { BagList } from './components/BagList';
import { SummaryCard } from './components/SummaryCard';
import { ReceiptView } from './components/ReceiptView';
import { HistoryList } from './components/HistoryList';
import { AiAdvisor } from './components/AiAdvisor';
import { YieldCalculatorModal } from './components/YieldCalculatorModal';
import { DashboardView } from './components/DashboardView';
import { AdminPortal } from './components/admin/AdminPortal';
import { OcrModal } from './components/OcrModal';
import { SmartParseModal } from './components/SmartParseModal';
import { AuthModal } from './components/AuthModal';

const USER_STORAGE_KEY = 'htx_hoatien2_current_user';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'weighing' | 'history' | 'ai_advisor' | 'yield' | 'receipt' | 'dashboard' | 'admin'>('weighing');
  const [isCloudSync, setIsCloudSync] = useState<boolean>(isSupabaseConfigured);

  // Admin Config & Users State
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(DEFAULT_ADMIN_CONFIG);
  const [usersList, setUsersList] = useState<User[]>(() => getLocalUsers());

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      id: 'pham_cong_tuan',
      username: 'pham_cong_tuan',
      fullName: 'Phạm Công Tuân',
      role: 'admin',
    };
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Current session being edited
  const [sessionInfo, setSessionInfo] = useState<WeighingSession>({
    id: Date.now().toString(),
    userId: currentUser?.id,
    operatorName: currentUser?.fullName || 'Phạm Công Tuân',
    farmerName: '',
    farmerPhone: '',
    truckInfo: 'Xe Đội 1 HTX Hòa Tiến 2',
    truckPhone: '',
    location: 'Cánh đồng Gò Tháp',
    riceType: 'HG12',
    unitPrice: 8500,

    tareType: 'per_bag',
    tarePerBag: 0.1,
    tareFixedTotal: 0,

    impurityType: 'percent',
    impurityPercent: 0,
    impurityFixedKg: 0,
    moisturePercent: 14,

    deposit: 0,
    date: new Date().toISOString().split('T')[0],
    note: '',
    bagWeights: [],
    createdAt: new Date().toLocaleString('vi-VN'),
    areaUnit: 'sao_trung_bo',
  });

  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [savedSessions, setSavedSessions] = useState<WeighingSession[]>([]);
  const [selectedReceiptSession, setSelectedReceiptSession] = useState<WeighingSession | null>(null);

  // Modals
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);
  const [showSmartModal, setShowSmartModal] = useState<boolean>(false);
  const [showYieldModal, setShowYieldModal] = useState<boolean>(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string>('');

  // TTS Voice
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const [ttsPlaying, setTtsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load history & admin config on mount
  useEffect(() => {
    async function loadData() {
      const [sessionsRes, configRes] = await Promise.all([
        fetchSessions(),
        fetchAdminConfig(),
      ]);
      setSavedSessions(sessionsRes.sessions);
      setIsCloudSync(sessionsRes.isCloud);
      setAdminConfig(configRes);
    }
    loadData();
  }, []);

  // Refresh All Data after Restore / Import
  const handleRefreshAllData = async () => {
    const [sessionsRes, configRes] = await Promise.all([
      fetchSessions(),
      fetchAdminConfig(),
    ]);
    setSavedSessions(sessionsRes.sessions);
    setAdminConfig(configRes);
    setUsersList(getLocalUsers());
  };

  const handleSaveUsersList = (newUsers: User[]) => {
    setUsersList(newUsers);
    saveLocalUsers(newUsers);
  };

  const handleSaveAdminConfig = async (newConfig: AdminConfig) => {
    setAdminConfig(newConfig);
    await saveAdminConfig(newConfig);
    showToast('⚙️ Đã lưu và đồng bộ cấu hình Admin!');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {}
    setSessionInfo((prev) => ({
      ...prev,
      userId: user.id,
      operatorName: user.fullName,
    }));
    showToast(`🔑 Đăng nhập thành công: ${user.fullName}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    showToast('👋 Đã đăng xuất khỏi tài khoản!');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3200);
  };

  // Weight Management
  const handleAddWeight = (specificVal?: number, bagsCount: number = 1) => {
    if (specificVal !== undefined) {
      if (!isNaN(specificVal) && specificVal > 0 && specificVal < 5000) {
        const entryToAdd = bagsCount > 1
          ? { weight: Number(specificVal.toFixed(1)), bagsCount }
          : Number(specificVal.toFixed(1));

        setSessionInfo((prev) => ({
          ...prev,
          bagWeights: [...prev.bagWeights, entryToAdd],
        }));
        setCurrentWeight('');
      }
    } else {
      const rawText = currentWeight.trim();
      if (!rawText) return;

      const tokens = rawText.split(/[\s,;+\n]+/).filter(Boolean);
      const newEntries: (number | any)[] = [];

      for (const token of tokens) {
        if (token.includes('/')) {
          const [wStr, bStr] = token.split('/');
          const w = parseFloat(wStr.replace(',', '.'));
          const b = parseInt(bStr, 10) || 1;
          if (!isNaN(w) && w > 0 && w < 5000) {
            newEntries.push(b > 1 ? { weight: Number(w.toFixed(1)), bagsCount: b } : Number(w.toFixed(1)));
          }
        } else {
          const w = parseFloat(token.replace(',', '.'));
          if (!isNaN(w) && w > 0 && w < 5000) {
            newEntries.push(bagsCount > 1 ? { weight: Number(w.toFixed(1)), bagsCount } : Number(w.toFixed(1)));
          }
        }
      }

      if (newEntries.length > 0) {
        setSessionInfo((prev) => ({
          ...prev,
          bagWeights: [...prev.bagWeights, ...newEntries],
        }));
        setCurrentWeight('');
      } else {
        showToast('Số cân không hợp lệ (ví dụ: 50.5 hoặc 101.5 / 2 bao)');
      }
    }
  };

  const handleRemoveWeight = (index: number) => {
    setSessionInfo((prev) => ({
      ...prev,
      bagWeights: prev.bagWeights.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateWeight = (index: number, newWeight: number, newBagsCount: number = 1) => {
    setSessionInfo((prev) => {
      const updated = [...prev.bagWeights];
      updated[index] = newBagsCount > 1
        ? { weight: Number(newWeight.toFixed(1)), bagsCount: newBagsCount }
        : Number(newWeight.toFixed(1));
      return { ...prev, bagWeights: updated };
    });
  };

  const handleClearAllBags = () => {
    setSessionInfo((prev) => ({ ...prev, bagWeights: [] }));
    showToast('Đã xóa tất cả các bao lúa!');
  };

  // Reset to brand new session
  const handleNewSession = () => {
    if (
      sessionInfo.bagWeights.length > 0 &&
      !window.confirm('Bắt đầu tạo phiếu cân mới? Dữ liệu cân hiện tại chưa lưu sẽ bị hủy.')
    ) {
      return;
    }

    setSessionInfo({
      id: Date.now().toString(),
      userId: currentUser?.id,
      operatorName: currentUser?.fullName || 'Phạm Công Tuân',
      farmerName: '',
      farmerPhone: '',
      truckInfo: adminConfig.trucks[0] || 'Xe Đội 1 HTX Hòa Tiến 2',
      truckPhone: '',
      location: adminConfig.locations[0] || 'Cánh đồng Gò Tháp',
      riceType: adminConfig.varieties[0]?.name || 'HG12',
      unitPrice: adminConfig.varieties[0]?.defaultPrice || 8500,
      tareType: 'per_bag',
      tarePerBag: 0.1,
      tareFixedTotal: 0,
      impurityType: 'percent',
      impurityPercent: 0,
      impurityFixedKg: 0,
      moisturePercent: 14,
      deposit: 0,
      date: new Date().toISOString().split('T')[0],
      note: '',
      bagWeights: [],
      createdAt: new Date().toLocaleString('vi-VN'),
      areaUnit: 'sao_trung_bo',
    });
    setCurrentWeight('');
    showToast('Đã tạo phiếu cân mới!');
  };

  // Calculated totals
  const currentTotals = calculateTotals(sessionInfo.bagWeights, sessionInfo);

  // Save Session
  const handleSaveSession = async () => {
    if (sessionInfo.bagWeights.length === 0) {
      return showToast('Chưa có bao lúa nào trong phiếu cân!');
    }
    if (!sessionInfo.farmerName.trim()) {
      return showToast('Vui lòng nhập tên Chủ Ruộng trước khi lưu!');
    }

    const completedSession: WeighingSession = {
      ...sessionInfo,
      id: sessionInfo.id || Date.now().toString(),
      userId: currentUser?.id,
      operatorName: sessionInfo.operatorName || currentUser?.fullName || 'Phạm Công Tuân',
      calculated: currentTotals,
      createdAt: new Date().toLocaleString('vi-VN'),
    };

    const res = await saveSessionToService(completedSession);
    
    const existingIdx = savedSessions.findIndex((s) => s.id === completedSession.id);
    let updatedHistory = [...savedSessions];
    if (existingIdx >= 0) {
      updatedHistory[existingIdx] = completedSession;
    } else {
      updatedHistory = [completedSession, ...savedSessions];
    }
    setSavedSessions(updatedHistory);
    setIsCloudSync(res.isCloud);

    if (res.isCloud) {
      showToast('☁️ Đã đồng bộ phiếu cân lên Supabase Cloud!');
    } else {
      showToast('💾 Đã lưu phiếu cân vào máy (LocalStorage)!');
    }
  };

  // Delete from History
  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu cân này khỏi sổ?')) {
      const res = await deleteSessionFromService(id);
      const updated = savedSessions.filter((s) => s.id !== id);
      setSavedSessions(updated);
      setIsCloudSync(res.isCloud);
      showToast('Đã xóa phiếu cân khỏi sổ!');
    }
  };

  // Load Session to Edit
  const handleLoadSessionToEdit = (s: WeighingSession) => {
    setSessionInfo(s);
    setActiveTab('weighing');
    showToast(`Đã mở phiếu cân của ${s.farmerName || 'Chủ ruộng'} để tiếp tục cân!`);
  };

  // Zalo Copy
  const handleCopyZalo = async (sessionToCopy?: WeighingSession) => {
    const s = sessionToCopy || { ...sessionInfo, calculated: currentTotals };
    const text = generateZaloShareText(s);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('📋 Đã sao chép nội dung phiếu cân gửi Zalo!');
    } catch (err) {
      showToast('Không thể tự động sao chép.');
    }
  };

  // AI TTS Voice Playback
  const handleSpeakTts = async () => {
    if (ttsPlaying && audioRef.current) {
      audioRef.current.pause();
      setTtsPlaying(false);
      return;
    }

    setTtsLoading(true);
    try {
      const calc = currentTotals;
      const textToRead = `Thông báo kết quả cân lúa HTX Hòa Tiến 2: Chủ ruộng ${
        sessionInfo.farmerName || 'Chưa nhập tên'
      }. Giống lúa ${sessionInfo.riceType}. Tổng cộng ${calc.totalBags} bao lúa, cân ròng thực tế là ${
        calc.finalNetWeight
      } ki-lô-gam. Đơn giá ${sessionInfo.unitPrice} đồng một kg. Tổng thành tiền là ${new Intl.NumberFormat(
        'vi-VN'
      ).format(calc.totalAmount)} đồng. Xin cảm ơn quý khách!`;

      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead }),
      });

      const data = await res.json();
      if (data.success && data.audioBase64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = await playBase64PcmAudio(data.audioBase64, 24000);
        audioRef.current = audio;
        setTtsPlaying(true);
        audio.onended = () => setTtsPlaying(false);
        showToast('🔊 Đang đọc kết quả bằng giọng nói AI...');
      } else {
        throw new Error(data.error || 'Lỗi phát âm thanh AI.');
      }
    } catch (err: any) {
      showToast('Lỗi khi phát giọng nói AI.');
    } finally {
      setTtsLoading(false);
    }
  };

  // AI OCR apply
  const handleApplyOcrResult = (ocr: OcrResult) => {
    if (ocr.bagWeights && ocr.bagWeights.length > 0) {
      setSessionInfo((prev) => ({
        ...prev,
        farmerName: ocr.farmerName || prev.farmerName,
        truckInfo: ocr.truckInfo || prev.truckInfo,
        riceType: ocr.riceType || prev.riceType,
        unitPrice: ocr.unitPrice || prev.unitPrice,
        tarePerBag: ocr.tarePerBag !== undefined ? ocr.tarePerBag : prev.tarePerBag,
        impurityPercent: ocr.impurityPercent !== undefined ? ocr.impurityPercent : prev.impurityPercent,
        bagWeights: [...prev.bagWeights, ...ocr.bagWeights],
        note: ocr.note || prev.note,
      }));
      showToast(`✨ AI đã quét thành công ${ocr.bagWeights.length} bao lúa!`);
    }
  };

  // Smart parse apply
  const handleApplySmartData = (data: any) => {
    if (data.bagWeights && data.bagWeights.length > 0) {
      setSessionInfo((prev) => ({
        ...prev,
        farmerName: data.farmerName || prev.farmerName,
        truckInfo: data.buyerName || data.truckInfo || prev.truckInfo,
        riceType: data.riceType || prev.riceType,
        unitPrice: data.unitPrice || prev.unitPrice,
        deposit: data.deposit || prev.deposit,
        bagWeights: [...prev.bagWeights, ...data.bagWeights],
      }));
      showToast(`✨ AI đã phân tích lời nói và thêm ${data.bagWeights.length} bao lúa!`);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/90 text-slate-900'
    } transition-colors duration-300`}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl font-lexend font-bold flex items-center gap-2 text-xs sm:text-sm animate-bounce border border-emerald-400">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bagCount={currentTotals.totalBags}
        historyCount={savedSessions.length}
        currentUser={currentUser}
        adminConfig={adminConfig}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Body Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-5">
          {/* TAB 1: WEIGHING PANEL */}
          {activeTab === 'weighing' && (
            <div className="space-y-4">
              <FarmerInfoForm
                sessionInfo={sessionInfo}
                setSessionInfo={setSessionInfo}
                adminConfig={adminConfig}
                darkMode={darkMode}
                onNewSession={handleNewSession}
              />

              <WeighingPanel
                currentWeight={currentWeight}
                setCurrentWeight={setCurrentWeight}
                onAddWeight={handleAddWeight}
                onOpenOcr={() => setShowOcrModal(true)}
                onOpenSmartParse={() => setShowSmartModal(true)}
                onOpenBulkModal={() => setShowSmartModal(true)}
                bagCount={currentTotals.totalBags}
                draftCount={currentTotals.totalDrafts}
                darkMode={darkMode}
              />

              <BagList
                bagWeights={sessionInfo.bagWeights}
                onRemoveWeight={handleRemoveWeight}
                onClearAll={handleClearAllBags}
                onUpdateWeight={handleUpdateWeight}
                darkMode={darkMode}
              />

              <SummaryCard
                sessionInfo={sessionInfo}
                totals={currentTotals}
                onSaveSession={handleSaveSession}
                onSpeakTts={handleSpeakTts}
                ttsLoading={ttsLoading}
                ttsPlaying={ttsPlaying}
                onCopyZalo={() => handleCopyZalo()}
                onViewReceipt={() => {
                  setSelectedReceiptSession({ ...sessionInfo, calculated: currentTotals });
                  setActiveTab('receipt');
                }}
                onOpenYieldModal={() => setShowYieldModal(true)}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* TAB 2: HISTORY LIST */}
          {activeTab === 'history' && (
            <HistoryList
              sessions={savedSessions}
              onSelectSession={(s) => {
                setSelectedReceiptSession(s);
                setActiveTab('receipt');
              }}
              onLoadSessionToEdit={handleLoadSessionToEdit}
              onDeleteSession={handleDeleteSession}
              onCopyZalo={(s) => handleCopyZalo(s)}
              darkMode={darkMode}
            />
          )}

          {/* TAB 3: AI AGRICULTURAL ADVISOR */}
          {activeTab === 'ai_advisor' && (
            <AiAdvisor darkMode={darkMode} />
          )}

          {/* TAB 4: DASHBOARD REPORTING */}
          {activeTab === 'dashboard' && (
            <DashboardView
              sessions={savedSessions}
              darkMode={darkMode}
              onSelectSession={(s) => {
                setSelectedReceiptSession(s);
                setActiveTab('receipt');
              }}
            />
          )}

          {/* TAB 5: YIELD CALCULATOR PAGE */}
          {activeTab === 'yield' && (
            <div className="space-y-4">
              <div className={`p-6 rounded-3xl border shadow-xl ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-200'
              }`}>
                <h2 className="font-lexend font-black text-lg text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  📊 BẢNG TÍNH NĂNG SUẤT LÚA SÀO/MẪU TRUNG BỘ (ĐÀ NẴNG)
                </h2>
                <p className="text-xs text-slate-500 mb-4 font-medium">
                  Chuyển đổi sản lượng kg từ phiếu cân thành năng suất kg / Sào Trung Bộ (500m2), Mẫu Trung Bộ (5.000m2), Tấn/ha và dự tính lợi nhuận ròng.
                </p>
                <button
                  onClick={() => setShowYieldModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-lexend font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all text-sm"
                >
                  Mở Máy Tính Năng Suất Sào/Mẫu
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN PORTAL DASHBOARD */}
          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <AdminPortal
              config={adminConfig}
              onSaveConfig={handleSaveAdminConfig}
              users={usersList}
              onSaveUsers={handleSaveUsersList}
              sessions={savedSessions}
              onRefreshAllData={handleRefreshAllData}
              darkMode={darkMode}
            />
          )}

          {/* TAB 7: RECEIPT VIEW */}
          {activeTab === 'receipt' && selectedReceiptSession && (
            <ReceiptView
              session={selectedReceiptSession}
              onBack={() => setActiveTab('weighing')}
              onCopyZalo={() => handleCopyZalo(selectedReceiptSession)}
              darkMode={darkMode}
            />
          )}

          {/* Footer */}
          <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-500 py-4 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
            <p className="font-bold text-slate-600 dark:text-slate-300">🌾 {adminConfig.htxInfo.name}</p>
            <p>Địa chỉ: <strong>{adminConfig.htxInfo.address}</strong> • Tác giả: <strong>{adminConfig.htxInfo.author}</strong> • 📞 ĐT: <a href={`tel:${adminConfig.htxInfo.phone}`} className="font-semibold hover:underline text-emerald-600 dark:text-emerald-400">{adminConfig.htxInfo.phone}</a></p>
          </footer>
        </main>
      </div>

      {/* Auth Login Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onLogin={handleLogin}
          onClose={() => setShowAuthModal(false)}
          darkMode={darkMode}
        />
      )}

      {/* OCR Scanner Modal */}
      {showOcrModal && (
        <OcrModal
          onApplyOcr={handleApplyOcrResult}
          onClose={() => setShowOcrModal(false)}
          darkMode={darkMode}
        />
      )}

      {/* Smart Parse Voice / Text Modal */}
      {showSmartModal && (
        <SmartParseModal
          onAddWeights={(weights) => {
            setSessionInfo((prev) => ({
              ...prev,
              bagWeights: [...prev.bagWeights, ...weights],
            }));
            showToast(`Đã thêm ${weights.length} bao lúa!`);
          }}
          onApplySmartData={handleApplySmartData}
          onClose={() => setShowSmartModal(false)}
          darkMode={darkMode}
        />
      )}

      {/* Yield Calculator Modal */}
      {showYieldModal && (
        <YieldCalculatorModal
          netKg={currentTotals.finalNetWeight || 1000}
          unitPrice={sessionInfo.unitPrice || 8500}
          onClose={() => setShowYieldModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
