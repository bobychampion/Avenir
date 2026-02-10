# Product Requirements Document (PRD)

## Product Name

**Avenir** — Career Discovery Platform for Secondary School Students (JSS & SSS),  **Avenir** is a career discovery platform that helps secondary school students identify academic directions early and refine career pathways before critical subject and post-secondary decisions are made.

---

## 1. Overview

### 1.1 Product Summary

The Career Discovery Platform is an EdTech web-based application designed to help **Junior Secondary School (JSS)** and **Senior Secondary School (SSS)** students discover suitable academic directions and career paths early.

The platform uses structured assessments, rule-based logic, and AI-assisted explanations to guide students toward informed academic and career decisions **before irreversible subject and post-secondary choices are made**.

This MVP focuses strictly on **secondary school students** (JSS & SSS). University students are explicitly out of scope.

---

## 2. Problem Statement

### Core Problem

Secondary school students often:

- Choose subject tracks (Arts, Science, Commercial) without sufficient self-awareness
- Lack structured career guidance early enough
- Make late or misaligned decisions that affect academic performance and employability

Existing guidance is:

- Manual and inconsistent
- Not data-driven
- Often introduced too late (post-secondary level)

---

## 3. Goals & Objectives

### Primary Goals

- Provide **early career direction discovery** for JSS students
- Provide **career refinement and clarity** for SSS students
- Align guidance with how schools already operate (subject streams)

### MVP Success Criteria

- Students can complete an assessment in under 10 minutes
- Students receive clear, understandable results
- Platform can be piloted in real secondary schools
- System is demo-ready for incubation/funding programs

---

## 4. Target Users

### 4.1 Primary Users

- **JSS Students** (Entry / Early JSS)
- **SSS Students** (After subject stream selection)

### 4.2 Secondary Users (Future, not MVP)

- Parents
- Teachers / Guidance counselors
- School administrators

---

## 5. User Segmentation & Modes

The platform operates in **two modes** determined at onboarding:

### Mode A: JSS Discovery Mode

- Broad academic direction discovery
- Focus on interests, strengths, and learning style

### Mode B: SSS Refinement Mode

- Career-specific guidance within a chosen subject track
- Focus on career fit and preparation

---

## 6. Career Framework (Locked)

### 6.1 Academic Directions (JSS)

1. Science & Analytical
2. Arts & Humanities
3. Commercial & Business
4. Creative & Design
5. Hybrid / Multidisciplinary

### 6.2 Career Clusters (SSS)

1. Engineering & Technology
2. Health & Medical Sciences
3. Pure & Applied Sciences
4. Data, AI & Computational Fields
5. Law, Governance & Public Service
6. Media, Communication & Journalism
7. Education & Social Sciences
8. Business, Management & Entrepreneurship
9. Finance, Accounting & Economics
10. Marketing, Sales & Strategy
11. Creative Arts & Design
12. Technical & Vocational Careers

---

## 7. User Flow

1. Landing Page
2. Select Student Level (JSS or SSS)
3. (SSS only) Select Subject Track (Arts / Science / Commercial)
4. Student Profile Input (basic)
5. Assessment Quiz
6. Results Page
7. Career / Direction Detail View

---

## 8. Functional Requirements

### 8.1 Onboarding

- Student selects JSS or SSS
- SSS students select subject track
- Optional demographic inputs (age, class)

---

### 8.2 Assessment Engine

The assessment is **not a simple form**. It is a **multi-dimensional diagnostic tool** designed to reveal patterns, preferences, and tendencies over time. Questions are scenario-based, comparative, and pathway-driven rather than direct career questions.

The system is intentionally designed to feel like a **guided journey**, not a questionnaire.

---

## 8.2.1 Assessment Design Philosophy

- Avoid direct questions like "What do you want to be?"
- Use **scenario-based**, **preference-ranking**, and **forced-choice** questions
- Measure *how students think*, not what they claim to like
- Use repetition of themes across sections to validate consistency

