# Bilim — Product Requirements Document (PRD)

## 1. Product Overview

- **Product name:** Bilim
- **Product type:** Web-based educational knowledge platform
- **Primary language:** Uzbek
- **Target market:** Uzbekistan and Uzbek-speaking users worldwide

### Product vision

Bilim is a free, structured online knowledge platform where users can learn practical and academic subjects in Uzbek through concise lessons, examples, exercises, quizzes, and structured learning paths.

The initial product will focus on IT and programming, with architecture designed to support additional subjects later.

### Core proposition

«Learn practical knowledge in Uzbek — for free.»

---

## 2. Goals

### 2.1 Primary goals

1. Provide high-quality educational content in Uzbek.
2. Organize knowledge into structured courses and learning paths.
3. Allow users to learn through lessons, examples, quizzes, and exercises.
4. Track individual learning progress.
5. Allow qualified contributors to create educational content.
6. Establish a moderation and review system for content quality.
7. Build an SEO-friendly educational knowledge base.

### 2.2 Non-goals for MVP

The MVP will not include:

- Native mobile applications
- Live classes
- Video hosting
- AI tutor
- Paid courses
- Advertising
- Marketplace
- Employer/recruitment functionality
- Advanced social networking
- Public leaderboards
- Certificates

---

## 3. Target Users

### 3.1 Learner

A person who wants to learn a subject independently in Uzbek.

Examples:

- University student
- High-school student
- Career changer
- Self-taught developer
- Freelancer
- Professional improving skills

### 3.2 Contributor

A knowledgeable person who creates lessons or educational material.

Examples:

- Developer
- Teacher
- Engineer
- Industry professional
- Experienced student

### 3.3 Reviewer

A qualified contributor responsible for reviewing submitted educational content.

### 3.4 Administrator

Manages the platform, users, content, categories, moderation and analytics.

---

## 4. MVP Scope

The MVP consists of:

1. Public website
2. User authentication
3. Categories
4. Courses
5. Learning paths
6. Lessons
7. Interactive programming examples
8. Exercises
9. Quizzes
10. User progress
11. Bookmarks
12. Contributor system
13. Content moderation
14. Search
15. Glossary
16. User profiles
17. Admin panel
18. SEO infrastructure

---

## 5. Initial Content

The MVP launches with the following subjects:

### Programming

- HTML
- CSS
- JavaScript
- Git
- SQL

Each subject should contain a structured course.

### Minimum launch content

- 5 courses
- 100+ lessons
- 50+ exercises
- 100+ quiz questions
- 100+ glossary terms

Content must be written in clear, natural Uzbek.

---

## 6. Information Architecture

```
Home
│
├── Categories
│   ├── Programming
│   │   ├── HTML
│   │   ├── CSS
│   │   ├── JavaScript
│   │   ├── Git
│   │   └── SQL
│   │
│   └── Future categories
│
├── Learning Paths
│   └── Frontend Developer
│
├── Search
│
├── Glossary
│
└── Community
    └── Contributors
```

---

## 7. Homepage

The homepage must contain:

### Header

- Logo
- Courses
- Learning Paths
- Glossary
- Search
- Login
- Sign up

### Hero

Headline: «O'zbek tilida bepul bilim o'rganing.»

Search field: «Nimani o'rganmoqchisiz?»

### Popular categories

Display major subjects.

### Popular courses

Display most popular courses.

### Learning paths

Display available career/skill paths.

### Latest content

Display recently published lessons.

### Contributors

Display selected contributors.

---

## 8. Authentication

Users can register/login using:

- Google
- Telegram
- Email/password

Authentication must support:

- registration
- login
- logout
- password reset
- email verification
- account deletion

---

## 9. User Profile

Profile fields:

- Username
- Display name
- Avatar
- Bio
- Registration date

Learning statistics:

- Lessons completed
- Courses completed
- Exercises completed
- Current streak
- Learning paths
- Saved lessons

Public profile URL: `/u/{username}`

---

## 10. Categories

Each category contains:

- Name
- Slug
- Description
- Icon
- Parent category
- Courses
- Number of lessons

Example:

```
Programming
→ JavaScript
→ React
→ Python
→ SQL
```

Categories must support hierarchical organization.

---

## 11. Courses

Each course contains:

- Title
- Slug
- Description
- Cover image
- Category
- Difficulty
- Estimated duration
- Author
- Reviewer
- Modules
- Lessons
- Exercises
- Quizzes
- Publication status

