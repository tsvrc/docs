import { translate } from '@docusaurus/Translate';

export default function ScrollCue() {
  return (
    <div className="flex justify-center pb-6">
      <a
        href="#why"
        aria-label={translate({ id: 'framework.hero.scrollCue', message: 'Scroll to learn more' })}
        className="animate-bounce text-fg-muted opacity-70 hover:opacity-100">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}