---

## 8.2.2 JSS Assessment Design (Broad Discovery)

### Purpose
Help students discover **academic direction and learning tendencies** before subject streaming.

### Dimensions Measured
1. Cognitive Style (logical, creative, verbal, practical)
2. Interest Orientation (people, things, ideas, systems)
3. Learning Preference (visual, hands-on, reading, discussion)
4. Curiosity Trigger (how questions are approached)
5. Task Enjoyment (structure vs exploration)

### Question Structure
- 20 questions total
- Scenario-based and comparative
- **Everyday life scenarios** (home, play, social situations, hobbies)
- Questions avoid classroom or exam framing to reduce bias
- Example:
  - "At home or with friends, which activity do you naturally enjoy most?"
    - A. Fixing or figuring out how things work
    - B. Drawing, designing, or creating something new
    - C. Talking, explaining, or helping others understand
    - D. Organizing plans, events, or activities


### Sample JSS Everyday-Life Questions (MVP Draft)

Below are sample **everyday-life, scenario-based questions** for the JSS assessment. These questions are designed to reveal thinking patterns, interests, and natural tendencies rather than academic performance.

1. **When you have free time at home, what do you enjoy doing the most?**
   - A. Taking things apart to see how they work
   - B. Drawing, designing, or creating something new
   - C. Talking with people or helping someone solve a problem
   - D. Planning activities or organizing what needs to be done

2. **If your friends are trying to solve a problem, what role do you naturally take?**
   - A. Suggest logical steps to fix it
   - B. Think of a creative or unusual solution
   - C. Explain ideas so everyone understands
   - D. Coordinate who should do what

3. **At a family event, which activity sounds most enjoyable to you?**
   - A. Helping set up equipment or gadgets
   - B. Decorating the space or choosing how it looks
   - C. Talking with guests and making them feel welcome
   - D. Managing time or making sure plans go smoothly

4. **When you are given a new game or device, what do you do first?**
   - A. Explore how it works and test it
   - B. Customize how it looks or feels
   - C. Ask others how to use it and share tips
   - D. Read the instructions and plan how to use it

5. **Which activity would you enjoy doing for a whole afternoon?**
   - A. Solving puzzles or fixing things
   - B. Writing stories, drawing, or making music
   - C. Teaching or helping someone learn something
   - D. Organizing a small event or project

6. **If you notice something around you is not working well, what do you usually do?**
   - A. Try to understand the cause and fix it
   - B. Think of a new or better way it could be done
   - C. Talk to others about the problem and possible solutions
   - D. Make a plan to improve or manage the situation

7. **When working with others, what makes you feel most satisfied?**
   - A. Solving a difficult problem
   - B. Creating something original
   - C. Seeing people understand or feel helped
   - D. Seeing everything run smoothly

8. **If you could start a small project just for fun, what would it most likely be?**
   - A. Building or fixing something
   - B. Designing or creating something artistic
   - C. Helping or teaching people something useful
   - D. Organizing a group or activity

---

### Sample SSS Everyday-Life Questions (MVP Draft)

Below are sample **everyday-life, scenario-based questions** for the SSS assessment. These questions are designed to refine career direction **within a chosen subject track** by focusing on problem preference, impact, and work style.

1. **Imagine you are asked to help improve something in your community. Which task would you choose?**
   - A. Fixing or improving how a system or tool works
   - B. Creating a new idea, design, or solution
   - C. Speaking to people to understand their needs and explain solutions
   - D. Planning how the work should be done step by step

2. **If you had to choose one type of challenge to work on regularly, which would you prefer?**
   - A. Technical or logical problems
   - B. Creative or expressive challenges
   - C. People-related or communication challenges
   - D. Organizing processes or making decisions

3. **Which kind of work environment do you think you would enjoy most?**
   - A. Working independently on complex tasks
   - B. Working freely with room for creativity
   - C. Working closely with people
   - D. Working in a structured and organized setting

