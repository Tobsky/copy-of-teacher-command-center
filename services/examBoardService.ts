import { supabase } from '../supabaseClient';
import { ExamBoard } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const examBoardService = {
    fetchExamBoards: async () => {
        const { data, error } = await supabase.from('exam_boards').select('*');
        if (error) throw error;
        return toCamelCase(data) as ExamBoard[];
    },

    addExamBoard: async (board: Omit<ExamBoard, 'id'>, userId: string): Promise<ExamBoard> => {
        const { data, error } = await supabase.from('exam_boards').insert([
            toSnakeCase({ ...board, userId })
        ]).select();
        if (error) throw error;
        return toCamelCase(data[0]) as ExamBoard;
    },

    updateExamBoard: async (updated: ExamBoard): Promise<ExamBoard> => {
        const { error } = await supabase.from('exam_boards').update(
            toSnakeCase(updated)
        ).eq('id', updated.id);
        if (error) throw error;
        return updated;
    },

    deleteExamBoard: async (id: string) => {
        const { error } = await supabase.from('exam_boards').delete().eq('id', id);
        if (error) throw error;
    },

    restoreDefaultExamBoards: async (boards: Omit<ExamBoard, 'id'>[], userId: string) => {
        const { data, error } = await supabase.from('exam_boards').insert(
            boards.map(b => toSnakeCase({ ...b, userId }))
        ).select();
        if (error) throw error;
        return toCamelCase(data) as ExamBoard[];
    }
};
