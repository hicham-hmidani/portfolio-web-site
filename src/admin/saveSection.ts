import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import toast from 'react-hot-toast';

export interface SectionVersion {
  id: string;
  timestamp: number;
  savedAt?: any;
  docId: string;
  data: any;
}

/**
 * Saves a section document to portfolio_content/{docId}.
 * Before writing, copies the current doc to portfolio_content/{docId}/versions/{timestamp}.
 * Maintains a maximum of 10 previous versions, deleting older ones.
 */
export async function saveSection(
  docId: string,
  data: any,
  options: { notify?: boolean; successMessage?: string } = {}
) {
  const { notify = true, successMessage = 'Changes saved successfully' } = options;

  try {
    const docRef = doc(db, 'portfolio_content', docId);

    // 1. Before writing, copy current doc to portfolio_content/{docId}/versions/{timestamp}
    try {
      const currentSnap = await getDoc(docRef);
      if (currentSnap.exists()) {
        const currentData = currentSnap.data();
        const timestamp = Date.now().toString();
        const versionRef = doc(db, 'portfolio_content', docId, 'versions', timestamp);

        // Strip previous updatedAt to preserve the exact snapshot
        const snapshotData = { ...currentData };
        delete snapshotData.updatedAt;

        await setDoc(versionRef, {
          data: snapshotData,
          timestamp: Date.now(),
          savedAt: serverTimestamp(),
          docId
        });

        // Keep the last 10 versions, delete older ones
        const versionsSnap = await getDocs(collection(db, 'portfolio_content', docId, 'versions'));
        // Sort descending by version document ID (timestamp)
        const sortedDocs = [...versionsSnap.docs].sort((a, b) => b.id.localeCompare(a.id));
        if (sortedDocs.length > 10) {
          const toDelete = sortedDocs.slice(10);
          await Promise.all(toDelete.map((d) => deleteDoc(d.ref)));
        }
      }
    } catch (archiveErr) {
      console.warn('Warning creating section version archive:', archiveErr);
    }

    // 2. Write new data with serverTimestamp
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    if (notify) {
      toast.success(successMessage);
    }
  } catch (err) {
    console.error(`Error saving section ${docId}:`, err);
    if (notify) {
      toast.error('Failed to save changes');
    }
    throw err;
  }
}

/**
 * Fetches all saved versions for a given section, sorted newest to oldest.
 */
export async function getSectionVersions(docId: string): Promise<SectionVersion[]> {
  try {
    const versionsRef = collection(db, 'portfolio_content', docId, 'versions');
    const snapshot = await getDocs(versionsRef);
    const versions: SectionVersion[] = snapshot.docs.map((d) => {
      const v = d.data();
      return {
        id: d.id,
        timestamp: v.timestamp || parseInt(d.id, 10) || Date.now(),
        savedAt: v.savedAt,
        docId: v.docId || docId,
        data: v.data || {}
      };
    });

    // Return sorted newest first
    return versions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error(`Error fetching versions for ${docId}:`, err);
    return [];
  }
}
