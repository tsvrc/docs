import type { ReactNode } from 'react';
import { COLOR, fieldInnerLine, LABEL_COLUMN_WIDTH } from '@site/src/components/TsWindowMock/styles';
import type { SettingsData } from '@site/src/components/TsWindowMock/data';
import type { ConfigureState } from '@site/src/components/TsWindowMock/useConfigureState';

function SectionHeader({ children }: { children: ReactNode }) {
  return <div style={{ color: COLOR.text, fontWeight: 600, marginBottom: 3 }}>{children}</div>;
}

function Toggle({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 18, cursor: 'default' }} onClick={onClick}>
      <div style={{ width: LABEL_COLUMN_WIDTH, paddingLeft: 2 }}>{label}</div>
      <div
        style={{
          width: 13,
          height: 13,
          boxSizing: 'border-box',
          background: COLOR.fieldBg,
          border: `1px solid ${COLOR.borderField}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: COLOR.textSelected,
          lineHeight: 1,
        }}>
        {checked ? '✔' : ''}
      </div>
    </div>
  );
}

export default function SettingsPanel({ state }: { state: ConfigureState }) {
  const s = state.working.settings;
  const set = (fn: (settings: SettingsData) => void) => state.mutateSettings(fn);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '10px 2px 0' }}>
      <SectionHeader>Logging</SectionHeader>
      <div style={{ display: 'flex', alignItems: 'center', height: 18 }}>
        <div style={{ width: LABEL_COLUMN_WIDTH, paddingLeft: 2 }}>World Prefix</div>
        <div
          style={{
            flex: 1,
            height: 18,
            boxSizing: 'border-box',
            background: COLOR.fieldBg,
            border: `1px solid ${COLOR.borderField}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 3px',
            ...fieldInnerLine,
          }}>
          <input
            type="text"
            value={s.worldPrefix}
            onChange={(e) => set((prev) => { prev.worldPrefix = e.target.value; })}
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none', color: COLOR.text, fontSize: 12, padding: 0 }}
          />
        </div>
      </div>

      <div style={{ height: 14 }} />
      <SectionHeader>Tsvrc Internal</SectionHeader>
      <Toggle label="Info" checked={s.internalInfo} onClick={() => set((p) => { p.internalInfo = !p.internalInfo; })} />
      <Toggle label="Warning" checked={s.internalWarning} onClick={() => set((p) => { p.internalWarning = !p.internalWarning; })} />
      <Toggle label="Error" checked={s.internalError} onClick={() => set((p) => { p.internalError = !p.internalError; })} />

      <div style={{ height: 14 }} />
      <SectionHeader>Your World</SectionHeader>
      <Toggle label="Info" checked={s.worldInfo} onClick={() => set((p) => { p.worldInfo = !p.worldInfo; })} />
      <Toggle label="Warning" checked={s.worldWarning} onClick={() => set((p) => { p.worldWarning = !p.worldWarning; })} />
      <Toggle label="Error" checked={s.worldError} onClick={() => set((p) => { p.worldError = !p.worldError; })} />

      <div style={{ height: 14 }} />
      <SectionHeader>Tree-Shaking (generate only what&apos;s used)</SectionHeader>
      <div
        style={{ display: 'flex', alignItems: 'center', height: 18, cursor: 'default' }}
        onClick={() => set((p) => { p.treeShakeUnused = !p.treeShakeUnused; })}>
        <div style={{ width: LABEL_COLUMN_WIDTH, paddingLeft: 2, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          Tree-Shake Unused Globa
        </div>
        <div
          style={{
            width: 13,
            height: 13,
            boxSizing: 'border-box',
            background: COLOR.fieldBg,
            border: `1px solid ${COLOR.borderField}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: COLOR.textSelected,
            lineHeight: 1,
          }}>
          {s.treeShakeUnused ? '✔' : ''}
        </div>
      </div>
    </div>
  );
}
