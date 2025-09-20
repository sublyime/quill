'use client';

import { useEffect, useRef, useState } from 'react';
import type { Terminal as XTerm } from 'xterm';
import type { FitAddon } from 'xterm-addon-fit';
import type { WebLinksAddon } from 'xterm-addon-web-links';
import type { WebglAddon } from 'xterm-addon-webgl';

interface TerminalProps {
  connectionId?: string;
  onData?: (data: string) => void;
}

export function Terminal({ connectionId, onData }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load xterm styles
    if (typeof window !== 'undefined') {
      require('xterm/css/xterm.css');
    }
  }, []);

  useEffect(() => {
    if (!isClient || !terminalRef.current) return;

    const initTerminal = async () => {
      // Dynamically import terminal and addons
      const { Terminal: XTerm } = await import('xterm');
      const { FitAddon } = await import('xterm-addon-fit');
      const { WebLinksAddon } = await import('xterm-addon-web-links');
      const { WebglAddon } = await import('xterm-addon-webgl');

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

      // Initialize base addons first
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);

      // Open terminal in container
      if (terminalRef.current) {
        term.open(terminalRef.current);
      }
      
      // Try to initialize WebGL addon after terminal is opened
      let webglAddon: WebglAddon | null = null;
      try {
        webglAddon = new WebglAddon();
        term.loadAddon(webglAddon);
      } catch (e) {
        console.warn('WebGL addon initialization failed, falling back to DOM renderer:', e);
      }

      // Fit terminal to container
      fitAddon.fit();

      // Handle window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      // Handle data input
      const dataHandler = term.onData((data: string) => {
        onData?.(data);
      });

      // Write welcome message
      term.writeln('\x1b[32m Welcome to Quill Terminal \x1b[0m');
      term.writeln('\x1b[32m Connected to: ' + (connectionId || 'No connection') + '\x1b[0m');
      term.writeln('');

      xtermRef.current = term;

      return () => {
        // Cleanup in reverse order
        window.removeEventListener('resize', handleResize);
        dataHandler.dispose();
        
        // Dispose addons in reverse order
        if (webglAddon) {
          try {
            webglAddon.dispose();
          } catch (e) {
            console.warn('WebGL addon disposal failed:', e);
          }
        }
        fitAddon.dispose();
        webLinksAddon.dispose();
        
        // Finally dispose terminal
        term.dispose();
      };
    };

    // Initialize terminal and store cleanup function
    let cleanup: (() => void) | undefined;
    initTerminal().then(cleanupFn => {
      if (cleanupFn) cleanup = cleanupFn;
    });

    // Return cleanup function
    return () => {
      if (cleanup) cleanup();
    };
  }, [isClient, connectionId, onData]);

  // Method to write data to terminal
  const writeData = (data: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(data);
    }
  };

  if (!isClient) {
    return <div className="h-full w-full bg-black" />;
  }

  return (
    <div 
      ref={terminalRef} 
      className="h-full w-full bg-black"
      style={{ padding: '12px' }}
    />
  );
}