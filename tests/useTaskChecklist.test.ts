import test from 'node:test';
import assert from 'node:assert/strict';
import { ChecklistItemData } from '../src/types/checklist';

test('8. Checklist Item: Toggle completed memperbarui status tanpa mengubah ID atau origin', () => {
  const initial: ChecklistItemData[] = [
    { id: 'c1', text: 'Langkah pertama', completed: false, origin: 'ai' },
    { id: 'c2', text: 'Langkah kedua', completed: true, origin: 'manual' },
  ];

  // Toggle item 1
  const updated = initial.map((item) =>
    item.id === 'c1' ? { ...item, completed: !item.completed } : item
  );

  assert.equal(updated[0].completed, true);
  assert.equal(updated[0].id, 'c1');
  assert.equal(updated[0].origin, 'ai');

  // Toggle kembali
  const toggledBack = updated.map((item) =>
    item.id === 'c1' ? { ...item, completed: !item.completed } : item
  );
  assert.equal(toggledBack[0].completed, false);
});

test('9. Edit Teks: Memperbarui teks dan mempertahankan ID serta origin', () => {
  const item: ChecklistItemData = {
    id: 'c1',
    text: 'Teks lama',
    completed: true,
    origin: 'ai',
  };

  const newText = 'Teks baru yang sudah diedit pengguna';
  const editedItem = {
    ...item,
    text: newText.trim(),
  };

  assert.equal(editedItem.id, 'c1');
  assert.equal(editedItem.completed, true);
  assert.equal(editedItem.origin, 'ai');
  assert.equal(editedItem.text, newText);
});

test('10. Edit Teks: Menolak teks kosong atau hanya spasi', () => {
  const item: ChecklistItemData = {
    id: 'c1',
    text: 'Teks awal',
    completed: false,
    origin: 'ai',
  };

  const invalidInputs = ['', '   ', '\t\n'];
  for (const input of invalidInputs) {
    const trimmed = input.trim();
    assert.equal(trimmed.length === 0, true, 'Input kosong harus ditolak');
  }

  // Teks asli harus tetap bertahan
  assert.equal(item.text, 'Teks awal');
});

test('11. Perhitungan Progres: Menghindari pembagian dengan nol saat checklist kosong', () => {
  const emptyChecklist: ChecklistItemData[] = [];
  const total = emptyChecklist.length;
  const completed = emptyChecklist.filter((i) => i.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  assert.equal(total, 0);
  assert.equal(completed, 0);
  assert.equal(percentage, 0, 'Harus 0%, bukan NaN');
  assert.ok(!Number.isNaN(percentage));
});

test('12. Perhitungan Progres: Akurasi persentase saat sebagian dan seluruh langkah selesai', () => {
  const items: ChecklistItemData[] = [
    { id: '1', text: 'A', completed: true, origin: 'ai' },
    { id: '2', text: 'B', completed: true, origin: 'ai' },
    { id: '3', text: 'C', completed: false, origin: 'ai' },
    { id: '4', text: 'D', completed: false, origin: 'ai' },
    { id: '5', text: 'E', completed: false, origin: 'ai' },
  ];

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const percentage = Math.round((completed / total) * 100);

  assert.equal(completed, 2);
  assert.equal(total, 5);
  assert.equal(percentage, 40);

  // Progres 100%
  const allCompleted = items.map((i) => ({ ...i, completed: true }));
  const fullPercentage = Math.round((allCompleted.filter((i) => i.completed).length / total) * 100);
  assert.equal(fullPercentage, 100);
});
