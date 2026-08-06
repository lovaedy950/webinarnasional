import React, { useState, useEffect } from 'react';
import { RegistrationRecord } from '../types';
import { 
  getRegistrations, fetchRegistrationsFromDB, updateRegistrationStatus, updateRegistrationApprovedSeries, updateRegistrationRecordByAdmin, exportToCSV, 
  getSubmissionLogs, fetchSubmissionLogsFromDB, retrySubmissionToDB, deleteRegistration, SubmissionLog 
} from '../data/registrationStore';
import { getMaintenanceConfig, saveMaintenanceConfig, MaintenanceConfig, PRICING_CATEGORIES, WEBINAR_SERIES_DATA } from '../data/webinarData';
import { uploadProofToBackblaze } from '../lib/backblazeClient';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, CheckCircle2, Clock, XCircle, DollarSign, Search, Filter, Download, 
  Eye, LogOut, ExternalLink, Phone, MessageSquare, ShieldCheck, RefreshCw, FileText, 
  CheckSquare, X, Building2, AlertTriangle, Database, Activity, RotateCcw, ShieldAlert, Trash2, Power, Settings, Wrench, Menu, GraduationCap, Award, Edit, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoKariadi from '../assets/images/Logo_RS_Kariadi_Resmi.png';
import logoPpni from '../assets/images/logo ppni.png';
import logoKemenkes from '../assets/images/logo kemenkes.png';
import logo101Corpo from '../assets/images/101 corpo acc.png';

