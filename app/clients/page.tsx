"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/types/apiClient'
import { Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Client {
  id?: string;
  name: string;
  company_name: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyForm: Client = {
  name: "",
  company_name: "",
  phone: "",
  email: "",
  notes: "",
};

export default function Page() {

  const router = useRouter();

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setClientForm(emptyForm);
    setError(null);
  };

  // form state
  const [clientForm, setClientForm] = useState<Client>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // list state
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setClientForm({
      ...clientForm,
      [e.target.name]: e.target.value,
    });
  };

  const fetchClients = () => {
    setLoading(true);
    apiClient.get('client')
      .then((res) => {
        setClientsList(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل العملاء");
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!clientForm.name || !clientForm.phone) {
      setError("الرجاء تعبئة الحقول المطلوبة على الأقل (الاسم والهاتف)");
      return;
    }

    setSubmitting(true);
    setError(null);

    apiClient.post('client', clientForm)
      .then(() => {
        fetchClients();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        const message = err?.response?.data?.message || "تعذر حفظ العميل، تأكد من صحة البيانات";
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-6xl">

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-2xl font-bold text-[#101828] tracking-tight">العملاء</p>
            <p className="text-sm text-[#667085] mt-1">إدارة بيانات العملاء والاشتراكات</p>
          </div>
          <div>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1F5EFF] hover:bg-[#1848D6] active:bg-[#123499] transition-colors px-5 py-2.5 rounded-xl shadow-sm shadow-blue-900/10"
            >
              <span className="text-lg leading-none">+</span>
              اضافة عميل
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">اجمالي العملاء</p>
            <p className="text-2xl font-bold text-[#101828] mt-2">{clientsList.length}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">اشتراكات فعالة</p>
            <p className="text-2xl font-bold text-[#12B76A] mt-2">—</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">اشتراكات منتهية</p>
            <p className="text-2xl font-bold text-[#F04438] mt-2">—</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">قيد الاجراء</p>
            <p className="text-2xl font-bold text-[#F79009] mt-2">—</p>
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
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">الاسم</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اسم الشركة</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">الهاتف</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">البريد الإلكتروني</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">الملاحظات</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اجراءات</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center text-[#98A2B3] px-5 py-10">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : clientsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-[#98A2B3] px-5 py-10">
                      لا يوجد عملاء بعد
                    </td>
                  </tr>
                ) : (
                  clientsList.map((client, index) => (
                    <tr
                      key={client.id ?? index}
                      className="border-b border-[#EAECF0] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-[#101828]">{client.company_name}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{client.company_name}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{client.phone}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{client.email}</td>
                      <td className="px-5 py-3.5 text-[#475467] max-w-[200px] truncate">{client.notes}</td>
                      <td className="px-5 py-3.5 text-[#475467]">
                      <button className="cursor-pointer" onClick={() => router.push(`/clients/${client.id}`)}>
                        <Eye size={18} />
                      </button>
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
          className="fixed inset-0 bg-[#101828]/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px]"
          >
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[#101828]">إضافة عميل</h2>
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
                <input
                  name="name"
                  type="text"
                  value={clientForm.name}
                  onChange={handleChange}
                  placeholder="الاسم"
                  required
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                />
                <input
                  name="company_name"
                  type="text"
                  value={clientForm.company_name}
                  onChange={handleChange}
                  placeholder="اسم الشركة"
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                />
                <input
                  name="phone"
                  type="text"
                  value={clientForm.phone}
                  onChange={handleChange}
                  placeholder="رقم الهاتف"
                  required
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                />
                <input
                  name="email"
                  type="email"
                  value={clientForm.email}
                  onChange={handleChange}
                  placeholder="البريد الإلكتروني"
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                />
                <textarea
                  name="notes"
                  value={clientForm.notes}
                  onChange={handleChange}
                  placeholder="ملاحظات"
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF] resize-none"
                  rows={4}
                />
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