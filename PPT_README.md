# IntelliScan Presentation Generator

## Overview
This script creates a comprehensive PowerPoint presentation for the IntelliScan project based on the existing documentation and presentation templates.

## Generated Presentation
**File:** `IntelliScan_Presentation.pptx`
**Slides:** 19 slides
**Size:** ~48KB

## Presentation Structure

1. **Title Slide** - Project title and presentation details
2. **Project Team** - Team information and guide details
3. **Presentation Agenda** - Overview of presentation contents
4. **Existing System Analysis** - Problems with current business card management
5. **Need for the New System** - Requirements that IntelliScan addresses
6. **Problem Definition & Objectives** - Detailed problem statement and goals
7. **System Scope - Implemented Features** - Complete list of features
8. **Technology Stack** - Frontend and backend technologies (two-column layout)
9. **AI & Third-Party Integrations** - External services and APIs
10. **System Architecture** - High-level system design
11. **User Roles & Access Control** - RBAC and user tiers
12. **Database Schema (SQLite)** - Database table structures
13. **Core Business Workflows** - Key user workflows
14. **Demo Walkthrough Plan** - Step-by-step demo outline
15. **Testing & Quality Assurance** - Testing approaches
16. **Challenges Faced & Solutions** - Technical challenges overcome
17. **Future Scope & Enhancements** - Planned improvements
18. **Project Conclusion** - Summary of achievements
19. **Questions & Answers** - Q&A slide

## Features of the Generated PPT

- **Professional Layout:** Clean, academic presentation format
- **Consistent Styling:** Proper fonts, colors, and spacing
- **Two-Column Slides:** Technology stack comparison
- **Bullet Points:** Easy-to-read content organization
- **Proper Hierarchy:** Clear heading structure
- **Academic Format:** Suitable for MCA project presentation

## Content Sources

The presentation content is derived from:
- `ALL_DOCUMENT_OF_PROJECT/College_Document/Presentation-1_intelliscan.md`
- `ALL_DOCUMENT_OF_PROJECT/College_Document/Presentation-2_intelliscan.md`
- `ALL_DOCUMENT_OF_PROJECT/IntelliScan_Complete_Project_Overview.md`
- `ALL_DOCUMENT_OF_PROJECT/APRIL_04_2026_PRESENTATION_PACK.md`

## How to Customize

1. **Team Information:** Edit slide 2 to add actual team member names and enrollment numbers
2. **Colors/Themes:** Modify the RGBColor values in the script for different color schemes
3. **Content:** Update the slide content arrays in the `create_intelliscan_presentation()` function
4. **Layout:** Adjust font sizes, positions, and layouts as needed

## Requirements

- Python 3.11+
- python-pptx library (`pip install python-pptx`)
- Microsoft PowerPoint or compatible viewer to open .pptx files

## Usage

```bash
python create_intelliscan_ppt.py
```

The script will generate `IntelliScan_Presentation.pptx` in the current directory.

## Notes

- The presentation follows the format typical for MCA college project presentations
- All content is based on the actual IntelliScan codebase and documentation
- The PPT is ready for presentation with proper academic formatting
- Diagrams and images can be added manually to enhance visual appeal