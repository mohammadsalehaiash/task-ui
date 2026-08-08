"use client"
import React, { useState, useEffect } from 'react'
import apiClient from '@/types/apiClient'
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useParams } from 'next/navigation'

interface Requirement {
  id: string;
  client_id: string;
  sector_type: "profit" | "non_profit";
  commercial_register: string | null;
  commercial_register_data: string | null;
  association_license: string | null;
  board_formation_declaration: string | null;
  national_address: string | null;
  website: string | null;
  domain_email: string | null;
  named_phone: string | null;
  drive_link: string | null;
  checklist: Record<string, boolean>;
  client?: { id: string; company_name: string };
}

const fieldLabels: Record<string, string> = {
  commercial_register: "سجل تجاري",
  commercial_register_data: "بيانات السجل التجاري",
  association_license: "ترخيص الجمعية",
  board_formation_declaration: "إقرار تشكيل مجلس الإدارة",
  national_address: "العنوان الوطني",
  website: "الموقع الالكتروني",
  domain_email: "بريد مرتبط على نفس الدومين",
  named_phone: "رقم جوال باسم",
  drive_link: "رابط الدرايف",
};

export default function Page() {

  const { id } = useParams();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edit modal state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequirement = () => {
    setLoading(true);
    apiClient.get(`requirements/${id}`)
      .then((res) => {
        setRequirement(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل المتطلب");
      })
      .finally(() => setLoading(false));
  };

  const handleToggle = (key: string) => {
    if (!requirement) return;
    apiClient.patch(`requirements/${requirement.id}/toggle-item`, { key })
      .then(() => fetchRequirement())
      .catch((err) => {
        console.error(err);
        setError("تعذر تحديث الحالة");
      });
  };

  const openEdit = (key: string) => {
    if (!requirement) return;
    setEditingKey(key);
    setEditValue((requirement as any)[key] ?? "");
  };

  const closeEdit = () => {
    setEditingKey(null);
    setEditValue("");
    setError(null);
  };

  const handleSaveEdit = () => {
    if (!requirement || !editingKey) return;

    if (!editValue.trim()) {
      setError("الرجاء إدخال قيمة");
      return;
    }

    setSubmitting(true);
    apiClient.patch(`requirements/${requirement.id}/update-item`, {
      key: editingKey,
      value: editValue,
    })
      .then(() => {
        fetchRequirement();
        closeEdit();
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر حفظ القيمة");
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeleteItem = (key: string) => {
    if (!requirement) return;
    if (!confirm("هل أنت متأكد من حذف قيمة هذا الحقل؟")) return;

    apiClient.delete(`requirements/${requirement.id}/delete-item`, { data: { key } })
      .then(() => fetchRequirement())
      .catch((err) => {
        console.error(err);
        setError("تعذر حذف الحقل");
      });
  };

  useEffect(() => {
    if (id) fetchRequirement();
  }, [id]);

  if (loading) {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#98A2B3] text-sm">جاري التحميل...</p>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#98A2B3] text-sm">لم يتم العثور على المتطلب</p>
      </div>
    );
  }

  const keys = Object.keys(requirement.checklist ?? {});

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-[#F7F8FA] font-[system-ui]">
      <div className="container mx-auto px-6 md:px-10 py-12 max-w-4xl">

        <div>
          <p className="text-2xl font-bold text-[#101828] tracking-tight">
            متطلبات {requirement.client?.company_name}
          </p>
          <p className="text-sm text-[#667085] mt-1">
            {requirement.sector_type === "profit" ? "قطاع ربحي" : "قطاع غير ربحي"}
          </p>
        </div>

        {error && (
          <div className="mt-4 text-sm text-[#F04438] bg-[#FEF3F2] border border-[#FDA29B] rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {keys.map((key) => {
            const done = requirement.checklist[key];
            const value = (requirement as any)[key];

            return (
              <div
                key={key}
                className={`border rounded-2xl p-4 transition-colors ${
                  done ? "bg-[#F0FDF4] border-[#B9F2CE]" : "bg-white border-[#EAECF0]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => handleToggle(key)}
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      done
                        ? "bg-[#12B76A] border-[#12B76A] text-white"
                        : "bg-white border-[#D0D5DD] text-transparent"
                    }`}
                  >
                    <Check size={15} strokeWidth={3} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#101828]">{fieldLabels[key]}</p>

                    {key === "drive_link" && value ? (
                      
                       <a href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm mt-1 text-[#1F5EFF] hover:underline truncate block"
                      >
                        فتح رابط الدرايف ↗
                      </a>
                    ) : (
                      <p className={`text-sm mt-1 truncate ${value ? "text-[#475467]" : "text-[#98A2B3]"}`}>
                        {value || "لا توجد قيمة"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(key)} className="text-[#1F5EFF] cursor-pointer">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteItem(key)} className="text-[#F04438] cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ------------------------ Edit Modal ---------------------------  */}
      {editingKey && (
        <div
          className="fixed inset-0 bg-[#101828]/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
          onClick={closeEdit}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] bg-white rounded-2xl p-6 shadow-xl shadow-black/10"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-[#101828]">{fieldLabels[editingKey]}</h2>
              <button type="button" onClick={closeEdit} className="text-[#667085] hover:text-[#101828]">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-3.5 text-sm text-[#F04438] bg-[#FEF3F2] border border-[#FDA29B] rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <input
              type={editingKey === "drive_link" || editingKey === "website" ? "url" : "text"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editingKey === "drive_link" ? "https://drive.google.com/..." : fieldLabels[editingKey]}
              className="w-full border border-[#D0D5DD] rounded-xl px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#1F5EFF]/30 focus:border-[#1F5EFF]"
            />

            <div className="flex justify-end gap-2.5 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={submitting}
                className="bg-[#1F5EFF] hover:bg-[#1848D6] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button
                onClick={closeEdit}
                className="bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}