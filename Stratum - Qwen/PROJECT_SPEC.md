# Project Specification

## Overview

**Project Name:** [PROJECT_NAME]

**Description:** [Brief description of what this project does]

**Repository:** [GitHub/GitLab URL]

---

## Audience & Jobs to Be Done

### Primary Audience

**Who:** [Describe the primary user persona]

**Context:** [When/where do they use this? What's their situation?]

### Jobs to Be Done

| JTBD ID | Statement | Desired Outcome |
|---------|-----------|-----------------|
| JTBD-001 | When [situation], I want to [motivation], so I can [expected outcome] | [Success metric] |
| JTBD-002 | When [situation], I want to [motivation], so I can [expected outcome] | [Success metric] |

---

## Topics of Concern (Activities)

Break down each JTBD into discrete activities (verbs, not capabilities):

### Activity: [activity-name]

**Related to:** JTBD-001

**Description:** What the user does to accomplish part of their job

**Capability Depths:**
- **Basic:** Minimal viable implementation
- **Enhanced:** Additional features/power
- **Advanced:** Edge cases, integrations

**Acceptance Criteria:**
- [ ] Observable outcome 1
- [ ] Observable outcome 2
- [ ] Performance constraint (if applicable)
- [ ] Edge case handling

---

## Technical Constraints

| Constraint | Description |
|------------|-------------|
| **Language** | [e.g., TypeScript, Python, Go] |
| **Runtime** | [e.g., Node.js 20+, Python 3.11+] |
| **Database** | [e.g., PostgreSQL, SQLite, None] |
| **External Services** | [e.g., AWS S3, Stripe, None] |
| **Deployment** | [e.g., Docker, Vercel, Bare metal] |

---

## Architecture Overview

```
[High-level architecture diagram or description]

Example:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│     API      │────▶│  Database   │
│  (React SPA)│     │  (Node.js)   │     │ (PostgreSQL)│
└─────────────┘     └──────────────┘     └─────────────┘
```

### Key Components

| Component | Responsibility | Location |
|-----------|----------------|----------|
| [Name] | [What it does] | `src/...` |
| [Name] | [What it does] | `src/...` |

---

## Build & Test Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile/build the project |
| `npm run test` | Run all tests |
| `npm run lint` | Lint code |
| `npm run dev` | Start development server |

---

## Existing Conventions

### Code Style

- [e.g., ESLint + Prettier configuration]
- [e.g., Black + isort for Python]

### Project Structure

```
project-root/
├── src/              # Application source
├── src/lib/          # Shared utilities (standard library)
├── tests/            # Test files
├── docs/             # Documentation
└── [other dirs]
```

### Naming Conventions

- Files: [e.g., kebab-case.ts]
- Functions: [e.g., camelCase]
- Classes: [e.g., PascalCase]
- Constants: [e.g., UPPER_SNAKE_CASE]

---

## Non-Goals

What this project explicitly does NOT do:

- [Out of scope item 1]
- [Out of scope item 2]

---

## Future Considerations

Nice-to-haves for later (not in current scope):

- [Future feature 1]
- [Future feature 2]

---

## Notes

[Any additional context, decisions made, or constraints not captured above]
