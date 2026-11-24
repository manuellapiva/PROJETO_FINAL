import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Footer from '../components/Footer';
import { request, extractArray } from '../services/api';
import { colors, radius } from '../styles/theme';

const INITIAL_FORM = {
  idvest: '',
  id_materia: '',
  idtopico: '',
  graudif: '',
  ano: '',
  enunciado: '',
  alt_a: '',
  alt_b: '',
  alt_c: '',
  alt_d: '',
  alt_e: '',
  resp_correta: '',
  explicacao_prof: '',
  contas_url: '',
  videoaula: '',
  imagem_url: '',
  remover_imagem: false,
};

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={String(value ?? '')}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8b7d91"
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}

function SelectField({ label, value, options, onSelect, getLabel, getValue, disabled = false }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((item) => String(getValue(item)) === String(value));
  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          disabled={disabled}
          style={[styles.select, disabled && styles.disabledSelect]}
          onPress={() => setVisible(true)}
        >
          <Text style={styles.selectText} numberOfLines={1}>
            {selected ? getLabel(selected) : 'Selecione'}
          </Text>
          <Text style={styles.chevron}>⌄</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.modalList}>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={`${getValue(item)}-${index}`}
                  style={styles.modalOption}
                  onPress={() => {
                    onSelect(String(getValue(item)));
                    setVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{getLabel(item)}</Text>
                </TouchableOpacity>
              ))}
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

