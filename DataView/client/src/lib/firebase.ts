import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { DataRow } from '@/types/dashboard';

export async function connectToFirebase(projectId: string, collectionName: string): Promise<DataRow[]> {
  try {
    // Initialize Firebase with minimal config
    const firebaseConfig = {
      projectId: projectId,
    };

    const app = initializeApp(firebaseConfig, `dashboard-${Date.now()}`);
    const db = getFirestore(app);

    // Get collection data
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data: DataRow[] = [];

    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (data.length === 0) {
      throw new Error('No data found in the specified collection');
    }

    return data;
  } catch (error) {
    console.error('Firebase connection error:', error);
    throw new Error(`Failed to connect to Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function setupRealtimeListener(
  projectId: string, 
  collectionName: string, 
  callback: (data: DataRow[]) => void
) {
  // This would setup real-time listeners
  // Implementation depends on Firebase rules and permissions
  console.log('Setting up real-time listener for:', projectId, collectionName);
  // TODO: Implement real-time listeners when Firebase permissions allow
}