interface AdminDashboardProps {
  onLogout: () => void;
  onGoToPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onGoToPublic }) => {
  const [activeTab, setActiveTab] = useState<'registrations' | 'logs'>('registrations');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [submissionLogs, setSubmissionLogs] = useState<SubmissionLog[]>([]);

  // Maintenance Config State
  const [maintConfig, setMaintConfig] = useState<MaintenanceConfig>(getMaintenanceConfig());
  const [showMaintModal, setShowMaintModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [seriesFilter, setSeriesFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, seriesFilter]);

  // Log Search Term
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');

  // Modal State for Viewing Payment Proof & Detail
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(null);
  const [selectedLog, setSelectedLog] = useState<SubmissionLog | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  // Modal State for Delete Confirmation
  const [deleteTargetRecord, setDeleteTargetRecord] = useState<RegistrationRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');

  // Admin Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSeries, setEditSeries] = useState<string[]>([]);
  const [editCategoryId, setEditCategoryId] = useState<string>('perawat_rsdk');
  const [editTotalAmount, setEditTotalAmount] = useState<number>(0);
  const [editProofFileName, setEditProofFileName] = useState<string>('');
  const [editProofUrl, setEditProofUrl] = useState<string>('');
  const [isUploadingEditProof, setIsUploadingEditProof] = useState<boolean>(false);
  const [showAdminEditConfirmModal, setShowAdminEditConfirmModal] = useState<boolean>(false);
  const [isAdminEditChecked, setIsAdminEditChecked] = useState<boolean>(false);

  const handleStartEditRecord = (record: RegistrationRecord) => {
    setEditSeries(record.series || []);
    setEditCategoryId(record.categoryId || 'perawat_rsdk');
    setEditTotalAmount(record.totalAmount || 0);
    setEditProofFileName(record.paymentProofName || '');
    setEditProofUrl(record.paymentProofUrl || '');
    setIsAdminEditChecked(false);
    setIsEditMode(true);
  };

  const handleRecalculateAmount = (series: string[], catId: string) => {
    const cat = PRICING_CATEGORIES.find(c => c.id === catId) || PRICING_CATEGORIES[0];
    return cat.rawPrice * series.length;
  };

  const handleEditSeriesToggle = (seriesTitle: string) => {
    let updatedSeries: string[] = [];
    if (editSeries.includes(seriesTitle)) {
      updatedSeries = editSeries.filter(s => s !== seriesTitle);
    } else {
      updatedSeries = [...editSeries, seriesTitle];
    }
    setEditSeries(updatedSeries);
    setEditTotalAmount(handleRecalculateAmount(updatedSeries, editCategoryId));
  };

  const handleEditCategoryChange = (catId: string) => {
    setEditCategoryId(catId);
    setEditTotalAmount(handleRecalculateAmount(editSeries, catId));
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRecord) return;

    setEditProofFileName(file.name);
    setIsUploadingEditProof(true);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          try {
            const b2Res = await uploadProofToBackblaze(file.name, compressedBase64, selectedRecord.id);
            setEditProofUrl(b2Res.presignedUrl || b2Res.key || compressedBase64);
          } catch (err) {
            setEditProofUrl(compressedBase64);
          } finally {
            setIsUploadingEditProof(false);
          }
        };
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const b2Res = await uploadProofToBackblaze(file.name, base64Data, selectedRecord.id);
          setEditProofUrl(b2Res.presignedUrl || b2Res.key || base64Data);
        } catch (err) {
          setEditProofUrl(base64Data);
        } finally {
          setIsUploadingEditProof(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdminEditConfirm = () => {
    if (editSeries.length === 0) {
      alert('⚠️ Pilihan seri webinar tidak boleh kosong. Mohon pilih minimal 1 seri.');
      return;
    }
    setIsAdminEditChecked(false);
    setShowAdminEditConfirmModal(true);
  };

  const handleExecuteAdminEditSave = async () => {
    if (!selectedRecord) return;

    const catObj = PRICING_CATEGORIES.find(c => c.id === editCategoryId);

    const updated = await updateRegistrationRecordByAdmin(selectedRecord.id, {
      series: editSeries,
      categoryId: editCategoryId,
      categoryName: catObj ? catObj.role : selectedRecord.categoryName,
      totalAmount: editTotalAmount,
      paymentProofName: editProofFileName || selectedRecord.paymentProofName,
      paymentProofUrl: editProofUrl || selectedRecord.paymentProofUrl,
      notes: `[EDITED_BY_ADMIN: ${new Date().toISOString().slice(0, 16)}] ${selectedRecord.notes || ''}`
    });

    setRegistrations(updated);
    setSelectedRecord(updated.find(r => r.id === selectedRecord.id) || null);
    setShowAdminEditConfirmModal(false);
    setIsEditMode(false);
    setRetryMessage(`✅ Data pendaftaran ${selectedRecord.fullName} (${selectedRecord.id}) berhasil diperbarui & disimpan ke Supabase!`);
    setTimeout(() => setRetryMessage(null), 5000);
  };

  const handleToggleMaintenance = (isClosed: boolean) => {
    const updated = saveMaintenanceConfig({
      ...maintConfig,
      isClosed
    });
    setMaintConfig(updated);
    setRetryMessage(isClosed ? '⚠️ Status Pendaftaran kini DITUTUP SEMENTARA.' : '🟢 Status Pendaftaran kini DIBUKA kembali!');
    setTimeout(() => setRetryMessage(null), 4000);
  };

  const handleSaveMaintForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveMaintenanceConfig(maintConfig);
    setMaintConfig(updated);
    setShowMaintModal(false);
    setRetryMessage('✅ Pengaturan status pendaftaran & pesan pengumuman berhasil disimpan!');
    setTimeout(() => setRetryMessage(null), 4000);
  };

  const loadData = async () => {
    setRegistrations(getRegistrations());
    setSubmissionLogs(getSubmissionLogs());
    const liveData = await fetchRegistrationsFromDB();
    setRegistrations(liveData);
    const liveLogs = await fetchSubmissionLogsFromDB();
    if (liveLogs && liveLogs.length > 0) {
      setSubmissionLogs(liveLogs);
    }
  };

  const handleExecuteDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetRecord) return;

    const res = await deleteRegistration(deleteTargetRecord.id, deleteConfirmText);
    if (res.success) {
      setRetryMessage(res.message);
      setDeleteTargetRecord(null);
      setDeleteConfirmText('');
      setDeleteErrorMsg('');
      if (selectedRecord && selectedRecord.id === deleteTargetRecord.id) {
        setSelectedRecord(null);
      }
      loadData();
      setTimeout(() => setRetryMessage(null), 5000);
    } else {
      setDeleteErrorMsg(res.message);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Real-time WebSocket Channel for Instant Multi-Device Sync
    const channel = supabase
      .channel('realtime:registrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        async () => {
          const freshData = await fetchRegistrationsFromDB();
          if (freshData && freshData.length > 0) {
            setRegistrations(freshData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    let nextStatus: 'pending' | 'valid' | 'approved_diklat' | 'rejected' = 'valid';
    if (currentStatus === 'pending') {
      nextStatus = 'valid';
    } else if (currentStatus === 'valid') {
      nextStatus = 'approved_diklat';
    } else {
      nextStatus = 'pending';
    }

    const targetItem = registrations.find(r => r.id === id);
    const approvedSeries = nextStatus === 'approved_diklat' 
      ? (targetItem?.series || []) 
      : (nextStatus === 'pending' || nextStatus === 'rejected') 
      ? [] 
      : (targetItem?.approvedSeries || []);

    const verifiedAt = (nextStatus === 'valid' || nextStatus === 'approved_diklat') 
      ? new Date().toISOString().replace('T', ' ').slice(0, 16) 
      : targetItem?.verifiedAt;

    // ⚡ INSTANT OPTIMISTIC UI MUTATION (0 ms delay)
    setRegistrations(prev => prev.map(item => item.id === id ? { 
      ...item, 
      status: nextStatus, 
      approvedSeries,
      verifiedAt
    } : item));

    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(prev => prev ? { 
        ...prev, 
        status: nextStatus, 
        approvedSeries,
        verifiedAt
      } : null);
    }

    // Background Storage & DB Sync
    const updated = await updateRegistrationStatus(id, nextStatus);
    setRegistrations(updated);
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(updated.find(r => r.id === id) || null);
    }
  };

  const handleUpdateStatusExplicit = async (id: string, status: 'pending' | 'valid' | 'approved_diklat' | 'rejected') => {
    const target = registrations.find(r => r.id === id);
    if (status === 'approved_diklat' && target && target.status === 'pending') {
      alert('⚠️ Tidak dapat Approve Diklat! Mohon set status "Sudah Membayar" terlebih dahulu.');
      return;
    }

    const approvedSeries = status === 'approved_diklat' 
      ? (target?.series || []) 
      : (status === 'pending' || status === 'rejected') 
      ? [] 
      : (target?.approvedSeries || []);

    const verifiedAt = (status === 'valid' || status === 'approved_diklat') 
      ? new Date().toISOString().replace('T', ' ').slice(0, 16) 
      : target?.verifiedAt;

    // ⚡ INSTANT OPTIMISTIC UI MUTATION (0 ms delay)
    setRegistrations(prev => prev.map(item => item.id === id ? { 
      ...item, 
      status, 
      approvedSeries,
      verifiedAt
    } : item));

    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(prev => prev ? { 
        ...prev, 
        status, 
        approvedSeries,
        verifiedAt
      } : null);
    }

    // Background Storage & DB Sync
    const updated = await updateRegistrationStatus(id, status);
    setRegistrations(updated);
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(updated.find(r => r.id === id) || null);
    }
  };

  const handleToggleSeriesDiklat = async (record: RegistrationRecord, seriesTitle: string) => {
    if (record.status === 'pending') {
      alert('⚠️ Tidak dapat Approve Diklat! Mohon set status "Sudah Membayar" terlebih dahulu.');
      return;
    }

    const currentApproved = record.approvedSeries || (record.status === 'approved_diklat' ? record.series : []);
    let newApproved: string[] = [];

    if (currentApproved.includes(seriesTitle)) {
      newApproved = currentApproved.filter(s => s !== seriesTitle);
    } else {
      newApproved = [...currentApproved, seriesTitle];
    }

    const newStatus: 'pending' | 'valid' | 'approved_diklat' | 'rejected' = newApproved.length > 0 
      ? 'approved_diklat' 
      : (record.status === 'approved_diklat' ? 'valid' : record.status);

    // ⚡ INSTANT OPTIMISTIC UI MUTATION (0 ms delay)
    setRegistrations(prev => prev.map(item => item.id === record.id ? { 
      ...item, 
      approvedSeries: newApproved,
      status: newStatus 
    } : item));

    if (selectedRecord && selectedRecord.id === record.id) {
      setSelectedRecord(prev => prev ? { 
        ...prev, 
        approvedSeries: newApproved,
        status: newStatus 
      } : null);
    }

    // Background Storage & DB Sync
    const updated = await updateRegistrationApprovedSeries(record.id, newApproved);
    setRegistrations(updated);
    if (selectedRecord && selectedRecord.id === record.id) {
      setSelectedRecord(updated.find(r => r.id === record.id) || null);
    }
  };

  const handleApproveAllSeriesDiklat = async (record: RegistrationRecord) => {
    if (record.status === 'pending') {
      alert('⚠️ Tidak dapat Approve Diklat! Mohon set status "Sudah Membayar" terlebih dahulu.');
      return;
    }

    const newApproved = record.series;

    // ⚡ INSTANT OPTIMISTIC UI MUTATION (0 ms delay)
    setRegistrations(prev => prev.map(item => item.id === record.id ? { 
      ...item, 
      approvedSeries: newApproved,
      status: 'approved_diklat' 
    } : item));

    if (selectedRecord && selectedRecord.id === record.id) {
      setSelectedRecord(prev => prev ? { 
        ...prev, 
        approvedSeries: newApproved,
        status: 'approved_diklat' 
      } : null);
    }

    // Background Storage & DB Sync
    const updated = await updateRegistrationApprovedSeries(record.id, newApproved);
    setRegistrations(updated);
    if (selectedRecord && selectedRecord.id === record.id) {
      setSelectedRecord(updated.find(r => r.id === record.id) || null);
    }
  };

  const handleRetrySubmit = async (logId: number | string) => {
    const result = await retrySubmissionToDB(logId);
    setRetryMessage(result.message);
    loadData();
    setTimeout(() => setRetryMessage(null), 5000);
  };

  // Filter Logic Registrations
  const filteredData = registrations.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nikKtp.includes(searchTerm) ||
      item.phone.includes(searchTerm) ||
      item.installation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    const matchesSeries = seriesFilter === 'all' || item.series.includes(seriesFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesSeries;
  });

  // Filter Logic Submission Logs
  const filteredLogs = submissionLogs.filter(log => {
    const matchesSearch =
      log.fullName.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.phone.includes(logSearchTerm) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(logSearchTerm.toLowerCase())) ||
      (log.registrationId && log.registrationId.toLowerCase().includes(logSearchTerm.toLowerCase()));

    const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Statistics
  const totalCount = registrations.length;
  const validCount = registrations.filter(r => r.status === 'valid').length;
  const approvedDiklatCount = registrations.filter(r => r.status === 'approved_diklat').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const totalRevenue = registrations.filter(r => r.status === 'valid' || r.status === 'approved_diklat').reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalLogsCount = submissionLogs.length;
  const dbErrorsCount = submissionLogs.filter(l => l.status === 'db_error' && !l.isResolved).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          
          {/* Left Brand & Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 lg:hidden border border-slate-700 transition-colors cursor-pointer"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>

            <div className="flex items-center gap-2 bg-white/95 p-1 sm:p-1.5 rounded-xl shadow-sm">
              <img src={logoKemenkes} alt="Kemenkes" className="h-5 sm:h-6 object-contain" />
              <div className="h-4 w-[1px] bg-slate-300"></div>
              <img src={logoKariadi} alt="RSUP Dr. Kariadi" className="h-5 sm:h-6 object-contain" />
              <div className="h-4 w-[1px] bg-slate-300"></div>
              <img src={logoPpni} alt="PPNI" className="h-7 sm:h-8 object-contain scale-110" />
            </div>

            <div className="hidden sm:block">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight block">
                ADMIN PORTAL VERIFIKASI & LOGS
              </span>
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                HUT Ke-101 RSUP Dr. Kariadi (Supabase & Backblaze Powered)
              </span>
            </div>
          </div>

          {/* Right Action Controls (Desktop & Mobile Quick Switcher) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Switcher Button */}
            {maintConfig.isClosed ? (
              <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 p-1 rounded-xl">
                <button
                  onClick={() => handleToggleMaintenance(false)}
                  className="px-2.5 py-1.5 text-[11px] sm:text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                  title="Klik untuk membuka pendaftaran kembali"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>BUKA</span>
                </button>
                <button
                  onClick={() => setShowMaintModal(true)}
                  className="p-1.5 text-amber-200 hover:text-white hover:bg-amber-400/20 rounded-lg transition-colors"
                  title="Pengaturan Pesan Pengumuman"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 p-1 rounded-xl">
                <span className="px-2 text-[10px] sm:text-[11px] font-black text-emerald-300 uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  DIBUKA
                </span>
                <button
                  onClick={() => handleToggleMaintenance(true)}
                  className="px-2 py-1 text-[11px] font-bold text-amber-200 hover:text-white bg-amber-500/30 hover:bg-amber-600 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Klik untuk menutup sementara pendaftaran"
                >
                  <Power className="w-3 h-3" />
                  <span className="hidden sm:inline">TUTUP SEMENTARA</span>
                </button>
                <button
                  onClick={() => setShowMaintModal(true)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Pengaturan Pesan"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onGoToPublic}
              className="hidden md:flex px-3 py-1.5 text-xs font-bold text-cyan-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Web Publik</span>
            </button>

            <button
              onClick={onLogout}
              className="hidden md:flex px-3 py-1.5 text-xs font-bold text-red-300 hover:text-white bg-red-500/20 hover:bg-red-600 rounded-xl transition-all items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE SLIDE-OUT SIDEBAR DRAWER & BACKDROP */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            />

            {/* Drawer Window */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs sm:max-w-sm bg-slate-900 text-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-4 sm:p-5 space-y-5">
                {/* Header Drawer */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl">
                      <img src={logoKariadi} alt="RS Kariadi" className="h-5 object-contain" />
                      <img src={logoPpni} alt="PPNI" className="h-6 object-contain" />
                    </div>
                    <div>
                      <span className="font-extrabold text-white text-xs block">ADMIN DASHBOARD</span>
                      <span className="text-[10px] text-cyan-300 font-bold block">DPK PPNI KARIADI</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* System Control Switcher */}
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2.5 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status System Pendaftaran</span>
                  
                  {maintConfig.isClosed ? (
                    <div className="space-y-2">
                      <span className="px-2.5 py-1 text-xs font-black bg-amber-500/20 text-amber-300 rounded-lg border border-amber-400/30 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        DITUTUP SEMENTARA
                      </span>
                      <button
                        onClick={() => {
                          handleToggleMaintenance(false);
                          setIsSidebarOpen(false);
                        }}
                        className="w-full py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Power className="w-4 h-4" />
                        <span>BUKA PENDAFTARAN</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="px-2.5 py-1 text-xs font-black bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        PENDAFTARAN DIBUKA
                      </span>
                      <button
                        onClick={() => {
                          handleToggleMaintenance(true);
                          setIsSidebarOpen(false);
                        }}
                        className="w-full py-2 text-xs font-bold text-amber-200 bg-amber-500/30 hover:bg-amber-600 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Power className="w-4 h-4" />
                        <span>TUTUP SEMENTARA</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowMaintModal(true);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Pengaturan Pesan</span>
                  </button>
                </div>

                {/* Sidebar Navigation Menu */}
                <div className="space-y-1.5 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Menu Utama</span>
                  
                  <button
                    onClick={() => {
                      setActiveTab('registrations');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'registrations' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" />
                      <span>Data Pendaftar</span>
                    </div>
                    <span className="px-2 py-0.5 bg-black/30 rounded-full text-[10px] font-mono">{totalCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('logs');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeTab === 'logs' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4" />
                      <span>Audit & Error Logs</span>
                    </div>
                    <span className="px-2 py-0.5 bg-black/30 rounded-full text-[10px] font-mono">{totalLogsCount}</span>
                  </button>
                </div>

                {/* Quick Stats Summary */}
                <div className="space-y-2 text-left bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ringkasan Ringkas</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Valid Lunas</span>
                      <span className="font-extrabold text-emerald-400">{validCount} Peserta</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Pending</span>
                      <span className="font-extrabold text-amber-400">{pendingCount} Peserta</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Omset</span>
                    <span className="font-extrabold text-cyan-300 text-sm">Rp {totalRevenue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-800 space-y-2 text-left bg-slate-950">
                <button
                  onClick={() => {
                    exportToCSV(filteredData);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Excel (CSV)</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onGoToPublic();
                      setIsSidebarOpen(false);
                    }}
                    className="py-2 text-[11px] font-bold text-cyan-300 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Web Publik</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="py-2 text-[11px] font-bold text-red-300 bg-red-500/20 hover:bg-red-600 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header & Retry Notification */}
        {retryMessage && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{retryMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Control Panel & System Logs Admin
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Monitoring pendaftar lunas, tracking submisi error database, dan manajemen verifikasi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={() => exportToCSV(filteredData)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION SWITCHER */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'registrations'
                ? 'bg-white text-cyan-800 border-t-2 border-x border-slate-200 border-t-cyan-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Daftar Pendaftar ({totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 relative cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-cyan-800 border-t-2 border-x border-slate-200 border-t-cyan-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-600" />
            <span>Tracking & Error Submisi ({totalLogsCount})</span>

            {dbErrorsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-red-600 text-white rounded-full animate-pulse">
                {dbErrorsCount} Error
              </span>
            )}
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: DAFTAR PENDAFTAR TABLE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            
            {/* 5 Overview Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Pendaftar</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{totalCount} Peserta</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Sudah Membayar</span>
                  <span className="text-xl font-black text-emerald-800 mt-1 block">{validCount} Lunas</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-indigo-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Approve Diklat</span>
                  <span className="text-xl font-black text-indigo-900 mt-1 block">{approvedDiklatCount} Diklat</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-700" />
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Menunggu Verifikasi</span>
                  <span className="text-xl font-black text-amber-800 mt-1 block">{pendingCount} Pending</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Omset</span>
                  <span className="text-lg font-black text-cyan-900 mt-1 block">Rp {totalRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-900 text-white flex items-center justify-center font-bold shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 relative">
                  <input
                    type="text"
                    placeholder="Cari Nama, Email, NIK, No. HP, atau Instalasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-xs font-semibold text-slate-800"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="all">Semua Status Pembayaran & Diklat</option>
                    <option value="approved_diklat">🎓 Approve Diklat</option>
                    <option value="valid">✅ Sudah Membayar (Valid)</option>
                    <option value="pending">⏳ Menunggu Verifikasi (Pending)</option>
                    <option value="rejected">❌ Ditolak</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="perawat_rsdk">Perawat RSDK (10k)</option>
                    <option value="medis">Medis (35k)</option>
                    <option value="perawat">Perawat / Nakes (25k)</option>
                    <option value="mahasiswa">Mahasiswa / Umum (15k)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={seriesFilter}
                    onChange={(e) => setSeriesFilter(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="all">Semua Seri</option>
                    <option value="ONKOLOGI">Seri 1: ONKOLOGI</option>
                    <option value="JANTUNG">Seri 2: JANTUNG</option>
                    <option value="NEUROSAINS">Seri 3: NEUROSAINS</option>
                    <option value="URONEFRO">Seri 4: URONEFRO</option>
                  </select>
                </div>
              </div>
            </div>
                 {/* PAGINATION CALCULATIONS */}
            {(() => {
              const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
              const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
              const startIndex = (safeCurrentPage - 1) * itemsPerPage;
              const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
              const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

              return (
                <div className="space-y-4">
                  {/* PETUNJUK KETERANGAN ACC DIKLAT & PAGINATION TOP BAR */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-left">
                    {/* Legend Indicators for Team Diklat */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="text-slate-500 font-extrabold uppercase tracking-wider">Keterangan Seri Diklat:</span>
                      <span className="px-2 py-0.5 bg-indigo-700 text-white rounded-lg flex items-center gap-1 shadow-2xs border border-indigo-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                        <span>APPROVED DIKLAT (ACC)</span>
                      </span>
                      <span className="px-2 py-0.5 bg-cyan-50 text-cyan-900 border border-cyan-300 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-600" />
                        <span>Belum Approved</span>
                      </span>
                    </div>

                    {/* Range Summary & Items Per Page Selector */}
                    <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium">
                      <span>
                        Menampilkan <strong className="text-slate-900 font-black">{filteredData.length > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-slate-900 font-black">{endIndex}</strong> dari <strong className="text-slate-900 font-black">{filteredData.length}</strong> Pendaftar
                      </span>

                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                        <span className="text-[11px] text-slate-500 font-bold">Per Halaman:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-300 font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* DATA VIEW (MOBILE CARDS & DESKTOP TABLE) */}
                  
                  {/* MOBILE CARDS VIEW (VISIBLE ON SMARTPHONES < md) */}
                  <div className="block md:hidden space-y-3">
                    {paginatedData.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold shadow-sm">
                        Tidak ada data pendaftaran yang sesuai.
                      </div>
                    ) : (
                      paginatedData.map((record) => {
                        const isApproved = record.status === 'approved_diklat';
                        const isValid = record.status === 'valid';
                        const isRejected = record.status === 'rejected';

                        return (
                          <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5 text-left">
                            {/* Card Header: Status Badge & ID/Date */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-xs font-mono">{record.id}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{record.createdAt}</span>
                              </div>
                              
                              <button
                                onClick={() => handleToggleStatus(record.id, record.status)}
                                className={`px-2.5 py-1 rounded-lg font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                                  isApproved
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                    : isValid
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : isRejected
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {isApproved ? (
                                  <>
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                                    <span>APPROVE DIKLAT</span>
                                  </>
                                ) : isValid ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>SUDAH MEMBAYAR</span>
                                  </>
                                ) : isRejected ? (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                                    <span>DITOLAK</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                    <span>PENDING</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Card Body: Participant Details & Per-Series Approved Status */}
                            <div className="space-y-1 text-left">
                              <span className="font-extrabold text-slate-900 text-sm block leading-snug">{record.fullName}</span>
                              
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 font-medium">
                                <span className="text-cyan-800 font-mono font-bold">{record.email}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-slate-600">NIK: {record.nikKtp}</span>
                              </div>

                              <div className="text-xs text-slate-600 font-medium pt-1">
                                🏢 <span className="font-bold text-slate-800">{record.installation}</span> ({record.city})
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[10px]">
                                <span className="px-2 py-0.5 font-extrabold bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                                  {record.categoryName}
                                </span>
                                {record.series.map((sTitle, idx) => {
                                  const approvedList = record.approvedSeries || (record.status === 'approved_diklat' ? record.series : []);
                                  const isSeriesApproved = approvedList.includes(sTitle);

                                  return (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-lg font-black flex items-center gap-1 border transition-all ${
                                        isSeriesApproved
                                          ? 'bg-indigo-700 text-white border-indigo-800 shadow-2xs'
                                          : 'bg-cyan-50 text-cyan-900 border-cyan-200 font-bold'
                                      }`}
                                      title={isSeriesApproved ? `Webinar ${sTitle}: Approved Diklat 🎓` : `Webinar ${sTitle}: Belum Approved ⏳`}
                                    >
                                      {isSeriesApproved ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />
                                          <span>{sTitle}</span>
                                          <span className="bg-emerald-500/30 text-emerald-200 text-[8px] px-1 py-0.2 rounded font-mono uppercase">
                                            ACC
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
                                          <span>{sTitle}</span>
                                        </>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Card Status Action Row */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                              {record.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatusExplicit(record.id, 'valid')}
                                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Set Sudah Membayar</span>
                                  </button>
                                  <button
                                    onClick={() => alert('⚠️ Mohon set "Sudah Membayar" terlebih dahulu sebelum Approve Diklat!')}
                                    className="flex-1 py-1.5 px-2 bg-slate-100 text-slate-400 font-bold text-[11px] rounded-xl border border-slate-200 cursor-not-allowed opacity-60 flex items-center justify-center gap-1"
                                    title="Harus set Sudah Membayar terlebih dahulu"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>Approve Diklat 🔒</span>
                                  </button>
                                </>
                              ) : record.status === 'valid' ? (
                                <button
                                  onClick={() => handleUpdateStatusExplicit(record.id, 'approved_diklat')}
                                  className="w-full py-1.5 px-2 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-[11px] rounded-xl shadow-md flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>Klik untuk Approve Diklat 🎓</span>
                                </button>
                              ) : isApproved ? (
                                <div className="w-full py-1 px-2 bg-indigo-50 border border-indigo-200 rounded-xl text-center text-indigo-900 font-extrabold text-[11px] flex items-center justify-center gap-1">
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                                  <span>Status: Approved Diklat ✨</span>
                                </div>
                              ) : null}
                            </div>

                            {/* Card Footer: Tagihan & Touch Actions */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Tagihan</span>
                                <span className="font-black text-slate-900 text-sm">Rp {record.totalAmount.toLocaleString('id-ID')}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`https://wa.me/${record.cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                                  title="Chat WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>WA</span>
                                </a>

                                <button
                                  onClick={() => setSelectedRecord(record)}
                                  className="px-2.5 py-1.5 text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Bukti</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setDeleteTargetRecord(record);
                                    setDeleteConfirmText('');
                                    setDeleteErrorMsg('');
                                  }}
                                  className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                                  title="Hapus Peserta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* DESKTOP TABLE VIEW (VISIBLE ON TABLETS & DESKTOPS md:) */}
                  <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Daftar Peserta Pendaftar ({filteredData.length} Total Data)
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        * Tanda <strong className="text-indigo-700">APPROVED (ACC)</strong> menunjukkan seri webinar yang sudah disetujui tim Diklat
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="p-3.5 text-center">Status / Validasi & Diklat</th>
                            <th className="p-3.5">ID & Waktu</th>
                            <th className="p-3.5">Nama & Email LMS</th>
                            <th className="p-3.5">NIK KTP</th>
                            <th className="p-3.5">Asal Instalasi & Kota</th>
                            <th className="p-3.5">No. HP (WhatsApp)</th>
                            <th className="p-3.5">Kategori & Status Per Seri Diklat</th>
                            <th className="p-3.5 text-right">Total Tagihan</th>
                            <th className="p-3.5 text-center">Bukti Transfer</th>
                            <th className="p-3.5 text-center">Aksi Detail</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {paginatedData.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="p-8 text-center text-slate-500 font-semibold">
                                Tidak ada data pendaftaran yang sesuai.
                              </td>
                            </tr>
                          ) : (
                            paginatedData.map((record) => {
                              const isApproved = record.status === 'approved_diklat';
                              const isValid = record.status === 'valid';
                              const isRejected = record.status === 'rejected';

                              return (
                                <tr key={record.id} className="hover:bg-cyan-50/40 transition-colors">
                                  <td className="p-3.5 text-center space-y-1">
                                    <button
                                      onClick={() => handleToggleStatus(record.id, record.status)}
                                      className={`w-full px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        isApproved
                                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200'
                                          : isValid
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                          : isRejected
                                          ? 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                                          : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                      }`}
                                    >
                                      {isApproved ? (
                                        <>
                                          <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                                          <span>Approve Diklat</span>
                                        </>
                                      ) : isValid ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Sudah Membayar</span>
                                        </>
                                      ) : isRejected ? (
                                        <>
                                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                                          <span>Ditolak</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                                          <span>Pending</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Quick Action Button for Approve Diklat if status === valid */}
                                    {isValid && (
                                      <button
                                        onClick={() => handleUpdateStatusExplicit(record.id, 'approved_diklat')}
                                        className="w-full px-2 py-1 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-[10px] rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                        title="Klik untuk Approve Diklat"
                                      >
                                        <GraduationCap className="w-3 h-3" />
                                        <span>Approve Diklat 🎓</span>
                                      </button>
                                    )}

                                    {record.status === 'pending' && (
                                      <button
                                        onClick={() => alert('⚠️ Mohon set "Sudah Membayar" terlebih dahulu sebelum Approve Diklat!')}
                                        className="w-full px-2 py-1 bg-slate-100 text-slate-400 font-bold text-[10px] rounded-lg border border-slate-200 cursor-not-allowed opacity-60 flex items-center justify-center gap-1"
                                        title="Harus set Sudah Membayar terlebih dahulu"
                                      >
                                        <GraduationCap className="w-3 h-3" />
                                        <span>Approve Diklat 🔒</span>
                                      </button>
                                    )}
                                  </td>

                                  <td className="p-3.5 font-mono text-[11px]">
                                    <span className="font-bold text-slate-900 block">{record.id}</span>
                                    <span className="text-slate-400 text-[10px] block">{record.createdAt}</span>
                                  </td>

                                  <td className="p-3.5">
                                    <span className="font-extrabold text-slate-900 block leading-snug">{record.fullName}</span>
                                    <span className="text-cyan-800 text-[11px] font-mono block">{record.email}</span>
                                  </td>

                                  <td className="p-3.5 font-mono text-slate-800 font-semibold">
                                    {record.nikKtp}
                                  </td>

                                  <td className="p-3.5">
                                    <span className="font-bold text-slate-800 block">{record.installation}</span>
                                    <span className="text-slate-500 text-[11px] block">{record.city}</span>
                                  </td>

                                  <td className="p-3.5">
                                    <a
                                      href={`https://wa.me/${record.cleanPhone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition-colors font-mono"
                                    >
                                      <Phone className="w-3 h-3 text-emerald-600" />
                                      <span>{record.phone}</span>
                                    </a>
                                  </td>

                                  {/* PER-SERIES STATUS BADGES COLUMN FOR TEAM DIKLAT */}
                                  <td className="p-3.5 space-y-1.5">
                                    <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-800 rounded border border-slate-200">
                                      {record.categoryName}
                                    </span>
                                    
                                    <div className="space-y-1">
                                      {record.series.map((sTitle, idx) => {
                                        const approvedList = record.approvedSeries || (record.status === 'approved_diklat' ? record.series : []);
                                        const isSeriesApproved = approvedList.includes(sTitle);

                                        return (
                                          <div
                                            key={idx}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center justify-between gap-1 shadow-2xs border transition-all ${
                                              isSeriesApproved
                                                ? 'bg-indigo-700 text-white border-indigo-800 shadow-indigo-500/20'
                                                : 'bg-cyan-50 text-cyan-900 border-cyan-300 font-bold'
                                            }`}
                                            title={isSeriesApproved ? `Webinar ${sTitle}: APPROVED Diklat 🎓` : `Webinar ${sTitle}: Belum Approved Diklat ⏳`}
                                          >
                                            <div className="flex items-center gap-1">
                                              {isSeriesApproved ? (
                                                <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />
                                              ) : (
                                                <Clock className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
                                              )}
                                              <span>{sTitle}</span>
                                            </div>

                                            <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase ${
                                              isSeriesApproved
                                                ? 'bg-emerald-500/30 text-emerald-200'
                                                : 'bg-slate-200/60 text-slate-600'
                                            }`}>
                                              {isSeriesApproved ? 'APPROVED' : 'BELUM'}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>

                                  <td className="p-3.5 text-right font-extrabold text-slate-900 text-xs">
                                    Rp {record.totalAmount.toLocaleString('id-ID')}
                                  </td>

                                  <td className="p-3.5 text-center">
                                    <button
                                      onClick={() => setSelectedRecord(record)}
                                      className="px-2.5 py-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>{record.paymentProofName ? 'Lihat Bukti' : 'Belum Ada'}</span>
                                    </button>
                                  </td>

                                  <td className="p-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => setSelectedRecord(record)}
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                        title="Detail & Verifikasi"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      
                                      <button
                                        onClick={() => {
                                          setDeleteTargetRecord(record);
                                          setDeleteConfirmText('');
                                          setDeleteErrorMsg('');
                                        }}
                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                        title="Hapus Peserta"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PAGINATION BOTTOM CONTROLS */}
                  {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-medium text-[11px] hidden sm:inline">
                        Halaman <strong>{safeCurrentPage}</strong> dari <strong>{totalPages}</strong> (Total {filteredData.length} Data)
                      </span>

                      <div className="flex items-center gap-1 mx-auto sm:mx-0">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={safeCurrentPage === 1}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            safeCurrentPage === 1
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                          }`}
                          title="Halaman Pertama"
                        >
                          « Awal
                        </button>

                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={safeCurrentPage === 1}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            safeCurrentPage === 1
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                          }`}
                        >
                          ‹ Sebelum
                        </button>

                        <span className="px-3.5 py-1.5 bg-cyan-700 text-white rounded-xl font-black text-xs shadow-sm">
                          {safeCurrentPage} / {totalPages}
                        </span>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={safeCurrentPage === totalPages}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            safeCurrentPage === totalPages
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                          }`}
                        >
                          Lanjut ›
                        </button>

                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={safeCurrentPage === totalPages}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                            safeCurrentPage === totalPages
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                          }`}
                          title="Halaman Akhir"
                        >
                          Akhir »
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: TRACKING & ERROR SUBMISI SYSTEM LOGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            
            {/* System Info Header */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl font-extrabold tracking-tight">Sistem Tracking & Recovery Submisi Gagal</h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Fitur ini melacak seluruh pengiriman formulir dari peserta. Jika data gagal masuk ke database MySQL (misalnya kendala koneksi Hostinger, timeout, atau schema error), payload tetap tersimpan di sini dan dapat dikirim ulang (retry) langsung oleh Admin.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">DB Error Pending</span>
                  <span className="text-xl font-black text-amber-400 block">{dbErrorsCount} Log</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Rec. Logs</span>
                  <span className="text-xl font-black text-white block">{totalLogsCount} Log</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar Logs */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1 relative">
                <input
                  type="text"
                  placeholder="Cari Log berdasarkan Nama, Email, Phone, atau Pesan Error..."
                  value={logSearchTerm}
                  onChange={(e) => setLogSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-xs font-semibold text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              <div className="w-full sm:w-64">
                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="all">Semua Tipe Log Submisi</option>
                  <option value="db_error">⚠️ Error Database MySQL</option>
                  <option value="network_error">⚡ Network / Connection Error</option>
                  <option value="validation_error">🚫 Validation Error</option>
                  <option value="success">✅ Submisi Sukses</option>
                </select>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Riwayat Submisi & Error Tracking ({filteredLogs.length} Data)
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  * Klik 'Coba Kirim Ulang' untuk memasukkan payload gagal ke database
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Waktu & Reg ID</th>
                      <th className="p-3.5">Peserta</th>
                      <th className="p-3.5">Status Tracking</th>
                      <th className="p-3.5">Pesan Error / Diagnosis System</th>
                      <th className="p-3.5">IP & User Agent</th>
                      <th className="p-3.5 text-center">Aksi Pemulihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                          Tidak ada log tracking submisi yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isDbError = log.status === 'db_error';
                        const isNetworkError = log.status === 'network_error';
                        const isSuccess = log.status === 'success';

                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5 font-mono text-[11px]">
                              <span className="font-bold text-slate-900 block">{log.registrationId || '-'}</span>
                              <span className="text-slate-400 text-[10px] block">{log.createdAt}</span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-extrabold text-slate-900 block">{log.fullName}</span>
                              <span className="text-cyan-800 text-[11px] font-mono block">{log.email}</span>
                              <span className="text-slate-500 text-[10px] font-mono block">{log.phone}</span>
                            </td>

                            <td className="p-3.5">
                              {isSuccess ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-lg border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Berhasil Masuk DB</span>
                                </span>
                              ) : isDbError ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-lg border border-amber-300 animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Error MySQL DB</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 font-extrabold text-[10px] rounded-lg border border-red-300">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  <span>Error Submisi</span>
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 max-w-md">
                              {log.errorMessage ? (
                                <div className="p-2 bg-red-50/90 border border-red-200 rounded-xl text-[11px] font-mono text-red-800 break-words">
                                  {log.errorMessage}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px] font-medium">Tidak ada error (Submisi Normal)</span>
                              )}
                            </td>

                            <td className="p-3.5 font-mono text-[10px] text-slate-500">
                              <span className="block font-bold text-slate-700">{log.ipAddress || '127.0.0.1'}</span>
                              <span className="block truncate max-w-[140px]" title={log.userAgent}>{log.userAgent || 'Chrome/Browser'}</span>
                            </td>

                            <td className="p-3.5 text-center space-y-1">
                              {log.isResolved ? (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-md border border-emerald-200 block">
                                  ✅ Sudah Dipulihkan
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleRetrySubmit(log.id)}
                                  className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[11px] rounded-xl shadow-md flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
                                  title="Proses ulang payload ini agar tersimpan ke database"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Coba Kirim Ulang</span>
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedLog(log)}
                                className="text-[10px] font-bold text-cyan-800 hover:underline block mx-auto pt-1"
                              >
                                Lihat Raw Payload JSON
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* BUKTI TRANSFER & DETAIL VERIFICATION MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp my-auto max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest block">Detail Pendaftaran & Bukti Transfer</span>
                <h3 className="text-lg sm:text-xl font-extrabold pr-4">{selectedRecord.fullName}</h3>
                <span className="text-[10px] sm:text-xs font-mono text-slate-400">{selectedRecord.id} • {selectedRecord.createdAt}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={() => handleStartEditRecord(selectedRecord)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Edit Pilihan Seri & Upload Bukti Transfer Baru"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Seri & Bukti</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Batal Edit</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedRecord(null);
                    setIsEditMode(false);
                  }}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditMode ? (
              /* ADMIN EDIT FORM MODE */
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-left bg-slate-50">
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-amber-800">
                    <Edit className="w-4 h-4 text-amber-600" />
                    <span>Mode Edit Seri & Bukti Transfer Peserta</span>
                  </div>
                  <p>
                    Gunakan mode ini jika nominal transfer tidak sesuai dengan pilihan awal peserta. Anda dapat menyesuaikan seri webinar yang dipilih dan mengunggah ulang bukti transfer jika diperlukan.
                  </p>
                </div>

                {/* 1. EDIT SERI WEBINAR CHECKLIST */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="text-xs font-black uppercase text-slate-800 tracking-wider block">
                    1. Sesuaikan Pilihan Seri Webinar:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {WEBINAR_SERIES_DATA.map((series) => {
                      const isChecked = editSeries.includes(series.title);
                      return (
                        <button
                          key={series.id}
                          type="button"
                          onClick={() => handleEditSeriesToggle(series.title)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-cyan-50 border-cyan-300 text-cyan-950 font-bold shadow-sm ring-1 ring-cyan-200'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <span className="text-xs font-bold">{series.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{series.date}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. EDIT KATEGORI & TOTAL TAGIHAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-800 tracking-wider block mb-1">
                      2. Kategori Peserta:
                    </label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => handleEditCategoryChange(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                    >
                      {PRICING_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.role} (Rp {cat.rawPrice.toLocaleString('id-ID')} / webinar)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-slate-800 tracking-wider block mb-1">
                      Total Tagihan Baru (Otomatis / Manual):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-extrabold text-slate-400">Rp</span>
                      <input
                        type="number"
                        value={editTotalAmount}
                        onChange={(e) => setEditTotalAmount(Number(e.target.value) || 0)}
                        className="w-full text-sm font-black bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. UPLOAD BUKTI TRANSFER BARU */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-xs font-black uppercase text-slate-800 tracking-wider block">
                    3. Upload Bukti Transfer Baru (Opsional):
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      <span>{isUploadingEditProof ? 'Mengunggah ke Storage...' : 'Pilih Berkas Baru (Foto / PDF)'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleEditFileChange}
                        className="hidden"
                        disabled={isUploadingEditProof}
                      />
                    </label>
                    <span className="text-xs font-mono text-slate-600 truncate max-w-[200px]">
                      {editProofFileName || selectedRecord.paymentProofName || 'Tetap berkas lama'}
                    </span>
                  </div>
                </div>

                {/* TOMBOL SIMPAN & BATAL EDIT */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAdminEditConfirm}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan & Update Data Peserta</span>
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL VIEW MODE */
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nama Lengkap (LMS):</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedRecord.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Email (LMS):</span>
                  <span className="font-bold text-cyan-800 font-mono block">{selectedRecord.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">NIK KTP:</span>
                  <span className="font-bold text-slate-900 font-mono block">{selectedRecord.nikKtp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Asal Instalasi:</span>
                  <span className="font-bold text-slate-900 block">{selectedRecord.installation} ({selectedRecord.city})</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-cyan-50 border border-cyan-200">
                <div>
                  <span className="text-xs text-cyan-800 font-bold block">Total Tagihan Pembayaran:</span>
                  <span className="text-2xl font-black text-slate-900 block">Rp {selectedRecord.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <a
                  href={`https://wa.me/${selectedRecord.cleanPhone}?text=Halo%20${encodeURIComponent(selectedRecord.fullName)},%20kami%20dari%20panitia%20Webinar%20HUT%20101%20RSUP%20Dr.%20Kariadi...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Hubungi WA ({selectedRecord.phone})</span>
                </a>
              </div>

              {/* BERKAS BUKTI TRANSFER PREVIEW & ACTIONS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-700" />
                    <span>Berkas Bukti Transfer Pembayaran</span>
                  </h4>
                  <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {selectedRecord.paymentProofName || 'bukti_transfer.jpg'}
                  </span>
                </div>

                {/* REAL IMAGE PREVIEW (SUPPORT HTTP, HTTPS, B2 URL, DATA URL, AND LOCAL UPLODS) */}
                {selectedRecord.paymentProofUrl && (
                  selectedRecord.paymentProofUrl.startsWith('data:image/') ||
                  selectedRecord.paymentProofUrl.startsWith('http://') ||
                  selectedRecord.paymentProofUrl.startsWith('https://') ||
                  selectedRecord.paymentProofUrl.startsWith('/uploads/')
                ) && !selectedRecord.paymentProofUrl.includes('.pdf') ? (
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                    <div className="relative group overflow-hidden rounded-xl border border-slate-700 bg-black max-h-72 flex items-center justify-center">
                      <img
                        src={selectedRecord.paymentProofUrl}
                        alt="Bukti Transfer Pembayaran"
                        className="max-h-72 w-auto object-contain cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => setPreviewImageSrc(selectedRecord.paymentProofUrl || null)}
                        onError={(e) => {
                          // Fallback if image fails to load
                          console.warn('Image load fallback');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                        <span className="bg-white/90 text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                          <Eye className="w-4 h-4" /> Klik Untuk Perbesar
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewImageSrc(selectedRecord.paymentProofUrl || null)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Perbesar Layar Penuh</span>
                      </button>

                      <a
                        href={selectedRecord.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={selectedRecord.paymentProofName || `bukti_transfer_${selectedRecord.id}.png`}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Buka / Unduh Berkas Foto</span>
                      </a>
                    </div>
                  </div>
                ) : selectedRecord.paymentProofUrl && (
                  selectedRecord.paymentProofUrl.startsWith('data:application/pdf') ||
                  selectedRecord.paymentProofUrl.includes('.pdf')
                ) ? (
                  /* REAL PDF PREVIEW */
                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 font-extrabold flex items-center justify-center mx-auto shadow-sm text-sm">
                      PDF
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{selectedRecord.paymentProofName || 'Dokumen Bukti Transfer.pdf'}</span>
                      <span className="text-xs text-slate-500 block">Dokumen PDF Bukti Transfer</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <a
                        href={selectedRecord.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Buka PDF di Tab Baru</span>
                      </a>

                      <a
                        href={selectedRecord.paymentProofUrl}
                        download={selectedRecord.paymentProofName || `bukti_transfer_${selectedRecord.id}.pdf`}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Berkas PDF</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* MOCK / FALLBACK RECEIPT CARD */
                  <div className="bg-gradient-to-br from-slate-900 to-cyan-950 text-white p-5 rounded-2xl border border-cyan-800/40 shadow-lg space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-cyan-800/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-300">Resi Bukti Transfer Terverifikasi</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded">
                        BANK MANDIRI
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-cyan-200/70 block">Rekening Tujuan:</span>
                        <span className="font-bold text-white block">136-00-3276632-4</span>
                        <span className="text-[10px] text-cyan-300 block">a.n DPK PPNI RSUP DR KARIADI</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cyan-200/70 block">Total Nominal:</span>
                        <span className="font-extrabold text-emerald-400 text-sm block">Rp {selectedRecord.totalAmount.toLocaleString('id-ID')}</span>
                        <span className="text-[10px] text-slate-300 block">{selectedRecord.categoryName}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-cyan-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-slate-300 font-semibold">
                        Nama Berkas: <code className="text-cyan-300 bg-black/30 px-1.5 py-0.5 rounded">{selectedRecord.paymentProofName || 'bukti_transfer.jpg'}</code>
                      </span>

                      <a
                        href={`data:text/plain;charset=utf-8,--- BUKTI TRANSFER WEBINAR HUT 101 RS KARIADI ---\nID Registrasi: ${selectedRecord.id}\nNama Peserta: ${selectedRecord.fullName}\nEmail LMS: ${selectedRecord.email}\nNIK KTP: ${selectedRecord.nikKtp}\nNominal: Rp ${selectedRecord.totalAmount}\nKategori: ${selectedRecord.categoryName}\nTanggal: ${selectedRecord.createdAt}\nNama File: ${selectedRecord.paymentProofName}`}
                        download={`bukti_transfer_${selectedRecord.id}.txt`}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Bukti Transfer</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Manajemen Status Verifikasi & Diklat:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* 1. Set Sudah Membayar */}
                  <button
                    type="button"
                    onClick={() => handleUpdateStatusExplicit(selectedRecord.id, 'valid')}
                    className={`py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedRecord.status === 'valid'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sudah Membayar</span>
                  </button>

                  {/* 2. Approve Diklat (Only enabled when status is valid or approved_diklat) */}
                  <button
                    type="button"
                    disabled={selectedRecord.status === 'pending'}
                    onClick={() => {
                      if (selectedRecord.status === 'pending') {
                        alert('⚠️ Tidak dapat Approve Diklat! Mohon set "Sudah Membayar" terlebih dahulu.');
                        return;
                      }
                      handleUpdateStatusExplicit(selectedRecord.id, 'approved_diklat');
                    }}
                    title={selectedRecord.status === 'pending' ? 'Harus di-set Sudah Membayar terlebih dahulu' : 'Approve Diklat'}
                    className={`py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      selectedRecord.status === 'approved_diklat'
                        ? 'bg-indigo-700 text-white shadow-md'
                        : selectedRecord.status === 'pending'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Approve Diklat</span>
                  </button>

                  {/* 3. Set Pending */}
                  <button
                    type="button"
                    onClick={() => handleUpdateStatusExplicit(selectedRecord.id, 'pending')}
                    className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedRecord.status === 'pending'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Set Menunggu</span>
                  </button>

                  {/* 4. Tolak */}
                  <button
                    type="button"
                    onClick={() => handleUpdateStatusExplicit(selectedRecord.id, 'rejected')}
                    className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedRecord.status === 'rejected'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-red-50 text-red-800 border border-red-300 hover:bg-red-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak Bukti</span>
                  </button>
                </div>

                {selectedRecord.status === 'pending' && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 font-bold flex items-start gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>⚠️ ATURAN ALUR: Tombol <strong>"Approve Diklat"</strong> terkunci. Klik tombol <strong>"Sudah Membayar"</strong> terlebih dahulu untuk membuka akses Approve Diklat.</span>
                  </div>
                )}
              </div>

              {/* PER-SERIES DIKLAT APPROVAL SECTION */}
              <div className="space-y-3 pt-3 border-t border-slate-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    🎓 Approve Diklat Per Seri Webinar Terpilih ({selectedRecord.series.length} Seri):
                  </span>
                  {selectedRecord.status !== 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApproveAllSeriesDiklat(selectedRecord)}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                    >
                      Approve Semua ({selectedRecord.series.length} Seri)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedRecord.series.map((sTitle) => {
                    const approvedList = selectedRecord.approvedSeries || (selectedRecord.status === 'approved_diklat' ? selectedRecord.series : []);
                    const isSeriesApproved = approvedList.includes(sTitle);
                    const isPending = selectedRecord.status === 'pending';

                    return (
                      <button
                        key={sTitle}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggleSeriesDiklat(selectedRecord, sTitle)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isPending
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : isSeriesApproved
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-sm ring-1 ring-indigo-200 cursor-pointer'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-black">
                            {isSeriesApproved ? '✅' : '⏳'}
                          </span>
                          <div>
                            <span className="text-xs font-black block">Webinar {sTitle}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {isSeriesApproved ? 'Disetujui Diklat' : 'Belum Approved'}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold shadow-sm ${
                          isSeriesApproved
                            ? 'bg-indigo-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isSeriesApproved ? 'APPROVED 🎓' : 'APPROVE'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAW PAYLOAD JSON MODAL FOR LOGS */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp my-auto max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Detail Raw Payload JSON Submisi</span>
                <h3 className="text-base sm:text-lg font-extrabold pr-4">{selectedLog.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl overflow-x-auto text-[11px] leading-relaxed shadow-inner">
                <pre>{JSON.stringify(JSON.parse(selectedLog.payloadJson || '{}'), null, 2)}</pre>
              </div>

              {selectedLog.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 font-sans text-xs">
                  <span className="font-bold block text-red-900">Pesan Diagnosis Server:</span>
                  <p>{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {!selectedLog.isResolved ? (
                <button
                  onClick={() => {
                    handleRetrySubmit(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Kirim Ulang ke Database Sekarang</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700">✅ Payload telah berhasil dipulihkan</span>
              )}

              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (WITH MANDATORY CONFIRMATION WORD "hapus") */}
      {deleteTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-200 text-center space-y-5 animate-scaleUp my-auto max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                Konfirmasi Hapus Pendaftar Permanen
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Anda akan menghapus data pendaftar <span className="font-extrabold text-slate-900">{deleteTargetRecord.fullName}</span> ({deleteTargetRecord.id}).
              </p>
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-2xl text-xs text-left space-y-1 font-medium">
                <p className="font-bold text-red-900">⚠️ Peringatan Keamanan:</p>
                <p>Penghapusan ini akan menghapus peserta dari daftar aktif, namun <b>riwayat penghapusan tetap dicatat secara permanen dalam System Audit Logs</b>.</p>
              </div>
            </div>

            <form onSubmit={handleExecuteDelete} className="space-y-4 text-left">
              {deleteErrorMsg && (
                <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deleteErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ketik kata <code className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-black">hapus</code> di bawah ini untuk mengonfirmasi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik kata 'hapus'..."
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    setDeleteErrorMsg('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm font-bold text-slate-900 text-center font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetRecord(null);
                    setDeleteConfirmText('');
                    setDeleteErrorMsg('');
                  }}
                  className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmText.trim().toLowerCase() !== 'hapus'}
                  className={`w-full py-3 px-4 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    deleteConfirmText.trim().toLowerCase() === 'hapus'
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                      : 'bg-slate-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Permanen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY ADMIN EDIT CONFIRMATION WARNING MODAL */}
      {showAdminEditConfirmModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 space-y-5 animate-scaleUp text-left">
            {/* Header Warning */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">PERINGATAN KONFIRMASI PERUBAHAN</span>
                <h3 className="text-lg font-black text-slate-900 leading-snug">Konfirmasi Update Data & Bukti Transfer</h3>
              </div>
            </div>

            {/* Detail Ringkasan Edit */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5 text-xs text-slate-800 font-medium">
              <p className="font-bold text-amber-900">
                Mohon pastikan data yang Anda edit berikut sudah <u>BENAR & SESUAI</u> dengan bukti transfer asli peserta:
              </p>

              <div className="space-y-1.5 pt-2 border-t border-amber-200/60 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID & Nama:</span>
                  <span className="font-bold text-slate-900">{selectedRecord.id} ({selectedRecord.fullName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seri Terbaru ({editSeries.length} Webinar):</span>
                  <span className="font-bold text-cyan-800">{editSeries.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Nominal Baru:</span>
                  <span className="font-black text-emerald-700 text-sm">Rp {editTotalAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bukti Transfer:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{editProofFileName || selectedRecord.paymentProofName}</span>
                </div>
              </div>
            </div>

            {/* Mandatory Checkbox Confirmation */}
            <label className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={isAdminEditChecked}
                onChange={(e) => setIsAdminEditChecked(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500 mt-0.5"
              />
              <span className="text-xs text-slate-800 font-bold leading-snug">
                Saya mengonfirmasi bahwa data seri webinar, nominal, dan bukti transfer ini sudah <span className="text-emerald-700 underline">BENAR & SESUAI</span> untuk diperbarui di database Supabase.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAdminEditConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal / Periksa Lagi
              </button>

              <button
                type="button"
                disabled={!isAdminEditChecked}
                onClick={handleExecuteAdminEditSave}
                className={`px-5 py-2.5 rounded-xl font-black text-xs text-white shadow-md flex items-center gap-1.5 transition-all ${
                  isAdminEditChecked
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-emerald-500/20'
                    : 'bg-slate-300 border border-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya, Data Sudah Benar & Update Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAINTENANCE & STATUS CONFIGURATION MODAL */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Wrench className="w-5 h-5" />
                <span>Pengaturan Status & Mode Maintenance</span>
              </div>
              <button
                onClick={() => setShowMaintModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintForm} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Pendaftaran Saat Ini
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMaintConfig(prev => ({ ...prev, isClosed: false }))}
                    className={`py-3 px-4 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      !maintConfig.isClosed
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                    <span>🟢 DIBUKA (AKTIF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaintConfig(prev => ({ ...prev, isClosed: true }))}
                    className={`py-3 px-4 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      maintConfig.isClosed
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/30'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-200" />
                    <span>⚠️ DITUTUP SEMENTARA</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Waktu Akses Kembali (Buka Pukul)
                </label>
                <input
                  type="text"
                  value={maintConfig.reopenTime}
                  onChange={e => setMaintConfig(prev => ({ ...prev, reopenTime: e.target.value }))}
                  placeholder="Contoh: Hari Ini, Pukul 18.00 WIB"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Pengumuman Modal
                </label>
                <input
                  type="text"
                  value={maintConfig.title}
                  onChange={e => setMaintConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Judul Pengumuman"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pesan Detail Pengumuman
                </label>
                <textarea
                  rows={3}
                  value={maintConfig.message}
                  onChange={e => setMaintConfig(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Isi pesan pengumuman untuk pengunjung..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="w-1/2 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX VIEWER */}
      {previewImageSrc && (
        <div
          onClick={() => setPreviewImageSrc(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <button
            onClick={() => setPreviewImageSrc(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImageSrc}
            alt="Perbesar Bukti Transfer"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-scaleUp"
          />
        </div>
      )}

    </div>
  );
};
