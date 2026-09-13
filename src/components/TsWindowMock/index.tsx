import GroupsPanel from '@site/src/components/TsWindowMock/GroupsPanel';
import EntriesPanel from '@site/src/components/TsWindowMock/EntriesPanel';
import SettingsPanel from '@site/src/components/TsWindowMock/SettingsPanel';
import GeneratedPreview from '@site/src/components/TsWindowMock/GeneratedPreview';
import { SceneIcon } from '@site/src/components/TsWindowMock/Icons';
import { COLOR, FONT_FAMILY, fieldInnerLine } from '@site/src/components/TsWindowMock/styles';
import { SETTINGS_DESCRIPTION, TAB_CONFIG, TAB_LABELS, TABS, type RegistryTabKey } from '@site/src/components/TsWindowMock/data';
import { useConfigureState } from '@site/src/components/TsWindowMock/useConfigureState';

function WarningTriangle({ gutterWidth }: { gutterWidth: number }) {
  return (
    <div style={{ flex: 'none', width: gutterWidth, paddingTop: 1, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderBottom: `16px solid ${COLOR.warning}`,
          position: 'relative',
        }}>
        <div
          style={{
            position: 'absolute',
            left: -2,
            top: 5,
            width: 4,
            color: '#2a2a2a',
            fontSize: 10,
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1,
          }}>
          !
        </div>
      </div>
    </div>
  );
}

export default function TsWindowMock() {
  const state = useConfigureState();
  const isSettings = state.activeTab === 'settings';
  const registryTabKey = isSettings ? null : (state.activeTab as RegistryTabKey);
  const description = registryTabKey ? TAB_CONFIG[registryTabKey].description : SETTINGS_DESCRIPTION;

  return (
    <div className="not-prose my-4">
      <div className="overflow-x-auto">
        <div
          style={{
            width: 604,
            height: 625,
            minWidth: 604,
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${COLOR.borderDark}`,
            background: COLOR.panelBg,
            color: COLOR.text,
            fontSize: 12,
            lineHeight: 1,
            overflow: 'hidden',
            fontFamily: FONT_FAMILY,
            WebkitFontSmoothing: 'antialiased',
            boxShadow: '0 8px 40px rgba(0,0,0,.5)',
            cursor: 'default',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}>
          <div
            style={{
              height: 21,
              flex: 'none',
              display: 'flex',
              alignItems: 'stretch',
              background: COLOR.chromeBg,
              borderBottom: `1px solid ${COLOR.borderDark}`,
            }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 9px',
                background: COLOR.chromeTab,
                color: '#d2d2d2',
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}>
              {`Configure${state.dirty ? '*' : ''}`}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 6px', color: COLOR.text }}>
              <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                {'⋮'}
              </div>
              <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 9, height: 9, border: `1px solid ${COLOR.text}` }} />
              </div>
              <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                {'✕'}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '3px 4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: 18, flex: 'none' }}>
              <div style={{ width: 150, paddingLeft: 2, color: COLOR.text }}>Linked Scene</div>
              <div
                style={{
                  flex: 1,
                  height: 18,
                  boxSizing: 'border-box',
                  background: COLOR.chromeBg,
                  border: `1px solid ${COLOR.borderField}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '0 3px',
                }}>
                <div style={{ width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SceneIcon />
                </div>
                <div style={{ flex: 1, color: COLOR.text, fontSize: 12 }}>MyWorld</div>
                <div style={{ width: 13, height: 13, border: '1px solid #7a7a7a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: COLOR.textDim }} />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 8,
                flex: 'none',
                minHeight: 18,
                boxSizing: 'border-box',
                background: COLOR.boxBg,
                border: `1px solid ${COLOR.borderDark}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 5px',
                color: COLOR.text,
              }}>
              Tsvrc is set up.
            </div>

            <div
              style={{
                marginTop: 8,
                flex: 'none',
                display: 'flex',
                height: 18,
                borderBottom: `1px solid ${COLOR.tabDivider}`,
                borderTop: `1px solid ${COLOR.tabStripTop}`,
                boxSizing: 'content-box',
              }}>
              {TABS.map((key) => {
                const active = key === state.activeTab;
                return (
                  <div
                    key={key}
                    onClick={() => state.selectTab(key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      cursor: 'default',
                      boxSizing: 'border-box',
                      borderRight: key === 'settings' ? 0 : `1px solid ${COLOR.tabDivider}`,
                      background: active ? COLOR.tabActive : COLOR.btnBg,
                      color: active ? COLOR.textBright : '#d2d2d2',
                    }}>
                    {TAB_LABELS[key]}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 4, flex: 'none', padding: '0 5px', color: COLOR.text, fontSize: 11.5, lineHeight: '12.5px' }}>
              {description}
            </div>

            <div
              style={{
                marginTop: 8,
                flex: 'none',
                height: 16,
                boxSizing: 'border-box',
                background: COLOR.fieldBg,
                border: `1px solid ${COLOR.borderField}`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '0 7px',
                ...fieldInnerLine,
              }}>
              <div style={{ flex: 'none', width: 9, height: 9, border: '1.5px solid #8a8a8a', borderRadius: '50%', position: 'relative' }}>
                <div style={{ position: 'absolute', right: -3, bottom: -2, width: 4, height: 1.5, background: '#8a8a8a', transform: 'rotate(45deg)' }} />
              </div>
              <input
                type="text"
                value={state.search}
                onChange={(e) => state.setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none', color: COLOR.text, fontSize: 11.5, padding: 0 }}
              />
            </div>

            {isSettings && <SettingsPanel state={state} />}
            {registryTabKey && (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 8, marginTop: 6 }}>
                <GroupsPanel tabKey={registryTabKey} state={state} />
                <EntriesPanel tabKey={registryTabKey} state={state} />
              </div>
            )}

            {state.dirty && (
              <>
                <div
                  style={{
                    flex: 'none',
                    marginTop: 6,
                    background: COLOR.boxBg,
                    border: `1px solid ${COLOR.borderDark}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 7px',
                  }}>
                  <WarningTriangle gutterWidth={20} />
                  <div style={{ flex: 1, color: COLOR.text, fontSize: 11.5, lineHeight: '13px' }}>
                    You have unapplied changes. Apply them to regenerate, or discard them to revert.
                  </div>
                </div>
                <div style={{ flex: 'none', display: 'flex', gap: 4, marginTop: 4 }}>
                  <div
                    style={{ flex: 1, height: 20, background: COLOR.btnBg, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLOR.textBright, cursor: 'default' }}
                    onClick={state.apply}>
                    Apply
                  </div>
                  <div
                    style={{ flex: 1, height: 20, background: COLOR.btnBg, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLOR.textBright, cursor: 'default' }}
                    onClick={state.discard}>
                    Discard
                  </div>
                </div>
              </>
            )}

            <div
              style={{
                flex: 'none',
                height: 20,
                margin: '4px 0',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default',
                background: state.dirty ? COLOR.btnDisabled : COLOR.btnBg,
                color: state.dirty ? COLOR.textDisabled : COLOR.textBright,
              }}
              onClick={state.forceRegenerate}>
              Force Regenerate
            </div>
          </div>
        </div>
      </div>

      <GeneratedPreview registry={state.committed.registry} />
    </div>
  );
}