4. **When starting a long-term project, what motivates you most?**
   - A. Solving a difficult problem
   - B. Creating something original or meaningful
   - C. Making a positive difference in people’s lives
   - D. Seeing a plan succeed from start to finish

5. **If you had to learn a new skill outside school, which would you be most excited about?**
   - A. Learning how systems, machines, or technology work
   - B. Learning design, writing, or creative skills
   - C. Learning how to teach, guide, or support others
   - D. Learning how to manage projects or resources

6. **Which result would make you feel most proud after completing a project?**
   - A. It works efficiently and solves the problem
   - B. It looks or feels creative and unique
   - C. People benefited or learned something new
   - D. The project was well-organized and successful

7. **When working in a team, what role do you naturally take?**
   - A. Problem-solver or technical contributor
   - B. Idea generator or creative contributor
   - C. Communicator or team supporter
   - D. Planner or coordinator

8. **Thinking about your future, what matters most to you in a career?**
   - A. Working on challenging problems
   - B. Expressing creativity or ideas
   - C. Helping people or influencing society
   - D. Building something stable and well-structured

---

### Output Logic
- Scores mapped to Career Clusters
- Top 3–5 matches shown
- Each result includes **why it fits** and **how to prepare**

---

### 8.3 Scoring & Matching Logic

The mapping logic is the **core intelligence** of Avenir. It translates student choices into clear academic directions (JSS) and career clusters (SSS) using transparent, explainable rules.

The goal is **clarity and trust**, not black-box prediction.

---

## 8.3.1 JSS Mapping Logic (Answers → Academic Directions)

Each answer option in the JSS assessment maps to **one primary Academic Direction** and optionally a **secondary direction**.

### JSS Direction Weights

| Answer Type | Primary Direction | Secondary Direction (Optional) |
|-----------|------------------|--------------------------------|
| Fixing, logic, systems | Science & Analytical | Hybrid |
| Creating, design, imagination | Creative & Design | Arts & Humanities |
| Talking, helping, explaining | Arts & Humanities | Education & Social Sciences |
| Planning, organizing, managing | Commercial & Business | Hybrid |

### Scoring Rules (JSS)
- Each selected option = +1 point to its primary direction
- Secondary direction (if any) = +0.5 point
- After all questions:
  - Highest score = **Primary Academic Direction**
  - Second-highest = **Secondary Direction** (shown only if close)

### Consistency Check (JSS)
- Repeated signals across multiple dimensions increase confidence
- Highly mixed scores trigger **Hybrid / Multidisciplinary** result

---

## 8.3.2 SSS Mapping Logic (Answers → Career Clusters)

SSS mapping refines direction **within a chosen subject track** (Arts / Science / Commercial).

Each answer option maps to:
- A **problem type**
- A **work style**
- One or more **career clusters**

---

### SSS Answer → Career Cluster Mapping (Examples)

| Answer Preference | Career Clusters Boosted |
|------------------|-------------------------|
| Technical / logical problems | Engineering & Technology, Data & AI, Pure Sciences |
| Helping people / social impact | Health Sciences, Education & Social Sciences, Law & Public Service |
| Creative expression | Creative Arts & Design, Media & Communication |
| Planning, management, structure | Business & Management, Finance & Accounting, Marketing & Strategy |

---

### Subject Track Constraint Logic (SSS)

To maintain realism:
- **Science track** prioritizes:
  - Engineering & Technology
  - Health & Medical Sciences
  - Pure & Applied Sciences
  - Data & AI

- **Arts track** prioritizes:
  - Law & Public Service
  - Media & Communication
  - Education & Social Sciences
  - Creative Arts

- **Commercial track** prioritizes:
  - Business & Management
  - Finance & Accounting
  - Marketing & Strategy

Out-of-track clusters are **de-emphasized**, not removed.

---

