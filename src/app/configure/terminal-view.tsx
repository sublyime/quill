'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

const generateLogLine = () => {
  const timestamp = new Date().toISOString();
  const hexData = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ');
  return `[${timestamp}] RECV: ${hexData}`;
};

export function TerminalView() {
  const [logs, setLogs] = useState<string[]>(['Welcome to the DataQuill Terminal.', 'Waiting for data...']);
  const [command, setCommand] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setLogs((prevLogs) => [...prevLogs, generateLogLine()]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newLogs = [...logs, `> ${command}`];

    if (command.toLowerCase() === 'clear') {
      setLogs(['Terminal cleared.']);
    } else if (command.toLowerCase() === 'help') {
      newLogs.push('Available commands: clear, help, pause, play');
    } else if (command.toLowerCase() === 'pause') {
        newLogs.push('Data stream paused.');
        setIsPaused(true);
    } else if (command.toLowerCase() === 'play') {
        newLogs.push('Data stream resumed.');
        setIsPaused(false);
    } 
    else {
      newLogs.push(`Command not found: ${command}`);
    }

    setLogs(newLogs);
    setCommand('');
  };

  const togglePause = () => {
    setLogs(prev => [...prev, `> ${isPaused ? 'play' : 'pause'}`, `Data stream ${isPaused ? 'resumed' : 'paused'}.`]);
    setIsPaused(!isPaused);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-[580px] max-h-[580px] bg-gray-900 text-gray-300 font-mono rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-5 w-5 text-green-400" />
          <span className="text-sm font-semibold text-white">Raw Data Stream</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-gray-700" onClick={togglePause}>
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          <span className="sr-only">{isPaused ? 'Play' : 'Pause'}</span>
        </Button>
      </div>
      <div 
        className="flex-grow p-4 overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence initial={false}>
            {logs.map((log, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs leading-relaxed"
                >
                    {log}
                </motion.div>
            ))}
        </AnimatePresence>
        <div ref={endOfLogsRef} />
      </div>
      <form onSubmit={handleCommandSubmit} className="flex items-center bg-gray-800 px-4 py-2 rounded-b-lg border-t border-gray-700">
        <ChevronRight className="h-4 w-4 text-green-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-grow bg-transparent text-gray-300 placeholder-gray-500 focus:outline-none text-sm"
          placeholder="Enter command (e.g., 'help')..."
          autoFocus
        />
      </form>
    </div>
  );
}
