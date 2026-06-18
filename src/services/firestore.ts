import * as mockDb from '@/lib/mockDb'

type Unsubscribe = () => void

export interface CollectionService<T extends { id: string }> {
  subscribe: (onData: (items: T[]) => void, onError: (error: Error) => void) => Unsubscribe
  getAll: () => Promise<T[]>
  setDoc: (id: string, data: T) => Promise<void>
  update: (id: string, partial: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
  exists: () => Promise<boolean>
}

export function createCollectionService<T extends { id: string }>(
  collectionName: string,
): CollectionService<T> {
  return {
    subscribe(onData) {
      return mockDb.subscribe<T>(collectionName, onData)
    },

    async getAll() {
      return mockDb.getCollection<T>(collectionName)
    },

    async setDoc(id, data) {
      mockDb.setDoc<T>(collectionName, id, data)
    },

    async update(id, partial) {
      mockDb.updateDoc<T>(collectionName, id, partial)
    },

    async delete(id) {
      mockDb.deleteFromCollection(collectionName, id)
    },

    async exists() {
      return mockDb.getCollection(collectionName).length > 0
    },
  }
}