Course URL: `/courses/{course-slug}`

### Course page

Display:

- Course description
- Learning objectives
- Prerequisites
- Module list
- Progress
- Author
- Reviewer
- Start/Continue button

---

## 12. Learning Paths

A learning path consists of multiple courses.

Example:

```
Frontend Developer

HTML
↓
CSS
↓
JavaScript
↓
Git
↓
React
↓
TypeScript
```

Learning path fields:

- Title
- Description
- Difficulty
- Estimated duration
- Courses
- Required skills
- Learning outcomes

---

## 13. Lessons

Every lesson must have:

- Title
- Slug
- Introduction
- Main content
- Examples
- Images/diagrams where appropriate
- Interactive examples where applicable
- Exercises
- Quiz
- Related lessons
- Previous lesson
- Next lesson
- Author
- Reviewer
- Last updated date

URL: `/courses/{course}/lessons/{lesson}`

---

## 14. Lesson Content Format

Lessons should follow a consistent structure:

1. Title
2. Short explanation
3. Why is this important?
4. Concept explanation
5. Example
6. Interactive example
7. Detailed explanation
8. Common mistakes
9. Exercise
10. Quiz
11. Related concepts
12. Next lesson

Content must support:

- Headings
- Paragraphs
- Lists
- Tables
- Code blocks
- Images
- Links
- Notes
- Warnings
- Embedded examples

---

## 15. Interactive Code Editor

For programming courses, users can write and execute code directly in the browser.

MVP languages:

- HTML
- CSS
- JavaScript

Future:

- Python
- SQL
- TypeScript

### Requirements

- Code editor
- Run button
- Output panel
- Reset button
- Mobile-friendly interface

User code must execute inside a secure sandbox.

Arbitrary code must never execute directly on the application server.

---

## 16. Exercises

Exercise fields:

- Title
- Description
- Difficulty
- Instructions
- Expected result
- Validation rules
- Hints
- Solution

Exercise states:

- Not started
- In progress
- Completed

Programming exercises must automatically validate user submissions where possible.

---

## 17. Quizzes

Question types:

- Multiple choice
- True/false
- Multiple answers

Each question contains:

- Question
- Answers
- Correct answer
- Explanation

Quiz result:

- Score
- Correct answers
- Incorrect answers
- Explanations

---

## 18. Progress Tracking

For authenticated users track:

- Course started
- Lesson viewed
- Lesson completed
- Exercise completed
- Quiz score
- Learning path progress

Course progress example:

```
JavaScript
████████░░ 80%
```

Users can resume their last lesson.

---

## 19. Bookmarks

Users can bookmark:

- Courses
- Lessons
- Glossary terms

Bookmark management page: `/dashboard/bookmarks`

---

## 20. Search

Search must cover:

- Courses
- Lessons
- Categories
- Glossary
- Contributors

Search should support Uzbek Latin characters including: `o'`, `g'`, `'`

Search should tolerate common variations such as: `o'zbek`, `o'zbek`, `ozbek`

Search result ranking should prioritize:

1. Exact title match
2. Partial title match
3. Content relevance
4. Popularity
5. Quality

---

## 21. Glossary

Each glossary term contains:

- Term
- Uzbek definition
- English equivalent
- Russian equivalent where available
- Examples
- Related terms
- Related lessons

Example:

```
API
Application Programming Interface

API — dasturlar o'rtasida ma'lumot almashishni
ta'minlaydigan interfeys.

Related:
HTTP
REST
JSON
Endpoint
```

Glossary terms should be indexable by search engines.

---

## 22. Contributor System

Users can apply to become contributors.

Contributor application:

- Areas of expertise
- Experience
- Portfolio/profile URL
- Motivation
- Sample educational content

Admin approves or rejects applications.

Approved contributors can:

- Create drafts
- Edit drafts
- Submit content
- View review feedback
- Revise rejected content

Contributors cannot directly publish content.

---

## 23. Content Workflow

```
Draft
 ↓
Submitted
 ↓
Under Review
 ↓
Changes Requested
 ↓
Resubmitted
 ↓
Approved
 ↓
Published
```

Content versions must be stored.

Administrators must be able to restore previous versions.

---

## 24. Content Quality

Every published lesson must display:

- Author
- Reviewer
- Last updated date

Users can report:

- Incorrect information
- Outdated information
- Copyright violation
- Spam
- Offensive content

