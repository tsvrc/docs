import CodePanel from '@site/src/components/framework/AnnotatedCode/CodePanel';
import AnnotationList from '@site/src/components/framework/AnnotatedCode/AnnotationList';
import { useAnnotations } from '@site/src/components/framework/AnnotatedCode/annotations';

export default function AnnotatedCode() {
  const annotations = useAnnotations();
  return (
    <div className="max-w-md overflow-hidden rounded-lg border border-border/40 shadow-lg shadow-black/20 lg:max-w-lg">
      <CodePanel annotations={annotations} />
      <AnnotationList annotations={annotations} />
    </div>
  );
}
