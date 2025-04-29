#!/usr/bin/env node
const Taskmaster = require('./taskmaster');
const ProjectAnalyzer = require('./project-analyzer');
const readline = require('readline');

const taskmaster = new Taskmaster();
const analyzer = new ProjectAnalyzer();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function createTask() {
  const title = await askQuestion('Task title: ');
  const description = await askQuestion('Task description: ');
  
  console.log('\nCategories: UI, Backend, Database, Testing, Deployment, Documentation, Refactoring, Optimization');
  const category = await askQuestion('Task category: ');
  
  console.log('\nPriorities: Critical, High, Medium, Low');
  const priority = await askQuestion('Task priority: ');
  
  const deadlineInput = await askQuestion('Task deadline (YYYY-MM-DD or leave empty): ');
  const deadline = deadlineInput ? new Date(deadlineInput).toISOString() : null;
  
  const notes = await askQuestion('Additional notes: ');
  
  const newTask = taskmaster.createTask({
    title,
    description,
    category,
    priority,
    status: 'Pending',
    deadline,
    dependencies: [],
    subtasks: [],
    notes
  });
  
  console.log('\nTask created successfully:');
  console.log(JSON.stringify(newTask, null, 2));
}

function displayTasks(tasks) {
  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }
  
  // Group tasks by status
  const tasksByStatus = {};
  tasks.forEach(task => {
    if (!tasksByStatus[task.status]) {
      tasksByStatus[task.status] = [];
    }
    tasksByStatus[task.status].push(task);
  });
  
  // Display tasks by status
  Object.keys(tasksByStatus).forEach(status => {
    console.log(`\n${status.toUpperCase()} (${tasksByStatus[status].length}):`);
    tasksByStatus[status].forEach(task => {
      console.log(`- [${task.id.substring(0, 8)}] ${task.title} (${task.priority})`);
    });
  });
}

async function updateTask(id) {
  const task = taskmaster.getTask(id);
  if (!task) {
    console.log(`Task with ID ${id} not found.`);
    return;
  }
  
  console.log('\nCurrent task:');
  console.log(JSON.stringify(task, null, 2));
  
  console.log('\nLeave fields empty to keep current values.');
  const title = await askQuestion(`Title (${task.title}): `) || task.title;
  const description = await askQuestion(`Description (${task.description}): `) || task.description;
  
  console.log('\nCategories: UI, Backend, Database, Testing, Deployment, Documentation, Refactoring, Optimization');
  const category = await askQuestion(`Category (${task.category}): `) || task.category;
  
  console.log('\nPriorities: Critical, High, Medium, Low');
  const priority = await askQuestion(`Priority (${task.priority}): `) || task.priority;
  
  console.log('\nStatus: Pending, In Progress, Review, Completed, Blocked');
  const status = await askQuestion(`Status (${task.status}): `) || task.status;
  
  const deadlineStr = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : 'none';
  const deadlineInput = await askQuestion(`Deadline (${deadlineStr}): `);
  const deadline = deadlineInput ? new Date(deadlineInput).toISOString() : task.deadline;
  
  const notes = await askQuestion(`Additional notes (${task.notes}): `) || task.notes;
  
  const updatedTask = taskmaster.updateTask(id, {
    title,
    description,
    category,
    priority,
    status,
    deadline,
    notes
  });
  
  console.log('\nTask updated successfully:');
  console.log(JSON.stringify(updatedTask, null, 2));
}

