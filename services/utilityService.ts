import { supabase } from '../supabaseClient';
import { Snippet, Todo } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const snippetService = {
    fetchSnippets: async () => {
        const { data, error } = await supabase.from('snippets').select('*');
        if (error) throw error;
        return toCamelCase(data) as Snippet[];
    },

    addSnippet: async (snippet: Omit<Snippet, 'id'>, userId: string) => {
        const { data, error } = await supabase.from('snippets').insert([
            toSnakeCase({ ...snippet, userId })
        ]).select();
        if (error) throw error;
        return toCamelCase(data[0]) as Snippet;
    },

    deleteSnippet: async (id: string) => {
        const { error } = await supabase.from('snippets').delete().eq('id', id);
        if (error) throw error;
    }
};

export const todoService = {
    fetchTodos: async () => {
        const { data, error } = await supabase.from('todos').select('*');
        if (error) throw error;
        return toCamelCase(data) as Todo[];
    },

    addTodo: async (text: string, userId: string) => {
        const { data, error } = await supabase.from('todos').insert([
            toSnakeCase({ text, completed: false, userId })
        ]).select();
        if (error) throw error;
        return toCamelCase(data[0]) as Todo;
    },

    toggleTodo: async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('todos').update({ completed: !currentStatus }).eq('id', id);
        if (error) throw error;
    },

    deleteTodo: async (id: string) => {
        const { error } = await supabase.from('todos').delete().eq('id', id);
        if (error) throw error;
    }
};
