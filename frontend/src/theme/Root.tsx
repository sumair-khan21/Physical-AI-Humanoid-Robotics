/**
 * Docusaurus Root Component (Swizzled)
 *
 * This is a swizzled component that wraps the entire Docusaurus site.
 * We use it to inject the ChatWidget globally on all pages.
 *
 * To create this file via Docusaurus CLI:
 * npm run swizzle @docusaurus/theme-classic Root -- --wrap
 */

import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ChatWidget from '../components/ChatWidget/ChatWidget';

interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const backendURL = siteConfig.customFields?.backendURL as string | undefined;

  return (
    <>
      {children}
      <ChatWidget position="bottom-right" backendURL={backendURL} />
    </>
  );
}
