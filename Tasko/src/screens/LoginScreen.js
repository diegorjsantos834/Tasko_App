import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Screen, Logo, Mascot, Field, Button } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';

export default function LoginScreen({ navigation }) {
  const { signIn, resetAll } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const r = signIn(email, password);
    if (!r.ok) setError(r.error);
  };

  const forgot = () =>
    Alert.alert(
      'Esqueceu a senha?',
      'Enviamos uma mensagem para seu e-mail para que possa alterar sua senha',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Entrar com nova senha',
          style: 'destructive',
          onPress: () => {
            resetAll();
            navigation.navigate('Signup');
          },
        },
      ]
    );

  return (
    <Screen contentStyle={{ justifyContent: 'space-between' }}>
      <View>
        <Logo />
        <View style={{ alignItems: 'center', marginTop: 28, marginBottom: 28 }}>
          <Mascot size={130} />
        </View>
        <Text style={T.title}>Bom ter você de volta.</Text>
        <Text style={[T.sub, { marginTop: 8, marginBottom: 28 }]}>Entre para continuar no seu ritmo.</Text>

        <Field
          label="E-mail" placeholder="Seu e-mail" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        />
        <Field label="Senha" placeholder="Sua senha" secure value={password} onChangeText={setPassword} />

        <Pressable onPress={forgot} style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
          <Text style={T.caption}>Esqueci minha senha</Text>
        </Pressable>

        {error ? <Text style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}
        <Button title="Entrar" onPress={submit} />

        <Text style={{ color: colors.subtle, textAlign: 'center', marginTop: 22, fontSize: 14 }}>
          Ainda não tem uma conta?{' '}
          <Text style={{ color: colors.text, fontWeight: '700' }} onPress={() => navigation.navigate('Signup')}>
            Cadastre-se
          </Text>
        </Text>
      </View>

      <View style={{ alignItems: 'center', marginTop: 36 }}>
        <Text style={T.caption}>Organização é liberdade.</Text>
        <Text style={[T.caption, { fontSize: 10, marginTop: 4 }]}>VERSÃO 1.0</Text>
      </View>
    </Screen>
  );
}
