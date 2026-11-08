import React, { useState } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Screen, BackHeader, Field, Button, Chip, SectionLabel } from '../components/ui';
import { useApp, uid } from '../store/AppContext';
import { colors, radius, T } from '../theme';
import { dateWithTime, fromKey, longDate, todayKey, toKey, toTime } from '../utils/dates';

const LEADS = [
  { v: null, label: 'Padrão' }, { v: 0, label: 'Na hora' }, { v: 5, label: '5 min' },
  { v: 10, label: '10 min' }, { v: 30, label: '30 min' }, { v: 60, label: '1 h' },
];

function PickerField({ label, value, placeholder, onPress, onClear, style }) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={{ height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <Text numberOfLines={1} style={{ flex: 1, color: value ? colors.text : colors.muted, fontSize: 15 }}>{value || placeholder}</Text>
        {value && onClear ? (
          <Pressable onPress={onClear} hitSlop={10}><Feather name="x" size={16} color={colors.subtle} /></Pressable>
        ) : null}
      </Pressable>
    </View>
  );
}

// Criar ou editar tarefa. params: { taskId?, categoryId?, date? }
export default function TaskFormScreen({ navigation, route }) {
  const { data, addTask, updateTask, deleteTask } = useApp();
  const editing = data.tasks.find((t) => t.id === route.params?.taskId);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [desc, setDesc] = useState(editing?.description ?? '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? route.params?.categoryId ?? data.categories[0]?.id ?? null);
  const [date, setDate] = useState(editing?.date ?? route.params?.date ?? todayKey());
  const [start, setStart] = useState(editing?.start ?? null);
  const [end, setEnd] = useState(editing?.end ?? null);
  const [lead, setLead] = useState(editing?.lead ?? null);
  const [subs, setSubs] = useState(editing?.subtasks ?? []);
  const [newSub, setNewSub] = useState('');
  const [error, setError] = useState('');
  const [iosPicker, setIosPicker] = useState(null); // { kind, value } (só iOS)

  const applyPicked = (kind, d) => {
    if (kind === 'date') setDate(toKey(d));
    else if (kind === 'start') setStart(toTime(d));
    else setEnd(toTime(d));
  };

  const openPicker = (kind) => {
    const value = kind === 'date' ? fromKey(date) : dateWithTime(date, kind === 'start' ? start : end);
    const mode = kind === 'date' ? 'date' : 'time';
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value, mode, is24Hour: true,
        onChange: (e, d) => { if (e.type === 'set' && d) applyPicked(kind, d); },
      });
    } else {
      setIosPicker({ kind, value });
    }
  };

  const addSub = () => {
    if (!newSub.trim()) return;
    setSubs((s) => [...s, { id: uid(), title: newSub.trim(), done: false }]);
    setNewSub('');
  };

  const save = async () => {
    if (!title.trim()) return setError('Dê um título para a tarefa.');
    if (!categoryId) return setError('Crie uma categoria antes de salvar a tarefa.');
    if (start && end && end <= start) return setError('O horário final precisa ser depois do inicial.');
    const subtasks = newSub.trim() ? [...subs, { id: uid(), title: newSub.trim(), done: false }] : subs;
    const payload = { title: title.trim(), description: desc.trim(), categoryId, date, start, end, lead, subtasks };
    if (editing) await updateTask(editing.id, payload);
    else await addTask(payload);
    navigation.goBack();
  };

  const remove = () =>
    Alert.alert('Excluir tarefa?', `"${editing.title}" será removida.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => { deleteTask(editing.id); navigation.goBack(); } },
    ]);

  return (
    <Screen footer={<Button title={editing ? 'Salvar alterações' : 'Criar tarefa'} onPress={save} />}>
      <BackHeader title={editing ? 'Editar tarefa' : 'Nova tarefa'} icon="x" onBack={() => navigation.goBack()} />
      <Text style={T.title}>{editing ? 'Ajuste os detalhes.' : 'Qual é o próximo passo?'}</Text>
      <Text style={[T.sub, { marginTop: 8, marginBottom: 24 }]}>Uma tarefa por vez, no seu ritmo.</Text>

      <Field label="Título" value={title} onChangeText={setTitle} placeholder="Ex.: Estudar matemática" />
      <Field label="Descrição" value={desc} onChangeText={setDesc} placeholder="Algum detalhe importante? (opcional)" multiline />

      <Text style={{ color: colors.text, fontSize: 14, marginBottom: 10 }}>Categoria</Text>
      {data.categories.length === 0 ? (
        <Button title="Criar categoria" icon="plus" variant="ghost" onPress={() => navigation.navigate('CategoryForm')} style={{ marginBottom: 16 }} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {data.categories.map((c) => (
            <Chip key={c.id} label={c.name} active={c.id === categoryId} onPress={() => setCategoryId(c.id)} />
          ))}
        </View>
      )}

      <PickerField label="Data" value={longDate(date)} onPress={() => openPicker('date')} style={{ flex: 0, marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <PickerField label="Início" value={start} placeholder="Sem horário" onPress={() => openPicker('start')} onClear={() => setStart(null)} />
        <View style={{ width: 12 }} />
        <PickerField label="Fim" value={end} placeholder="Sem horário" onPress={() => openPicker('end')} onClear={() => setEnd(null)} />
      </View>

      {iosPicker ? (
        <View style={{ marginBottom: 16 }}>
          <DateTimePicker
            value={iosPicker.value} mode={iosPicker.kind === 'date' ? 'date' : 'time'} display="spinner"
            themeVariant="dark" is24Hour onChange={(e, d) => d && setIosPicker((p) => ({ ...p, value: d }))}
          />
          <Button title="OK" variant="ghost" onPress={() => { applyPicked(iosPicker.kind, iosPicker.value); setIosPicker(null); }} />
        </View>
      ) : null}

      <Text style={{ color: colors.text, fontSize: 14, marginBottom: 10 }}>Lembrete</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {LEADS.map((l) => (
          <Chip key={l.label} label={l.label} active={lead === l.v} onPress={() => setLead(l.v)} />
        ))}
      </View>

      <SectionLabel style={{ marginTop: 10 }}>Subtarefas</SectionLabel>
      {subs.map((s) => (
        <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Feather name="corner-down-right" size={16} color={colors.muted} />
          <Text style={{ flex: 1, marginLeft: 10, color: s.done ? colors.muted : colors.text, textDecorationLine: s.done ? 'line-through' : 'none' }}>{s.title}</Text>
          <Pressable onPress={() => setSubs((all) => all.filter((x) => x.id !== s.id))} hitSlop={10}>
            <Feather name="x" size={18} color={colors.subtle} />
          </Pressable>
        </View>
      ))}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Field style={{ flex: 1, marginBottom: 0 }} placeholder="Adicionar subtarefa" value={newSub} onChangeText={setNewSub} onSubmitEditing={addSub} returnKeyType="done" />
        <Pressable onPress={addSub} style={{ width: 54, height: 54, marginLeft: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="plus" size={20} color={colors.text} />
        </Pressable>
      </View>

      {error ? <Text style={{ color: colors.danger, fontSize: 13, marginTop: 16 }}>{error}</Text> : null}
      {editing ? <Button title="Excluir tarefa" variant="danger" onPress={remove} style={{ marginTop: 24 }} /> : null}
    </Screen>
  );
}
