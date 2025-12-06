import type { CompartmentStatus } from "../domain/types";

const SNAPSHOT_KEY = "beerbuddy.history.sensorSnapshot.v1";
const RESTOCKS_KEY = "beerbuddy.history.sensorRestocks.v1";
const RESTOCK_THRESHOLD = 0.25; // ignore sensor noise smaller than a quarter unit
const RETENTION_DAYS = 120;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

interface SensorSnapshot {
  recordedAt: string;
  unitsByCompartment: Record<number, number>;
}

export interface SensorRestockRecord {
  id: string;
  compartmentId: number;
  units: number;
  timestamp: string;
}

export function loadSensorRestockRecords(): SensorRestockRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RESTOCKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SensorRestockRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidRecord);
  } catch {
    return [];
  }
}

export function syncSensorRestockRecords(
  compartments: CompartmentStatus[],
  now: Date = new Date(),
): SensorRestockRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  const snapshot = loadSnapshot();
  const restocks = pruneOldRecords(loadSensorRestockRecords(), now);
  const nowIso = now.toISOString();

  const nextSnapshot: SensorSnapshot = {
    recordedAt: nowIso,
    unitsByCompartment: {},
  };

  for (const compartment of compartments) {
    const safeCurrent = toNumber(compartment.currentUnits);
    nextSnapshot.unitsByCompartment[compartment.id] = safeCurrent;
    const previousUnits = snapshot?.unitsByCompartment?.[compartment.id];
    if (typeof previousUnits !== "number") {
      continue;
    }

    const delta = roundUnits(safeCurrent - previousUnits);
    if (delta >= RESTOCK_THRESHOLD) {
      restocks.push({
        id: `sensor-restock-${compartment.id}-${now.getTime()}`,
        compartmentId: compartment.id,
        units: delta,
        timestamp: nowIso,
      });
    }
  }

  saveSnapshot(nextSnapshot);
  saveRestockRecords(restocks);

  return restocks;
}

export function filterRestockRecords(
  records: SensorRestockRecord[],
  fromIso?: string,
  toIso?: string,
): SensorRestockRecord[] {
  const fromTs = fromIso ? Date.parse(fromIso) : Number.NEGATIVE_INFINITY;
  const toTs = toIso ? Date.parse(toIso) : Number.POSITIVE_INFINITY;
  return records.filter((record) => {
    const ts = Date.parse(record.timestamp);
    if (Number.isNaN(ts)) return false;
    return ts >= fromTs && ts < toTs;
  });
}

function pruneOldRecords(records: SensorRestockRecord[], now: Date): SensorRestockRecord[] {
  const cutoff = now.getTime() - RETENTION_MS;
  return records.filter((record) => {
    const ts = Date.parse(record.timestamp);
    if (Number.isNaN(ts)) {
      return false;
    }
    return ts >= cutoff;
  });
}

function isValidRecord(candidate: SensorRestockRecord): candidate is SensorRestockRecord {
  return (
    candidate != null &&
    typeof candidate === "object" &&
    typeof candidate.id === "string" &&
    typeof candidate.timestamp === "string" &&
    typeof candidate.compartmentId === "number" &&
    typeof candidate.units === "number" &&
    Number.isFinite(candidate.units)
  );
}

function loadSnapshot(): SensorSnapshot | null {
  if (!canUseStorage()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SensorSnapshot;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      recordedAt: typeof parsed.recordedAt === "string" ? parsed.recordedAt : new Date(0).toISOString(),
      unitsByCompartment: typeof parsed.unitsByCompartment === "object" && parsed.unitsByCompartment
        ? parsed.unitsByCompartment
        : {},
    };
  } catch {
    return null;
  }
}

function saveSnapshot(snapshot: SensorSnapshot) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures (e.g., quota exceeded)
  }
}

function saveRestockRecords(records: SensorRestockRecord[]) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(RESTOCKS_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage failures
  }
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function toNumber(value: unknown): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) {
    return 0;
  }
  return numberValue;
}

function roundUnits(units: number): number {
  return Math.round(units * 100) / 100;
}
