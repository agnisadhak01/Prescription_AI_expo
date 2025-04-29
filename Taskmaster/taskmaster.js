const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Taskmaster {
  constructor() {
    this.tasksPath = path.join(__dirname, 'tasks.json');
    this.completedPath = path.join(__dirname, 'completed.json');
    this.tasks = this._loadTasks();
    this.completedTasks = this._loadCompletedTasks();
  }

  _loadTasks() {
    try {
      const data = fs.readFileSync(this.tasksPath, 'utf8');
      return JSON.parse(data).tasks || [];
    } catch (error) {
      console.error('Error loading tasks:', error.message);
      return [];
    }
  }

  _loadCompletedTasks() {
    try {
      const data = fs.readFileSync(this.completedPath, 'utf8');
      return JSON.parse(data).completed_tasks || [];
    } catch (error) {
      console.error('Error loading completed tasks:', error.message);
      return [];
    }
  }

  _saveTasks() {
    try {
      fs.writeFileSync(this.tasksPath, JSON.stringify({ tasks: this.tasks }, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving tasks:', error.message);
    }
  }

  _saveCompletedTasks() {
    try {
      fs.writeFileSync(this.completedPath, JSON.stringify({ completed_tasks: this.completedTasks }, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving completed tasks:', error.message);
    }
  }

  createTask(taskData) {
    const now = new Date().toISOString();
    const newTask = {
      id: uuidv4(),
      created: now,
      updated: now,
      ...taskData,
    };
    
    this.tasks.push(newTask);
    this._saveTasks();
    return newTask;
  }

  getTask(id) {
    return this.tasks.find(task => task.id === id);
  }

  updateTask(id, updates) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updated: new Date().toISOString(),
    };
    
    this._saveTasks();
    return this.tasks[taskIndex];
  }

  completeTask(id) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const completedTask = {
      ...this.tasks[taskIndex],
      status: 'Completed',
      updated: new Date().toISOString(),
      completed: new Date().toISOString(),
    };
    
    this.completedTasks.push(completedTask);
    this.tasks.splice(taskIndex, 1);
    
    this._saveTasks();
    this._saveCompletedTasks();
    
    return completedTask;
  }

  deleteTask(id) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const deletedTask = this.tasks[taskIndex];
    this.tasks.splice(taskIndex, 1);
    this._saveTasks();
    
    return deletedTask;
  }

  blockTask(id, reason) {
    return this.updateTask(id, {
      status: 'Blocked',
      notes: this.getTask(id).notes + `\n[BLOCKED]: ${reason}`
    });
  }

  listTasks(filters = {}) {
    let filteredTasks = [...this.tasks];
    
    if (filters.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }
    
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }
    
    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }
    
    return filteredTasks;
  }

  getFocusTask() {
    // Prioritize tasks by dependency tree, status, priority, and deadline
    const availableTasks = this.tasks.filter(task => {
      // Filter out blocked tasks
      if (task.status === 'Blocked') return false;
      
      // Filter out tasks with unmet dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const pendingDependencies = task.dependencies.filter(depId => 
          this.tasks.some(t => t.id === depId && t.status !== 'Completed')
        );
        if (pendingDependencies.length > 0) return false;
      }
      
      return true;
    });
    
    if (availableTasks.length === 0) return null;
    
    // Sort by priority (Critical > High > Medium > Low)
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    availableTasks.sort((a, b) => {
      // First, sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by deadline (if both have deadlines)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (a.deadline) {
        return -1; // a has a deadline, b doesn't, so a comes first
      } else if (b.deadline) {
        return 1; // b has a deadline, a doesn't, so b comes first
      }
      
      // If no other criteria match, sort by creation date
      return new Date(a.created) - new Date(b.created);
    });
    
    return availableTasks[0];
  }

  generateReport() {
    const now = new Date().toISOString();
    const reportPath = path.join(__dirname, 'reports', `report-${now.split('T')[0]}.json`);
    
    const report = {
      date: now,
      total_tasks: this.tasks.length,
      completed_tasks: this.completedTasks.length,
      tasks_by_status: {},
      tasks_by_category: {},
      tasks_by_priority: {},
    };
    
    // Count tasks by status
    this.tasks.forEach(task => {
      report.tasks_by_status[task.status] = (report.tasks_by_status[task.status] || 0) + 1;
      report.tasks_by_category[task.category] = (report.tasks_by_category[task.category] || 0) + 1;
      report.tasks_by_priority[task.priority] = (report.tasks_by_priority[task.priority] || 0) + 1;
    });
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
      return reportPath;
    } catch (error) {
      console.error('Error generating report:', error.message);
      return null;
    }
  }
}

module.exports = Taskmaster; 