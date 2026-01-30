interface TodoItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ id, title, completed, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
      <button
        onClick={() => onToggle(id)}
        className={`h-5 w-5 flex-shrink-0 rounded-full border-2 ${
          completed
            ? 'border-green-500 bg-green-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        aria-label={completed ? `Mark "${title}" as pending` : `Mark "${title}" as completed`}
      />
      <span
        className={`flex-1 ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}
      >
        {title}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="text-sm text-gray-400 hover:text-red-500"
        aria-label={`Delete "${title}"`}
      >
        Delete
      </button>
    </li>
  );
}
