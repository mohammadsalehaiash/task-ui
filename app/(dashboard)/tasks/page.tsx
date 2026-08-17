"use client"
import React, { useState, useEffect, useRef } from 'react'
import apiClient from '@/types/apiClient'

interface Users {
  id: string;
  name: string;
}

interface Task {
  id: string
  user_id: string
  title: string
  start_date: string | null
  due_date: string | null
  status: string
  notes: string | null
  completed_at: string | null
}

const DRAG_THRESHOLD = 8 // بالبكسل — أي حركة أقل من كده تتحسب كليك عادي، مش سحب

export default function page() {
  const [Open, setOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string>("")
  const [FetchTasks, setFetchTasks] = useState<Task[]>([]);
  const [FetchUsers, setFetchUsers] = useState<Users[]>([]);
  const [tasks, setTasks] = useState({
    user_id: "",
    title: "",
    start_date: "",
    due_date: "",
    status: "",
    completed_at: "",
    notes: ""
  });

  // حالة السحب المرئية (بتتحدث أثناء السحب عشان تحرك الشبح وتلوّن العمود)
  const [dragState, setDragState] = useState<{
    taskId: string
    title: string
    x: number
    y: number
    overColumn: string | null
  } | null>(null)

  // حالة تأكيد الحذف (اسم المهمة اللي هتتحذف، عشان نعرض تأكيد قبل ما نمسح فعليًا)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const pendingTask = useRef<Task | null>(null)
  const isDraggingRef = useRef(false)
  const overColumnRef = useRef<string | null>(null) // مصدر الحقيقة لـ"أنهي عمود الماوس فوقه دلوقتي"

  const FetchUsersData = function () {
    apiClient.get('user')
      .then(function (res) {
        setFetchUsers(res.data.data.data)
      })
  }

  const FetchTasksData = function () {
    apiClient.get('task')
      .then(function (res) {
        setFetchTasks(res.data.data)
      })
  }

  const handleChange = function (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setTasks({
      ...tasks,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = function (e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    apiClient.post('task', tasks)
      .then(function () {
        setOpen(false)
        setTasks({ user_id: "", title: "", start_date: "", due_date: "", status: "", notes: "", completed_at: "" })
        FetchTasksData()
      })
      .catch(function (err) {
        console.error(err)
      })
  }

  const updateTaskStatus = function (taskId: string, newStatus: string) {
    setFetchTasks(function (prev) {
      return prev.map(function (t) {
        if (t.id === taskId) return { ...t, status: newStatus }
        return t
      })
    })

    apiClient.put(`task/${taskId}`, { status: newStatus })
      .catch(function (err) {
        console.error(err)
        FetchTasksData()
      })
  }

  const handleDeleteTask = function (taskId: string) {
    setFetchTasks(function (prev) {
      return prev.filter(function (t) { return t.id !== taskId })
    })
    setConfirmDeleteId(null)

    apiClient.delete(`task/${taskId}`)
      .catch(function (err) {
        console.error(err)
        FetchTasksData() // لو الحذف فشل في الباك اند، نرجع نجيب البيانات الحقيقية
      })
  }

  // بداية الضغط على الكارت (مش بداية سحب لسه)
  const handleCardPointerDown = function (e: React.PointerEvent, task: Task) {
    // لو ضغط على زرار الحذف، ما نبدأش سحب خالص
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return

    pointerStart.current = { x: e.clientX, y: e.clientY }
    pendingTask.current = task
    isDraggingRef.current = false
  }

  useEffect(function () {
    // pointermove: بيحسب هل تعدينا حد السحب، وبيحرك الشبح بس — مش مسؤول عن اكتشاف العمود
    const handlePointerMove = function (e: PointerEvent) {
      if (!pointerStart.current || !pendingTask.current) return

      const dx = e.clientX - pointerStart.current.x
      const dy = e.clientY - pointerStart.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (!isDraggingRef.current && distance > DRAG_THRESHOLD) {
        isDraggingRef.current = true
      }

      if (isDraggingRef.current) {
        setDragState({
          taskId: pendingTask.current.id,
          title: pendingTask.current.title,
          x: e.clientX,
          y: e.clientY,
          overColumn: overColumnRef.current, // بيتحدث من onPointerEnter/Leave بتاعة كل عمود
        })
      }
    }

    // pointerup: بناخد قرارنا من overColumnRef، مش من فحص الإحداثيات
    const handlePointerUp = function () {
      if (isDraggingRef.current && pendingTask.current) {
        const targetStatus = overColumnRef.current
        if (targetStatus && targetStatus !== pendingTask.current.status) {
          updateTaskStatus(pendingTask.current.id, targetStatus)
        }
      }

      pointerStart.current = null
      pendingTask.current = null
      isDraggingRef.current = false
      overColumnRef.current = null
      setDragState(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return function () {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  // العمود بيبلّغ بنفسه إن الماوس دخل/خرج من حدوده — أدق بكتير من فحص الإحداثيات
  const handleColumnPointerEnter = function (columnKey: string) {
    if (!isDraggingRef.current) return
    overColumnRef.current = columnKey
    setDragState(function (prev) {
      return prev ? { ...prev, overColumn: columnKey } : prev
    })
  }

  const handleColumnPointerLeave = function (columnKey: string) {
    if (overColumnRef.current === columnKey) {
      overColumnRef.current = null
      setDragState(function (prev) {
        return prev ? { ...prev, overColumn: null } : prev
      })
    }
  }

  useEffect(function () {
    FetchUsersData();
    FetchTasksData();
  }, [])

  const statusColumns = [
    { key: "Pending", label: "لم تبدأ", dot: "bg-slate-400", ring: "ring-slate-300" },
    { key: "In Progress", label: "جارية", dot: "bg-amber-500", ring: "ring-amber-300" },
    { key: "Completed", label: "مكتملة", dot: "bg-emerald-500", ring: "ring-emerald-300" },
  ]

  return (
    <>
      <div className="min-h-screen bg-[#F4F5F7] font-[system-ui]">

        {/* الهيدر */}
        <div dir="ltr" className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-white sticky top-0 z-10">
          <button
            onClick={function () { setOpen(true) }}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white font-medium text-sm py-2.5 px-5 rounded-full cursor-pointer transition-colors shadow-sm">
            <span className="text-base leading-none">+</span> اضافة مهمة
          </button>

          <div className="flex items-center gap-2">
            {FetchUsers.map(function (user) {
              const active = activeUserId === user.id
              return (
                <button
                  key={user.id}
                  onClick={function () { setActiveUserId(user.id) }}
                  className={`font-medium text-sm py-2 px-4 rounded-full cursor-pointer transition-all ${
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
                  }`}>
                  {user.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* اللوحة */}
        {activeUserId ? (
          <div dir="rtl" className="flex gap-5 p-6 overflow-x-auto items-start">
            {statusColumns.map(function (column) {
              const columnTasks = FetchTasks.filter(function (task) {
                return task.user_id === activeUserId && task.status === column.key
              })
              const isHovered = dragState?.overColumn === column.key

              return (
                <div
                  key={column.key}
                  onPointerEnter={function () { handleColumnPointerEnter(column.key) }}
                  onPointerLeave={function () { handleColumnPointerLeave(column.key) }}
                  className={`w-72 shrink-0 rounded-2xl p-3 transition-all duration-150 ${
                    isHovered ? `bg-white ring-2 ${column.ring} ring-inset shadow-sm` : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 px-1.5 pb-3">
                    <span className={`w-2 h-2 rounded-full ${column.dot}`}></span>
                    <span className="text-gray-700 text-sm font-semibold">{column.label}</span>
                    <span className="text-gray-400 text-[11px] bg-gray-200/70 rounded-full px-2 py-0.5 ms-auto font-medium">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 min-h-[90px]">
                    {columnTasks.map(function (task) {
                      const isBeingDragged = dragState?.taskId === task.id
                      const isConfirming = confirmDeleteId === task.id

                      return (
                        <div
                          key={task.id}
                          onPointerDown={function (e) { handleCardPointerDown(e, task) }}
                          className={`group relative bg-white rounded-xl p-3.5 border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] select-none touch-none cursor-grab active:cursor-grabbing flex flex-col gap-2 transition-all hover:shadow-md hover:border-gray-300 ${
                            isBeingDragged ? "opacity-30" : ""
                          }`}
                        >
                          {/* زرار الحذف — يظهر عند الـ hover بس */}
                          <button
                            data-no-drag
                            onClick={function (e) { e.stopPropagation(); setConfirmDeleteId(task.id) }}
                            className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            aria-label="حذف المهمة"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                            </svg>
                          </button>

                          <p className={`text-gray-900 text-sm font-semibold leading-snug pl-5 ${column.key === "Completed" ? "line-through text-gray-400" : ""}`}>
                            {task.title}
                          </p>

                          {task.notes && (
                            <p className="text-gray-500 text-xs leading-relaxed">{task.notes}</p>
                          )}

                          <div className="flex flex-col gap-1 pt-2 mt-0.5 border-t border-gray-100">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400">البداية</span>
                              <span className="text-gray-600 font-medium">{task.start_date || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400">الاستحقاق</span>
                              <span className="text-gray-600 font-medium">{task.due_date || "—"}</span>
                            </div>
                            {task.completed_at && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-gray-400">الإنجاز</span>
                                <span className="text-emerald-600 font-medium">{task.completed_at}</span>
                              </div>
                            )}
                          </div>

                          {/* تأكيد الحذف — يظهر فوق الكارت نفسه */}
                          {isConfirming && (
                            <div
                              data-no-drag
                              className="absolute inset-0 bg-white/97 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center gap-2.5 p-3"
                            >
                              <p className="text-gray-800 text-xs font-medium text-center">تحذف "{task.title}"؟</p>
                              <div className="flex gap-2 w-full">
                                <button
                                  onClick={function (e) { e.stopPropagation(); handleDeleteTask(task.id) }}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg py-1.5 transition-colors">
                                  حذف
                                </button>
                                <button
                                  onClick={function (e) { e.stopPropagation(); setConfirmDeleteId(null) }}
                                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg py-1.5 transition-colors">
                                  تراجع
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {columnTasks.length === 0 && (
                      <div className="text-center text-gray-300 text-xs py-6 border border-dashed border-gray-200 rounded-xl">
                        لا توجد مهام
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-16 text-sm">اختر مستخدمًا لعرض مهامه</p>
        )}
      </div>

      {/* الشبح اللي بيتبع الماوس أثناء السحب */}
      {dragState && (
        <div
          id="drag-ghost"
          style={{
            position: 'fixed',
            left: dragState.x + 14,
            top: dragState.y + 14,
            pointerEvents: 'none',
            zIndex: 60,
          }}
          className="bg-white border border-gray-300 shadow-lg rounded-lg px-3.5 py-2.5 text-sm font-medium text-gray-800 max-w-[220px] truncate rotate-2"
        >
          {dragState.title}
        </div>
      )}

      {/* مودال الإضافة */}
      {Open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6 flex flex-col gap-4" dir="rtl">
            <h2 className="text-lg font-semibold text-gray-900">إضافة مهمة</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <input
                type="text"
                name="title"
                onChange={handleChange}
                placeholder="عنوان المهمة"
                required
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="start_date"
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" />

                <input
                  type="date"
                  name="due_date"
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors" />
              </div>

              <select
                name="status"
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors">
                <option value="">اختر الحالة</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                name="user_id"
                required
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors">
                <option value="">اختر المستخدم</option>
                {FetchUsers.map(function (user) {
                  return (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  )
                })}
              </select>

              <textarea
                onChange={handleChange}
                name="notes"
                placeholder="ملاحظات"
                rows={3}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none transition-colors" />

              <div className="flex gap-3 mt-2">
                <button type="submit" className="flex-1 bg-gray-900 hover:bg-black text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                  إضافة المهمة
                </button>
                <button type="button" onClick={() => setOpen(false)} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors">
                  اغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}