import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, BackHeader, Field, Button, Avatar } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';
import { pickImage } from '../utils/media';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY = {
  profile: ['Editar perfil', 'Como você quer aparecer?', 'Escolha um nome e uma foto da galeria.'],
  email: ['Gerenciar e-mail', 'Seu e-mail de acesso.', 'Confirme sua senha para trocar o e-mail.'],
  password: ['Alterar senha', 'Uma senha nova.', 'Use pelo menos 8 caracteres.'],
};

// mode: 'profile' | 'email' | 'password'
export default function EditAccountScreen({ navigation, route }) {
  const mode = route.params?.mode ?? 'profile';
  const { data, updateAccount } = useApp();
  const a = data.account;

  const [name, setName] = useState(a.name);
  const [avatar, setAvatar] = useState(a.avatar);
  const [email, setEmail] = useState(a.email);
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');

  const choosePhoto = async () => {
    const uri = await pickImage([1, 1]);
    if (uri) setAvatar(uri);
  };

  const save = () => {
    if (mode === 'profile') {
      if (!name.trim()) return setError('Escreva um nome.');
      updateAccount({ name: name.trim(), avatar });
    } else if (mode === 'email') {
      if (current !== a.password) return setError('Senha atual incorreta.');
      if (!EMAIL.test(email.trim())) return setError('Digite um e-mail válido.');
      updateAccount({ email: email.trim().toLowerCase() });
    } else {
      if (current !== a.password) return setError('Senha atual incorreta.');
      if (pw.length < 8) return setError('A nova senha precisa ter pelo menos 8 caracteres.');
      if (pw !== pw2) return setError('As senhas novas não são iguais.');
      updateAccount({ password: pw });
    }
    navigation.goBack();
  };

  const [crumb, title, sub] = COPY[mode];

  return (
    <Screen footer={<Button title="Salvar alterações" onPress={save} />}>
      <BackHeader title={crumb} icon="x" onBack={() => navigation.goBack()} />
      <Text style={T.title}>{title}</Text>
      <Text style={[T.sub, { marginTop: 8, marginBottom: 24 }]}>{sub}</Text>

      {mode === 'profile' ? (
        <>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <Avatar uri={avatar} size={116} />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <Button title="Escolher foto" icon="image" variant="ghost" onPress={choosePhoto} style={{ paddingHorizontal: 18, height: 44 }} />
              {avatar ? <Button title="Remover" variant="ghost" onPress={() => setAvatar(null)} style={{ paddingHorizontal: 18, height: 44, marginLeft: 10 }} /> : null}
            </View>
          </View>
          <Field label="Nome" value={name} onChangeText={setName} placeholder="Como podemos chamar você?" autoCapitalize="words" />
        </>
      ) : null}

      {mode === 'email' ? (
        <>
          <Field label="Novo e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <Field label="Senha atual" secure value={current} onChangeText={setCurrent} placeholder="Sua senha" />
        </>
      ) : null}

      {mode === 'password' ? (
        <>
          <Field label="Senha atual" secure value={current} onChangeText={setCurrent} placeholder="Sua senha" />
          <Field label="Nova senha" secure value={pw} onChangeText={setPw} placeholder="Crie uma senha" />
          <Field label="Confirmar nova senha" secure value={pw2} onChangeText={setPw2} placeholder="Repita a senha" />
        </>
      ) : null}

      {error ? <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text> : null}
    </Screen>
  );
}
