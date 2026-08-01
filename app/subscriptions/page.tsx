"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/types/apiClient'
import { Eye, X } from 'lucide-react';

interface Client {
  id: string;
  company_name: string;
}

interface Subscription {
  id?: string;
  client_id: string;
  client?: Client; // في حال الـ API يرجع العلاقة كاملة
  status: 'active' | 'inactive' | 'canceled' | '';
  start_date: string;
  end_date: string | null;
}

const emptyForm: Subscription = {
  client_id: "",
  status: "",
  start_date: "",
  end_date: "",
};

const statusLabels: Record<string, string> = {
  active: "فعالة",
  inactive: "غير فعالة",
  canceled: "ملغاة",
};

const statusStyles: Record<string, string> = {
  active: "bg-[#ECFDF3] text-[#12B76A]",
  inactive: "bg-[#F2F4F7] text-[#667085]",
  canceled: "bg-[#FEF3F2] text-[#F04438]",
};

export default function SubscriptionsPage() {

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setSubscriptionForm(emptyForm);
    setError(null);
  };

  // form state
  const [subscriptionForm, setSubscriptionForm] = useState<Subscription>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // subscriptions list state
  const [subscribersList, setSubscribersList] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // clients list state (لتعبئة select العميل)
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setSubscriptionForm({
      ...subscriptionForm,
      [e.target.name]: e.target.value,
    });
  };

  const fetchSubscriptions = () => {
    setLoading(true);
    apiClient.get('subscription')
      .then((res) => {
        setSubscribersList(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل الاشتراكات");
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

    if (!subscriptionForm.client_id || !subscriptionForm.status || !subscriptionForm.start_date) {
      setError("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    setError(null);

    apiClient.post('subscription', subscriptionForm)
      .then(() => {
        fetchSubscriptions();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        const message = err?.response?.data?.message || "تعذر حفظ الاشتراك، تأكد من صحة البيانات";
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchClients();
  }, []);

  const getClientName = (subscription: Subscription) => {
    if (subscription.client?.company_name) return subscription.client.company_name;
    const found = clients.find((c) => c.id === subscription.client_id);
    return found ? found.company_name : subscription.client_id;
  };

  const activeCount = subscribersList.filter((s) => s.status === "active").length;
  const inactiveCount = subscribersList.filter((s) => s.status === "inactive").length;
  const cancelledCount = subscribersList.filter((s) => s.status === "canceled").length;

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-6xl">

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-2xl font-bold text-[#101828] tracking-tight">الاشتراكات</p>
            <p className="text-sm text-[#667085] mt-1">إدارة اشتراكات العملاء وحالاتها</p>
          </div>
          <div> 
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#1F5EFF] hover:bg-[#1848D6] active:bg-[#123499] transition-colors px-5 py-2.5 rounded-xl shadow-sm shadow-blue-900/10"
            >
              <span className="text-lg leading-none">+</span> اشتراك جديد
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">فعالة</p>
            <p className="text-2xl font-bold text-[#12B76A] mt-2">{activeCount}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">غير فعالة</p>
            <p className="text-2xl font-bold text-[#98A2B3] mt-2">{inactiveCount}</p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">ملغاة</p>
            <p className="text-2xl font-bold text-[#F04438] mt-2">{cancelledCount}</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAECF0] rounded-2xl mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">العميل</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">الحالة</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">بداية الاشتراك</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">نهاية الاشتراك</th>
                  <th className="text-right font-semibold text-[#667085] px-5 py-3">اجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[#667085]">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : subscribersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[#667085]">
                      لا يوجد اشتراكات
                    </td>
                  </tr>
                ) : (
                  subscribersList.map((subscription, index) => (
                    <tr
                      key={subscription.id ?? index}
                      className="border-b border-[#EAECF0] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-[#101828]">
                        {getClientName(subscription)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            statusStyles[subscription.status] ?? "bg-[#F2F4F7] text-[#667085]"
                          }`}
                        >
                          {statusLabels[subscription.status] ?? subscription.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#475467]">{subscription.start_date}</td>
                      <td className="px-5 py-3.5 text-[#475467]">{subscription.end_date ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#475467]">
                        <button className="cursor-pointer" onClick={() => console.log(subscription)}>
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
                <h2 className="text-lg font-bold text-[#101828]">إضافة اشتراك</h2>
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
                  value={subscriptionForm.client_id}
                  onChange={handleChange}
                  required
                  className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                >
                  <option value="" disabled>
                    {loadingClients ? "جاري تحميل العملاء..." : "اختر العميل"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name}
                    </option>
                  ))}
                </select>

                {/* اختيار الحالة */}
                <select
                  name="status"
                  value={subscriptionForm.status}
                  onChange={handleChange}
                  required
                  className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                >
                  <option value="" disabled>اختر الحالة</option>
                  <option value="active">فعالة</option>
                  <option value="inactive">غير فعالة</option>
                  <option value="canceled">ملغاة</option>
                </select>

                <div>
                  <label className="block text-xs font-medium text-[#667085] mb-1">بداية الاشتراك</label>
                  <input
                    type="date"
                    name="start_date"
                    value={subscriptionForm.start_date}
                    onChange={handleChange}
                    required
                    className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#667085] mb-1">
                    نهاية الاشتراك (اختياري)
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={subscriptionForm.end_date ?? ""}
                    onChange={handleChange}
                    className="w-full text-sm text-[#344054] border border-[#D0D5DD] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF] focus:border-[#1F5EFF]"
                  />
                </div>
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