import { supabase } from '../supabaseClient';
import { AttendanceRecord } from '../types';
import { toCamelCase, toSnakeCase } from '../utils/mapper';

export const attendanceService = {
    fetchAttendance: async () => {
        const { data, error } = await supabase.from('attendance').select('*');
        if (error) throw error;
        return toCamelCase(data) as AttendanceRecord[];
    },

    updateAttendance: async (record: AttendanceRecord, userId: string) => {
        const payload = toSnakeCase({ ...record, userId });
        // Remove empty ID so Postgres generates a new UUID or handles conflict
        if (!payload.id) delete payload.id;

        // onConflict: 'student_id, date, class_id'
        const { data, error } = await supabase.from('attendance').upsert(payload, { onConflict: 'student_id, date, class_id' }).select();

        if (error) throw error;
        return toCamelCase(data[0]) as AttendanceRecord;
    }
};
