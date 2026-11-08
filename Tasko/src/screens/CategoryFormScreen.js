import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, BackHeader, Field, Button, Cover, SectionLabel } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';
import { pickImage } from '../utils/media';

// Criar ou editar categoria. params: { id? }
export default function CategoryFormScreen({ navigation, route }) {
  const { data, addCategory, updateCategory, deleteCategory } = useApp();
  const editing = data.categories.find((c) => c.id === route.params?.id);

  const [name, setName] = useState(editing?.name ?? '');
  const [cover, setCover] = useState(editing?.cover ?? null);
  const [error, setError] = useState('');
  const seed = editing ? data.categories.indexOf(editing) : data.categories.length;

  const choose = async () => {
    const uri = await pickImage([16, 9]);
    if (uri) setCover(uri);
  };

  const save = () => {
    if (!name.trim()) return setError('Dê um nome para a categoria.');
    if (editing) updateCategory(editing.id, { name: name.trim(), cover });
    else addCategory({ name: name.trim(), cover });
    navigation.goBack();
  };

  const remove = () => {
    const n = data.tasks.filter((t) => t.categoryId === editing.id).length;
    Alert.alert(
      `Excluir "${editing.name}"?`,
      n ? `As ${n} tarefas dentro dela também serão excluídas.` : 'Essa categoria não tem tarefas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => { deleteCategory(editing.id); navigation.goBack(); } },
      ]
    );
  };

  return (
    <Screen footer={<Button title={editing ? 'Salvar alterações' : 'Criar categoria'} onPress={save} />}>
      <BackHeader title={editing ? 'Editar categoria' : 'Nova categoria'} icon="x" onBack={() => navigation.goBack()} />
      <Text style={T.title}>{editing ? 'Ajuste este espaço.' : 'Um novo espaço.'}</Text>
      <Text style={[T.sub, { marginTop: 8, marginBottom: 24 }]}>Dê um nome e uma capa para reconhecer rápido.</Text>

      <Field label="Nome" value={name} onChangeText={setName} placeholder="Ex.: Estudos" error={error} autoCapitalize="sentences" />

      <SectionLabel>Capa</SectionLabel>
      <Cover uri={cover} seed={seed} style={{ height: 140, justifyContent: 'flex-end', padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{name.trim() || 'Nome da categoria'}</Text>
      </Cover>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Button title="Escolher da galeria" icon="image" variant="ghost" onPress={choose} style={{ flex: 1, backgroundColor: colors.surface }} />
        {cover ? <Button title="Remover" variant="ghost" onPress={() => setCover(null)} style={{ marginLeft: 10, paddingHorizontal: 22, backgroundColor: colors.surface }} /> : null}
      </View>

      {editing ? <Button title="Excluir categoria" variant="danger" onPress={remove} style={{ marginTop: 28 }} /> : null}
    </Screen>
  );
}
