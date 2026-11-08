import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, Logo, Mascot, Checkbox, ProgressBar, Cover, IconButton, Button } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';
import { todayKey, byTime, plural, WEEKDAYS, MONTHS } from '../utils/dates';

export default function HomeScreen({ navigation }) {
  const { data, toggleTask } = useApp();
  const { account, categories, tasks, focus } = data;

  const now = new Date();
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`.toUpperCase();
  const todays = tasks.filter((t) => t.date === todayKey()).sort(byTime);
  const doneCount = todays.filter((t) => t.done).length;
  const nextTask = todays.find((t) => !t.done);
  const firstName = (account?.name || '').split(' ')[0];
  const catName = (id) => categories.find((c) => c.id === id)?.name ?? '';
  const countIn = (id) => tasks.filter((t) => t.categoryId === id).length;
  const openCategory = (id) =>
    navigation.navigate('Categories', { screen: 'CategoryDetail', params: { id }, initial: false });
  const openTask = (id) => navigation.navigate('TaskForm', { taskId: id });

  return (
    <Screen tabbed>
      {}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <IconButton
          name="bell" bordered={false}
          onPress={() => Alert.alert('Notificações', 'Os lembretes das suas tarefas chegam como notificações do sistema.')}
        />
      </View>

      {/* Saudação */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 22 }}>
        <View style={{ flex: 1 }}>
          <Text style={[T.title, { fontSize: 32 }]}>Olá, {firstName}!</Text>
          <Text style={[T.sub, { marginTop: 6 }]}>Sua rotina. Do seu jeito.</Text>
          <Text style={[T.caption, { marginTop: 4, letterSpacing: 0.6 }]}>{dateLabel}</Text>
        </View>
        <Mascot size={104} />
      </View>

      {/* Tarefas de hoje */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <Text style={T.h2}>Tarefas de hoje</Text>
          <Text style={T.caption}>{doneCount} de {todays.length} concluídas</Text>
        </View>
        <ProgressBar value={todays.length ? doneCount / todays.length : 0} />

        {todays.length === 0 ? (
          <View style={{ paddingTop: 18 }}>
            <Text style={[T.sub, { marginBottom: 14 }]}>Nada marcado para hoje. Que tal planejar um passo?</Text>
            <Button title="Criar tarefa" icon="plus" variant="ghost" onPress={() => navigation.navigate('TaskForm', { date: todayKey() })} />
          </View>
        ) : (
          todays.slice(0, 4).map((t, i) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
              <Checkbox checked={t.done} onPress={() => toggleTask(t.id)} />
              <Pressable onPress={() => openTask(t.id)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.done ? colors.muted : colors.text, fontSize: 15, fontWeight: '600', textDecorationLine: t.done ? 'line-through' : 'none' }}>{t.title}</Text>
                  <Text style={[T.caption, { marginTop: 2 }]}>{catName(t.categoryId)}</Text>
                </View>
                {t.start ? <Text style={T.sub}>{t.start}</Text> : null}
              </Pressable>
            </View>
          ))
        )}
        {todays.length > 4 ? (
          <Pressable onPress={() => navigation.navigate('Calendar')} style={{ paddingTop: 6 }}>
            <Text style={[T.caption, { textAlign: 'center' }]}>+ {todays.length - 4} no calendário</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Categorias */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 12 }}>
        <Text style={T.h2}>Categorias</Text>
        <Pressable onPress={() => navigation.navigate('Categories')} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[T.sub, { marginRight: 4 }]}>Ver todas</Text>
          <Feather name="arrow-right" size={14} color={colors.subtle} />
        </Pressable>
      </View>
      {categories.length === 0 ? (
        <Button title="Criar categoria" icon="plus" variant="ghost" onPress={() => navigation.navigate('CategoryForm')} />
      ) : (
        <View style={{ flexDirection: 'row' }}>
          {categories.slice(0, 2).map((c, i) => (
            <Pressable key={c.id} onPress={() => openCategory(c.id)} style={{ flex: 1, marginRight: i === 0 && categories.length > 1 ? 12 : 0 }}>
              <Cover uri={c.cover} seed={i} style={{ height: 100, justifyContent: 'flex-end', padding: 14 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{c.name}</Text>
                <Text style={{ color: colors.subtle, fontSize: 12, marginTop: 2 }}>{plural(countIn(c.id), 'tarefa', 'tarefas')}</Text>
              </Cover>
            </Pressable>
          ))}
        </View>
      )}

      {/* Modo de foco */}
      <Pressable
        onPress={() => navigation.navigate('Focus', { taskId: nextTask?.id })}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', marginTop: 18, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 })}
      >
        <Feather name="clock" size={22} color={colors.text} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>Um passo de cada vez.</Text>
          <Text style={[T.caption, { marginTop: 2 }]}>Reserve {focus.focusMin} min para se concentrar</Text>
        </View>
        <Feather name="arrow-up-right" size={20} color={colors.text} />
      </Pressable>
    </Screen>
  );
}