Reports are sent to moderators.

---

## 25. Discussions

MVP discussion functionality:

Each lesson can contain:

- Comments
- Replies
- Upvotes
- Report

Users can ask questions about the lesson.

Authors and reviewers can answer questions.

Moderators can delete inappropriate comments.

---

## 26. Contributor Profiles

Contributor profile displays:

- Name
- Avatar
- Bio
- Expertise
- Published courses
- Published lessons
- Number of learners
- Contributor reputation

Example:

```
Ali Valiyev
Frontend Developer

Courses: 4
Lessons: 38
Learners: 12,450
```

---

## 27. Admin Panel

### Overview

- Total users
- Active users
- Courses
- Lessons
- Contributors
- Pending reviews
- Reports

### Content management

- Categories
- Courses
- Modules
- Lessons
- Exercises
- Quizzes
- Glossary

### Moderation

- Contributor applications
- Content submissions
- User reports
- Comments

### Users

- Search users
- View profile
- Change roles
- Suspend account
- Delete account

---

## 28. Roles & Permissions

```
Visitor
    ↓
User
    ↓
Contributor
    ↓
Reviewer
    ↓
Moderator
    ↓
Admin
```

**Visitor** — Read published content.

**User** — Visitor permissions + Progress, Bookmarks, Comments, Exercises, Quizzes.

**Contributor** — User permissions + Create content, Edit own drafts, Submit content.

**Reviewer** — Contributor permissions + Review assigned content, Request changes, Approve content.

**Moderator** — Moderate users, Moderate comments, Handle reports.

**Admin** — Full access.

---

## 29. Notifications

MVP notifications:

- Content review result
- Comment reply
- Course completion
- Exercise completion
- Contributor approval

Notification center: `/notifications`

---

## 30. SEO

Every public course, lesson and glossary term must have:

- SEO title
- Meta description
- Canonical URL
- Open Graph metadata
- Structured data where appropriate
- Sitemap inclusion

URLs must be human-readable.

Example:

```
/uz/javascript/massivlar
/uz/html/formalar
/uz/css/flexbox
```

Avoid IDs in public URLs.

---

## 31. Internationalization

Architecture must support multiple languages.

Initial language: Uzbek

Future: Russian, English

Content language must be stored independently from UI language.

---

## 32. Responsive Design

The platform must work on:

- Mobile phones
- Tablets
- Laptops
- Desktop

Mobile-first design is required.

Minimum supported browsers: Chrome, Safari, Firefox, Edge

---

## 33. Accessibility

The platform should follow WCAG principles.

Requirements:

- Keyboard navigation
- Semantic HTML
- Accessible form labels
- Sufficient contrast
- Alt text
- Screen-reader compatibility
- Focus states

---

## 34. Performance

Target:

- Lighthouse Performance ≥90 for major public pages
- Fast initial page load
- Server-side rendering/static generation for SEO pages
- Image optimization
- CDN for static assets

Course and lesson pages should be optimized for low-bandwidth connections.

---

## 35. Security

Requirements:

- HTTPS
- Secure authentication
- Password hashing
- Rate limiting
- CSRF protection where applicable
- XSS protection
- Input validation
- Authorization checks
- Secure file uploads
- Audit logs for administrative actions

Interactive code execution must use isolated sandboxes.

---

## 36. Recommended Technical Architecture

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS

### Backend

**Option A:** Next.js server architecture

**Option B:** Node.js, NestJS, REST API

Use a modular architecture so the backend can later support mobile applications.

### Database

- PostgreSQL

### ORM

- Prisma

### Authentication

- Auth.js or equivalent
- Google OAuth
- Telegram authentication
- Email/password

### Search

MVP: PostgreSQL full-text search

Later: OpenSearch/Elasticsearch

### Storage

S3-compatible object storage.

### Code execution

Isolated sandbox/container execution service.

---

## 37. Core Database Entities

```
User
Role
Profile

Category
Course
Module
Lesson

LessonContent
Exercise
ExerciseSubmission
Quiz
QuizQuestion
QuizAnswer

LearningPath
LearningPathCourse

Progress
Bookmark

GlossaryTerm

ContributorApplication

ContentReview
ContentVersion
ContentReport

Comment
CommentVote

Notification

AuditLog
```

---

## 38. Important Relationships

