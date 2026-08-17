"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/types/apiClient'
import { Eye, X, Pencil, Check, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Client {
  id: string;
  name: string;
  company_name: string;
  email: string;
}

interface ClientRequest {
  id?: string;
  client_id: string;
  client?: Client;
  status: string;
  submission_date: string;
  expected_date: string | null;
  issued_date: string | null;
  duns_number: string;
  verification_date: string | null;
  has_facebook_account: boolean;
  has_business_manager: boolean;
  duns_status: string;
  verification_status: string;
  notes: string;
}

const emptyForm: ClientRequest = {
  client_id: "",
  status: "",
  submission_date: "",
  expected_date: "",
  issued_date: "",
  duns_number: "",
  verification_date: "",
  has_facebook_account: false,
  has_business_manager: false,
  duns_status: "",
  verification_status: "",
  notes: "",
};

const statusOptions: Record<string, { label: string; style: string }> = {
  pending: { label: "قيد الانتظار", style: "bg-[#FFFAEB] text-[#F79009]" },
  in_progress: { label: "قيد المعالجة", style: "bg-[#EFF8FF] text-[#1F5EFF]" },
  completed: { label: "مكتمل", style: "bg-[#ECFDF3] text-[#12B76A]" },
  rejected: { label: "مرفوض", style: "bg-[#FEF3F2] text-[#F04438]" },
};

const StatusBadge = ({ ok, trueLabel, falseLabel }: { ok: boolean; trueLabel: string; falseLabel: string }) => (
  <span
    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
      ok ? "bg-[#ECFDF3] text-[#12B76A]" : "bg-[#FEF3F2] text-[#F04438]"
    }`}
  >
    {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    {ok ? trueLabel : falseLabel}
  </span>
);

export default function ClientRequestsPage() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setIsOpen(true);
  };

  const openEditModal = (request: ClientRequest) => {
    setEditingId(request.id ?? null);
    setForm({
      client_id: request.client_id ?? "",
      status: request.status ?? "",
      submission_date: request.submission_date ?? "",
      expected_date: request.expected_date ?? "",
      issued_date: request.issued_date ?? "",
      duns_number: request.duns_number ?? "",
      verification_date: request.verification_date ?? "",
      has_facebook_account: request.has_facebook_account,
      has_business_manager: request.has_business_manager,
      duns_status: request.duns_status ?? "",
      verification_status: request.verification_status ?? "",
      notes: request.notes ?? "",
    });
    setError(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const [form, setForm] = useState<ClientRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [requestsList, setRequestsList] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleField = (name: "has_facebook_account" | "has_business_manager") => {
    setForm({ ...form, [name]: !form[name] });
  };

  const isDunsComplete = Boolean(
    form.submission_date && form.expected_date && form.issued_date && form.duns_number
  );
  const isVerificationComplete = Boolean(
    form.has_facebook_account && form.has_business_manager && form.verification_date
  );

  const fetchRequests = () => {
    setLoading(true);
    apiClient.get('request')
      .then((res) => setRequestsList(res.data.data))
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل الطلبات");
      })
      .finally(() => setLoading(false));
  };

  const fetchClients = () => {
    setLoadingClients(true);
    apiClient.get('client')
      .then((res) => setClients(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingClients(false));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    const payload = {
      ...form,
      duns_status: isDunsComplete ? "مكتمل" : "قيد الانتظار",
      verification_status: isVerificationComplete ? "مكتمل" : "قيد الانتظار",
    };

    const request = editingId
      ? apiClient.put(`request/${editingId}`, payload)
      : apiClient.post('request', payload);

    request
      .then(() => {
        fetchRequests();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || "تعذر حفظ الطلب، تأكد من صحة البيانات");
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    fetchRequests();
    fetchClients();
  }, []);

  const pendingCount = requestsList.filter((r) => r.status === "pending").length;
  const inProgressCount = requestsList.filter((r) => r.status === "in_progress").length;
  const completedCount = requestsList.filter((r) => r.status === "completed").length;
  const rejectedCount = requestsList.filter((r) => r.status === "rejected").length;

  const SectionStatusBadge = ({ complete }: { complete: boolean }) => (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
        complete ? "bg-[#ECFDF3] text-[#12B76A]" : "bg-[#F2F4F7] text-[#667085]"
      }`}
    >
      {complete && <Check size={12} />}
      {complete ? "مكتمل" : "غير مكتمل"}
    </span>
  );

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-6xl">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-2xl font-bold text-[#101828] tracking-tight">طلبات العملاء</p>
            <p className="text-sm text-[#667085] mt-1">إدارة طلبات التوثيق والتحقق للعملاء</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1F5EFF] hover:bg-[#1848D6] active:bg-[#123499] transition-colors px-5 py-2.5 rounded-xl shadow-sm shadow-blue-900/10"
          >
            <span className="text-lg leading-none">+</span> طلب جديد
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">قيد الانتظار</p>
            <p className="text-2xl font-bold text-[#F79009] mt-2">{pendingCount}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">قيد المعالجة</p>
            <p className="text-2xl font-bold text-[#1F5EFF] mt-2">{inProgressCount}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">مكتملة</p>
            <p className="text-2xl font-bold text-[#12B76A] mt-2">{completedCount}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">مرفوضة</p>
            <p className="text-2xl font-bold text-[#F04438] mt-2">{rejectedCount}</p>
          </div>
        </div>

        {error && !isOpen && (
          <div className="mt-4 text-sm text-[#F04438] bg-[#FEF3F2] border border-[#FDA29B] rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#EAECF0] rounded-2xl mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اسم الشركة</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">البريد الإلكتروني</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">D-U-N-S STATUS</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">FACEBOOK STATUS</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">تاريخ التحقق</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-6 text-[#667085]">جاري التحميل...</td></tr>
                ) : requestsList.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-[#667085]">لا يوجد طلبات بعد</td></tr>
                ) : (
                  requestsList.map((request, index) => {
                    const isDunsOk = request.duns_status === "مكتمل";
                    const isFacebookOk = request.has_facebook_account;
                    const isVerified = Boolean(request.verification_date);

                    return (
                      <tr key={request.id ?? index} className="border-b border-[#EAECF0] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#101828]">
                          {request.client?.company_name || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-[#475467]">
                          {request.client?.email || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge ok={isDunsOk} trueLabel="مكتمل" falseLabel="قيد الانتظار" />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge ok={isFacebookOk} trueLabel="متوفر" falseLabel="غير متوفر" />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge ok={isVerified} trueLabel="محقق" falseLabel="غير محقق" />
                            {request.verification_date && (
                              <span className="text-xs text-[#667085]">{request.verification_date}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#475467]">
                          <div className="flex items-center gap-3">
                            <button className="cursor-pointer hover:text-[#101828]" onClick={() => router.push(`/requests/${request.id}`)} title="عرض"><Eye size={18} /></button>
                            <button className="cursor-pointer hover:text-[#1F5EFF]" onClick={() => openEditModal(request)} title="تعديل"><Pencil size={16} /></button>
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
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-[#101828]/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={closeModal}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px] my-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[#101828]">{editingId ? "تعديل الطلب" : "إضافة طلب"}</h2>
                <button type="button" onClick={closeModal} className="text-[#667085] hover:text-[#101828]"><X size={18} /></button>
              </div>

              {error && (
                <div className="mb-3.5 text-sm text-[#F04438] bg-[#FEF3F2] border border-[#FDA29B] rounded-lg px-4 py-2">{error}</div>
              )}

              <div className="space-y-4">
                {/* الشركة */}
                <select name="client_id" value={form.client_id} onChange={handleChange}
                  className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]">
                  <option value="">
                    {loadingClients ? "جاري تحميل الشركات..." : "اختر الشركة (اختياري)"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name} {client.name ? `(${client.name})` : ""}
                    </option>
                  ))}
                </select>

                {/* الحالة العامة */}
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]">
                  <option value="">الحالة العامة (اختياري)</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="completed">مكتمل</option>
                  <option value="rejected">مرفوض</option>
                </select>

                {/* ===== القسم الأول: DUNS ===== */}
                <div className="border border-[#EAECF0] rounded-xl p-4 bg-[#F9FAFB]">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold text-[#101828]">بيانات DUNS</p>
                    <SectionStatusBadge complete={isDunsComplete} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-[#667085] mb-1">تاريخ الطلب</label>
                      <input type="date" name="submission_date" value={form.submission_date} onChange={handleChange}
                        className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#667085] mb-1">تاريخ الخروج المتوقع</label>
                      <input type="date" name="expected_date" value={form.expected_date ?? ""} onChange={handleChange}
                        className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#667085] mb-1">تاريخ الإصدار</label>
                      <input type="date" name="issued_date" value={form.issued_date ?? ""} onChange={handleChange}
                        className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#667085] mb-1">رقم DUNS</label>
                      <input type="text" name="duns_number" value={form.duns_number} onChange={handleChange} placeholder="مثال: 123456789"
                        className="w-full text-sm text-[#344054] placeholder:text-[#98A2B3] border border-[#D0D5DD] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]" />
                    </div>
                  </div>
                </div>

                {/* ===== القسم الثاني: التحقق ===== */}
                <div className="border border-[#EAECF0] rounded-xl p-4 bg-[#F9FAFB]">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold text-[#101828]">بيانات التحقق</p>
                    <SectionStatusBadge complete={isVerificationComplete} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => toggleField("has_facebook_account")}
                      className={`flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-3 py-2.5 border transition-colors ${
                        form.has_facebook_account
                          ? "bg-[#1F5EFF] border-[#1F5EFF] text-white"
                          : "bg-white border-[#D0D5DD] text-[#344054] hover:border-[#1F5EFF]"
                      }`}
                    >
                      {form.has_facebook_account && <Check size={14} />}
                      وجود حساب فيسبوك
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleField("has_business_manager")}
                      className={`flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-3 py-2.5 border transition-colors ${
                        form.has_business_manager
                          ? "bg-[#1F5EFF] border-[#1F5EFF] text-white"
                          : "bg-white border-[#D0D5DD] text-[#344054] hover:border-[#1F5EFF]"
                      }`}
                    >
                      {form.has_business_manager && <Check size={14} />}
                      وجود مدير أعمال
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#667085] mb-1">تاريخ التحقق</label>
                    <input type="date" name="verification_date" value={form.verification_date ?? ""} onChange={handleChange}
                      className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]" />
                  </div>
                </div>

                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="ملاحظات" rows={3}
                  className="w-full text-sm text-[#344054] placeholder:text-[#98A2B3] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF] resize-none" />
              </div>

              <div className="flex justify-end gap-2.5 mt-6">
                <button className="bg-[#1F5EFF] hover:bg-[#1848D6] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={submitting}>
                  {submitting ? "جاري الحفظ..." : (editingId ? "تحديث" : "حفظ")}
                </button>
                <button onClick={closeModal} className="bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors" type="button">إلغاء</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}