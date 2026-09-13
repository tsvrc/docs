import { useCallback, useState } from 'react';
import {
  createInitialRegistryData,
  createInitialSettings,
  type RegistryTabData,
  type RegistryTabKey,
  type SettingsData,
  type TabKey,
} from '@site/src/components/TsWindowMock/data';

interface DataTree {
  registry: Record<RegistryTabKey, RegistryTabData>;
  settings: SettingsData;
}

function createInitialTree(): DataTree {
  return { registry: createInitialRegistryData(), settings: createInitialSettings() };
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function useConfigureState() {
  const [committed, setCommitted] = useState<DataTree>(() => createInitialTree());
  const [working, setWorking] = useState<DataTree>(committed);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('pool');
  const [search, setSearch] = useState('');
  const [renameFocused, setRenameFocused] = useState(false);

  const mutateTab = useCallback(
    (key: RegistryTabKey, fn: (tab: RegistryTabData) => void, markDirty = true) => {
      setWorking((prev) => {
        const next = deepClone(prev);
        fn(next.registry[key]);
        return next;
      });
      if (markDirty) setDirty(true);
    },
    [],
  );

  const mutateSettings = useCallback((fn: (s: SettingsData) => void) => {
    setWorking((prev) => {
      const next = deepClone(prev);
      fn(next.settings);
      return next;
    });
    setDirty(true);
  }, []);

  const selectTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setRenameFocused(false);
  }, []);

  const selectGroup = useCallback(
    (key: RegistryTabKey, index: number) => {
      mutateTab(
        key,
        (tab) => {
          tab.sel = index;
          tab.focused = true;
        },
        false,
      );
    },
    [mutateTab],
  );

  const toggleExpand = useCallback(
    (key: RegistryTabKey, index: number) => {
      mutateTab(key, (tab) => (tab.groups[index].expanded = !tab.groups[index].expanded), false);
    },
    [mutateTab],
  );

  const addGroup = useCallback(
    (key: RegistryTabKey) => {
      mutateTab(key, (tab) => {
        tab.groups.push({ name: 'New Group', depth: 0, expanded: true, entries: [] });
        tab.sel = tab.groups.length - 1;
        tab.focused = true;
      });
      setRenameFocused(true);
    },
    [mutateTab],
  );

  const addSubGroup = useCallback(
    (key: RegistryTabKey) => {
      mutateTab(key, (tab) => {
        const at = tab.sel;
        const parent = tab.groups[at];
        if (!parent || parent.name === '(ungrouped)') return;
        tab.groups.splice(at + 1, 0, { name: 'New Sub-group', depth: parent.depth + 1, expanded: true, entries: [] });
        tab.sel = at + 1;
      });
      setRenameFocused(true);
    },
    [mutateTab],
  );

  const deleteGroup = useCallback(
    (key: RegistryTabKey) => {
      mutateTab(key, (tab) => {
        const group = tab.groups[tab.sel];
        if (!group || group.name === '(ungrouped)') return;
        tab.groups.splice(tab.sel, 1);
        tab.sel = Math.max(0, tab.sel - 1);
      });
      setRenameFocused(false);
    },
    [mutateTab],
  );

  const renameGroup = useCallback(
    (key: RegistryTabKey, name: string) => {
      mutateTab(key, (tab) => {
        tab.groups[tab.sel].name = name;
      });
    },
    [mutateTab],
  );

  const addEntry = useCallback(
    (key: RegistryTabKey) => {
      mutateTab(key, (tab) => {
        const group = tab.groups[tab.sel];
        if (!group) return;
        group.entries.push({ icon: 'none', label: 'None (Object)', name: '' });
      });
    },
    [mutateTab],
  );

  const assignEntry = useCallback(
    (key: RegistryTabKey, entryIndex: number, icon: 'script' | 'prefab' | 'none', label: string) => {
      mutateTab(key, (tab) => {
        const entry = tab.groups[tab.sel].entries[entryIndex];
        entry.icon = icon;
        entry.label = label;
      });
    },
    [mutateTab],
  );

  const removeEntry = useCallback(
    (key: RegistryTabKey, entryIndex: number) => {
      mutateTab(key, (tab) => {
        tab.groups[tab.sel].entries.splice(entryIndex, 1);
      });
    },
    [mutateTab],
  );

  const renameEntry = useCallback(
    (key: RegistryTabKey, entryIndex: number, name: string) => {
      mutateTab(key, (tab) => {
        tab.groups[tab.sel].entries[entryIndex].name = name;
      });
    },
    [mutateTab],
  );

  const apply = useCallback(() => {
    setCommitted(working);
    setDirty(false);
    setRenameFocused(false);
  }, [working]);

  const discard = useCallback(() => {
    setWorking(committed);
    setDirty(false);
    setRenameFocused(false);
  }, [committed]);

  const forceRegenerate = useCallback(() => { }, []);

  return {
    committed,
    working,
    dirty,
    activeTab,
    search,
    renameFocused,
    setSearch,
    setRenameFocused,
    selectTab,
    selectGroup,
    toggleExpand,
    addGroup,
    addSubGroup,
    deleteGroup,
    renameGroup,
    addEntry,
    assignEntry,
    removeEntry,
    renameEntry,
    mutateSettings,
    apply,
    discard,
    forceRegenerate,
  };
}

export type ConfigureState = ReturnType<typeof useConfigureState>;