```
Category
 └── Courses
      └── Modules
           └── Lessons
                ├── Exercises
                └── Quizzes

LearningPath
 └── Courses

User
 ├── Progress
 ├── Bookmarks
 ├── Comments
 └── Submissions

Contributor
 └── Content

Lesson
 ├── Author
 ├── Reviewer
 ├── Comments
 ├── Reports
 └── Versions
```

---

## 39. API Requirements

### Authentication

```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot-password
```

### Courses

```
GET /courses
GET /courses/:slug
POST /courses
PATCH /courses/:id
DELETE /courses/:id
```

### Lessons

```
GET /lessons/:slug
POST /lessons
PATCH /lessons/:id
DELETE /lessons/:id
```

### Progress

```
GET /me/progress
POST /lessons/:id/complete
POST /exercises/:id/submit
```

### Bookmarks

```
GET /me/bookmarks
POST /bookmarks
DELETE /bookmarks/:id
```

### Search

```
GET /search?q=
```

### Glossary

```
GET /glossary
GET /glossary/:slug
```

### Contributions

```
POST /contributor/apply
POST /content/submit
GET /content/my
```

---

## 40. Analytics

### Acquisition

- Landing page visits
- Search traffic
- Referral source

### Learning

- Course starts
- Lesson starts
- Lesson completions
- Exercise attempts
- Exercise completion
- Quiz scores

### Retention

- Daily active users
- Weekly active users
- Monthly active users
- Day 7 retention
- Day 30 retention

### Content

- Most viewed lessons
- Most completed lessons
- Search queries
- Failed searches
- Most bookmarked lessons

---

## 41. MVP Acceptance Criteria

The MVP is ready for public launch when:

### Content

- 5 courses exist
- 100+ lessons published
- All lessons reviewed
- 50+ exercises available
- 100+ quiz questions available

### Platform

- Users can register/login
- Users can browse courses
- Users can search content
- Users can read lessons
- Users can complete exercises
- Users can take quizzes
- Progress is persisted
- Bookmarks work
- Contributor applications work
- Content review workflow works
- Admin panel works

### Technical

- Mobile responsive
- HTTPS enabled
- Error monitoring enabled
- Database backups configured
- Code execution sandbox secured
- SEO metadata implemented
- Sitemap implemented
- Production deployment automated

---

## 42. MVP Development Phases

**Phase 1 — Foundation**

- Project setup
- Database
- Authentication
- Design system
- User roles
- Admin foundation

**Phase 2 — Content**

- Categories
- Courses
- Modules
- Lessons
- Content editor
- Publishing workflow

**Phase 3 — Learning**

- Progress
- Exercises
- Quizzes
- Bookmarks
- Learning paths

**Phase 4 — Programming**

- Code editor
- JavaScript execution
- HTML/CSS preview
- Exercise validation

**Phase 5 — Community**

- Contributor applications
- Reviews
- Comments
- Reports
- Contributor profiles

**Phase 6 — Discovery**

- Search
- Glossary
- SEO
- Sitemap
- Recommendations

**Phase 7 — Launch**

- Analytics
- Monitoring
- Security audit
- Performance optimization
- Production deployment

---

## 43. Launch Strategy

Initial launch should focus on one clear category: programming/IT.

Initial positioning: «O'zbek tilida dasturlashni bepul o'rganing.»

After achieving consistent learner activity and contributor participation, expand into:

1. Business
2. Finance
3. English
4. Mathematics
5. Science
6. Design
7. Professional skills

---

## 44. Future Features

After MVP validation:

- Python execution
- SQL playground
- TypeScript
- Certificates
- Advanced assessments
- AI tutor
- AI-assisted search
- Personalized learning paths
- Streaks
- Achievements
- Leaderboards
- Mobile applications
- Offline learning
- Russian/English localization
- Expert mentorship
- Employer/recruitment platform
- Corporate learning

---

## 45. Product Success Criteria

The product should ultimately demonstrate:

### Learners

- Users regularly return to continue courses.
- Users complete multiple lessons per session.
- Users progress through complete learning paths.
- Users search for additional content.

### Contributors

- New contributors join organically.
- Contributors publish repeatedly.
- Reviewers maintain content quality.
- Existing contributors remain active.

### Content

- Search traffic grows.
- Published content accumulates.
- Content is updated rather than abandoned.
- Users report errors and contributors correct them.

### Core metric

Weekly learners who complete at least one meaningful learning activity.

The product should optimize for learning outcomes and recurring usage, not registrations or page views.
