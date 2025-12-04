import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import {
  LayoutDashboard,
  Layers,
  DollarSign,
  ListTodo,
  CircleUser,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../stores/ThemeContext';
import { useLanguage } from '../../stores/LanguageContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 52 + insets.bottom : 60;
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? colors.neutral[50] : colors.neutral[900],
        tabBarInactiveTintColor: isDark ? colors.neutral[500] : colors.neutral[400],
        tabBarStyle: {
          backgroundColor: isDark ? colors.neutral[900] : '#fff',
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100],
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard
              size={22}
              color={color}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stages"
        options={{
          title: t('tabs.stages'),
          tabBarIcon: ({ color, focused }) => (
            <Layers
              size={22}
              color={color}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: t('tabs.todos'),
          tabBarIcon: ({ color, focused }) => (
            <ListTodo
              size={22}
              color={color}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('tabs.expenses'),
          tabBarIcon: ({ color, focused }) => (
            <DollarSign
              size={22}
              color={color}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ color, focused }) => (
            <CircleUser
              size={22}
              color={color}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
      {/* Hidden screens accessible via navigation */}
      <Tabs.Screen
        name="suppliers"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="settings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="projects"
        options={{ href: null }}
      />
    </Tabs>
  );
}
