import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the terminal component with no SSR
const TerminalClient = dynamic(
  () => import('./terminal-client').then(mod => ({ default: mod.Terminal })),
  { ssr: false }
);

interface TerminalProps {
  connectionId?: string;
  onData?: (data: string) => void;
}

export function Terminal(props: TerminalProps) {
  return <TerminalClient {...props} />;
}