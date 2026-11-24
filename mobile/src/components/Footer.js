import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/theme';

export default function Footer({ onLogout }) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerLogo}>
        <Text style={styles.brand}>BUSCFÍSICA</Text>
        {onLogout ? (
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>SAIR</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.column}>
        <Text style={styles.heading}>CONTATO</Text>
        <Text style={styles.line}>BUSCFISICA7@GMAIL.COM</Text>
        <Text style={styles.line}>(19) 99653-1673</Text>
      </View>

      <View style={styles.column}>
        <Text style={styles.heading}>DESENVOLVEDORES</Text>
        <Text style={styles.line}>AYLA CRISTINA DA SILVA VILELA</Text>
        <Text style={styles.line}>GABRIELLA CAMACHO STAVARENGO</Text>
        <Text style={styles.line}>GUSTAVO MILLAMONTE</Text>
        <Text style={styles.line}>MARIA VITÓRIA GUEDES FERREIRA</Text>
        <Text style={styles.line}>MANUELLA DA SILVA PIVA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: colors.dark,
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 24,
  },
  footerLogo: {
    alignItems: 'center',
  },
  brand: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
    marginBottom: 10,
  },
  logoutButton: {
    padding: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  column: {
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  line: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'center',
  },
});