async function processCommand(command) {
  const parts = command.trim().split(' ');
  const action = parts[0].toLowerCase();
  
  if (action !== 'task') {
    console.log('Unknown command. Type "task help" for available commands.');
    return;
  }
  
  const subcommand = parts[1] ? parts[1].toLowerCase() : 'help';
  
  switch (subcommand) {
    case 'list':
      // Check for filters
      const filters = {};
      if (parts[2]) {
        const filterPart = parts[2];
        if (filterPart.startsWith('category:')) {
          filters.category = filterPart.split(':')[1];
        } else if (filterPart.startsWith('priority:')) {
          filters.priority = filterPart.split(':')[1];
        } else if (filterPart.startsWith('status:')) {
          filters.status = filterPart.split(':')[1];
        }
      }
      
      const tasks = taskmaster.listTasks(filters);
      displayTasks(tasks);
      break;
      
    case 'create':
      await createTask();
      break;
      
    case 'update':
      const updateId = parts[2];
      if (!updateId) {
        console.log('Please provide a task ID to update.');
        return;
      }
      await updateTask(updateId);
      break;
      
    case 'complete':
      const completeId = parts[2];
      if (!completeId) {
        console.log('Please provide a task ID to complete.');
        return;
      }
      try {
        const completedTask = taskmaster.completeTask(completeId);
        console.log(`Task "${completedTask.title}" marked as completed.`);
      } catch (error) {
        console.error(error.message);
      }
      break;
      
    case 'delete':
      const deleteId = parts[2];
      if (!deleteId) {
        console.log('Please provide a task ID to delete.');
        return;
      }
      try {
        const deletedTask = taskmaster.deleteTask(deleteId);
        console.log(`Task "${deletedTask.title}" deleted.`);
      } catch (error) {
        console.error(error.message);
      }
      break;
      
    case 'blocked':
      const blockId = parts[2];
      if (!blockId) {
        console.log('Please provide a task ID to mark as blocked.');
        return;
      }
      const reason = await askQuestion('Reason for blocking this task: ');
      try {
        const blockedTask = taskmaster.blockTask(blockId, reason);
        console.log(`Task "${blockedTask.title}" marked as blocked.`);
      } catch (error) {
        console.error(error.message);
      }
      break;
      
    case 'focus':
      const focusTask = taskmaster.getFocusTask();
      if (focusTask) {
        console.log('\nRecommended task to focus on:');
        console.log(JSON.stringify(focusTask, null, 2));
      } else {
        console.log('No available tasks to focus on.');
      }
      break;
      
    case 'report':
      const reportPath = taskmaster.generateReport();
      if (reportPath) {
        console.log(`Report generated: ${reportPath}`);
      } else {
        console.log('Failed to generate report.');
      }
      break;
      
    case 'analyze':
      console.log('Analyzing project for task suggestions...');
      const suggestions = analyzer.generateTaskSuggestions();
      
      if (suggestions.length === 0) {
        console.log('No task suggestions found from code analysis.');
        return;
      }
      
      console.log(`\nFound ${suggestions.length} potential tasks from code analysis:`);
      for (let i = 0; i < suggestions.length; i++) {
        console.log(`\n${i + 1}. ${suggestions[i].title} (${suggestions[i].category}, ${suggestions[i].priority})`);
        console.log(`   ${suggestions[i].description}`);
      }
      
      const addResponse = await askQuestion('\nWould you like to add these suggestions to your tasks? (y/n): ');
      if (addResponse.toLowerCase() === 'y') {
        for (const suggestion of suggestions) {
          taskmaster.createTask(suggestion);
        }
        console.log(`Added ${suggestions.length} tasks from code analysis.`);
      }
      break;
      
    case 'help':
    default:
      console.log(`
Taskmaster Commands:
  task list                      - Display all tasks, grouped by status
  task list category:[category]  - Filter tasks by category
  task list priority:[priority]  - Filter tasks by priority
  task list status:[status]      - Filter tasks by status
  task create                    - Create a new task
  task update [id]               - Update an existing task
  task complete [id]             - Mark a task as completed
  task delete [id]               - Remove a task
  task blocked [id]              - Mark a task as blocked
  task focus                     - Recommend the next most important task
  task report                    - Generate progress report
  task analyze                   - Analyze code for task suggestions
  task help                      - Show this help message
      `);
      break;
  }
}

async function main() {
  console.log('Taskmaster - Task Management System');
  console.log('Type "task help" for available commands or "exit" to quit.');
  
  while (true) {
    const command = await askQuestion('\n> ');
    if (command.toLowerCase() === 'exit') {
      break;
    }
    
    await processCommand(command);
  }
  
  rl.close();
}

main(); 