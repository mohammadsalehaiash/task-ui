"use client";

import React, { useState, useEffect } from 'react'
import Link from "next/link";
import apiClient from '@/types/apiClient'
import { ChevronLeft } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Subscription {
  id: string;
  client_id: string;
  client?: Client;
  status: 'active' | 'inactive' | 'canceled';
  start_date: string;
  end_date: string | null;
}

interface ClientRequest {
  id: string;
  client_id: string;
  client?: Client;
  type: string;
  status: string;
  submission_date: string;
}

const reqStatusLabels: Record<string, string> = {
  pending: "قيد التحقق",
  in_progress: "قيد التحقق",
  completed: "مقبول",
  rejected: "مرفوض",
};

const reqStatusStyles: Record<string, string> = {
  pending: "bg-[#FFFAEB] text-[#F79009]",
  in_progress: "bg-[#FFFAEB] text-[#F79009]",
  completed: "bg-[#ECFDF3] text-[#12B76A]",
  rejected: "bg-[#FEF3F2] text-[#F04438]",
};

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get('client'),
      apiClient.get('subscription'),
      apiClient.get('request'),
    ])
      .then(([clientsRes, subsRes, reqsRes]) => {
        setClients(clientsRes.data.data ?? []);
        setSubscriptions(subsRes.data.data ?? []);
        setRequests(reqsRes.data.data ?? []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeSubsCount = subscriptions.filter((s) => s.status === "active").length;
  const pendingRequestsCount = requests.filter(
    (r) => r.status === "pending" || r.status === "in_progress"
  ).length;

  // آخر 3 طلبات
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime())
    .slice(0, 3);

  // الاشتراكات الفعالة التي تنتهي قريبًا (خلال 10 أيام)
  const expiringSoon = subscriptions
    .filter((s) => {
      if (s.status !== "active" || !s.end_date) return false;
      const daysLeft = Math.ceil(
        (new Date(s.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft >= 0 && daysLeft <= 10;
    })
    .map((s) => ({
      ...s,
      daysLeft: Math.ceil(
        (new Date(s.end_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-6xl">

        <div>
          <p className="text-2xl font-bold text-[#101828] tracking-tight">الرئيسية</p>
          <p className="text-sm text-[#667085] mt-1">نظرة عامة على العملاء والاشتراكات والطلبات</p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">إجمالي العملاء</p>
            <p className="text-2xl font-bold text-[#101828] mt-2">
              {loading ? "—" : clients.length}
            </p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">اشتراكات فعالة</p>
            <p className="text-2xl font-bold text-[#12B76A] mt-2">
              {loading ? "—" : activeSubsCount}
            </p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">طلبات قيد التنفيذ</p>
            <p className="text-2xl font-bold text-[#F79009] mt-2">
              {loading ? "—" : pendingRequestsCount}
            </p>
          </div>
          <div className="bg-white border border-[#EAECF0] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#667085]">مهام اليوم</p>
            <p className="text-2xl font-bold text-[#101828] mt-2">—</p>
          </div>
        </div>

        {/* آخر الطلبات */}
        <div className="bg-white border border-[#EAECF0] rounded-2xl mt-8 p-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-base font-bold text-[#101828]">آخر الطلبات</p>
            <select className="text-sm text-[#667085] border border-[#D0D5DD] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1F5EFF]">
              <option>كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="completed">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <div className="flex flex-col">
            {loading ? (
              <p className="text-sm text-[#667085] py-6 text-center">جاري التحميل...</p>
            ) : recentRequests.length === 0 ? (
              <p className="text-sm text-[#667085] py-6 text-center">لا يوجد طلبات بعد</p>
            ) : (
              recentRequests.map((req, i) => (
                <Link
                  href={`/clients/${req.client_id}`}
                  key={req.id}
                  className={`flex items-center justify-between py-4 hover:bg-[#F9FAFB] transition-colors px-2 -mx-2 rounded-lg ${
                    i !== recentRequests.length - 1 ? "border-b border-[#EAECF0]" : ""
                  }`}
                >
                  <ChevronLeft size={16} className="text-[#98A2B3]" />
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-[#101828]">
                      {req.client?.name ?? "—"}
                    </p>
                    <p className="text-xs text-[#667085] mt-0.5">{req.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        reqStatusStyles[req.status] ?? "bg-[#F2F4F7] text-[#667085]"
                      }`}
                    >
                      {reqStatusLabels[req.status] ?? req.status}
                    </span>
                    <span className="text-sm text-[#667085] w-24 text-left">
                      {req.submission_date}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* مهام المتابعة + اشتراكات قاربت على الانتهاء */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          <div className="bg-white border border-[#EAECF0] rounded-2xl p-5">
            <p className="text-base font-bold text-[#101828] mb-4">مهام المتابعة</p>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#667085] py-4 text-center">
                لا يوجد نظام مهام متصل بعد
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#EAECF0] rounded-2xl p-5">
            <p className="text-base font-bold text-[#101828] mb-4">اشتراكات قاربت على الانتهاء</p>
            <div className="flex flex-col">
              {loading ? (
                <p className="text-sm text-[#667085] py-4 text-center">جاري التحميل...</p>
              ) : expiringSoon.length === 0 ? (
                <p className="text-sm text-[#667085] py-4 text-center">
                  لا يوجد اشتراكات قاربت على الانتهاء
                </p>
              ) : (
                expiringSoon.map((sub, i) => (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between py-3 ${
                      i !== expiringSoon.length - 1 ? "border-b border-[#EAECF0]" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-[#101828]">
                      {sub.client?.name ?? "—"}
                    </span>
                    <span className="text-sm font-medium text-[#F79009]">
                      باقي {sub.daysLeft} أيام
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>‌
  );
}