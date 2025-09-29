import { openDB } from "idb";
import { DataSource, DocsDataResult } from "@/types";

const DB_NAME = "docsQueryDB";
const DATA_STORE = "queryData";
const DOCS_STORE = "docsData";

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE);
      }
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE);
      }
    },
  });
}

// --- Query Data ---
export async function saveData(data: DataSource[]) {
  const db = await getDb();
  await db.put(DATA_STORE, data, "queryData");
}

export async function getData(): Promise<DataSource[] | null> {
  const db = await getDb();
  return (await db.get(DATA_STORE, "queryData")) || null;
}

export async function clearData() {
  const db = await getDb();
  await db.clear(DATA_STORE);
}

// --- Docs Data ---
export async function saveDocsData(data: DocsDataResult[]) {
  const db = await getDb();
  await db.put(DOCS_STORE, data, "docsData");
}

export async function getDocsData(): Promise<DocsDataResult[] | null> {
  const db = await getDb();
  return (await db.get(DOCS_STORE, "docsData")) || null;
}

export async function clearDocsData() {
  const db = await getDb();
  await db.delete(DOCS_STORE, "docsData");
}
