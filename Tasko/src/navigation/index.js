import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import TabBar from '../components/TabBar';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CalendarSettingsScreen from '../screens/CalendarSettingsScreen';
import FocusScreen from '../screens/FocusScreen';
import FocusSettingsScreen from '../screens/FocusSettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import EditAccountScreen from '../screens/EditAccountScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import CategoryFormScreen from '../screens/CategoryFormScreen';

const Root = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const CatStack = createNativeStackNavigator();

const stackOptions = { headerShown: false, contentStyle: { backgroundColor: colors.bg } };

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, border: colors.border, primary: colors.text },
};

// Categorias + detalhes dentro da mesma aba (a barra de abas continua visível)
function CategoriesStack() {
  return (
    <CatStack.Navigator screenOptions={{ ...stackOptions, animation: 'slide_from_right' }}>
      <CatStack.Screen name="CategoriesList" component={CategoriesScreen} />
      <CatStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    </CatStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Calendar" component={CalendarScreen} />
      <Tabs.Screen name="Categories" component={CategoriesStack} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function Navigation() {
  const { ready, data } = useApp();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  const logged = data.session && !!data.account;

  return (
    <NavigationContainer theme={navTheme}>
      <Root.Navigator screenOptions={stackOptions}>
        {!logged ? (
          <>
            <Root.Screen name="Login" component={LoginScreen} />
            <Root.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Root.Screen name="Tabs" component={MainTabs} />
            <Root.Screen name="CalendarSettings" component={CalendarSettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Root.Screen name="Focus" component={FocusScreen} options={{ animation: 'fade' }} />
            <Root.Screen name="FocusSettings" component={FocusSettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Root.Screen name="ProfileSettings" component={ProfileSettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Root.Screen name="EditAccount" component={EditAccountScreen} options={{ presentation: 'modal' }} />
            <Root.Screen name="TaskForm" component={TaskFormScreen} options={{ presentation: 'modal' }} />
            <Root.Screen name="CategoryForm" component={CategoryFormScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
