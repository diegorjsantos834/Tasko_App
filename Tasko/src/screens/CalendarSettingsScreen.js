import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, BackHeader, Button, Row, Toggle, Segmented, SectionLabel, ActionSheet } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';

const LEADS = [0, 5, 10, 15, 30, 60];
const leadLabel = (m) => (m === 0 ? 'Na hora' : m === 60 ? '1 hora antes' : `${m} minutos antes`);

export default function CalendarSettingsScreen({ navigation }) {
  const { data, updateSettings } = useApp();
  const [s, setS] = useState(data.settings);
  const [sheet, setSheet] = useState(null); 
  const set = (patch) => setS((v) => ({ ...v, ...patch }));

  const save = async () => {
    // envia só o que mudou, para só refazer lembretes quando for preciso
    const patch = {};
    Object.keys(s).forEach((k) => { if (s[k] !== data.settings[k]) patch[k] = s[k]; });
    if (Object.keys(patch).length) await updateSettings(patch);
    navigation.goBack();
  };

  return (
    <Screen footer={<Button title="Salvar alterações" onPress={save} />}>
      <BackHeader title="Calendário" onBack={() => navigation.goBack()} />
      <Text style={T.title}>Sua agenda, seu ritmo.</Text>
      <Text style={[T.sub, { marginTop: 8, marginBottom: 22 }]}>Escolha como visualizar e lembrar das tarefas.</Text>

      <SectionLabel>Visualização</SectionLabel>
      <Row icon="calendar" title="Primeiro dia da semana" subtitle={s.weekStart === 0 ? 'Domingo' : 'Segunda-feira'} onPress={() => setSheet('week')} />

      <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 12 }}>Visualização padrão</Text>
        <Segmented
          value={s.view} onChange={(v) => set({ view: v })}
          options={[{ value: 'month', label: 'Mês' }, { value: 'week', label: 'Semana' }, { value: 'day', label: 'Dia' }]}
          style={{ backgroundColor: colors.bg }}
        />
      </View>

      <Row
        title="Mostrar tarefas concluídas" subtitle="Manter as conquistas na agenda"
        right={<Toggle value={s.showDone} onValueChange={(v) => set({ showDone: v })} />}
      />

      <SectionLabel style={{ marginTop: 18 }}>Lembretes de tarefas</SectionLabel>
      <Row
        icon="bell" title="Lembretes" subtitle="Receber avisos de tarefas agendadas"
        right={<Toggle value={s.reminders} onValueChange={(v) => set({ reminders: v })} />}
      />
      <Row icon="clock" title="Antecedência padrão" subtitle={leadLabel(s.lead)} onPress={() => setSheet('lead')} />

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, paddingHorizontal: 4 }}>
        <Feather name="info" size={16} color={colors.muted} style={{ marginTop: 1 }} />
        <Text style={[T.caption, { flex: 1, marginLeft: 10, lineHeight: 18 }]}>
          Você pode ajustar o lembrete de cada tarefa ao criar ou editar um agendamento.
        </Text>
      </View>

      <ActionSheet
        visible={sheet === 'week'} onClose={() => setSheet(null)} title="Primeiro dia da semana"
        options={[
          { label: 'Domingo', onPress: () => set({ weekStart: 0 }) },
          { label: 'Segunda-feira', onPress: () => set({ weekStart: 1 }) },
        ]}
      />
      <ActionSheet
        visible={sheet === 'lead'} onClose={() => setSheet(null)} title="Antecedência padrão"
        options={LEADS.map((m) => ({ label: leadLabel(m), onPress: () => set({ lead: m }) }))}
      />
    </Screen>
  );
}
