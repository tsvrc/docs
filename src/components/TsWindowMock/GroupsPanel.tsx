import { COLOR, button } from '@site/src/components/TsWindowMock/styles';
import type { RegistryTabKey } from '@site/src/components/TsWindowMock/data';
import type { ConfigureState } from '@site/src/components/TsWindowMock/useConfigureState';

interface Row {
  index: number;
  name: string;
  depth: number;
  count: number;
  hasKids: boolean;
  expanded: boolean;
}

function buildVisibleRows(groups: { name: string; depth: number; expanded: boolean; entries: unknown[] }[]): Row[] {
  const rows: Row[] = [];
  let hideBelowDepth: number | null = null;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (hideBelowDepth !== null) {
      if (g.depth > hideBelowDepth) continue;
      hideBelowDepth = null;
    }
    const next = groups[i + 1];
    const hasKids = !!next && next.depth > g.depth;
    rows.push({ index: i, name: g.name, depth: g.depth, count: g.entries.length, hasKids, expanded: g.expanded });
    if (hasKids && !g.expanded) hideBelowDepth = g.depth;
  }
  return rows;
}

export default function GroupsPanel({ tabKey, state }: { tabKey: RegistryTabKey; state: ConfigureState }) {
  const tab = state.working.registry[tabKey];
  const selectedGroup = tab.groups[tab.sel];
  const canActOnSelection = !!selectedGroup && selectedGroup.name !== '(ungrouped)';

  const query = state.search.trim().toLowerCase();
  const rows = query
    ? tab.groups
      .map((g, index) => ({
        index,
        name: g.name,
        depth: g.depth,
        count: g.entries.length,
        hasKids: false,
        expanded: g.expanded,
      }))
      .filter((r) => r.name.toLowerCase().includes(query))
    : buildVisibleRows(tab.groups);

  return (
    <div style={{ width: 207, flex: 'none', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          height: 18,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 2,
          color: COLOR.text,
          fontWeight: 600,
          flex: 'none',
        }}>
        Groups
      </div>
      <div style={{ display: 'flex', gap: 4, flex: 'none', marginTop: 1 }}>
        <div style={button(true, { width: 57, height: 18 })} onClick={() => state.addGroup(tabKey)}>
          + Group
        </div>
        <div
          style={button(canActOnSelection, { width: 84, height: 18 })}
          onClick={() => canActOnSelection && state.addSubGroup(tabKey)}>
          + Sub-group
        </div>
        <div
          style={button(canActOnSelection, { width: 56, height: 18 })}
          onClick={() => canActOnSelection && state.deleteGroup(tabKey)}>
          Delete
        </div>
      </div>
      {canActOnSelection && (
        <div
          style={{
            marginTop: 5,
            flex: 'none',
            height: 18,
            boxSizing: 'border-box',
            background: COLOR.fieldBg,
            display: 'flex',
            alignItems: 'center',
            padding: '0 3px',
            border: `1px solid ${state.renameFocused ? COLOR.focusRing : COLOR.borderField}`,
          }}>
          <input
            type="text"
            value={selectedGroup.name}
            onChange={(e) => state.renameGroup(tabKey, e.target.value)}
            onFocus={() => state.setRenameFocused(true)}
            onBlur={() => state.setRenameFocused(false)}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 0,
              outline: 'none',
              color: COLOR.text,
              fontSize: 12,
              padding: 0,
            }}
          />
        </div>
      )}
      <div style={{ height: 1, background: COLOR.dividerLight, marginTop: 11, flex: 'none' }} />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          background: `repeating-linear-gradient(to bottom, ${COLOR.rowZebraA} 0 16px, ${COLOR.rowZebraB} 16px 32px)`,
        }}>
        {rows.map((row) => {
          const selected = row.index === tab.sel;
          const highlighted = selected && tab.focused;
          return (
            <div
              key={row.index}
              onClick={() => state.selectGroup(tabKey, row.index)}
              style={{
                height: 16,
                display: 'flex',
                alignItems: 'center',
                cursor: 'default',
                fontSize: 12,
                background: highlighted ? COLOR.selection : 'transparent',
                paddingLeft: 3 + row.depth * 13,
              }}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (row.hasKids) state.toggleExpand(tabKey, row.index);
                }}
                style={{
                  width: 12,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  color: COLOR.text,
                  visibility: row.hasKids ? 'visible' : 'hidden',
                }}>
                {row.expanded ? '▼' : '▶'}
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  color: highlighted ? COLOR.textSelected : COLOR.text,
                }}>
                {row.name}
                {row.count > 0 ? ` (${row.count})` : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
