import type { CSSProperties } from 'react';

export const COLOR = {
  chromeBg: '#282828',
  chromeTab: '#3c3c3c',
  panelBg: '#383838',
  borderDark: '#232323',
  borderField: '#202020',
  boxBg: '#404040',
  fieldBg: '#2a2a2a',
  fieldBorderTop: '#0d0d0d',
  btnBg: '#585858',
  btnDisabled: '#484848',
  tabActive: '#46607c',
  tabDivider: '#242424',
  tabStripTop: '#303030',
  rowZebraA: '#3f3f3f',
  rowZebraB: '#383838',
  selection: '#2c5d87',
  dividerLight: '#5e5e5e',
  text: '#c4c4c4',
  textBright: '#e8e8e8',
  textSelected: '#eaeaea',
  textDisabled: '#8b8b8b',
  textDim: '#9a9a9a',
  warning: '#e0b32c',
  prefabIcon: '#4c9fd4',
  focusRing: '#4a7fb5',
} as const;

export const FONT_FAMILY = "Inter, 'Segoe UI', system-ui, sans-serif";

export const fieldInnerLine: CSSProperties = { boxShadow: `inset 0 1px 0 ${COLOR.fieldBorderTop}` };

export function button(enabled: boolean, extra?: CSSProperties): CSSProperties {
  return {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    borderRadius: 2,
    cursor: 'default',
    background: enabled ? COLOR.btnBg : COLOR.btnDisabled,
    color: enabled ? COLOR.textBright : COLOR.textDisabled,
    ...extra,
  };
}

export const LABEL_COLUMN_WIDTH = 150;