### Scoring Rules (SSS)
- Each answer = +1 point to mapped clusters
- Track-aligned clusters receive +0.5 bonus
- Final output shows:
  - Top 3–5 career clusters
  - Confidence level (High / Medium)

---

## 8.3.3 Explainability Layer (Critical)

Every result must answer:
- **Why this fits you** (based on repeated signals)
- **What you seem to enjoy solving**
- **How this aligns with your subject track**

AI is used only to:
- Generate clear explanations
- Personalize language tone
- Suggest next learning steps

No opaque predictions are shown to students.


---

### 8.4 Results Output

#### JSS Results

- Primary Academic Direction
- Optional Secondary Direction
- Explanation (plain language)
- Suggested subjects to explore
- Early skill indicators

#### SSS Results

- Top 3–5 Career Matches
- Career descriptions
- Required subjects
- Core skills
- Learning recommendations

---

### 8.5 Career Detail Pages

Each career/cluster includes:

- Overview
- What professionals do
- Required school subjects
- Foundational skills
- Example next steps

---

## 9. Non-Functional Requirements

### Performance

- Page load < 3 seconds on low bandwidth

### Accessibility

- Mobile-first design
- Simple language

### Security

- No sensitive personal data stored
- Basic authentication (optional for MVP)

---

## 10. Out of Scope (MVP)

- University pathways
- Job placement
- Scholarships
- Chatbots
- Advanced predictive AI
- Payment systems

---

## 11. Tech Stack (Recommended)

### Frontend
- Web (mobile-first)
- FlutterFlow / React / Bubble

### Backend
- Firebase or Supabase

### Logic
- Rule-based matching (JSON-driven)

### AI
- AI-assisted text generation only

---

## 12. Admin Backend for Managing Questions (MVP)

### 12.1 Purpose
The Admin Backend is the internal tool that allows authorized staff to **create, edit, test, and publish** assessment content without redeploying the frontend. It manages the question bank, branching logic, scoring weights, and result-mapping configuration.

The admin backend is required to support:
- Rapid iteration during school pilots
- Controlled updates (draft → review → publish)
- Auditability (who changed what, and when)

---

### 12.2 User Roles & Permissions

**Role: Admin (Full Access)**
- Manage users/roles
- Create/edit/publish questions and logic
- Manage career clusters and trait definitions
- Export/import configuration

**Role: Content Editor (Limited Access)**
- Create/edit questions and options
- Edit copy (prompts, option labels)
- Cannot publish to production without approval

**Role: Reviewer/Approver (Quality Gate)**
- Review content changes
- Approve/publish releases
- Cannot modify logic without editor/admin

**Role: Analyst (Read-Only)**
- View aggregated analytics and reports
- Export pilot datasets

---

### 12.3 Admin Information Architecture (Screens)

1. **Dashboard**
   - Drafts awaiting review
   - Recently published versions
   - Pilot completion stats (MVP-lite)

2. **Question Bank**
   - Search, filter, and tag management
   - Bulk actions (activate/deactivate)

3. **Question Editor**
   - Create/edit question prompt
   - Select response type (MCQ / Image / Scenario / Drag-Rank / Open)
   - Add/edit options
   - Assign tags and scoring weights

4. **Branching Logic Builder**
   - Set `next_question_id` per option
   - Visual tree view (node graph) + list view
   - Enforce max depth rules (2–3 levels)

5. **Trait & Scoring Rules**
   - Define trait dimensions
   - Weight tables per option
   - Normalization settings

6. **Career Cluster Mapping**
   - Define clusters
   - Trait thresholds per cluster
   - SSS subject-track weighting rules

7. **Preview & Simulator**
   - “Play test” the assessment as a student
   - See live scoring as answers are chosen
   - Display predicted cluster + confidence

8. **Publishing & Versioning**
   - Create release version (e.g., v1.0.3)
   - Promote draft → staging → production
   - Rollback to previous version

