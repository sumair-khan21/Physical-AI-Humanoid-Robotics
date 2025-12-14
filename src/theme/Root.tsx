/**
 * Root Component - Wraps the entire Docusaurus app
 *
 * This component is automatically loaded by Docusaurus and wraps every page.
 * Perfect for adding global components like the Modern ChatWidget.
 */

import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ModernChatWidget from '../components/ChatWidget/ModernChatWidget';

export default function Root({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const backendURL = siteConfig.customFields?.backendURL as string;

  return (
    <>
      {children}
      <ModernChatWidget
        backendURL={backendURL}
        timeout={30000}
      />
    </>
  );
}
