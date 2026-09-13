export type TabKey = 'pool' | 'globals' | 'constructs' | 'factories' | 'settings';
export type RegistryTabKey = Exclude<TabKey, 'settings'>;
export const TABS: TabKey[] = ['pool', 'globals', 'constructs', 'factories', 'settings'];

export const TAB_LABELS: Record<TabKey, string> = {
  pool: 'Pool',
  globals: 'Globals',
  constructs: 'Constructs',
  factories: 'Factories',
  settings: 'Settings',
};

export type EntryIcon = 'script' | 'prefab' | 'none';

export interface MockEntry {
  icon: EntryIcon;
  label: string;
  name: string;
}

export interface MockGroup {
  name: string;
  depth: number;
  expanded: boolean;
  entries: MockEntry[];
}

export interface RegistryTabData {
  sel: number;
  focused: boolean;
  groups: MockGroup[];
}

export interface SettingsData {
  worldPrefix: string;
  internalInfo: boolean;
  internalWarning: boolean;
  internalError: boolean;
  worldInfo: boolean;
  worldWarning: boolean;
  worldError: boolean;
  treeShakeUnused: boolean;
}

export interface RegistryTabConfig {
  key: RegistryTabKey;
  description: string;
  emptyHint: string;
  showNames: boolean;
  entryIcon: 'script' | 'prefab';
  catalog: string[];
}

export const TAB_CONFIG: Record<RegistryTabKey, RegistryTabConfig> = {
  pool: {
    key: 'pool',
    description:
      'Register UdonSharpBehaviour prefabs to pool. The system automatically instantiates all slots, ' +
      'initializes them, and wires every [WirePool] field across your behaviours at compile time. ' +
      'No manual scene placement, no cross-behaviour drag-and-drop, and no broken references when you refactor.',
    emptyHint: 'No pooled prefabs registered yet. Add a prefab here to make it available for network-synced spawning.',
    showNames: false,
    entryIcon: 'script',
    catalog: ['PickupOrb (Pickup Orb)', 'RoundTimer (Round Timer)', 'BossController (Boss Controller)'],
  },
  globals: {
    key: 'globals',
    description:
      "Register any scene object or component as a named field on _ts. After compiling, access it from any " +
      "TsvrcBehaviour via _ts.FieldName. Example: drag your GameManager here, then use _ts.GameManager from any " +
      "behaviour. Groups are organizational by default; toggle 'Namespace with group name' on a group to prefix " +
      "its entries' member names (e.g. _ts.EnemiesSpawner).",
    emptyHint: 'No globals registered yet. Add a scene object here to expose it as a field on TsGenerated.',
    showNames: true,
    entryIcon: 'script',
    catalog: ['GameManager (Game Manager)', 'MusicManager (Music Manager)', 'SpawnPoint (Spawn Point)'],
  },
  constructs: {
    key: 'constructs',
    description:
      'Register TsvrcBehaviours that are always active in the scene, not pooled, to initialize them at startup ' +
      "(TsConstruct). The reference stays private, never reachable as _ts.Name, so there's no member name to configure.",
    emptyHint: 'No constructs registered yet. Add a TsvrcBehaviour here to initialize it at startup without exposing it on _ts.',
    showNames: false,
    entryIcon: 'script',
    catalog: ['MatchStarter (Match Starter)', 'LobbyController (Lobby Controller)', 'AudioSettings (Audio Settings)'],
  },
  factories: {
    key: 'factories',
    description:
      'Register prefabs organized into nested groups. Generates a Create{Group}{SubGroup}...{Name}(Transform parent) ' +
      'method for each entry, prefixed by its full group ancestor chain. WARNING: instantiated objects do not receive ' +
      'a VRChat network ID and cannot send or receive network events. Use Pool for networked objects.',
    emptyHint: 'No factory prefabs registered yet. Add a group on the left, then add prefabs inside it for on-demand instantiation.',
    showNames: true,
    entryIcon: 'prefab',
    catalog: ['ConfettiBurst', 'BulletTrail', 'TrailFX'],
  },
};

export const SETTINGS_DESCRIPTION =
  "Project-wide Tsvrc configuration: logging levels and tags, and tree-shaking (generate only what's used).";

export const NULL_SLOT_HINT =
  'empty - nothing assigned here (if this used to point at something, it may have been deleted)';

function script(label: string): MockEntry {
  return { icon: 'script', label, name: '' };
}
function prefab(label: string): MockEntry {
  return { icon: 'prefab', label, name: '' };
}
function group(name: string, depth: number, entries: MockEntry[] = []): MockGroup {
  return { name, depth, expanded: true, entries };
}

export function createInitialRegistryData(): Record<RegistryTabKey, RegistryTabData> {
  return {
    pool: {
      sel: 0,
      focused: true,
      groups: [group('(ungrouped)', 0, [script('EnemyController (Enemy Controller)'), script('HitEffect (Hit Effect)')])],
    },
    globals: {
      sel: 0,
      focused: true,
      groups: [
        group('(ungrouped)', 0, [script('ScoreboardAnimator (Scoreboard Animator)'), script('AudioSettings (Audio Settings)')]),
        group('UI', 0, [script('SettingsMenu (Settings Menu)')]),
        group('Overlay', 1, [script('PlayerListOverlay (Player List Overlay)')]),
      ],
    },
    constructs: {
      sel: 1,
      focused: true,
      groups: [
        group('(ungrouped)', 0, [script('HelloWorld (Bootstrap)')]),
        group('Core', 0, [script('EventRouter (Event Router)')]),
      ],
    },
    factories: {
      sel: 1,
      focused: true,
      groups: [group('(ungrouped)', 0), group('Effects', 0, [prefab('HitSparkVFX'), prefab('ScorePopup')])],
    },
  };
}

export function createInitialSettings(): SettingsData {
  return {
    worldPrefix: '',
    internalInfo: true,
    internalWarning: true,
    internalError: true,
    worldInfo: true,
    worldWarning: true,
    worldError: true,
    treeShakeUnused: false,
  };
}

export function sanitizeIdentifier(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9_]/g, '');
  return cleaned.length > 0 ? cleaned : '';
}

export function memberPreview(tabKey: RegistryTabKey, entry: MockEntry, groupName: string): string | null {
  if (entry.icon === 'none') return null;
  if (tabKey === 'globals') {
    const leaf = sanitizeIdentifier(entry.name);
    return `_ts.${leaf.length > 0 ? leaf : '<auto>'}`;
  }
  if (tabKey === 'factories') {
    const chain = groupName === '(ungrouped)' ? '' : sanitizeIdentifier(groupName);
    const leaf = sanitizeIdentifier(entry.name);
    return `Create${chain}${leaf.length > 0 ? leaf : '<auto>'}(parent)`;
  }
  return null;
}
