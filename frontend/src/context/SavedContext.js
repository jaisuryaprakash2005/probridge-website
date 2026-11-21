import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSaved, toggleSaved } from '../services/api';
import { useAuth } from './AuthContext';

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSaved = useCallback(() => {
    if (!user) {
      setSavedIds(new Set());
      setSavedList([]);
      setLoading(false);
      return Promise.resolve([]);
    }

    setLoading(true);
    return getSaved()
      .then(({ data }) => {
        const list = data?.results || data?.properties || [];
        const rawIds = Array.isArray(data?.savedIds) && data.savedIds.length > 0
          ? data.savedIds
          : list.map(p => p.id || p._id);

        const nextSet = new Set(rawIds.map(String));
        setSavedIds(nextSet);
        setSavedList(list);
        return list;
      })
      .catch((err) => {
        console.warn('[Website SavedContext] Fetch saved error:', err);
        return [];
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const isSaved = useCallback((id) => {
    if (!id) return false;
    return savedIds.has(String(id));
  }, [savedIds]);

  const toggle = useCallback(async (property) => {
    const id = String(property.id || property._id);
    const willBeSaved = !savedIds.has(id);

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (willBeSaved) next.add(id);
      else next.delete(id);
      return next;
    });

    setSavedList(prev => {
      if (willBeSaved) return [property, ...prev.filter(p => String(p.id || p._id) !== id)];
      return prev.filter(p => String(p.id || p._id) !== id);
    });

    try {
      await toggleSaved(id);
    } catch (err) {
      // Revert on failure
      setSavedIds(prev => {
        const next = new Set(prev);
        if (willBeSaved) next.delete(id);
        else next.add(id);
        return next;
      });
      setSavedList(prev => {
        if (willBeSaved) return prev.filter(p => String(p.id || p._id) !== id);
        return [property, ...prev];
      });
    }
  }, [savedIds]);

  return (
    <SavedContext.Provider value={{ isSaved, toggle, savedIds, savedList, refreshSaved, loading }}>
      {children}
    </SavedContext.Provider>
  );
}

export const useSaved = () => useContext(SavedContext);
