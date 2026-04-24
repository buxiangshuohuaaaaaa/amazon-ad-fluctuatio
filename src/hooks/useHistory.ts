import { useState, useEffect, useCallback } from 'react';
import type { DiagnosisRecord } from '../types';

const STORAGE_KEY = 'ad_diagnosis_history';

function loadHistory(): DiagnosisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [records, setRecords] = useState<DiagnosisRecord[]>(loadHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecord = useCallback((record: DiagnosisRecord) => {
    setRecords(prev => [record, ...prev].slice(0, 50));
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setRecords([]);
  }, []);

  return { records, addRecord, deleteRecord, clearHistory };
}
