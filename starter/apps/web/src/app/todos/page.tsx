'use client';

import { useGetTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/lib/api/todos';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';

export default function TodosPage() {
  const { data, isLoading, error } = useGetTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <span className="text-gray-500">Loading todos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Failed to load todos: {error.message}</p>
      </div>
    );
  }

  const todos = data?.data ?? [];

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-2xl font-bold">Todos</h1>
      <div className="mb-6">
        <TodoForm
          onSubmit={(title) => createTodo.mutate({ title })}
          disabled={createTodo.isPending}
        />
      </div>
      <TodoList
        todos={todos}
        onToggle={(id) => {
          const todo = todos.find((t) => t.id === id);
          if (todo) {
            updateTodo.mutate({ id, completed: !todo.completed });
          }
        }}
        onDelete={(id) => deleteTodo.mutate(id)}
      />
    </main>
  );
}
