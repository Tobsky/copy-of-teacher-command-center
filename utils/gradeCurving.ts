/**
 * Grade Curving Engine
 * 
 * Provides functions to scale internal exam scores to examination board standards
 * and convert to school grading percentages using linear interpolation.
 */

import { ExamBoard, GradeBoundary, SchoolGradingSystem, SchoolGradeRange, CurvedGradeResult } from '../types';

/**
 * Scale a raw score to the examination board's maximum score.
 */
export function scaleScore(rawScore: number, internalMax: number, boardMax: number): number {
    if (internalMax <= 0) return 0;
    return (rawScore / internalMax) * boardMax;
}

/**
 * Find the board grade for a given scaled score.
 * Boundaries must be sorted in descending order by minScore.
 */
export function findBoardGrade(scaledScore: number, boundaries: GradeBoundary[]): GradeBoundary | null {
    // Sort boundaries by minScore descending (highest first)
    const sorted = [...boundaries].sort((a, b) => b.minScore - a.minScore);

    for (const boundary of sorted) {
        if (scaledScore >= boundary.minScore) {
            return boundary;
        }
    }

    // Return lowest grade if score is below all boundaries
    return sorted.length > 0 ? sorted[sorted.length - 1] : null;
}

/**
 * Get the next higher boundary (for calculating range).
 */
export function getNextBoundary(
    currentBoundary: GradeBoundary,
    boundaries: GradeBoundary[],
    boardMax: number
): { minScore: number } {
    const sorted = [...boundaries].sort((a, b) => b.minScore - a.minScore);
    const currentIndex = sorted.findIndex(b => b.grade === currentBoundary.grade);

    if (currentIndex === 0) {
        // Highest grade - upper bound is board max
        return { minScore: boardMax + 1 };
    }

    return sorted[currentIndex - 1];
}

/**
 * Find the school grade range that matches the board grade.
 */
export function findSchoolGradeRange(
    boardGrade: string,
    schoolGrading: SchoolGradingSystem
): SchoolGradeRange | null {
    return schoolGrading.grades.find(g => g.label === boardGrade) || null;
}

/**
 * Calculate school percentage using linear interpolation.
 * Maps the position within a board grade range to the corresponding school grade range.
 */
export function calculateSchoolPercentage(
    scaledScore: number,
    boardGrade: GradeBoundary,
    nextBoundary: { minScore: number },
    schoolGradeRange: SchoolGradeRange
): number {
    const boardRangeLower = boardGrade.minScore;
    const boardRangeUpper = nextBoundary.minScore - 1;
    const boardRange = boardRangeUpper - boardRangeLower;

    const schoolRangeLower = schoolGradeRange.minPercent;
    const schoolRangeUpper = schoolGradeRange.maxPercent;
    const schoolRange = schoolRangeUpper - schoolRangeLower;

    if (boardRange <= 0) {
        return schoolRangeLower;
    }

    // Linear interpolation
    const positionInBoardRange = scaledScore - boardRangeLower;
    const schoolPercent = schoolRangeLower + (positionInBoardRange * (schoolRange / boardRange));

    // Clamp to grade range and round to 1 decimal
    return Math.round(Math.min(Math.max(schoolPercent, schoolRangeLower), schoolRangeUpper) * 10) / 10;
}

/**
 * Determine school grade from percentage.
 */
export function determineSchoolGrade(percent: number, schoolGrading: SchoolGradingSystem): string {
    const sorted = [...schoolGrading.grades].sort((a, b) => b.minPercent - a.minPercent);

    for (const grade of sorted) {
        if (percent >= grade.minPercent && percent <= grade.maxPercent) {
            return grade.label;
        }
    }

    // Return lowest grade if below all ranges
    return sorted.length > 0 ? sorted[sorted.length - 1].label : 'N/A';
}

/**
 * Main curving function - curves a single raw score.
 */
export function curveGrade(
    rawScore: number,
    internalMax: number,
    board: ExamBoard,
    schoolGrading: SchoolGradingSystem
): CurvedGradeResult {
    // Validate inputs
    if (rawScore < 0) rawScore = 0;
    if (rawScore > internalMax) rawScore = internalMax;
    if (internalMax <= 0) {
        return {
            rawScore,
            scaledScore: 0,
            boardGrade: 'N/A',
            schoolPercent: 0,
            schoolGrade: 'N/A'
        };
    }

    // Step 1: Scale to board maximum
    const scaledScore = scaleScore(rawScore, internalMax, board.maxScore);

    // Step 2: Find board grade
    const boardGrade = findBoardGrade(scaledScore, board.boundaries);

    if (!boardGrade) {
        return {
            rawScore,
            scaledScore: Math.round(scaledScore * 10) / 10,
            boardGrade: 'N/A',
            schoolPercent: 0,
            schoolGrade: 'N/A'
        };
    }

    // Step 3: Find corresponding school grade range
    const schoolGradeRange = findSchoolGradeRange(boardGrade.grade, schoolGrading);

    if (!schoolGradeRange) {
        // Fallback: calculate based on scaled score percentage
        const fallbackPercent = Math.round((scaledScore / board.maxScore) * 100 * 10) / 10;
        return {
            rawScore,
            scaledScore: Math.round(scaledScore * 10) / 10,
            boardGrade: boardGrade.grade,
            schoolPercent: fallbackPercent,
            schoolGrade: determineSchoolGrade(fallbackPercent, schoolGrading)
        };
    }

    // Step 4: Calculate school percentage using linear interpolation
    const nextBoundary = getNextBoundary(boardGrade, board.boundaries, board.maxScore);
    const schoolPercent = calculateSchoolPercentage(scaledScore, boardGrade, nextBoundary, schoolGradeRange);

    // Step 5: Determine final school grade
    const schoolGrade = determineSchoolGrade(schoolPercent, schoolGrading);

    return {
        rawScore,
        scaledScore: Math.round(scaledScore * 10) / 10,
        boardGrade: boardGrade.grade,
        schoolPercent,
        schoolGrade
    };
}

/**
 * Curve multiple scores at once.
 */
export function curveGrades(
    scores: { studentId: string; studentName: string; rawScore: number }[],
    internalMax: number,
    board: ExamBoard,
    schoolGrading: SchoolGradingSystem
): Array<CurvedGradeResult & { studentId: string; studentName: string }> {
    return scores.map(({ studentId, studentName, rawScore }) => ({
        studentId,
        studentName,
        ...curveGrade(rawScore, internalMax, board, schoolGrading)
    }));
}
