# Taskmaster

A task management and development workflow system integrated into your project.

## Commands

- `task list`: Display all tasks, grouped by status
- `task list category:[category]`: Filter tasks by category
- `task list priority:[priority]`: Filter tasks by priority
- `task list status:[status]`: Filter tasks by status
- `task create`: Guide through creating a new task
- `task update [id]`: Update an existing task
- `task complete [id]`: Mark a task as completed
- `task delete [id]`: Remove a task
- `task blocked [id]`: Mark a task as blocked and prompt for reason
- `task focus`: Recommend the next most important task to work on

## Directory Structure

- `tasks.json`: Main task database
- `completed.json`: Archive of completed tasks
- `/reports`: Directory for progress reports
- `/templates`: Reusable task templates

## Categories

- UI
- Backend
- Database
- Testing
- Deployment
- Documentation
- Refactoring
- Optimization

## Priorities

- Critical
- High
- Medium
- Low

## Statuses

- Pending
- In Progress
- Review
- Completed
- Blocked 