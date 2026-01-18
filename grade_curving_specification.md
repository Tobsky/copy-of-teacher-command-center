# Grade Curving Functionality Specification for Teacher Administration App

## **Objective:**
Create a comprehensive grade curving system that allows teachers to automatically adjust internal exam scores to match external examination standards while converting to their school's grading system.

---

## **Core Requirements:**

### **1. User Roles & Context**
- **Primary users:** Teachers administering assessments
- **Applicable assessments:** Tests, Mock Exams, Midterm Exams, Final Exams
- **Excluded:** Daily quizzes, homework, classwork, projects

### **2. Data Input Structure**
```
Exam Configuration:
- Internal Exam (user-provided)
  - Maximum score (editable)
  - Raw student scores

- Examination Board Standards (preset + editable)
  - Board name (dropdown: IGCSE, Cambridge AS/A Level, Custom)
  - Maximum score
  - Grade boundaries (A*, A, B, C, D, E, F, U)

- School Grading System (editable)
  - Percentage ranges for each grade
  - Custom grade labels
```

### **3. Functionality Specifications**

#### **A. Grade Boundary Management**
- Preloaded templates for common boards:
  - IGCSE Computer Science
  - Cambridge AS/A Level  
  - Cambridge A Level
  - IB Diploma
- Custom board creation with:
  - Grade labels (A*, A, B, C, etc.)
  - Minimum scores for each grade
  - Maximum exam score

#### **B. Curving Engine Logic**
```
Process Flow:
1. Input raw scores out of internal maximum
2. Scale to examination board maximum using: 
   scaled_score = (raw_score / internal_max) * board_max
3. Map to examination board grades
4. Convert to school percentage using linear interpolation:
   school_percentage = lower_school_bound + 
   ((scaled_score - lower_board_bound) * 
   (school_range / board_range))
```

#### **C. School Grading System**
- Default: A*(90-100%), A(80-89%), B(70-79%), C(60-69%), D(50-59%), E(40-49%), F(0-39%)
- Customizable percentage boundaries
- Support for different grading scales (4.0 GPA, etc.)

---

## **4. User Interface Components**

### **A. Configuration Panel**
- Exam type selector (Test/Mock/Midterm/Final)
- Examination board selector with custom option
- Internal maximum score input
- School grading system editor

### **B. Input/Output Display**
```
Student Grade View:
| Student | Raw Score | Scaled Score | Board Grade | School % | School Grade |
```

### **C. Batch Processing**
- CSV upload for student scores
- Bulk grade generation
- Export results in multiple formats

---

## **5. Technical Specifications**

### **Data Validation:**
- Internal max must be > 0
- Grade boundaries must be sequential
- No overlapping percentage ranges
- Raw scores cannot exceed internal maximum

### **Calculation Accuracy:**
- Preserve decimal precision during calculations
- Round final percentages to 1 decimal place
- Handle edge cases (perfect scores, zero scores)

### **Error Handling:**
- Invalid grade boundary sequences
- Missing configuration parameters
- Data type mismatches

---

## **6. Output Features**

### **A. Individual Student Reports**
- Raw, scaled, and curved scores
- Visual grade progression
- Comparison to class average

### **B. Class Analytics**
- Grade distribution charts
- Performance statistics
- Boundary impact analysis

### **C. Export Options**
- PDF grade reports
- Excel/CSV data export
- Integration with school LMS

---

## **7. Implementation Steps**

### **Phase 1: Core Engine**
1. Build scaling algorithm
2. Implement grade boundary mapping
3. Create linear interpolation for percentages

### **Phase 2: Configuration Interface**
1. Examination board templates
2. School grading system editor
3. Assessment type handler

### **Phase 3: Data Management**
1. Student score input methods
2. Batch processing
3. Export functionality

### **Phase 4: Analytics & Reporting**
1. Visualizations
2. Statistical analysis
3. Report generation

---

## **8. Success Metrics**
- Processing time < 2 seconds for 100 students
- 99% calculation accuracy compared to manual verification
- Intuitive configuration within 3 clicks
- Support for 10+ examination boards

---

## **9. Example Use Case**

```
Scenario: Teacher with IGCSE-style internal exam
- Internal max: 42
- Board: IGCSE Computer Science (max: 75)
- School system: A*(90-100%), A(80-89%), etc.

Input: Student scores [35, 28, 19, 42]
Output: Curved grades [A, B, D, A*] with school percentages
```

**Calculation Example:**
- Student score: 35/42
- Scaled to board: (35/42) × 75 = 62.5
- Board grade: A* (61-75)
- School percentage: 90 + ((62.5 - 61) × (10/14)) = 91.07%
- School grade: A*

---

## **10. Additional Requirements:**
- Mobile-responsive design
- Offline capability for score input
- Data backup and recovery
- Multi-language support
- Accessibility compliance (WCAG 2.1)

---

## **11. Technical Architecture Considerations**

### **Data Models:**
```javascript
// Example data structure
ExamBoard = {
  name: "IGCSE Computer Science",
  maxScore: 75,
  boundaries: [
    {grade: "A*", minScore: 61},
    {grade: "A", minScore: 49},
    {grade: "B", minScore: 37},
    // ...
  ]
}

SchoolGrading = {
  grades: [
    {label: "A*", minPercent: 90, maxPercent: 100},
    {label: "A", minPercent: 80, maxPercent: 89},
    // ...
  ]
}
```

### **Algorithm Pseudocode:**
```python
def curve_grade(raw_score, internal_max, board, school_system):
    # Scale to board maximum
    scaled_score = (raw_score / internal_max) * board.maxScore
    
    # Find board grade
    board_grade = None
    for boundary in board.boundaries:
        if scaled_score >= boundary.minScore:
            board_grade = boundary
        else:
            break
    
    # Calculate school percentage
    lower_bound = board_grade.minScore
    upper_bound = next_boundary.minScore if next_boundary else board.maxScore
    board_range = upper_bound - lower_bound
    
    school_lower = school_system[board_grade.grade].minPercent
    school_upper = school_system[board_grade.grade].maxPercent
    school_range = school_upper - school_lower
    
    school_percent = school_lower + (
        (scaled_score - lower_bound) * 
        (school_range / board_range)
    )
    
    return {
        "scaled_score": scaled_score,
        "board_grade": board_grade.grade,
        "school_percent": school_percent,
        "school_grade": determine_school_grade(school_percent, school_system)
    }
```

---

## **12. Testing Scenarios**
1. Perfect score conversion
2. Boundary score handling (exact grade thresholds)
3. Invalid input handling
4. Custom board configurations
5. Different internal maximums
6. Large student datasets

---

This functionality should seamlessly integrate with existing teacher workflows while providing accurate, educationally sound grade conversions that maintain assessment integrity across different examination standards.

---
