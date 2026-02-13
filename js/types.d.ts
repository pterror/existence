// types.d.ts — shared type definitions for existence

// --- NameData (from generated names.js, excluded from tsc) ---

type NamePair = [string, number];

declare const NameData: {
  first: NamePair[];
  last: NamePair[];
};

// --- Character ---

interface PersonalityParams {
  neuroticism: number;    // 0-100
  self_esteem: number;    // 0-100
  rumination: number;     // 0-100
}

interface RelationshipPerson {
  name: string;
  flavor: string;
}

interface SupervisorPerson {
  name: string;
}

interface GameCharacter {
  first_name: string;
  last_name: string;
  sleepwear: string;
  outfit_default: string;
  outfit_low_mood: string;
  outfit_messy: string;
  friend1: RelationshipPerson;
  friend2: RelationshipPerson;
  coworker1: RelationshipPerson;
  coworker2: RelationshipPerson;
  supervisor: SupervisorPerson;
  job_type: string;
  age_stage: number | string;
  personality?: PersonalityParams;
}

interface OutfitSet {
  outfit_default: string;
  outfit_low_mood: string;
  outfit_messy: string;
}

// --- Interactions ---

interface Interaction {
  id: string;
  label: string;
  location: string | null;
  available: () => boolean;
  execute: () => string;
}

// --- Screen choices (chargen) ---

interface ScreenChoice {
  label: string;
  action: () => void;
}

// --- Weighted item ---

interface WeightedItem<T> {
  weight: number;
  value: T;
}

// --- Location ---

interface LocationDef {
  name: string;
  area: string;
  connections: Record<string, number>;
}

// --- Travel result ---

interface TravelResult {
  from: string;
  to: string;
  travelTime: number;
}

// --- Connection info ---

interface ConnectionInfo {
  id: string;
  name: string;
  travelTime: number;
  area: string;
}

// --- Action log entry ---

interface ActionEntry {
  action: { type: string; id?: string; destination?: string };
  timestamp: number;
}

// --- Save data ---

interface SaveData {
  seed: number;
  character: GameCharacter | null;
  actions: ActionEntry[];
}

// --- Run records ---

interface RunRecord {
  id: string;
  seed: number;
  character: GameCharacter;
  actions: ActionEntry[];
  status: 'active';
  createdAt: number;
  lastPlayed: number;
  version: number;
}

interface RunSummary {
  id: string;
  status: 'active';
  createdAt: number;
  lastPlayed: number;
  actionCount: number;
  characterName: string;
  jobType: string;
  ageStage: string;
}

// --- UI callbacks ---

interface UICallbacks {
  onAction: (interaction: Interaction) => void;
  onMove: (destId: string) => void;
  onIdle: () => void;
  onFocusTime: () => void;
  onFocusMoney: () => void;
  onStepAway?: () => void;
}
