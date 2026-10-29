import test from 'node:test';
import assert from 'node:assert/strict';
import { readRecordView, markRecordViewed } from '../src/services/recordViews.js';

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values,
  };
}

test('visualização é individual por usuário, tipo e registro', () => {
  const local = storage();
  assert.equal(readRecordView('bruno', 'checklist', 'a', local), false);
  assert.equal(markRecordViewed('bruno', 'checklist', 'a', local), true);
  assert.equal(readRecordView('bruno', 'checklist', 'a', local), true);
  assert.equal(readRecordView('joao', 'checklist', 'a', local), false);
  assert.equal(readRecordView('bruno', 'notification', 'a', local), false);
  assert.equal(readRecordView('bruno', 'checklist', 'b', local), false);
});

test('visualizações independentes não sobrescrevem outros registros', () => {
  const local = storage();
  markRecordViewed('bruno', 'notification', 'a', local);
  markRecordViewed('bruno', 'notification', 'b', local);
  markRecordViewed('joao', 'notification', 'a', local);
  assert.equal(local.values.size, 3);
  assert.equal(readRecordView('bruno', 'notification', 'a', local), true);
  assert.equal(readRecordView('bruno', 'notification', 'b', local), true);
});

test('chaves não colidem com separadores nos identificadores', () => {
  const local = storage();
  markRecordViewed('a:b', 'notification', 'c', local);
  assert.equal(readRecordView('a', 'notification', 'b:c', local), false);
  assert.equal(readRecordView('a:b', 'notification', 'c', local), true);
});

test('persistência guarda somente identificadores e uma marca sem data de expiração', () => {
  const local = storage();
  markRecordViewed('user-id', 'notification', 'record-id', local);
  markRecordViewed('user-id', 'notification', 'record-id', local);
  assert.deepEqual([...local.values], [['viva.record-view.v1:user-id:notification:record-id', '1']]);
  assert.equal(readRecordView('user-id', 'notification', 'record-id', local), true);
});

test('falhas de armazenamento não confirmam persistência nem leitura', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(readRecordView('u', 'checklist', 'a', blocked), null);
  assert.equal(markRecordViewed('u', 'checklist', 'a', blocked), false);
  const full = { getItem: () => null, setItem() { throw new Error('quota'); } };
  assert.equal(markRecordViewed('u', 'checklist', 'a', full), false);
});

test('identidade ausente ou tipo desconhecido não grava nada', () => {
  const local = storage();
  assert.equal(markRecordViewed('', 'checklist', 'a', local), false);
  assert.equal(markRecordViewed('u', 'unknown', 'a', local), false);
  assert.equal(markRecordViewed('u', 'notification', '', local), false);
  assert.equal(readRecordView(null, 'checklist', 'a', local), null);
  assert.equal(local.values.size, 0);
});
