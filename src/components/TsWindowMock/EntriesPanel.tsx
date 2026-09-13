import { useEffect, useRef, useState } from 'react';
import { COLOR, button, fieldInnerLine } from '@site/src/components/TsWindowMock/styles';
import { memberPreview, NULL_SLOT_HINT, TAB_CONFIG, type RegistryTabKey } from '@site/src/components/TsWindowMock/data';
import { PrefabIcon, ScriptIcon } from '@site/src/components/TsWindowMock/Icons';
import type { ConfigureState } from '@site/src/components/TsWindowMock/useConfigureState';

export default function EntriesPanel({ tabKey, state }: { tabKey: RegistryTabKey; state: ConfigureState }) {
  const config = TAB_CONFIG[tabKey];
  const tab = state.working.registry[tabKey];
  const group = tab.groups[tab.sel];
  const entries = group ? group.entries : [];
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const openEntryRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (pickerIndex === null) return;
    function handlePointerDown(e: MouseEvent) {
      if (openEntryRef.current && !openEntryRef.current.contains(e.target as Node)) {
        setPickerIndex(null);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [pickerIndex]);

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flex: 'none' }}>
        <div
          style={{
            color: COLOR.text,
            fontWeight: 600,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
          {group ? group.name : ''}
        </div>
        <div style={button(true, { width: 56, height: 18, flex: 'none' })} onClick={() => group && state.addEntry(tabKey)}>
          + Add
        </div>
      </div>

      {entries.length === 0 && (
        <div
          style={{
            marginTop: 1,
            flex: 'none',
            background: COLOR.boxBg,
            border: `1px solid ${COLOR.borderDark}`,
            padding: '3px 5px 4px',
            color: COLOR.text,
            fontSize: 11.5,
            lineHeight: '13px',
          }}>
          {config.emptyHint}
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ marginTop: 1, flex: 1, minHeight: 0, overflow: 'auto' }}>
          {entries.map((entry, index) => {
            const sub = entry.icon === 'none' ? NULL_SLOT_HINT : memberPreview(tabKey, entry, group.name);
            return (
              <div key={index} ref={index === pickerIndex ? openEntryRef : undefined}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
                  <div
                    onClick={() => setPickerIndex(pickerIndex === index ? null : index)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: 18,
                      boxSizing: 'border-box',
                      background: '#282828',
                      border: `1px solid ${COLOR.borderField}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '0 3px',
                      cursor: 'default',
                      ...fieldInnerLine,
                    }}>
                    <div style={{ width: 12, height: 12, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {entry.icon === 'prefab' && <PrefabIcon />}
                      {entry.icon === 'script' && <ScriptIcon />}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        color: COLOR.text,
                      }}>
                      {entry.label}
                    </div>
                    <div
                      style={{
                        width: 13,
                        height: 13,
                        flex: 'none',
                        border: '1px solid #7a7a7a',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <div style={{ width: 3, height: 3, borderRadius: '50%', background: COLOR.textDim }} />
                    </div>
                  </div>
                  {config.showNames && (
                    <div
                      style={{
                        width: 130,
                        flex: 'none',
                        height: 16,
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
                        value={entry.name}
                        onChange={(e) => state.renameEntry(tabKey, index, e.target.value)}
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
                  <div
                    onClick={() => state.removeEntry(tabKey, index)}
                    style={{
                      width: 18,
                      height: 18,
                      flex: 'none',
                      background: COLOR.btnBg,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: COLOR.textBright,
                      cursor: 'default',
                    }}>
                    {'✕'}
                  </div>
                </div>
                {pickerIndex === index && (
                  <div style={{ margin: '1px 22px 2px 0', background: COLOR.fieldBg, border: `1px solid ${COLOR.borderField}` }}>
                    <div
                      style={{
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px',
                        color: COLOR.textDim,
                        fontSize: 11,
                        borderBottom: `1px solid ${COLOR.borderField}`,
                      }}>
                      {config.entryIcon === 'prefab' ? 'Assign mock prefab' : 'Assign mock object'}
                    </div>
                    {config.catalog.map((name) => (
                      <div
                        key={name}
                        onClick={() => {
                          state.assignEntry(tabKey, index, config.entryIcon, name);
                          setPickerIndex(null);
                        }}
                        style={{ height: 16, display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px', cursor: 'default' }}>
                        <div style={{ width: 12, height: 12, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {config.entryIcon === 'prefab' ? <PrefabIcon /> : <ScriptIcon />}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            color: COLOR.text,
                            fontSize: 12,
                          }}>
                          {name}
                        </div>
                        <div style={{ flex: 'none', color: COLOR.textDisabled, fontSize: 11 }}>
                          {config.entryIcon === 'prefab' ? 'Prefab' : 'Scene'}
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={() => {
                        state.assignEntry(tabKey, index, 'none', 'None (Object)');
                        setPickerIndex(null);
                      }}
                      style={{ height: 16, display: 'flex', alignItems: 'center', padding: '0 6px', color: COLOR.textDim, fontSize: 12, cursor: 'default' }}>
                      None
                    </div>
                  </div>
                )}
                {sub && (
                  <div
                    style={{
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      paddingLeft: 12,
                      color: COLOR.textDim,
                      fontSize: 11,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}>
                    <div style={{ flex: 'none' }}>{'↳'}</div>
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>{sub}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
