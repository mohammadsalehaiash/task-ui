"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/types/apiClient'
import { ArrowRight, Phone, Mail, Building2, FileText } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company_name: string;
  phone: string;
  email: string;
  notes: string;
}

interface Subscription {
  id: string;
  client_id: string;
  status: 'active' | 'inactive' | 'canceled';
  start_date: string;
  end_date: string | null;
}

interface ClientRequest {
  id: string;
  client_id: string;
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

const subStatusLabels: Record<string, string> = {
  active: "فعالة",
  inactive: "غير فعالة",
  canceled: "ملغاة",
};

const subStatusStyles: Record<string, string> = {
  active: "bg-[#ECFDF3] text-[#12B76A]",
  inactive: "bg-[#F2F4F7] text-[#667085]",
  canceled: "bg-[#FEF3F2] text-[#F04438]",
};

const reqStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  in_progress: "قيد المعالجة",
  completed: "مكتمل",
  rejected: "مرفوض",
};

const reqStatusStyles: Record<string, string> = {
  pending: "bg-[#FFFAEB] text-[#F79009]",
  in_progress: "bg-[#EFF8FF] text-[#1F5EFF]",
  completed: "bg-[#ECFDF3] text-[#12B76A]",
  rejected: "bg-[#FEF3F2] text-[#F04438]",
};

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      apiClient.get(`client/${clientId}`),
      apiClient.get('subscription'),
      apiClient.get('request'),
    ])
      .then(([clientRes, subsRes, reqsRes]) => {
        setClient(clientRes.data.data);

        const allSubs: Subscription[] = subsRes.data.data;
        setSubscriptions(allSubs.filter((s) => s.client_id === clientId));

        const allReqs: ClientRequest[] = reqsRes.data.data;
        setRequests(allReqs.filter((r) => r.client_id === clientId));
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل بيانات العميل");
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-sm text-[#667085]">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#F04438]">{error ?? "العميل غير موجود"}</p>
        <button
          onClick={() => router.push('/clients')}
          className="text-sm font-semibold text-[#1F5EFF] hover:underline"
        >
          الرجوع إلى قائمة العملاء
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-6xl">

        {/* رجوع */}
        <button
          onClick={() => router.push('/clients')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#101828] transition-colors mb-6"
        >
          <ArrowRight size={16} />
          الرجوع إلى العملاء
        </button>

        {/* بطاقة معلومات العميل */}
        <div className="bg-white border border-[#EAECF0] rounded-2xl p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <p className="text-2xl font-bold text-[#101828]">{client.name}</p>
              {client.company_name && (
                <p className="text-sm text-[#667085] mt-1 flex items-center gap-1.5">
                  <Building2 size={14} /> {client.company_name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2.5 text-sm text-[#344054]">
              <Phone size={16} className="text-[#667085]" />
              {client.phone || "—"}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#344054]">
              <Mail size={16} className="text-[#667085]" />
              {client.email || "—"}
            </div>
          </div>

          {client.notes && (
            <div className="mt-4 pt-4 border-t border-[#EAECF0]">
              <p className="text-xs font-medium text-[#667085] flex items-center gap-1.5 mb-1.5">
                <FileText size={14} /> ملاحظات
              </p>
              <p className="text-sm text-[#344054]">{client.notes}</p>
            </div>
          )}
        </div>

        {/* الاشتراكات */}
        <div className="mt-8">
          <p className="text-lg font-bold text-[#101828] mb-3">الاشتراكات</p>
          <div className="bg-white border border-[#EAECF0] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">الحالة</th>
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">بداية الاشتراك</th>
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">نهاية الاشتراك</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-[#98A2B3] px-5 py-8">
                        لا يوجد اشتراكات لهذا العميل
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id} className="border-b border-[#EAECF0] last:border-0">
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${subStatusStyles[sub.status] ?? "bg-[#F2F4F7] text-[#667085]"}`}>
                            {subStatusLabels[sub.status] ?? sub.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#475467]">{sub.start_date}</td>
                        <td className="px-5 py-3.5 text-[#475467]">{sub.end_date ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* الطلبات */}
        <div className="mt-8">
          <p className="text-lg font-bold text-[#101828] mb-3">الطلبات</p>
          <div className="bg-white border border-[#EAECF0] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">النوع</th>
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">الحالة</th>
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">تاريخ التقديم</th>
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">التاريخ المتوقع</th>
                    <th className="text-right font-semibold text-[#667085] px-5 py-3">تاريخ التحقق</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-[#98A2B3] px-5 py-8">
                        لا يوجد طلبات لهذا العميل
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="border-b border-[#EAECF0] last:border-0">
                        <td className="px-5 py-3.5 text-[#101828] font-medium">{req.type}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${reqStatusStyles[req.status] ?? "bg-[#F2F4F7] text-[#667085]"}`}>
                            {reqStatusLabels[req.status] ?? req.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#475467]">{req.submission_date}</td>
                        <td className="px-5 py-3.5 text-[#475467]">{req.expected_date ?? "—"}</td>
                        <td className="px-5 py-3.5 text-[#475467]">{req.verification_date ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}