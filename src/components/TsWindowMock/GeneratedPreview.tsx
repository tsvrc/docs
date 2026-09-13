import { memberPreview, sanitizeIdentifier, type RegistryTabData, type RegistryTabKey } from '@site/src/components/TsWindowMock/data';

function typeNameOf(label: string): string {
  return label.split(' (')[0];
}

export default function GeneratedPreview({ registry }: { registry: Record<RegistryTabKey, RegistryTabData> }) {
  const lines: string[] = [];

  for (const g of registry.globals.groups) {
    for (const entry of g.entries) {
      if (entry.icon === 'none') continue;
      const preview = memberPreview('globals', entry, g.name);
      if (preview) lines.push(preview.replace('<auto>', sanitizeIdentifier(typeNameOf(entry.label))));
    }
  }
  for (const g of registry.constructs.groups) {
    for (const entry of g.entries) {
      if (entry.icon === 'none') continue;
      lines.push(`// ${typeNameOf(entry.label)}.TsStart() runs automatically at world start`);
    }
  }
  const poolTypes = new Set<string>();
  for (const g of registry.pool.groups)
    for (const entry of g.entries) if (entry.icon !== 'none') poolTypes.add(typeNameOf(entry.label));
  for (const name of poolTypes) {
    lines.push(`// ${name} is registered as poolable - declare [WirePool] on a field of this type to get an instance`);
  }
  for (const g of registry.factories.groups) {
    for (const entry of g.entries) {
      if (entry.icon === 'none') continue;
      const preview = memberPreview('factories', entry, g.name);
      if (preview) lines.push(preview.replace('<auto>', sanitizeIdentifier(entry.label)));
    }
  }

  return (
    <div className="mt-3 rounded-[2px] border border-[#2e2e2e] bg-[#262626] px-2 py-1.5 text-left">
      <div className="mb-1 text-[10px] font-semibold tracking-wide text-[#9a9a9a] uppercase">
        What&apos;s actually generated right now
      </div>
      {lines.length === 0 ? (
        <div className="text-[11px] text-[#7d7d7d]">Nothing yet. Add an entry and click Apply.</div>
      ) : (
        <pre className="m-0 overflow-x-auto text-[11px] whitespace-pre text-[#9fd88a]">{lines.join('\n')}</pre>
      )}
    </div>
  );
}
