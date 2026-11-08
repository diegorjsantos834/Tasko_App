import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, Cover, Checkbox, ProgressBar } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';
import { relativeDate, plural, todayKey, toKey } from '../utils/dates';

const completedLabel = (t) => {
  if (!t.completedAt) return 'Concluída';
  const d = new Date(t.completedAt);
  if (toKey(d) === todayKey()) return 'Concluída hoje';
  return `Concluída em ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function CategoryDetailScreen({ navigation, route }) {
  const { data, toggleTask, toggleSubtask } = useApp();
  const [expanded, setExpanded] = useState({});
  const cat = data.categories.find((c) => c.id === route.params.id);

  // Se a categoria for excluída, volta para a lista
  useEffect(() => {
    if (!cat) navigation.goBack();
  }, [cat, navigation]);
  if (!cat) return null;

  const tasks = data.tasks
    .filter((t) => t.categoryId === cat.id)
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.date + (a.start || '')).localeCompare(b.date + (b.start || '')));
  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.length - done;
  const subs = tasks.flatMap((t) => t.subtasks);
  const subsDone = subs.filter((s) => s.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const seed = data.categories.findIndex((c) => c.id === cat.id);

  const subtitle = (t) => {
    if (t.done) return completedLabel(t);
    const when = `${relativeDate(t.date)}${t.start ? `, ${t.start}` : ''}`;
    if (!t.subtasks.length) return when;
    return `${when} · ${t.subtasks.filter((s) => s.done).length} de ${t.subtasks.length} subtarefas`;
  };

  return (
    <Screen tabbed>
      {}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }} hitSlop={8}>
          <Feather name="chevron-left" size={22} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 15, marginLeft: 4 }}>Categorias</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('CategoryForm', { id: cat.id })}
          style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, height: 38 }}
        >
          <Feather name="edit-2" size={14} color={colors.text} />
          <Text style={{ color: colors.text, fontSize: 13, marginLeft: 8 }}>Editar categoria</Text>
        </Pressable>
      </View>

      <Cover uri={cat.cover} seed={seed} style={{ height: 120, justifyContent: 'flex-end', padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>{cat.name}</Text>
        <Text style={{ color: colors.subtle, fontSize: 12, marginTop: 2 }}>{plural(tasks.length, 'tarefa', 'tarefas')}</Text>
      </Cover>

      {}
      <View style={{ marginTop: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.text, fontSize: 13 }}>{done} de {tasks.length} {tasks.length === 1 ? 'tarefa concluída' : 'tarefas concluídas'}</Text>
          <Text style={T.caption}>{pct}%</Text>
        </View>
        <ProgressBar value={tasks.length ? done / tasks.length : 0} />
        <Text style={[T.caption, { marginTop: 8 }]}>Subtarefas: {subsDone} de {subs.length} concluídas</Text>
      </View>

      {/* Lista */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 24, marginBottom: 12 }}>
        <Text style={T.h2}>Tarefas</Text>
        <Text style={T.caption}>{plural(pending, 'pendente', 'pendentes')} · {plural(done, 'concluída', 'concluídas')}</Text>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 }}>
        {tasks.length === 0 ? (
          <Text style={[T.sub, { paddingVertical: 20, textAlign: 'center' }]}>Nenhuma tarefa aqui ainda.</Text>
        ) : (
          tasks.map((t, i) => {
            const hasSubs = t.subtasks.length > 0;
            const isOpen = !!expanded[t.id];
            return (
              <View key={t.id} style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
                  <Checkbox checked={t.done} onPress={() => toggleTask(t.id)} />
                  <Pressable onPress={() => navigation.navigate('TaskForm', { taskId: t.id })} style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ color: t.done ? colors.muted : colors.text, fontSize: 15, fontWeight: '600', textDecorationLine: t.done ? 'line-through' : 'none' }}>{t.title}</Text>
                    <Text style={[T.caption, { marginTop: 2 }]}>{subtitle(t)}</Text>
                  </Pressable>
                  <Pressable
                    hitSlop={10}
                    onPress={() => (hasSubs ? setExpanded((e) => ({ ...e, [t.id]: !e[t.id] })) : navigation.navigate('TaskForm', { taskId: t.id }))}
                  >
                    <Feather name={hasSubs ? (isOpen ? 'chevron-up' : 'chevron-down') : 'chevron-right'} size={20} color={colors.subtle} />
                  </Pressable>
                </View>
                {hasSubs && isOpen
                  ? t.subtasks.map((s) => (
                      <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 38, paddingBottom: 14 }}>
                        <Checkbox size={20} checked={s.done} onPress={() => toggleSubtask(t.id, s.id)} />
                        <Text style={{ marginLeft: 12, fontSize: 14, color: s.done ? colors.muted : colors.text, textDecorationLine: s.done ? 'line-through' : 'none' }}>{s.title}</Text>
                      </View>
                    ))
                  : null}
              </View>
            );
          })
        )}
      </View>

      <Pressable
        onPress={() => navigation.navigate('TaskForm', { categoryId: cat.id })}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}
      >
        <Feather name="plus" size={16} color={colors.subtle} />
        <Text style={{ color: colors.subtle, fontSize: 14, marginLeft: 8 }}>Adicionar tarefa em {cat.name}</Text>
      </Pressable>
    </Screen>
  );
}
