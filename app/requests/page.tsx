"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/types/apiClient'
import { Eye, X, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Client {
  id: string;
  name: string;
}

interface ClientRequest {
  id?: string;
  client_id: string;
  client?: Client;
  type: string;
  status: string;
  submission_date: string;
  expected_date: string | null;
  verification_date: string | null;
  has_facebook_account: boolean;
  has_business_manager: boolean;
  duns_status: string;
  verification_status: string;
  notes: string;
}

const emptyForm: ClientRequest = {
  client_id: "",
  type: "",
  status: "",
  submission_date: "",
  expected_date: "",
  verification_date: "",
  has_facebook_account: false,
  has_business_manager: false,
  duns_status: "",
  verification_status: "",
  notes: "",
};

// عدّل هذه القيم حسب أنواع الطلبات الفعلية عندك
const typeOptions = [
  { value: "facebook_verification", label: "توثيق فيسبوك" },
  { value: "business_manager_verification", label: "توثيق Business Manager" },
  { value: "duns_verification", label: "توثيق DUNS" },
];

const statusOptions: Record<string, { label: string; style: string }> = {
  pending: { label: "قيد الانتظار", style: "bg-[#FFFAEB] text-[#F79009]" },
  in_progress: { label: "قيد المعالجة", style: "bg-[#EFF8FF] text-[#1F5EFF]" },
  completed: { label: "مكتمل", style: "bg-[#ECFDF3] text-[#12B76A]" },
  rejected: { label: "مرفوض", style: "bg-[#FEF3F2] text-[#F04438]" },
};

export default function ClientRequestsPage() {

  const router = useRouter();

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = وضع الإضافة, وإلا وضع التعديل

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setIsOpen(true);
  };

  const openEditModal = (request: ClientRequest) => {
    setEditingId(request.id ?? null);
    setForm({
      client_id: request.client_id,
      type: request.type,
      status: request.status,
      submission_date: request.submission_date,
      expected_date: request.expected_date ?? "",
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

  // form state
  const [form, setForm] = useState<ClientRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // requests list
  const [requestsList, setRequestsList] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // clients list (لتعبئة select العميل)
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const fetchRequests = () => {
    setLoading(true);
    apiClient.get('request')
      .then((res) => {
        setRequestsList(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل الطلبات");
      })
      .finally(() => setLoading(false));
  };

  const fetchClients = () => {
    setLoadingClients(true);
    apiClient.get('client')
      .then((res) => {
        setClients(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoadingClients(false));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.client_id || !form.type || !form.status || !form.submission_date) {
      setError("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    setError(null);

    const request = editingId
      ? apiClient.put(`request/${editingId}`, form)
      : apiClient.post('request', form);

    request
      .then(() => {
        fetchRequests();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        const message = err?.response?.data?.message || "تعذر حفظ الطلب، تأكد من صحة البيانات";
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    fetchRequests();
    fetchClients();
  }, []);

  const getClientName = (request: ClientRequest) => {
    return request.client?.name ?? "—";
  };

  const getTypeLabel = (type: string) => {
    return typeOptions.find((t) => t.value === type)?.label ?? type;
  };

  const pendingCount = requestsList.filter((r) => r.status === "pending").length;
  const inProgressCount = requestsList.filter((r) => r.status === "in_progress").length;
  const completedCount = requestsList.filter((r) => r.status === "completed").length;
  const rejectedCount = requestsList.filter((r) => r.status === "rejected").length;

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-6xl">

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-2xl font-bold text-[#101828] tracking-tight">طلبات العملاء</p>
            <p className="text-sm text-[#667085] mt-1">إدارة طلبات التوثيق والتحقق للعملاء</p>
          </div>
          <div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1F5EFF] hover:bg-[#1848D6] active:bg-[#123499] transition-colors px-5 py-2.5 rounded-xl shadow-sm shadow-blue-900/10"
            >
              <span className="text-lg leading-none">+</span> طلب جديد
            </button>
          </div>
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
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">العميل</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">نوع الطلب</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">الحالة</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">تاريخ التقديم</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">التاريخ المتوقع</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">تاريخ التحقق</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-[#667085]">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : requestsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-[#667085]">
                      لا يوجد طلبات بعد
                    </td>
                  </tr>
                ) : (
                  requestsList.map((request, index) => (
                    <tr
                      key={request.id ?? index}
                      className="border-b border-[#EAECF0] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-[#101828]">
                        {getClientName(request)}
                      </td>
                      <td className="px-5 py-3.5 text-[#475467]">{getTypeLabel(request.type)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            statusOptions[request.status]?.style ?? "bg-[#F2F4F7] text-[#667085]"
                          }`}
                        >
                          {statusOptions[request.status]?.label ?? request.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#475467]">{request.submission_date}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{request.expected_date ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{request.verification_date ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#475467]">
                        <div className="flex items-center gap-3">
                          <button
                            className="cursor-pointer hover:text-[#101828]"
                            onClick={() => router.push(`/requests/${request.id}`)}
                            title="عرض"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="cursor-pointer hover:text-[#1F5EFF]"
                            onClick={() => openEditModal(request)}
                            title="تعديل"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-[#101828]/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] my-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[#101828]">
                  {editingId ? "تعديل الطلب" : "إضافة طلب"}
                </h2>
                <button type="button" onClick={closeModal} className="text-[#667085] hover:text-[#101828]">
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="mb-3.5 text-sm text-[#F04438] bg-[#FEF3F2] border border-[#FDA29B] rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

              <div className="space-y-3.5">
                {/* اختيار العميل */}
                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                  required
                  className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                >
                  <option value="" disabled>
                    {loadingClients ? "جاري تحميل العملاء..." : "اختر العميل"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>

                {/* نوع الطلب */}
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                >
                  <option value="" disabled>اختر نوع الطلب</option>
                  {typeOptions.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* الحالة */}
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                >
                  <option value="" disabled>اختر الحالة</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="completed">مكتمل</option>
                  <option value="rejected">مرفوض</option>
                </select>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#667085] mb-1">تاريخ التقديم</label>
                    <input
                      type="date" name="submission_date"
                      value={form.submission_date} onChange={handleChange} required
                      className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#667085] mb-1">التاريخ المتوقع</label>
                    <input
                      type="date" name="expected_date"
                      value={form.expected_date ?? ""} onChange={handleChange}
                      className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#667085] mb-1">تاريخ التحقق</label>
                    <input
                      type="date" name="verification_date"
                      value={form.verification_date ?? ""} onChange={handleChange}
                      className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                    />
                  </div>
                </div>

                <div className="flex gap-6 py-1">
                  <label className="flex items-center gap-2 text-sm text-[#344054] cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_facebook_account"
                      checked={form.has_facebook_account}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[#D0D5DD] accent-[#1F5EFF]"
                    />
                    يملك حساب فيسبوك
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#344054] cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_business_manager"
                      checked={form.has_business_manager}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[#D0D5DD] accent-[#1F5EFF]"
                    />
                    يملك Business Manager
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text" name="duns_status"
                    value={form.duns_status} onChange={handleChange}
                    placeholder="حالة DUNS"
                    className="w-full text-sm text-[#344054] placeholder:text-[#98A2B3] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                  />
                  <input
                    type="text" name="verification_status"
                    value={form.verification_status} onChange={handleChange}
                    placeholder="حالة التحقق"
                    className="w-full text-sm text-[#344054] placeholder:text-[#98A2B3] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                  />
                </div>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="ملاحظات"
                  rows={3}
                  className="w-full text-sm text-[#344054] placeholder:text-[#98A2B3] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-6">
                <button
                  className="bg-[#1F5EFF] hover:bg-[#1848D6] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "جاري الحفظ..." : (editingId ? "تحديث" : "حفظ")}
                </button>
                <button
                  onClick={closeModal}
                  className="bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  type="button"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}