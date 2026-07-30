// Fila de séries registradas offline, persistida em IndexedDB. Só usado no
// client (nenhuma dessas funções roda no servidor).

const DB_NAME = 'fifty-repz-offline'
const DB_VERSION = 1
const STORE_NAME = 'pendingSets'

export interface PendingSetEntry {
  localId: string
  sessionExerciseId: string
  weightKg: number | null
  reps: number
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function queuePendingSet(entry: PendingSetEntry): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(entry)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function removePendingSet(localId: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(localId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ordenado por criação: a sincronização precisa respeitar essa ordem, já
// que o número da série é calculado no servidor pela contagem existente
export async function listPendingSets(): Promise<PendingSetEntry[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      resolve(
        (request.result as PendingSetEntry[]).sort(
          (a, b) => a.createdAt - b.createdAt,
        ),
      )
    }
    request.onerror = () => reject(request.error)
  })
}
