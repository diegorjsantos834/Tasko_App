import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, toKey } from '../utils/dates';
import { cancelNotification, scheduleTaskReminder } from '../utils/notifications';

const KEY = '@tasko/v1';
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const DEFAULTS = {
  account: null, 
  session: false,
  categories: [], 
  tasks: [], 
  settings: { weekStart: 0, view: 'month', showDone: true, reminders: true, lead: 10, notifications: true },
  focus: { focusMin: 25, breakMin: 5, bg: 'default', alertOnEnd: true },
};

const SEED_CATEGORIES = ['Estudos', 'Trabalho', 'Projetos pessoais', 'Rotina', 'Esportes', 'Lazer'];

// Dias seguidos (até hoje ou ontem) com pelo menos uma tarefa concluída
function streakOf(tasks) {
  const days = new Set(tasks.filter((t) => t.done && t.completedAt).map((t) => toKey(new Date(t.completedAt))));
  let cursor = new Date();
  if (!days.has(toKey(cursor))) cursor = addDays(cursor, -1);
  let n = 0;
  while (days.has(toKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [data, setData] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);
  const ref = useRef(data);
  ref.current = data;

  // Carrega do armazenamento local
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setData({
            ...DEFAULTS,
            ...saved,
            settings: { ...DEFAULTS.settings, ...saved.settings },
            focus: { ...DEFAULTS.focus, ...saved.focus },
          });
        }
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  // Salva a cada mudança
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  /* ---------------- Conta ---------------- */
  const signUp = ({ name, email, password }) => {
    const cur = ref.current;
    if (cur.account) return { ok: false, error: 'Já existe uma conta neste aparelho. Entre com ela.' };
    const categories = cur.categories.length ? cur.categories : SEED_CATEGORIES.map((n) => ({ id: uid(), name: n, cover: null }));
    setData((d) => ({
      ...d,
      account: { name: name.trim(), email: email.trim().toLowerCase(), password, avatar: null },
      session: true,
      categories,
    }));
    return { ok: true };
  };

  const signIn = (email, password) => {
    const a = ref.current.account;
    if (!a || a.email !== email.trim().toLowerCase() || a.password !== password) {
      return { ok: false, error: 'E-mail ou senha incorretos.' };
    }
    setData((d) => ({ ...d, session: true }));
    return { ok: true };
  };

  const signOut = () => setData((d) => ({ ...d, session: false }));
  const updateAccount = (patch) => setData((d) => ({ ...d, account: { ...d.account, ...patch } }));
  const resetAll = () => {
    ref.current.tasks.forEach((t) => cancelNotification(t.notifId));
    setData(DEFAULTS);
  };

  /* ---------------- Categorias ---------------- */
  const addCategory = (fields) => {
    const cat = { id: uid(), cover: null, ...fields };
    setData((d) => ({ ...d, categories: [...d.categories, cat] }));
    return cat;
  };
  const updateCategory = (id, patch) =>
    setData((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const deleteCategory = (id) => {
    ref.current.tasks.filter((t) => t.categoryId === id).forEach((t) => cancelNotification(t.notifId));
    setData((d) => ({
      ...d,
      categories: d.categories.filter((c) => c.id !== id),
      tasks: d.tasks.filter((t) => t.categoryId !== id),
    }));
  };

  /* ---------------- Tarefas ---------------- */
  const syncReminder = async (task) => {
    await cancelNotification(task.notifId);
    const s = ref.current.settings;
    if (task.done || !s.reminders || !s.notifications) return null;
    return scheduleTaskReminder(task, s.lead);
  };

  const addTask = async (fields) => {
    const task = { id: uid(), done: false, completedAt: null, subtasks: [], lead: null, notifId: null, ...fields };
    task.notifId = await syncReminder(task);
    setData((d) => ({ ...d, tasks: [...d.tasks, task] }));
    return task;
  };

  const updateTask = async (id, patch) => {
    const old = ref.current.tasks.find((t) => t.id === id);
    if (!old) return;
    const notifId = await syncReminder({ ...old, ...patch });
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch, notifId } : t)) }));
  };

  const deleteTask = (id) => {
    const t = ref.current.tasks.find((x) => x.id === id);
    if (t) cancelNotification(t.notifId);
    setData((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) }));
  };

  const toggleTask = (id) => {
    const t = ref.current.tasks.find((x) => x.id === id);
    if (!t) return;
    const done = !t.done;
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((x) => (x.id === id ? { ...x, done, completedAt: done ? Date.now() : null } : x)),
    }));
    syncReminder({ ...t, done }).then((notifId) =>
      setData((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === id ? { ...x, notifId } : x)) }))
    );
  };

  const toggleSubtask = (taskId, subId) =>
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) } : t
      ),
    }));

  /* ---------------- Preferências ---------------- */
  const updateSettings = async (patch) => {
    const settings = { ...ref.current.settings, ...patch };
    ref.current = { ...ref.current, settings };
    setData((d) => ({ ...d, settings }));
    // Lembretes já agendados precisam ser refeitos quando as regras mudam
    if ('reminders' in patch || 'lead' in patch || 'notifications' in patch) {
      const ids = {};
      for (const t of ref.current.tasks) ids[t.id] = await syncReminder(t);
      setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id in ids ? { ...t, notifId: ids[t.id] } : t)) }));
    }
  };
  const updateFocus = (patch) => setData((d) => ({ ...d, focus: { ...d.focus, ...patch } }));

  const stats = {
    completed: data.tasks.filter((t) => t.done).length,
    pending: data.tasks.filter((t) => !t.done).length,
    streak: streakOf(data.tasks),
  };

  const value = {
    ready, data, stats,
    signUp, signIn, signOut, updateAccount, resetAll,
    addCategory, updateCategory, deleteCategory,
    addTask, updateTask, deleteTask, toggleTask, toggleSubtask,
    updateSettings, updateFocus,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
