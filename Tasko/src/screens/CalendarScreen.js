import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, IconButton, Checkbox } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';
import {
  addDays, byTime, fromKey, longDate, monthGrid, monthTitle, plural, startOfMonth,
  toKey, todayKey, weekOf, weekTitle, weekdayLetters,
} from '../utils/dates';

export default function CalendarScreen({ navigation }) {
  const { data, toggleTask } = useApp();
  const { settings, tasks, categories } = data;
  const view = settings.view; // 'month' | 'week' | 'day'

  const [selected, setSelected] = useState(todayKey());
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const today = todayKey();

  const visible = useMemo(() => tasks.filter((t) => settings.showDone || !t.done), [tasks, settings.showDone]);
  const marks = useMemo(() => {
    const m = {};
    visible.forEach((t) => { m[t.date] = true; });
    return m;
  }, [visible]);
  const dayTasks = visible.filter((t) => t.date === selected).sort(byTime);
  const catName = (id) => categories.find((c) => c.id === id)?.name ?? '';

  const cells =
    view === 'month' ? monthGrid(cursor.getFullYear(), cursor.getMonth(), settings.weekStart)
    : view === 'week' ? weekOf(selected, settings.weekStart)
    : [];
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const title = view === 'month' ? monthTitle(cursor) : view === 'week' ? weekTitle(cells) : longDate(selected);

  // Setas: mês → muda o mês exibido; semana/dia → move a data selecionada
  const go = (dir) => {
    if (view === 'month') {
      setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
    } else {
      const d = addDays(fromKey(selected), dir * (view === 'week' ? 7 : 1));
      setSelected(toKey(d));
      setCursor(startOfMonth(d));
    }
  };

  const pick = (cell) => {
    setSelected(cell.key);
    if (!cell.inMonth) setCursor(startOfMonth(fromKey(cell.key)));
  };

  return (
    <Screen tabbed>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Text style={[T.title, { fontSize: 32 }]}>Calendário</Text>
        <IconButton name="sliders" onPress={() => navigation.navigate('CalendarSettings')} />
      </View>

      {/* Calendário */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Pressable onPress={() => go(-1)} hitSlop={12} style={{ padding: 6 }}>
            <Feather name="chevron-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
          <Pressable onPress={() => go(1)} hitSlop={12} style={{ padding: 6 }}>
            <Feather name="chevron-right" size={20} color={colors.text} />
          </Pressable>
        </View>

        {view !== 'day' ? (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              {weekdayLetters(settings.weekStart).map((l, i) => (
                <Text key={i} style={{ flex: 1, textAlign: 'center', color: colors.muted, fontSize: 12 }}>{l}</Text>
              ))}
            </View>
            {rows.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row' }}>
                {row.map((cell) => {
                  const sel = cell.key === selected;
                  const isToday = cell.key === today;
                  return (
                    <Pressable key={cell.key} onPress={() => pick(cell)} style={{ flex: 1, height: 46, alignItems: 'center' }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.text : 'transparent', borderWidth: isToday && !sel ? 1 : 0, borderColor: colors.subtle }}>
                        <Text style={{ fontSize: 15, fontWeight: sel ? '700' : '400', color: sel ? colors.bg : cell.inMonth ? colors.text : '#4A4E53' }}>{cell.day}</Text>
                      </View>
                      <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: marks[cell.key] ? colors.subtle : 'transparent' }} />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </>
        ) : null}
      </View>

      {/* Tarefas do dia */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <View style={{ flex: 1 }}>
          <Text style={[T.h2, { fontSize: 18 }]}>{longDate(selected)}</Text>
          <Text style={[T.caption, { marginTop: 3 }]}>Um dia de cada vez.</Text>
        </View>
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, height: 28, justifyContent: 'center' }}>
          <Text style={{ color: colors.subtle, fontSize: 12 }}>{plural(dayTasks.length, 'tarefa', 'tarefas')}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginTop: 14 }}>
        {dayTasks.length === 0 ? (
          <Text style={[T.sub, { textAlign: 'center', paddingVertical: 22 }]}>Nenhuma tarefa neste dia.</Text>
        ) : (
          dayTasks.map((t, i) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
              <Checkbox checked={t.done} onPress={() => toggleTask(t.id)} />
              <Pressable onPress={() => navigation.navigate('TaskForm', { taskId: t.id })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.done ? colors.muted : colors.text, fontSize: 15, fontWeight: '600', textDecorationLine: t.done ? 'line-through' : 'none' }}>{t.title}</Text>
                  <Text style={[T.caption, { marginTop: 2 }]}>
                    {t.start ? `${t.start}${t.end ? ` – ${t.end}` : ''} · ` : ''}{catName(t.categoryId)}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.subtle} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Pressable
        onPress={() => navigation.navigate('TaskForm', { date: selected })}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}
      >
        <Feather name="plus" size={16} color={colors.subtle} />
        <Text style={{ color: colors.subtle, fontSize: 14, marginLeft: 8 }}>Adicionar tarefa neste dia</Text>
      </Pressable>
    </Screen>
  );
}
