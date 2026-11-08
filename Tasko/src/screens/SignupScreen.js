import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, Logo, Mascot, Field, Button } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T } from '../theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen({ navigation }) {
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = () => {
    const e = {};
    if (!name.trim()) e.name = 'Conte como podemos chamar você.';
    if (!EMAIL.test(email.trim())) e.email = 'Digite um e-mail válido.';
    if (password.length < 8) e.password = 'Use pelo menos 8 caracteres.';
    if (confirm !== password) e.confirm = 'As senhas não são iguais.';
    if (!accepted) e.terms = 'Aceite os termos para continuar.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const r = signUp({ name, email, password });
    if (!r.ok) setErrors({ email: r.error });
  };

  const info = (title) => Alert.alert(title, 'Este texto será exibido aqui quando o documento estiver pronto.');

  return (
    <Screen contentStyle={{ justifyContent: 'space-between' }}>
      <View>
        <Logo />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={T.title}>Seu ritmo começa aqui.</Text>
            <Text style={[T.sub, { marginTop: 8 }]}>Crie sua conta no Tasko.</Text>
          </View>
          <Mascot size={96} />
        </View>

        <Field label="Nome" placeholder="Como podemos chamar você?" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
        <Field
          label="E-mail" placeholder="Seu e-mail" value={email} onChangeText={setEmail} error={errors.email}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        />
        <Field label="Senha" placeholder="Crie uma senha" secure value={password} onChangeText={setPassword} error={errors.password} hint="Use pelo menos 8 caracteres." />
        <Field label="Confirmar senha" placeholder="Repita sua senha" secure value={confirm} onChangeText={setConfirm} error={errors.confirm} />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: errors.terms ? 6 : 20 }}>
          <Pressable
            onPress={() => setAccepted((a) => !a)}
            style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: accepted ? colors.text : colors.subtle, backgroundColor: accepted ? colors.text : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
          >
            {accepted ? <Feather name="check" size={16} color={colors.bg} /> : null}
          </Pressable>
          <Text style={{ flex: 1, color: colors.subtle, fontSize: 12 }}>
            Li e aceito os{' '}
            <Text style={{ color: colors.text, textDecorationLine: 'underline' }} onPress={() => info('Termos de uso')}>Termos de uso</Text>
            {' '}e a{' '}
            <Text style={{ color: colors.text, textDecorationLine: 'underline' }} onPress={() => info('Política de privacidade')}>Política de privacidade</Text>.
          </Text>
        </View>
        {errors.terms ? <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 14 }}>{errors.terms}</Text> : null}

        <Button title="Criar conta" onPress={submit} />
      </View>

      <Text style={{ color: colors.subtle, textAlign: 'center', marginTop: 28, fontSize: 14 }}>
        Já tem uma conta?{' '}
        <Text style={{ color: colors.text, fontWeight: '700' }} onPress={() => navigation.navigate('Login')}>Entrar</Text>
      </Text>
    </Screen>
  );
}
