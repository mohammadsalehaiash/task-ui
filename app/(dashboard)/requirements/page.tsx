"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/types/apiClient'
import { Eye, X, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Client {
  id?: string;
  company_name: string;
}

interface Requirement {
  id?: string;
  client_id: string;
  sector_type: "profit" | "non_profit" | "";
  commercial_register: string;
  commercial_register_data: string;
  association_license: string;
  board_formation_declaration: string;
  national_address: string;
  website: string;
  domain_email: string;
  named_phone: string;
  drive_link: string;
  checklist?: Record<string, boolean>;
  client?: Client;
}

const emptyForm: Requirement = {
  client_id: "",
  sector_type: "",
  commercial_register: "",
  commercial_register_data: "",
  association_license: "",
  board_formation_declaration: "",
  national_address: "",
  website: "",
  domain_email: "",
  named_phone: "",
  drive_link: "",
};

export default function Page() {

  const router = useRouter();

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setRequirementForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  // form state
  const [requirementForm, setRequirementForm] = useState<Requirement>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // list state
  const [requirementsList, setRequirementsList] = useState<Requirement[]>([]);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setRequirementForm({
      ...requirementForm,
      [e.target.name]: e.target.value,
    });
  };

  const fetchRequirements = () => {
    setLoading(true);
    apiClient.get('requirements')
      .then((res) => {
        setRequirementsList(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل المتطلبات");
      })
      .finally(() => setLoading(false));
  };

  const fetchClients = () => {
    apiClient.get('client')
      .then((res) => {
        setClientsList(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!requirementForm.client_id || !requirementForm.sector_type) {
      setError("الرجاء اختيار العميل ونوع القطاع");
      return;
    }

    setSubmitting(true);
    setError(null);

    const request = editingId
      ? apiClient.put(`requirements/${editingId}`, requirementForm)
      : apiClient.post('requirements', requirementForm);

    request
      .then(() => {
        fetchRequirements();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        const message = err?.response?.data?.message || "تعذر حفظ المتطلب، تأكد من صحة البيانات";
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleEdit = (requirement: Requirement) => {
    setRequirementForm({
      ...emptyForm,
      ...requirement,
      client_id: requirement.client?.id ?? requirement.client_id,
    });
    setEditingId(requirement.id ?? null);
    setIsOpen(true);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    if (!confirm("هل أنت متأكد من حذف هذا المتطلب؟")) return;

    apiClient.delete(`requirements/${id}`)
      .then(() => {
        fetchRequirements();
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر حذف المتطلب");
      });
  };

  const getProgress = (checklist?: Record<string, boolean>) => {
    if (!checklist || Object.keys(checklist).length === 0) return 0;
    const done = Object.values(checklist).filter(Boolean).length;
    return Math.round((done / Object.keys(checklist).length) * 100);
  };

  useEffect(() => {
    fetchRequirements();
    fetchClients();
  }, []);

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-6xl">

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-2xl font-bold text-[#101828] tracking-tight">المتطلبات</p>
            <p className="text-sm text-[#667085] mt-1">متطلبات العملاء حسب نوع القطاع</p>
          </div>
          <div>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1F5EFF] hover:bg-[#1848D6] active:bg-[#123499] transition-colors px-5 py-2.5 rounded-xl shadow-sm shadow-blue-900/10"
            >
              <span className="text-lg leading-none">+</span>
              اضافة متطلب
            </button>
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
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">نوع القطاع</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">نسبة الإنجاز</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اجراءات</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center text-[#98A2B3] px-5 py-10">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : requirementsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-[#98A2B3] px-5 py-10">
                      لا توجد متطلبات بعد
                    </td>
                  </tr>
                ) : (
                  requirementsList.map((requirement, index) => (
                    <tr
                      key={requirement.id ?? index}
                      className="border-b border-[#EAECF0] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-[#101828]">{requirement.client?.company_name}</td>
                      <td className="px-5 py-3.5 text-[#475467]">
                        {requirement.sector_type === "profit" ? "ربحي" : "غير ربحي"}
                      </td>
                      <td className="px-5 py-3.5 text-[#475467]">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[#EAECF0] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#12B76A]"
                              style={{ width: `${getProgress(requirement.checklist)}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#667085]">{getProgress(requirement.checklist)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#475467]">
                        <div className="flex items-center gap-3">
                          <button className="cursor-pointer" onClick={() => router.push(`/requirements/${requirement.id}`)}>
                            <Eye size={18} />
                          </button>
                          <button className="cursor-pointer text-[#1F5EFF]" onClick={() => handleEdit(requirement)}>
                            <Pencil size={18} />
                          </button>
                          <button className="cursor-pointer text-[#F04438]" onClick={() => handleDelete(requirement.id)}>
                            <Trash2 size={18} />
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

      {/* ------------------------ Modal ---------------------------  */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#101828]/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] my-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[#101828]">
                  {editingId ? "تعديل متطلب" : "إضافة متطلب"}
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
                <select
                  name="client_id"
                  value={requirementForm.client_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                >
                  <option value="">اختر العميل</option>
                  {clientsList.map((client) => (
                    <option key={client.id} value={client.id}>{client.company_name}</option>
                  ))}
                </select>

                <select
                  name="sector_type"
                  value={requirementForm.sector_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                >
                  <option value="">اختر نوع القطاع</option>
                  <option value="profit">ربحي</option>
                  <option value="non_profit">غير ربحي</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 mt-6">
                <button
                  className="bg-[#1F5EFF] hover:bg-[#1848D6] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "جاري الحفظ..." : "حفظ"}
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