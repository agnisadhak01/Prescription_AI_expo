const fs = require('fs');
const path = require('path');

class ProjectAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || path.join(__dirname, '..');
    this.excludeDirs = ['node_modules', '.git', '.expo', 'Taskmaster'];
  }

  /**
   * Scan the project files recursively
   * @param {string} dir - Directory to scan
   * @param {string[]} extensions - File extensions to include
   * @returns {string[]} - List of file paths
   */
  scanFiles(dir = this.projectRoot, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    const results = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          if (!this.excludeDirs.includes(item)) {
            results.push(...this.scanFiles(itemPath, extensions));
          }
        } else if (stats.isFile()) {
          const ext = path.extname(itemPath);
          if (extensions.includes(ext)) {
            results.push(itemPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error.message);
    }
    
    return results;
  }

  /**
   * Find TODO comments in the project files
   * @returns {Object[]} - List of TODO items with file and line info
   */
  findTodoComments() {
    const files = this.scanFiles();
    const todos = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Look for TODO or FIXME comments
          if (line.includes('TODO:') || line.includes('FIXME:') || line.includes('TODO ') || line.includes('FIXME ')) {
            todos.push({
              file: path.relative(this.projectRoot, file),
              line: index + 1,
              text: line.trim(),
              type: line.includes('FIXME') ? 'FIXME' : 'TODO'
            });
          }
        });
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    }
    
    return todos;
  }

  /**
   * Identify potential improvement areas based on code patterns
   * @returns {Object[]} - List of potential improvements
   */
  identifyImprovementAreas() {
    const files = this.scanFiles();
    const improvements = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativeFile = path.relative(this.projectRoot, file);
        
        // Look for large functions (over 50 lines)
        const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/gs) || [];
        for (const match of functionMatches) {
          if (match.split('\n').length > 50) {
            improvements.push({
              file: relativeFile,
              type: 'Refactoring',
              description: 'Large function that might need refactoring',
              details: `Function has over 50 lines and might benefit from being broken down into smaller functions.`
            });
          }
        }
        
        // Look for duplicate code blocks
        // This is a simplistic approach - a real implementation would use more sophisticated algorithms
        const codeBlocks = content.match(/{[^{}]*}/g) || [];
        const blockCounts = {};
        for (const block of codeBlocks) {
          if (block.length > 100) { // Only consider substantial blocks
            const simplified = block.replace(/\s+/g, ' ').trim();
            blockCounts[simplified] = (blockCounts[simplified] || 0) + 1;
          }
        }
        
        for (const [block, count] of Object.entries(blockCounts)) {
          if (count > 1) {
            improvements.push({
              file: relativeFile,
              type: 'Duplication',
              description: 'Possible code duplication detected',
              details: `Found ${count} instances of similar code blocks, consider extracting to a reusable function.`
            });
            break; // Only report once per file
          }
        }
        
        // Check for hardcoded values that should be constants
        if (content.match(/(['"])(?:http|api|www)[^\1]+\1/g)) {
          improvements.push({
            file: relativeFile,
            type: 'Optimization',
            description: 'Hardcoded URLs or API endpoints',
            details: 'Consider moving hardcoded URLs or API endpoints to a configuration file or constants.'
          });
        }
        
      } catch (error) {
        console.error(`Error analyzing file ${file}:`, error.message);
      }
    }
    
    return improvements;
  }

  /**
   * Generate task suggestions based on analysis
   * @returns {Object[]} - List of suggested tasks
   */
  generateTaskSuggestions() {
    const todos = this.findTodoComments();
    const improvements = this.identifyImprovementAreas();
    const tasks = [];
    
    // Convert TODOs to tasks
    for (const todo of todos) {
      tasks.push({
        title: `${todo.type}: ${todo.text.replace(todo.type + ':', '').trim()}`,
        description: `Found in ${todo.file}:${todo.line}`,
        category: todo.type === 'FIXME' ? 'Refactoring' : 'Documentation',
        priority: todo.type === 'FIXME' ? 'High' : 'Medium',
        status: 'Pending',
        notes: `Original comment: ${todo.text}`
      });
    }
    
    // Convert improvement suggestions to tasks
    for (const improvement of improvements) {
      tasks.push({
        title: improvement.description,
        description: `${improvement.details} (${improvement.file})`,
        category: improvement.type,
        priority: 'Medium',
        status: 'Pending',
        notes: `Auto-detected by project analyzer`
      });
    }
    
    return tasks;
  }
}

module.exports = ProjectAnalyzer; 