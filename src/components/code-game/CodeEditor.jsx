import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function CodeEditor({ code, onChange, language, readOnly = false }) {
  return (
    <div className="relative">
      <div className="absolute top-3 right-3 px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-md font-mono">
        {language === 'python' ? 'Python' : 'C++'}
      </div>
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={cn(
          "font-mono text-sm min-h-[400px] bg-slate-900 text-green-400 border-slate-700 resize-none",
          "focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        )}
        placeholder="// Escreva seu código aqui..."
        spellCheck={false}
      />
      <div className="text-xs text-slate-500 mt-2 flex items-center gap-4">
        <span>Linhas: {code.split('\n').length}</span>
        <span>Caracteres: {code.length}</span>
      </div>
    </div>
  );
}