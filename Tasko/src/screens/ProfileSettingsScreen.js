import React, { useState } from 'react';
import { Text, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, BackHeader, Button, Row, Toggle, SectionLabel, Avatar } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';

export default function ProfileSettingsScreen({ navigation }) {
  const { data, signOut, updateSettings } = useApp();
  const a = data.account;
  const [notifications, setNotifications] = useState(data.settings.notifications);

  const save = async () => {
    if (notifications !== data.settings.notifications) await updateSettings({ notifications });
    navigation.goBack();
  };

  const logout = () =>
    Alert.alert('Sair da conta?', 'Seus dados continuam salvos neste aparelho.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);

  return (
    <Screen footer={<Button title="Salvar alterações" onPress={save} />}>
      <BackHeader title="Perfil" onBack={() => navigation.goBack()} />
      <Text style={T.title}>Configurações</Text>
      <Text style={[T.sub, { marginTop: 8, marginBottom: 22 }]}>Sua conta e o Tasko do seu jeito.</Text>

      <SectionLabel>Sua conta</SectionLabel>
      <Row
        leading={<Avatar uri={a.avatar} size={42} />}
        title={a.name} subtitle="Editar nome e foto"
        onPress={() => navigation.navigate('EditAccount', { mode: 'profile' })}
      />
      <Row icon="mail" title="E-mail" subtitle="Gerenciar e-mail de acesso" onPress={() => navigation.navigate('EditAccount', { mode: 'email' })} />
      <Row icon="lock" title="Senha" subtitle="Alterar senha de acesso" onPress={() => navigation.navigate('EditAccount', { mode: 'password' })} />

      <SectionLabel style={{ marginTop: 18 }}>Preferências do app</SectionLabel>
      <Row icon="moon" title="Aparência" subtitle="Escuro" onPress={() => Alert.alert('Aparência', 'Por enquanto o Tasko tem apenas o tema escuro.')} />
      <Row icon="globe" title="Idioma" subtitle="Português (Brasil)" onPress={() => Alert.alert('Idioma', 'Por enquanto o Tasko está disponível apenas em português.')} />
      <Row
        icon="bell" title="Notificações" subtitle="Receber avisos do Tasko"
        right={<Toggle value={notifications} onValueChange={setNotifications} />}
      />

      <Pressable onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 22 }}>
        <Feather name="log-out" size={16} color={colors.subtle} />
        <Text style={{ color: colors.subtle, fontSize: 14, marginLeft: 8 }}>Sair da conta</Text>
      </Pressable>
    </Screen>
  );
}
