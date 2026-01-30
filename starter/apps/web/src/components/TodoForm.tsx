'use client';

import { useState } from 'react';

interface TodoFormProps {
  onSubmit: (title: string) => void;
  disabled?: boolean;
}

export function TodoForm({ onSubmit, disabled }: TodoFormProps) {
  const [title, setTitle] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setTitle('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        maxLength={200}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
        aria-label="New todo title"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