export default function AdminScreen({ token, onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [vestibulares, setVestibulares] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [dificuldades, setDificuldades] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const filteredTopics = useMemo(() => {
    if (!form.id_materia) return [];
    return topicos.filter(
      (topic) => String(topic.id_materia) === String(form.id_materia)
    );
  }, [topicos, form.id_materia]);

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return questions;
    return questions.filter((question) => [
      question.idq,
      question.enunciado,
      question.vestibular,
      question.sigla,
      question.materia,
      question.topico,
      question.ano,
    ].filter(Boolean).join(' ').toLowerCase().includes(term));
  }, [questions, search]);

  useEffect(() => {
    loadData();
  }, [token]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const [q, v, m, t, d] = await Promise.all([
        request('/questoes', token),
        request('/vestibulares', token),
        request('/materia', token),
        request('/topico', token),
        request('/dificuldade', token),
      ]);
      setQuestions(extractArray(q, ['questoes', 'dados']));
      setVestibulares(extractArray(v, ['vestibulares', 'dados']));
      setMaterias(extractArray(m, ['materias', 'dados']));
      setTopicos(extractArray(t, ['topicos', 'dados']));
      setDificuldades(extractArray(d, ['dificuldades', 'dados']));
    } catch (err) {
      setError(err.message || 'Erro ao carregar os dados do painel.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function clearForm() {
    setForm(INITIAL_FORM);
    setEditing(null);
  }

  async function prepareEdit(id) {
    try {
      setError('');
      setMessage('');
      const data = await request(`/questoes/${id}`, token);
      const topic = topicos.find((item) => String(item.id_top) === String(data.idtopico));
      setForm({
        ...INITIAL_FORM,
        idvest: String(data.idvest || ''),
        id_materia: String(topic?.id_materia || ''),
        idtopico: String(data.idtopico || ''),
        graudif: String(data.graudif || ''),
        ano: String(data.ano || ''),
        enunciado: data.enunciado || '',
        alt_a: data.alt_a || '',
        alt_b: data.alt_b || '',
        alt_c: data.alt_c || '',
        alt_d: data.alt_d || '',
        alt_e: data.alt_e || '',
        resp_correta: data.resp_correta || '',
        explicacao_prof: data.explicacao_prof || '',
        contas_url: data.contas_url || '',
        videoaula: data.videoaula || '',
        imagem_url: data.imagem_url || '',
      });
      setEditing(id);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar a questão.');
    }
  }

  async function saveQuestion() {
    setError('');
    setMessage('');

    if (!form.idvest || !form.id_materia || !form.idtopico || !form.graudif) {
      setError('Selecione o vestibular, a matéria, o tópico e a dificuldade.');
      return;
    }
    if (!form.enunciado.trim() || !form.resp_correta.trim()) {
      setError('Preencha o enunciado e a resposta correta.');
      return;
    }

    const body = new FormData();
    [
      'idvest', 'idtopico', 'graudif', 'ano', 'enunciado',
      'alt_a', 'alt_b', 'alt_c', 'alt_d', 'alt_e',
      'resp_correta', 'explicacao_prof', 'contas_url',
      'videoaula', 'imagem_url',
    ].forEach((key) => body.append(key, String(form[key] ?? '')));
    body.append('remover_imagem', form.remover_imagem ? 'true' : 'false');

    try {
      setSaving(true);
      const path = editing ? `/questoes/${editing}` : '/questoes';
      const result = await request(path, token, {
        method: editing ? 'PUT' : 'POST',
        body,
      });
      setMessage(result?.mensagem || (editing
        ? 'Questão atualizada com sucesso!'
        : 'Questão cadastrada com sucesso!'));
      clearForm();
      await loadData();
    } catch (err) {
      setError(err.message || 'Não foi possível salvar a questão.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(id) {
    const execute = async () => {
      try {
        setError('');
        setMessage('');
        const result = await request(`/questoes/${id}`, token, { method: 'DELETE' });
        setMessage(result?.mensagem || 'Questão excluída com sucesso!');
        if (String(editing) === String(id)) clearForm();
        await loadData();
      } catch (err) {
        setError(err.message || 'Não foi possível excluir a questão.');
      }
    };

    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Tem certeza de que deseja excluir a questão ${id}? Essa ação não poderá ser desfeita.`)) {
        await execute();
      }
      return;
    }

    Alert.alert(
      'Excluir questão',
      `Tem certeza de que deseja excluir a questão ${id}? Essa ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: execute },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageContent}>
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={styles.eyebrow}>ÁREA RESTRITA</Text>
            <Text style={styles.title}>Painel administrativo</Text>
            <Text style={styles.subtitle}>Gerencie as questões disponíveis no BuscFísica.</Text>
          </View>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>QUESTÕES CADASTRADAS</Text>
            <Text style={styles.summaryNumber}>{questions.length}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorBox}>{error}</Text> : null}
        {message ? <Text style={styles.successBox}>{message}</Text> : null}

        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>{editing ? 'EDIÇÃO' : 'NOVO CADASTRO'}</Text>
              <Text style={styles.panelTitle}>{editing ? `Editar questão #${editing}` : 'Cadastrar questão'}</Text>
            </View>
            {editing ? (
              <TouchableOpacity onPress={clearForm}>
                <Text style={styles.cancelText}>Cancelar edição</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <SelectField
            label="Vestibular *"
            value={form.idvest}
            options={vestibulares}
            getLabel={(item) => `${item.nome || 'Vestibular'}${item.sigla ? ` (${item.sigla})` : ''}`}
            getValue={(item) => item.id}
            onSelect={(value) => updateField('idvest', value)}
          />
          <SelectField
            label="Matéria *"
            value={form.id_materia}
            options={materias}
            getLabel={(item) => item.nome_mat || item.nome || 'Matéria'}
            getValue={(item) => item.id_mat ?? item.id}
            onSelect={(value) => setForm((current) => ({ ...current, id_materia: value, idtopico: '' }))}
          />
          <SelectField
            label="Tópico *"
            value={form.idtopico}
            options={filteredTopics}
            getLabel={(item) => item.nome_top || item.nome || 'Tópico'}
            getValue={(item) => item.id_top ?? item.id}
            onSelect={(value) => updateField('idtopico', value)}
            disabled={!form.id_materia}
          />
          <SelectField
            label="Dificuldade *"
            value={form.graudif}
            options={dificuldades}
            getLabel={(item) => item.grau || item.nome || 'Dificuldade'}
            getValue={(item) => item.id_d ?? item.id}
            onSelect={(value) => updateField('graudif', value)}
          />

          <Field label="Ano" value={form.ano} onChangeText={(value) => updateField('ano', value)} placeholder="Ex.: 2025" keyboardType="numeric" />
          <Field label="Enunciado *" value={form.enunciado} onChangeText={(value) => updateField('enunciado', value)} placeholder="Digite o enunciado completo da questão..." multiline />
          <View style={styles.alternativesPanel}>
            <Text style={styles.alternativesTitle}>Alternativas</Text>
            {['a', 'b', 'c', 'd', 'e'].map((letter) => (
              <Field
                key={letter}
                label={`Alternativa ${letter.toUpperCase()}${letter !== 'e' ? ' *' : ''}`}
                value={form[`alt_${letter}`]}
                onChangeText={(value) => updateField(`alt_${letter}`, value)}
                placeholder={`Digite a alternativa ${letter.toUpperCase()}...`}
                multiline
              />
            ))}
          </View>
          <Field label="Resposta correta *" value={form.resp_correta} onChangeText={(value) => updateField('resp_correta', value)} placeholder="Ex.: A) 25 m/s" />
          <Text style={styles.helper}>Informe a letra e o conteúdo da alternativa correta.</Text>
          <Field label="Explicação do professor" value={form.explicacao_prof} onChangeText={(value) => updateField('explicacao_prof', value)} placeholder="Explique a resolução da questão..." multiline />
          <Field label="Link dos cálculos" value={form.contas_url} onChangeText={(value) => updateField('contas_url', value)} placeholder="https://..." />
          <Field label="Link da videoaula" value={form.videoaula} onChangeText={(value) => updateField('videoaula', value)} placeholder="https://..." />
          <Field label="URL da imagem da questão" value={form.imagem_url} onChangeText={(value) => updateField('imagem_url', value)} placeholder="https://... ou /uploads/arquivo.png" />

          <Text style={styles.helper}>
            No app, informe o endereço da imagem já hospedada. O envio de arquivo de imagem pelo seletor do aparelho não está incluído nesta versão.
          </Text>

          {form.imagem_url ? (
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => updateField('remover_imagem', !form.remover_imagem)}
            >
              <View style={[styles.checkbox, form.remover_imagem && styles.checkboxChecked]}>
                {form.remover_imagem ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <Text style={styles.removeImageText}>Remover imagem atual</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveQuestion}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.saveButtonText}>
                {editing ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR QUESTÃO'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearForm} disabled={saving}>
            <Text style={styles.clearButtonText}>LIMPAR CAMPOS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.eyebrow}>GERENCIAMENTO</Text>
          <Text style={styles.panelTitle}>Questões cadastradas</Text>
          <Field
            label="Buscar questão"
            value={search}
            onChangeText={setSearch}
            placeholder="Enunciado, vestibular, matéria ou ID..."
          />
          <Text style={styles.resultCount}>{filteredQuestions.length} resultado(s)</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 25 }} />
          ) : filteredQuestions.length === 0 ? (
            <Text style={styles.empty}>Nenhuma questão encontrada.</Text>
          ) : filteredQuestions.map((question) => (
            <View key={String(question.idq)} style={styles.questionItem}>
              <Text style={styles.questionId}>QUESTÃO #{question.idq}</Text>
              <Text style={styles.questionText}>
                {String(question.enunciado || '').length > 180
                  ? `${String(question.enunciado).slice(0, 180)}...`
                  : question.enunciado}
              </Text>
              <View style={styles.tags}>
                {[question.sigla || question.vestibular, question.materia, question.topico, question.dificuldade, question.ano]
                  .filter(Boolean).map((tag, index) => (
                    <Text key={`${tag}-${index}`} style={styles.tag}>{String(tag)}</Text>
                  ))}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={() => prepareEdit(question.idq)}>
                  <Text style={styles.actionText}>EDITAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteQuestion(question.idq)}>
                  <Text style={styles.deleteText}>EXCLUIR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Footer onLogout={onLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 30 },
  pageContent: { width: '100%', paddingHorizontal: 15 },
  heading: { gap: 18, marginBottom: 25 },
  headingText: { flex: 1 },
  eyebrow: { color: colors.lilac, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.primary, fontSize: 32, fontWeight: '900', marginTop: 7 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 5 },
  summary: { backgroundColor: colors.primary, borderRadius: 18, padding: 18, alignItems: 'center' },
  summaryLabel: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  summaryNumber: { color: '#fff', fontSize: 38, fontWeight: '900', marginTop: 5 },
  errorBox: { color: '#9b2525', backgroundColor: '#ffe5e2', borderColor: '#f3b9b2', borderWidth: 1, padding: 14, borderRadius: 12, marginBottom: 18, fontWeight: '700' },
  successBox: { color: '#216b38', backgroundColor: '#e3f5e8', borderColor: '#b7e2c2', borderWidth: 1, padding: 14, borderRadius: 12, marginBottom: 18, fontWeight: '700' },
  panel: { backgroundColor: '#fff', borderRadius: 18, padding: 17, marginBottom: 24, elevation: 2 },
  sectionHeader: { gap: 12, marginBottom: 22 },
  panelTitle: { color: colors.primary, fontSize: 22, fontWeight: '900', marginTop: 6, marginBottom: 18 },
  cancelText: { color: colors.primary, fontWeight: '800', paddingVertical: 6 },
  field: { marginBottom: 17 },
  label: { color: colors.primary, fontSize: 14, fontWeight: '800', marginBottom: 8 },
  input: { width: '100%', borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, color: colors.text, backgroundColor: '#faf8fb', fontSize: 15, minHeight: 47 },
  textarea: { minHeight: 90, paddingTop: 12 },
  select: { width: '100%', minHeight: 47, borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 13, backgroundColor: '#faf8fb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  disabledSelect: { opacity: 0.5 },
  selectText: { color: colors.text, flex: 1, fontSize: 15 },
  chevron: { color: colors.primary, fontSize: 20, marginLeft: 8 },
  helper: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -8, marginBottom: 15 },
  alternativesPanel: { backgroundColor: '#f8f3fa', borderLeftWidth: 5, borderLeftColor: colors.lilac, borderRadius: 14, padding: 13, marginBottom: 16 },
  alternativesTitle: { color: colors.primary, fontSize: 18, fontWeight: '900', marginBottom: 15 },
  removeImage: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary },
  checkMark: { color: '#fff', fontWeight: '900' },
  removeImageText: { color: colors.danger, fontWeight: '700', flex: 1 },
  saveButton: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  clearButton: { backgroundColor: '#e9dcef', borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  clearButtonText: { color: colors.primary, fontWeight: '900', fontSize: 14 },
  disabledButton: { opacity: 0.6 },
  resultCount: { color: colors.muted, fontSize: 13, marginBottom: 15, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.textSecondary, paddingVertical: 24 },
  questionItem: { backgroundColor: '#f8f3fa', borderWidth: 1, borderColor: '#eadced', borderRadius: 15, padding: 15, marginBottom: 14 },
  questionId: { color: colors.lilac, fontSize: 12, fontWeight: '900', marginBottom: 8 },
  questionText: { color: '#32133b', fontSize: 15, lineHeight: 22, fontWeight: '700', marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { color: colors.primary, backgroundColor: '#e8d6ee', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6, fontSize: 11, fontWeight: '700', overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 9, marginTop: 14 },
  editButton: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.pill, padding: 12, alignItems: 'center' },
  deleteButton: { flex: 1, backgroundColor: '#ffe5e2', borderRadius: radius.pill, padding: 12, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  deleteText: { color: colors.danger, fontWeight: '900', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, maxHeight: '80%' },
  modalTitle: { color: colors.primary, fontSize: 20, fontWeight: '900', marginBottom: 12 },
  modalList: { flexGrow: 0 },
  modalOption: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOptionText: { color: colors.text, fontSize: 15 },
  modalClose: { marginTop: 12, backgroundColor: colors.primary, borderRadius: radius.pill, padding: 12, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '800' },
});
