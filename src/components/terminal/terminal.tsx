'use client';

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from 'xterm-addon-webgl';
import 'xterm/css/xterm.css';

interface TerminalProps {
  connectionId?: string;
  onData?: (data: string) => void;
}

export function Terminal({ connectionId, onData }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
        cursorAccent: '#000000',
      },
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      allowTransparency: true,
    });

    // Initialize addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const webglAddon = new WebglAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(webglAddon);

    // Open terminal in container
    term.open(terminalRef.current);
    fitAddon.fit();

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Handle data input
    term.onData((data) => {
      onData?.(data);
    });

    // Write welcome message
    term.writeln('\x1b[32m Welcome to Quill Terminal \x1b[0m');
    term.writeln('\x1b[32m Connected to: ' + (connectionId || 'No connection') + '\x1b[0m');
    term.writeln('');

    xtermRef.current = term;

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [connectionId]);

  // Method to write data to terminal
  const writeData = (data: string) => {
    xtermRef.current?.write(data);
  };

  return (
    <div 
      ref={terminalRef} 
      className="h-full w-full bg-black"
      style={{ padding: '12px' }}
    />
  );
}