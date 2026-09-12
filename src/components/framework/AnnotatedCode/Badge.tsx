import { colorClasses, type AnnotationColor } from '@site/src/components/framework/AnnotatedCode/annotations';

export default function Badge({ mark, color }: { mark: number; color: AnnotationColor }) {
  return (
    <span
      className={`ml-2 inline-flex h-4 w-4 -translate-y-px items-center justify-center rounded-full align-middle font-body text-[10px] leading-none font-bold text-white ${colorClasses[color].badge}`}>
      {mark}
    </span>
  );
}
