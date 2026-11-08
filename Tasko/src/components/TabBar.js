import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ActionSheet } from './ui';
import { colors } from '../theme';
import { todayKey } from '../utils/dates';

const TABS = {
  Home: ['home', 'Início'],
  Calendar: ['calendar', 'Calendário'],
  Categories: ['grid', 'Categorias'],
  Profile: ['user', 'Perfil'],
};

// Barra de abas com o botão "+" no centro (abre: criar projeto ou criar tarefa)
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const tab = (route) => {
    const focused = state.routes[state.index].key === route.key;
    const [icon, label] = TABS[route.name];
    const press = () => {
      const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <Pressable key={route.key} onPress={press} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}>
        <Feather name={icon} size={22} color={focused ? colors.text : colors.muted} />
        <Text style={{ fontSize: 10, marginTop: 4, color: focused ? colors.text : colors.muted, fontWeight: focused ? '700' : '400' }}>{label}</Text>
      </Pressable>
    );
  };

  const [home, cal, cats, prof] = state.routes;

  return (
    <>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border,
          paddingTop: 8, paddingBottom: Math.max(insets.bottom, 10), paddingHorizontal: 8,
        }}
      >
        {tab(home)}
        {tab(cal)}
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => ({ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6, marginTop: -4, opacity: pressed ? 0.85 : 1 })}
        >
          <Feather name="plus" size={28} color={colors.bg} />
        </Pressable>
        {tab(cats)}
        {tab(prof)}
      </View>

      <ActionSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="O que você quer criar?"
        options={[
          { label: 'Criar tarefa', sub: 'Com data, horário e subtarefas', icon: 'check-square', onPress: () => navigation.navigate('TaskForm', { date: todayKey() }) },
          { label: 'Criar projeto', sub: 'Uma nova categoria com capa própria', icon: 'folder-plus', onPress: () => navigation.navigate('CategoryForm') },
        ]}
      />
    </>
  );
}
