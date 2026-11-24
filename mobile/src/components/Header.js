import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../styles/theme';

const links = [
  { id: 'home', label: 'HOME' },
  { id: 'list', label: 'QUESTÕES' },
  { id: 'formulas', label: 'FÓRMULAS' },
];

export default function Header({
  active,
  onNavigate,
  onLogout,
  isAdmin = false,
}) {
  const navigation = isAdmin
    ? [...links, { id: 'admin', label: 'ADMINISTRAÇÃO' }]
    : links;

  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Text style={styles.brand}>BUSCFÍSICA</Text>
        <Image
          source={require('../assets/logo_buscfisica.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="Logo BuscFísica"
        />
      </View>

      <View style={styles.navbar}>
        {navigation.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavigate(item.id)}
            style={styles.navButton}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.navText,
              active === item.id && styles.activeText,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={onLogout}
          style={styles.navButton}
          activeOpacity={0.8}
        >
          <Text style={styles.navText}>SAIR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: colors.dark,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brand: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  navbar: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 17,
    rowGap: 12,
  },
  navButton: {
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  navText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: colors.lime,
    fontWeight: '800',
  },
});