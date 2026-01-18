/**
 * Preset Examination Board Templates
 * 
 * Contains preset configurations for common examination boards
 * and a default school grading system.
 */

import { ExamBoard, SchoolGradingSystem } from '../types';

// --- Preset Examination Boards ---

export const PRESET_BOARDS: ExamBoard[] = [
    {
        id: 'igcse-cs',
        name: 'IGCSE Computer Science',
        maxScore: 75,
        boundaries: [
            { grade: 'A*', minScore: 61 },
            { grade: 'A', minScore: 49 },
            { grade: 'B', minScore: 37 },
            { grade: 'C', minScore: 25 },
            { grade: 'D', minScore: 18 },
            { grade: 'E', minScore: 11 },
            { grade: 'F', minScore: 5 },
            { grade: 'U', minScore: 0 }
        ]
    },
    {
        id: 'cambridge-as',
        name: 'Cambridge AS Level',
        maxScore: 100,
        boundaries: [
            { grade: 'A', minScore: 65 },
            { grade: 'B', minScore: 55 },
            { grade: 'C', minScore: 45 },
            { grade: 'D', minScore: 35 },
            { grade: 'E', minScore: 25 },
            { grade: 'U', minScore: 0 }
        ]
    },
    {
        id: 'cambridge-a-level',
        name: 'Cambridge A Level',
        maxScore: 100,
        boundaries: [
            { grade: 'A*', minScore: 80 },
            { grade: 'A', minScore: 70 },
            { grade: 'B', minScore: 60 },
            { grade: 'C', minScore: 50 },
            { grade: 'D', minScore: 40 },
            { grade: 'E', minScore: 30 },
            { grade: 'U', minScore: 0 }
        ]
    },
    {
        id: 'ib-diploma',
        name: 'IB Diploma',
        maxScore: 100,
        boundaries: [
            { grade: '7', minScore: 90 },
            { grade: '6', minScore: 77 },
            { grade: '5', minScore: 64 },
            { grade: '4', minScore: 51 },
            { grade: '3', minScore: 38 },
            { grade: '2', minScore: 25 },
            { grade: '1', minScore: 12 },
            { grade: '0', minScore: 0 }
        ]
    }
];

// --- Default School Grading System ---

export const DEFAULT_SCHOOL_GRADING: SchoolGradingSystem = {
    name: 'Standard A*-F',
    grades: [
        { label: 'A*', minPercent: 90, maxPercent: 100 },
        { label: 'A', minPercent: 80, maxPercent: 89.9 },
        { label: 'B', minPercent: 70, maxPercent: 79.9 },
        { label: 'C', minPercent: 60, maxPercent: 69.9 },
        { label: 'D', minPercent: 50, maxPercent: 59.9 },
        { label: 'E', minPercent: 40, maxPercent: 49.9 },
        { label: 'F', minPercent: 0, maxPercent: 39.9 },
        { label: 'U', minPercent: 0, maxPercent: 0 }
    ]
};

// IB-compatible school grading (7-1 scale)
export const IB_SCHOOL_GRADING: SchoolGradingSystem = {
    name: 'IB 7-1 Scale',
    grades: [
        { label: '7', minPercent: 90, maxPercent: 100 },
        { label: '6', minPercent: 77, maxPercent: 89.9 },
        { label: '5', minPercent: 64, maxPercent: 76.9 },
        { label: '4', minPercent: 51, maxPercent: 63.9 },
        { label: '3', minPercent: 38, maxPercent: 50.9 },
        { label: '2', minPercent: 25, maxPercent: 37.9 },
        { label: '1', minPercent: 12, maxPercent: 24.9 },
        { label: '0', minPercent: 0, maxPercent: 11.9 }
    ]
};

// --- Helper Functions ---

export function getPresetBoardByName(name: string): ExamBoard | undefined {
    return PRESET_BOARDS.find(board => board.name === name);
}

export function createCustomBoard(
    name: string,
    maxScore: number,
    boundaries: { grade: string; minScore: number }[]
): ExamBoard {
    return {
        id: `custom-${Date.now()}`,
        name,
        maxScore,
        boundaries: boundaries.sort((a, b) => b.minScore - a.minScore)
    };
}

export function createCustomSchoolGrading(
    name: string,
    grades: { label: string; minPercent: number; maxPercent: number }[]
): SchoolGradingSystem {
    return {
        name,
        grades: grades.sort((a, b) => b.minPercent - a.minPercent)
    };
}
