import React, { useState } from 'react';
import { View, Text, Pressable, Alert, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, Cover, IconButton, Segmented, SectionLabel, ActionSheet, Empty, Button } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';
import { plural } from '../utils/dates';

const SORTS = ['Personalizada', 'A–Z', 'Mais tarefas'];

export default function CategoriesScreen({ navigation }) {
  const { data, deleteCategory } = useApp();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState('list');
  const [sort, setSort] = useState(0);
  const [menu, setMenu] = useState(null); // categoria com o menu aberto

  const total = data.tasks.length;
  let list = data.categories.map((c, i) => ({ ...c, index: i, count: data.tasks.filter((t) => t.categoryId === c.id).length }));
  if (sort === 1) list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 2) list = [...list].sort((a, b) => b.count - a.count);

  const open = (c) => navigation.navigate('CategoryDetail', { id: c.id });
  const confirmDelete = (c) =>
    Alert.alert(
      `Excluir "${c.name}"?`,
      c.count ? `As ${plural(c.count, 'tarefa', 'tarefas')} dentro dela também serão excluídas.` : 'Essa categoria não tem tarefas.',
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => deleteCategory(c.id) }]
    );

  const cardW = (width - 40 - 12) / 2;

  return (
    <Screen tabbed>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[T.title, { fontSize: 32 }]}>Categorias</Text>
        <IconButton name="plus" onPress={() => navigation.navigate('CategoryForm')} />
      </View>
      <Text style={[T.sub, { marginTop: 10, marginBottom: 18 }]}>
        {plural(data.categories.length, 'espaço', 'espaços')} para organizar {total === 1 ? 'sua' : 'suas'} {plural(total, 'tarefa', 'tarefas')}.
      </Text>

      <Segmented
        value={mode} onChange={setMode} style={{ marginBottom: 18 }}
        options={[{ value: 'list', label: 'Lista', icon: 'list' }, { value: 'grid', label: 'Grade', icon: 'grid' }]}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Suas categorias</SectionLabel>
        <Pressable onPress={() => setSort((s) => (s + 1) % SORTS.length)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }} hitSlop={8}>
          <Text style={[T.caption, { marginRight: 6 }]}>{SORTS[sort]}</Text>
          <Feather name="repeat" size={13} color={colors.muted} />
        </Pressable>
      </View>

      {list.length === 0 ? (
        <Empty
          title="Nenhuma categoria ainda"
          text="Crie um espaço para agrupar tarefas parecidas."
          action={<Button title="Criar categoria" icon="plus" onPress={() => navigation.navigate('CategoryForm')} />}
        />
      ) : mode === 'list' ? (
        list.map((c) => (
          <Pressable key={c.id} onPress={() => open(c)} onLongPress={() => setMenu(c)} style={{ marginBottom: 10 }}>
            <Cover uri={c.cover} seed={c.index} style={{ height: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{c.name}</Text>
                <Text style={{ color: colors.subtle, fontSize: 12, marginTop: 2 }}>{plural(c.count, 'tarefa', 'tarefas')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </Cover>
          </Pressable>
        ))
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {list.map((c) => (
            <Pressable key={c.id} onPress={() => open(c)} onLongPress={() => setMenu(c)} style={{ width: cardW, marginBottom: 12 }}>
              <Cover uri={c.cover} seed={c.index} style={{ height: 148, justifyContent: 'flex-end', padding: 14 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{c.name}</Text>
                <Text style={{ color: colors.subtle, fontSize: 12, marginTop: 2 }}>{plural(c.count, 'tarefa', 'tarefas')}</Text>
              </Cover>
            </Pressable>
          ))}
        </View>
      )}

      {list.length > 0 ? <Text style={[T.caption, { textAlign: 'center', marginTop: 8 }]}>Segure uma categoria para editar ou excluir.</Text> : null}

      {/* Segurar na categoria (lista ou grade) → editar ou excluir */}
      <ActionSheet
        visible={!!menu}
        onClose={() => setMenu(null)}
        title={menu?.name}
        options={
          menu
            ? [
                { label: 'Editar', icon: 'edit-2', onPress: () => navigation.navigate('CategoryForm', { id: menu.id }) },
                { label: 'Excluir', icon: 'trash-2', danger: true, onPress: () => confirmDelete(menu) },
              ]
            : []
        }
      />
    </Screen>
  );
}
