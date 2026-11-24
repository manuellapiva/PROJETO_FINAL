import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Footer from '../components/Footer';
import QuestionCard from '../components/QuestionCard';
import { colors, radius } from '../styles/theme';

function FilterSelect({ title, options, selected, onSelect, getLabel, getValue, allLabel }) {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((item) => String(getValue(item)) === String(selected));
  const display = selectedOption ? getLabel(selectedOption) : allLabel;

  return (
    <>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>{title}</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setVisible(true)}>
          <Text style={styles.selectText} numberOfLines={1}>{display}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>
            <ScrollView style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  onSelect('');
                  setVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{allLabel}</Text>
              </TouchableOpacity>
              {options.map((item, index) => {
                const value = String(getValue(item));
                return (
                  <TouchableOpacity
                    key={`${value}-${index}`}
                    style={styles.modalOption}
                    onPress={() => {
                      onSelect(value);
                      setVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{getLabel(item)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setVisible(false)}>
              <Text style={styles.modalCloseText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function QuestionsScreen({
  items = [],
  vests = [],
  materias = [],
  topicos = [],
  vest,
  materia,
  topico,
  onVestChange,
  onMateriaChange,
  onTopicoChange,
  onApplyFilters,
  onClearFilters,
  onCheckAnswer,
  loading,
  error,
  onLogout,
}) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageContent}>
        <View style={styles.filters}>
          <FilterSelect
            title="Vestibular"
            options={vests}
            selected={vest}
            onSelect={onVestChange}
            getLabel={(item) => `${item.nome || 'Vestibular'}${item.sigla ? ` - ${item.sigla}` : ''}`}
            getValue={(item) => item.id}
            allLabel="Todos"
          />
          <FilterSelect
            title="Matéria"
            options={materias}
            selected={materia}
            onSelect={onMateriaChange}
            getLabel={(item) => item.nome_mat || item.nome || 'Matéria'}
            getValue={(item) => item.id_mat ?? item.id}
            allLabel="Todas"
          />
          <FilterSelect
            title="Tópico"
            options={topicos}
            selected={topico}
            onSelect={onTopicoChange}
            getLabel={(item) => item.nome_top || item.nome || 'Tópico'}
            getValue={(item) => item.id_top ?? item.id}
            allLabel="Todos"
          />

          <TouchableOpacity style={styles.searchButton} onPress={onApplyFilters}>
            <Text style={styles.searchButtonText}>BUSCAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <Text style={styles.clearButtonText}>LIMPAR FILTROS</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.countBox}>
          <Text style={styles.countText}>
            Questões exibidas: <Text style={styles.countNumber}>{items.length}</Text>
          </Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando questões...</Text>
          </View>
        ) : items.length === 0 ? (
          <Text style={styles.empty}>Nenhuma questão encontrada.</Text>
        ) : (
          items.map((question, index) => (
            <QuestionCard
              key={String(question.idq ?? index)}
              question={question}
              onCheckAnswer={onCheckAnswer}
            />
          ))
        )}
      </View>

      <Footer onLogout={onLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 30,
  },
  pageContent: {
    width: '100%',
    paddingHorizontal: 10,
  },
  filters: {
    width: '100%',
    marginTop: 25,
    marginBottom: 25,
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  filterGroup: {
    width: '100%',
    gap: 7,
  },
  filterLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  selectButton: {
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: '#d8d8d8',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: '#24142a',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  chevron: {
    color: '#24142a',
    fontSize: 20,
    marginLeft: 8,
  },
  searchButton: {
    minHeight: 45,
    borderRadius: radius.pill,
    backgroundColor: '#b658d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  countBox: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#7b2cbf',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  countText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 14,
  },
  countNumber: {
    color: '#7b2cbf',
    fontWeight: '900',
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 35,
  },
  loadingText: {
    color: colors.primary,
    marginTop: 10,
    fontWeight: '700',
  },
  errorText: { color: colors.danger, textAlign: 'center', fontWeight: '800', marginBottom: 14, paddingHorizontal: 8 },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 30,
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    maxHeight: '80%',
  },
  modalTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalOptions: {
    flexGrow: 0,
  },
  modalOption: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 15,
  },
  modalClose: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '800',
  },
});