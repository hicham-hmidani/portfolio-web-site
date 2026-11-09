import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

export function useSectionDoc<T>(docId: string, defaults: T) {
  const [data, setData] = useState<T>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'portfolio_content', docId), (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        setData({ ...defaults, ...remoteData });
      } else {
        setData(defaults);
      }
      setLoading(false);
    }, (err) => {
      console.error(`Error loading section doc ${docId}:`, err);
      setData(defaults);
      setLoading(false);
    });

    return () => unsub();
  }, [docId]);

  return { data, loading };
}
