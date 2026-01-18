import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Copy, Plus, Trash2, Code2 } from 'lucide-react';

const SnippetBank: React.FC = () => {
  const { snippets, addSnippet, deleteSnippet, fetchSnippets } = useAppContext();

  useEffect(() => {
    fetchSnippets();
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('java');
  const [code, setCode] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && code) {
      addSnippet({ title, language: lang, code, tags: [] });
      setTitle('');
      setCode('');
      setShowForm(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in relative pb-6">
      <header className="flex justify-between items-end flex-wrap gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Code2 size={24} />
            </div>
            Snippet Bank
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Store reusable code snippets, rubric comments, and templates.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} /> New Snippet
        </button>
      </header>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in slide-in-from-top-4 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Snippet</h3>
            <button onClick={() => setShowForm(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Trash2 size={18} className="rotate-45" /> {/* Using Trash2 as X close icon (hack) or actually import X, but reusing Trash2 for now since it's imported, actually let's just use Text 'Cancel' below */}
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                  placeholder="e.g. Java Scanner Boilerplate"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Language</label>
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Code / Text</label>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={8}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white font-mono focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400 custom-scrollbar"
                placeholder="// Code goes here..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Save Snippet
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {snippets.map(snippet => (
          <div key={snippet.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden flex flex-col hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md group h-64">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Code2 size={16} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[150px]">{snippet.title}</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                {snippet.language}
              </span>
            </div>
            <div className="flex-1 p-0 relative group bg-slate-50 dark:bg-slate-900">
              <pre className="p-5 text-xs font-mono text-slate-600 dark:text-slate-300 overflow-auto whitespace-pre-wrap h-full custom-scrollbar leading-relaxed">
                {snippet.code}
              </pre>
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                <button
                  onClick={() => copyToClipboard(snippet.code)}
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => deleteSnippet(snippet.id)}
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {snippets.length === 0 && !showForm && (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Code2 size={40} className="opacity-50" />
            </div>
            <div>
              <p className="font-bold text-lg text-slate-600 dark:text-slate-400">Snippet bank is empty</p>
              <p className="text-sm mt-1">Add commonly used code or rubric text to get started.</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Create your first snippet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetBank;