# GitHub Labels Configuration

This file documents the labels used in the CozyReads repository.

## Severity Labels

| Label | Color | Description |
|-------|-------|-------------|
| `critical` | `#d63031` | Blocks deployment or core functionality |
| `high` | `#e17055` | Significant functionality affected |
| `medium` | `#fdcb6e` | Some functionality affected |
| `low` | `#74b9ff` | Minor issue or enhancement |

## Type Labels

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d1a854` | Something isn't working |
| `enhancement` | `#a29bfe` | New feature or improvement |
| `documentation` | `#6c5ce7` | Improvements or additions to docs |
| `refactor` | `#1dd1a1` | Code restructuring without behavior change |
| `performance` | `#00b894` | Performance improvements |
| `security` | `#d63031` | Security-related issue |

## Category Labels

| Label | Color | Description |
|-------|-------|-------------|
| `ui/ux` | `#e84393` | User interface or experience |
| `backend` | `#0984e3` | Backend/API related |
| `database` | `#6c5ce7` | Database related |
| `testing` | `#fdcb6e` | Test-related |
| `accessibility` | `#00b894` | Accessibility (A11Y) |
| `dependencies` | `#f0ad4e` | Dependency updates |

## Status Labels

| Label | Color | Description |
|-------|-------|-------------|
| `in-progress` | `#0984e3` | Currently being worked on |
| `blocked` | `#d63031` | Blocked by another issue |
| `help-wanted` | `#fdcb6e` | Looking for contributors |
| `good-first-issue` | `#7bed9f` | Good for newcomers |
| `discussion` | `#5f27cd` | Needs discussion |

## Other Labels

| Label | Color | Description |
|-------|-------|-------------|
| `wontfix` | `#636e72` | Won't be fixed |
| `duplicate` | `#b2bec3` | Duplicate issue |
| `invalid` | `#dfe6e9` | Not a valid issue |
| `question` | `#0984e3` | Question or clarification needed |

## Workflow

1. **Issues are created** with appropriate type label
2. **Triaged** by maintainers with severity and category labels
3. **Assigned** when work begins (add `in-progress`)
4. **Closed** with appropriate status label

## Creating Labels (for maintainers)

```bash
# Create a new label via GitHub CLI
gh label create "label-name" --color "color-hex" --description "description"

# Example
gh label create "good-first-issue" --color "7bed9f" --description "Good for newcomers"
```
