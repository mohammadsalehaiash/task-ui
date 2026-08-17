"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/types/apiClient'
import { ArrowRight, Mail, Building2, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company_name: string;
  email: string;
}

interface ClientRequest {
  id: string;
  client_id: string;
  client?: Client;
  status: string;
  submission_date: string | null;
  expected_date: string | null;
  issued_date: string | null;
  duns_number: string | null;
  verification_date: string | null;
  has_facebook_account: boolean;
  has_business_manager: boolean;
  duns_status: string | null;
  verification_status: string | null;
  notes: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  in_progress: "قيد المعالجة",
  completed: "مكتمل",
  rejected: "مرفوض",
};

const statusStyles: Record<string, string> = {
  pending: "bg-[#FFFAEB] text-[#F79009]",
  in_progress: "bg-[#EFF8FF] text-[#1F5EFF]",
  completed: "bg-[#ECFDF3] text-[#12B76A]",
  rejected: "bg-[#FEF3F2] text-[#F04438]",
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

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<ClientRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    apiClient.get(`request/${requestId}`)
      .then((res) => {
        setRequest(res.data.data ?? res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل بيانات الطلب");
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-sm text-[#667085]">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#F04438]">{error ?? "الطلب غير موجود"}</p>
        <button
          onClick={() => router.push('/requests')}
          className="text-sm font-semibold text-[#1F5EFF] hover:underline"
        >
          الرجوع إلى قائمة الطلبات
        </button>
      </div>
    );
  }

  const isDunsOk = request.duns_status === "مكتمل";
  const isFacebookOk = request.has_facebook_account;
  const isVerified = Boolean(request.verification_date);

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-4xl">

        <button
          onClick={() => router.push('/requests')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#101828] transition-colors mb-6"
        >
          <ArrowRight size={16} />
          الرجوع إلى الطلبات
        </button>

        <div className="bg-white border border-[#EAECF0] rounded-2xl p-6">
          {/* رأس البطاقة: اسم الشركة + البريد */}
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <p className="text-2xl font-bold text-[#101828] flex items-center gap-2">
                <Building2 size={20} className="text-[#667085]" />
                {request.client?.company_name || "—"}
              </p>
              {request.client?.email && (
                <p className="text-sm text-[#667085] mt-1.5 flex items-center gap-1.5">
                  <Mail size={14} />
                  {request.client.email}
                </p>
              )}
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                statusStyles[request.status] ?? "bg-[#F2F4F7] text-[#667085]"
              }`}
            >
              {statusLabels[request.status] ?? (request.status || "—")}
            </span>
          </div>

          {/* حالات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#EAECF0]">
            <div>
              <p className="text-xs font-medium text-[#667085] mb-1.5">D-U-N-S STATUS</p>
              <StatusBadge ok={isDunsOk} trueLabel="مكتمل" falseLabel="قيد الانتظار" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#667085] mb-1.5">FACEBOOK STATUS</p>
              <StatusBadge ok={isFacebookOk} trueLabel="متوفر" falseLabel="غير متوفر" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#667085] mb-1.5">حالة التحقق</p>
              <StatusBadge ok={isVerified} trueLabel="محقق" falseLabel="غير محقق" />
            </div>
          </div>

          {/* ===== قسم DUNS ===== */}
          <div className="mt-6 pt-6 border-t border-[#EAECF0]">
            <p className="text-sm font-bold text-[#101828] mb-4">بيانات DUNS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[#667085] flex items-center gap-1.5 mb-1">
                  <Calendar size={14} /> تاريخ الطلب
                </p>
                <p className="text-sm text-[#101828] font-medium">{request.submission_date ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#667085] flex items-center gap-1.5 mb-1">
                  <Calendar size={14} /> تاريخ الخروج المتوقع
                </p>
                <p className="text-sm text-[#101828] font-medium">{request.expected_date ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#667085] flex items-center gap-1.5 mb-1">
                  <Calendar size={14} /> تاريخ الإصدار
                </p>
                <p className="text-sm text-[#101828] font-medium">{request.issued_date ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#667085] mb-1">رقم DUNS</p>
                <p className="text-sm text-[#101828] font-medium">{request.duns_number ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* ===== قسم التحقق ===== */}
          <div className="mt-6 pt-6 border-t border-[#EAECF0]">
            <p className="text-sm font-bold text-[#101828] mb-4">بيانات التحقق</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5 text-sm text-[#344054]">
                {request.has_facebook_account ? (
                  <CheckCircle2 size={18} className="text-[#12B76A]" />
                ) : (
                  <XCircle size={18} className="text-[#98A2B3]" />
                )}
                يملك حساب فيسبوك
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#344054]">
                {request.has_business_manager ? (
                  <CheckCircle2 size={18} className="text-[#12B76A]" />
                ) : (
                  <XCircle size={18} className="text-[#98A2B3]" />
                )}
                يملك Business Manager
              </div>
              <div>
                <p className="text-xs font-medium text-[#667085] flex items-center gap-1.5 mb-1">
                  <Calendar size={14} /> تاريخ التحقق
                </p>
                <p className="text-sm text-[#101828] font-medium">{request.verification_date ?? "—"}</p>
              </div>
            </div>
          </div>

          {request.notes && (
            <div className="mt-6 pt-6 border-t border-[#EAECF0]">
              <p className="text-xs font-medium text-[#667085] mb-1.5">ملاحظات</p>
              <p className="text-sm text-[#344054] leading-relaxed">{request.notes}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}