"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/types/apiClient'
import { Eye, X, Pencil, Trash2, Filter, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface Client {
  id?: string;
  name: string;
  company_name: string;
  phone: string;
  email: string;
  notes: string;
  responsible_person: string;
  client_date: string;
}

const emptyForm: Client = {
  name: "",
  company_name: "",
  phone: "",
  email: "",
  notes: "",
  responsible_person: "",
  client_date: "",
};

const monthNames: Record<string, string> = {
  "1": "يناير", "2": "فبراير", "3": "مارس", "4": "أبريل",
  "5": "مايو", "6": "يونيو", "7": "يوليو", "8": "أغسطس",
  "9": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر",
};

interface Filters {
  year: string;
  month: string;
  responsible_person: string;
  search: string;
}

const emptyFilters: Filters = {
  year: "",
  month: "",
  responsible_person: "",
  search: "",
};

export default function Page() {

  const router = useRouter();

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setClientForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  // form state
  const [clientForm, setClientForm] = useState<Client>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // list state
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // filters state
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [years, setYears] = useState<string[]>([]);
  const [responsiblePersons, setResponsiblePersons] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setClientForm({
      ...clientForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => setFilters(emptyFilters);

  const fetchClients = () => {
    setLoading(true);
    apiClient.get('client', { params: filters })
      .then((res) => {
        setClientsList(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل العملاء");
      })
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    apiClient.get('client-stats', { params: { year: filters.year } })
      .then((res) => {
        setYears(res.data.data.years.map(String));
        setResponsiblePersons(res.data.data.responsible_persons);
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!clientForm.name || !clientForm.phone) {
      setError("الرجاء تعبئة الحقول المطلوبة على الأقل (الاسم والهاتف)");
      return;
    }

    setSubmitting(true);
    setError(null);

    const request = editingId
      ? apiClient.put(`client/${editingId}`, clientForm)
      : apiClient.post('client', clientForm);

    request
      .then(() => {
        fetchClients();
        fetchStats();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        const message = err?.response?.data?.message || "تعذر حفظ العميل، تأكد من صحة البيانات";
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleEdit = (client: Client) => {
    setClientForm({
      ...emptyForm,
      ...client,
      client_date: client.client_date ? client.client_date.substring(0, 10) : "",
    });
    setEditingId(client.id ?? null);
    setIsOpen(true);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

    apiClient.delete(`client/${id}`)
      .then(() => {
        fetchClients();
        fetchStats();
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر حذف العميل");
      });
  };

  useEffect(() => {
    fetchClients();
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [filters.year]);

  const totalClients = clientsList.length;
  const currentMonthCount = clientsList.filter((c) => {
    if (!c.client_date) return false;
    const now = new Date();
    const d = new Date(c.client_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const distinctResponsibleCount = new Set(clientsList.map((c) => c.responsible_person).filter(Boolean)).size;

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
            <p className="text-2xl font-bold text-[#101828] mt-2">{totalClients}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">عملاء هذا الشهر</p>
            <p className="text-2xl font-bold text-[#12B76A] mt-2">{currentMonthCount}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">عدد المسؤولين</p>
            <p className="text-2xl font-bold text-[#1F5EFF] mt-2">{distinctResponsibleCount}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">قيد الاجراء</p>
            <p className="text-2xl font-bold text-[#F79009] mt-2">—</p>
          </div>
        </div>

        {/* ------------------------ Filters ---------------------------  */}
        <div className="bg-white border border-[#EAECF0] rounded-2xl mt-8 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-[#667085]" />
            <p className="text-sm font-semibold text-[#101828]">الفلاتر</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input
              name="search"
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="بحث بالاسم / الشركة / الهاتف"
              className="col-span-2 w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
            />

            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
            >
              <option value="">كل السنوات</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
            >
              <option value="">كل الأشهر</option>
              {Object.entries(monthNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              name="responsible_person"
              value={filters.responsible_person}
              onChange={handleFilterChange}
              className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
            >
              <option value="">كل المسؤولين</option>
              {responsiblePersons.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {(filters.year || filters.month || filters.responsible_person || filters.search) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#101828] mt-3"
            >
              <RotateCcw size={13} />
              مسح الفلاتر
            </button>
          )}
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
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">المسؤول</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">تاريخ التسجيل</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">الهاتف</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">البريد الإلكتروني</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">الملاحظات</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اجراءات</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center text-[#98A2B3] px-5 py-10">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : clientsList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-[#98A2B3] px-5 py-10">
                      لا يوجد عملاء بعد
                    </td>
                  </tr>
                ) : (
                  clientsList.map((client, index) => (
                    <tr
                      key={client.id ?? index}
                      className="border-b border-[#EAECF0] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-3.5 font-medium text-[#101828]">{client.name}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{client.company_name}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{client.responsible_person || "—"}</td>
                      <td className="px-5 py-3.5 text-[#475467]">
                        {client.client_date ? client.client_date.substring(0, 10) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[#475467]">{client.phone}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{client.email}</td>
                      <td className="px-5 py-3.5 text-[#475467] max-w-[160px] truncate">{client.notes || "—"}</td>
                      <td className="px-5 py-3.5 text-[#475467]">
                        <div className="flex items-center gap-3">
                          <button className="cursor-pointer" onClick={() => router.push(`/clients/${client.id}`)}>
                            <Eye size={18} />
                          </button>
                          <button className="cursor-pointer text-[#1F5EFF]" onClick={() => handleEdit(client)}>
                            <Pencil size={18} />
                          </button>
                          <button className="cursor-pointer text-[#F04438]" onClick={() => handleDelete(client.id)}>
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
                  {editingId ? "تعديل عميل" : "إضافة عميل"}
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
                  name="responsible_person"
                  type="text"
                  value={clientForm.responsible_person}
                  onChange={handleChange}
                  placeholder="المسؤول"
                  className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                />
                <div>
                  <label className="block text-xs font-medium text-[#667085] mb-1">تاريخ التسجيل</label>
                  <input
                    name="client_date"
                    type="date"
                    value={clientForm.client_date}
                    onChange={handleChange}
                    className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
                  />
                </div>
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