9. **Import/Export**
   - Export question bank + logic as JSON/CSV
   - Import updates (validated schema)

---

### 12.4 Data Model (Admin-Managed Entities)

**Question**
- id, mode (JSS/SSS), prompt, type
- tags (category/dimension)
- difficulty (optional), status (draft/published/archived)

**Option**
- id, label/text or image_url
- weight_map (trait → score)
- next_question_id (branch routing)

**Branch Node (Derived)**
- parent_question_id, option_id → child_question_id

**Trait Dimension**
- id, display_name, description

**Career Cluster**
- id, name, description
- mapping rules (trait thresholds, weights)
- track rules (Arts/Science/Commercial)

**Assessment Version**
- version_id, created_by, approved_by
- created_at, published_at
- change log (diff summary)

---

### 12.5 Workflows

**Content Workflow**
1. Editor creates/edits questions in Draft
2. Reviewer validates wording, bias, and age appropriateness
3. Approver publishes a versioned release
4. Frontend pulls latest published config

**Pilot Iteration Workflow**
- After pilot feedback, create a new draft version
- Adjust weights/branches
- Simulate outcomes
- Publish as new version

---

### 12.6 Validation Rules (Guardrails)

To prevent broken assessments:
- No orphan questions in published sets (unless explicitly allowed)
- No cycles in branching (avoid infinite loops)
- Max branching depth enforced
- Each assessment run must have a valid end condition (≈20 questions)
- Required tags present (mode, category)
- Image questions must have valid image URLs
- Open-ended questions require a rubric tag (used for interpretation only)

---

### 12.7 MVP Analytics (Admin View)

Minimum analytics to support iteration:
- Completion rate
- Drop-off points by question
- Distribution of resulting clusters
- Average time to complete
- Top “low confidence” outcomes

---

### 12.8 Security & Compliance

- Role-based access control (RBAC)
- Audit logging for all edits and publishes
- No storage of sensitive personal data in admin
- Separate environments for staging vs production

---

### 12.9 Definition of Done (Admin Backend MVP)

- Admin can create/edit questions and options
- Admin can configure branching and scoring weights
- Preview/simulator works end-to-end
- Versioned publishing and rollback are functional
- Frontend can fetch and run the latest published configuration

---

## 13. Analytics & Feedback (MVP-lite)
 Analytics & Feedback (MVP-lite)

- Quiz completion rate
- Direction / career distribution
- User feedback form

---

## 13. Pilot Plan

- Deploy MVP in 1–3 secondary schools
- Test with JSS and SSS students
- Collect qualitative feedback
- Iterate assessment logic

---

## 14. Risks & Mitigations

### Risk: Overcomplexity

Mitigation: Strict MVP scope

### Risk: Misinterpretation of results

Mitigation: Clear disclaimers + simple language

### Risk: Low engagement

Mitigation: Short assessments, visual results

---

## 15. Future Enhancements (Post-MVP)

- Parent dashboards
- Teacher reports
- Personalized learning plans
- Advanced AI matching
- Localization by country

---

## 16. MVP Definition of Done

- Students can complete assessment
- Students receive clear results
- Platform is demo-ready
- Can be tested in real schools
- Suitable for incubation program review

---

## 17. Assessment Engine v1 Scope

### Purpose
The Assessment Engine v1 is the **core intelligence layer** of Avenir. It is responsible for dynamically presenting questions, capturing student responses, applying rule-based logic, and generating interpretable career discovery results for JSS and SSS students.

This document defines **what the engine will do, and deliberately what it will not do**, to keep the MVP focused, buildable, and credible.

---

### Objectives

The Assessment Engine v1 is designed to:
- Translate student responses into measurable cognitive and behavioral signals
- Adapt question flow using predefined branching logic (2–3 levels deep)
- Identify dominant intelligence traits and preferences
- Map these traits to relevant career clusters
- Produce clear, explainable results suitable for students, parents, and educators

