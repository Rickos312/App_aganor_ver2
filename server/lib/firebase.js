import admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Configuration Firebase Admin
const firebaseConfig = {
  projectId: "erpaganor",
  // Pour la production, utilisez un fichier de clé de service
  // credential: admin.credential.cert(require('./path/to/serviceAccountKey.json'))
};

// Initialiser Firebase Admin (en mode émulateur pour le développement)
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

export const db = getFirestore();

// Fonctions utilitaires pour maintenir la compatibilité avec l'ancien code
export async function getQuery(collection, filters = {}, select = '*') {
  let query = db.collection(collection);
  
  Object.entries(filters).forEach(([key, value]) => {
    query = query.where(key, '==', value);
  });
  
  const snapshot = await query.limit(1).get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  };
}

export async function allQuery(collection, filters = {}, select = '*', orderByField = null) {
  let query = db.collection(collection);
  
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      query = query.where(key, 'in', value);
    } else {
      query = query.where(key, '==', value);
    }
  });
  
  if (orderByField) {
    if (typeof orderByField === 'string') {
      query = query.orderBy(orderByField);
    } else if (orderByField.column) {
      const direction = orderByField.ascending !== false ? 'asc' : 'desc';
      query = query.orderBy(orderByField.column, direction);
    }
  }
  
  const snapshot = await query.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function runQuery(collection, data, operation = 'insert') {
  const now = Timestamp.now();
  
  switch (operation) {
    case 'insert':
      const docData = {
        ...data,
        created_at: now,
        updated_at: now
      };
      const docRef = await db.collection(collection).add(docData);
      return {
        id: docRef.id,
        changes: 1,
        data: { id: docRef.id, ...docData }
      };
      
    case 'update':
      const { id, ...updateData } = data;
      const updateRef = db.collection(collection).doc(id);
      await updateRef.update({
        ...updateData,
        updated_at: now
      });
      
      const updatedDoc = await updateRef.get();
      return {
        id: updatedDoc.id,
        changes: 1,
        data: { id: updatedDoc.id, ...updatedDoc.data() }
      };
      
    case 'delete':
      await db.collection(collection).doc(data.id).delete();
      return {
        id: data.id,
        changes: 1,
        data: null
      };
      
    default:
      throw new Error(`Opération non supportée: ${operation}`);
  }
}

// Fonction pour exécuter des requêtes complexes
export async function complexQuery(collectionName, queryBuilder) {
  const query = queryBuilder(db.collection(collectionName));
  const snapshot = await query.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Fonction pour les requêtes avec jointures (simulation)
export async function queryWithJoins(mainCollection, mainFilters = {}, joins = []) {
  const mainDocs = await allQuery(mainCollection, mainFilters);
  
  for (const doc of mainDocs) {
    for (const join of joins) {
      const { collection: joinCollection, localField, foreignField, as } = join;
      
      if (doc[localField]) {
        const joinedDoc = await getQuery(joinCollection, { [foreignField]: doc[localField] });
        doc[as] = joinedDoc;
      }
    }
  }
  
  return mainDocs;
}

export default admin;