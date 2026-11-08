import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, IconButton, Avatar, Row, SectionLabel, Sparkle } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';
import { plural } from '../utils/dates';

export default function ProfileScreen({ navigation }) {
  const { data, stats } = useApp();
  const a = data.account;

  const showStats = () =>
    Alert.alert(
      'Suas estatísticas',
      `Tarefas concluídas: ${stats.completed}\nTarefas pendentes: ${stats.pending}\nDias no seu ritmo: ${stats.streak}\nCategorias: ${data.categories.length}`
    );
  const showHelp = () =>
    Alert.alert(
      'Ajuda',
      'Toque no + para criar uma tarefa ou um projeto. Segure uma categoria para editar ou excluir. No modo de foco, o tempo segue o ritmo definido nas configurações.'
    );

  return (
    <Screen tabbed>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[T.title, { fontSize: 32 }]}>Perfil</Text>
        <IconButton name="sliders" onPress={() => navigation.navigate('ProfileSettings')} />
      </View>

      <View style={{ alignItems: 'center', marginTop: 22, marginBottom: 22 }}>
        <Pressable onPress={() => navigation.navigate('EditAccount', { mode: 'profile' })}>
          <Avatar uri={a.avatar} size={108} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 14 }}>{a.name}</Text>
        <Pressable onPress={() => navigation.navigate('EditAccount', { mode: 'profile' })} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Text style={T.sub}>Editar perfil</Text>
          <Feather name="arrow-right" size={13} color={colors.subtle} style={{ marginLeft: 4 }} />
        </Pressable>
      </View>

      {/* Números */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 22 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700' }}>{stats.completed}</Text>
          <Text style={[T.caption, { marginTop: 2 }]}>{stats.completed === 1 ? 'tarefa concluída' : 'tarefas concluídas'}</Text>
        </View>
        <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginHorizontal: 16 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700' }}>{plural(stats.streak, 'dia', 'dias')}</Text>
          <Text style={[T.caption, { marginTop: 2 }]}>no seu ritmo</Text>
        </View>
        <Sparkle size={26} color={colors.subtle} />
      </View>

      <SectionLabel>Do seu jeito</SectionLabel>
      <Row icon="bar-chart-2" title="Estatísticas" subtitle="Veja o que você já conquistou" onPress={showStats} />
      <Row icon="sliders" title="Configurações" subtitle="Aparência, lembretes e preferências" onPress={() => navigation.navigate('ProfileSettings')} />
      <Row icon="help-circle" title="Ajuda" subtitle="Conte com a gente" onPress={showHelp} />

      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>tasko</Text>
        <Text style={[T.caption, { marginTop: 4 }]}>Organização é liberdade.</Text>
        <Text style={[T.caption, { fontSize: 10, marginTop: 4 }]}>VERSÃO 1.0</Text>
      </View>
    </Screen>
  );
}