---

### In-Scope (Engine v1 WILL do)

#### 1. Adaptive Question Delivery
- Serve questions dynamically based on previous answers
- Support branching depth of up to **2–3 levels per domain**
- Ensure students answer approximately **20 questions**, drawn from a larger pool

#### 2. Multi-Modal Response Handling
- Multiple choice
- Image selection
- Scenario-based decision making
- Drag-and-drop ranking
- Short open-ended text (non-graded, signal-supported)

#### 3. Trait-Based Scoring System
- Maintain scores across defined intelligence dimensions
- Apply weighted scoring per response
- Normalize scores at completion

#### 4. Career Cluster Mapping
- Map aggregated trait scores to predefined career clusters
- Support primary and secondary cluster outputs
- Apply subject-track constraints for SSS students

#### 5. Explainable Results Generation
- Produce dominant traits, career clusters, and confidence level
- Feed structured results into a narrative explanation layer

#### 6. Configuration via Backend
- All questions, options, weights, and branching rules configurable via backend

---

### Out of Scope (Engine v1 WILL NOT do)

- Machine learning or self-training models
- Predict exact job titles
- Learn across users
- Psychological diagnosis or IQ testing

---

### Design Principles

- Explainability over complexity
- Deterministic logic
- Age-appropriate interpretation
- Extensible architecture

---

### Success Criteria (v1)

- End-to-end execution without manual intervention
- Educator validation of result credibility
- Student comprehension and comfort
- Pilot stability

---

### Versioning Note

Assessment Engine v1 is foundational. Future versions may introduce ML, analytics, and longitudinal tracking.

---

## 18. Admin Backend – Question & Assessment Management (v1)

### Purpose
The Admin Backend is the **control center** for Avenir’s Assessment Engine. It allows authorized administrators to create, manage, test, and iterate on assessment questions, branching logic, scoring weights, and career mappings **without modifying frontend code**.

---

### Core Admin Roles (v1)

- **System Admin** – full access (engine configuration, publishing)
- **Content Manager** – manage questions, options, and media

---

### Admin Capabilities (In Scope)

#### 1. Question Management
Admins can:
- Create, edit, archive questions
- Assign:
  - Question type (MCQ, image, scenario, ranking, open)
  - Assessment mode (JSS / SSS)
  - Intelligence dimension(s)
  - Difficulty / depth level
- Enable or disable questions without deletion

---

#### 2. Option & Response Configuration
For each question, admins can:
- Define answer options (text or image)
- Assign trait weights per option
- Set branching destination (`next_question_id`)
- Control option order or randomization

---

#### 3. Branching Logic Control
Admins can:
- Define parent–child question relationships
- Visualize branch depth (Level 1–3)
- Prevent circular or invalid branches
- Test branch paths before publishing

---

#### 4. Trait & Weight Management
Admins can:
- Adjust trait weight values
- Enable secondary trait scoring
- Flag high-signal questions
- Rebalance scoring without code changes

---

#### 5. Career Cluster Mapping
Admins can:
- Define career clusters
- Set required and supporting traits
- Configure subject-track constraints (SSS)
- Adjust threshold logic for confidence levels

---

#### 6. Publishing & Version Control
Admins can:
- Save changes as draft
- Publish new assessment versions
- Roll back to previous versions
- Lock live versions during pilots

---

### Admin UX Principles

- Form-driven (no-code)
- Safe defaults to prevent misconfiguration
- Inline validation and warnings
- Clear preview of student experience

---

### Non-Goals (Admin v1)

- No visual flowchart builder (tables first)
- No real-time analytics dashboard
- No automated optimization

---

### MVP Success Criteria (Admin Backend)

- Non-technical users can manage questions
- Branching logic can be updated safely
- Engine behavior changes without redeploying frontend
- Supports rapid iteration during school pilots

---

**Status:** MVP PRD – Ready for Design & Development

