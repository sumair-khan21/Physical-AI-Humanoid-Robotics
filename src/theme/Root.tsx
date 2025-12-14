/**
 * Root Component - Wraps the entire Docusaurus app
 *
 * This component is automatically loaded by Docusaurus and wraps every page.
 * Perfect for adding global components like the ChatWidget.
 */

import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ChatWidget from '../components/ChatWidget/ChatWidget';

export default function Root({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const backendURL = siteConfig.customFields?.backendURL as string;

  return (
    <>
      {children}
      <ChatWidget
        backendURL={backendURL}
        position="bottom-right"
        initialCollapsed={true}
        timeout={30000}
      />
    </>
  );
}
