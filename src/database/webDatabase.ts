/**
 * Web Database Adapter
 * Provides SQLite-compatible interface using localStorage for Web platform
 */

const STORAGE_PREFIX = 'bhojanayojana_';
const TABLES = [
  'pantry_items',
  'recipes',
  'recipe_content',
  'recipe_ingredients',
  'meal_plans',
  'nutrition_targets',
  'grocery_items',
  'preparation_tasks',
] as const;

type TableName = typeof TABLES[number];

interface QueryResult {
  lastInsertRowId: number;
}

/**
 * WebDatabase class that mimics expo-sqlite SQLiteDatabase interface
 */
export class WebDatabase {
  private initialized = false;

  /**
   * Initialize Web database storage
   */
  initialize(): void {
    if (this.initialized) return;

    // Create empty tables if they don't exist
    for (const table of TABLES) {
      const key = `${STORAGE_PREFIX}${table}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
      
      // Initialize ID sequence
      const seqKey = `${STORAGE_PREFIX}${table}_seq`;
      if (!localStorage.getItem(seqKey)) {
        localStorage.setItem(seqKey, '0');
      }
    }

    this.initialized = true;
    console.log('Web database initialized with localStorage');
  }

  /**
   * Get all rows matching a query
   */
  async getAllAsync<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const query = this.parseQuery(sql, params);
      
      if (query.type === 'SELECT') {
        return this.executeSelect<T>(query);
      }
      
      return [];
    } catch (error) {
      console.error('WebDatabase getAllAsync error:', error, { sql, params });
      return [];
    }
  }

  /**
   * Get first row matching a query
   */
  async getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.getAllAsync<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute a write query (INSERT, UPDATE, DELETE)
   */
  async runAsync(sql: string, params?: any[]): Promise<QueryResult> {
    try {
      const query = this.parseQuery(sql, params);
      
      if (query.type === 'INSERT') {
        return this.executeInsert(query);
      } else if (query.type === 'UPDATE') {
        return this.executeUpdate(query);
      } else if (query.type === 'DELETE') {
        return this.executeDelete(query);
      }
      
      return { lastInsertRowId: 0 };
    } catch (error) {
      console.error('WebDatabase runAsync error:', error, { sql, params });
      throw error;
    }
  }

  /**
   * Execute SQL (no-op for Web, used for schema creation)
   */
  async execAsync(sql: string): Promise<void> {
    // No-op for Web - schema is implicit
    console.log('WebDatabase execAsync (no-op):', sql.substring(0, 50) + '...');
  }

  /**
   * Close database (no-op for Web)
   */
  async closeAsync(): Promise<void> {
    console.log('WebDatabase closeAsync (no-op)');
  }

  /**
   * Parse SQL query and parameters
   */
  private parseQuery(sql: string, params?: any[]): any {
    const normalizedSql = sql.trim().replace(/\s+/g, ' ');
    const upperSql = normalizedSql.toUpperCase();

    // Detect query type
    let type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UNKNOWN' = 'UNKNOWN';
    if (upperSql.startsWith('SELECT')) type = 'SELECT';
    else if (upperSql.startsWith('INSERT')) type = 'INSERT';
    else if (upperSql.startsWith('UPDATE')) type = 'UPDATE';
    else if (upperSql.startsWith('DELETE')) type = 'DELETE';

    // Extract table name
    let tableName = '';
    if (type === 'SELECT') {
      const fromMatch = normalizedSql.match(/FROM\s+(\w+)/i);
      tableName = fromMatch ? fromMatch[1] : '';
    } else if (type === 'INSERT') {
      const intoMatch = normalizedSql.match(/INTO\s+(\w+)/i);
      tableName = intoMatch ? intoMatch[1] : '';
    } else if (type === 'UPDATE') {
      const updateMatch = normalizedSql.match(/UPDATE\s+(\w+)/i);
      tableName = updateMatch ? updateMatch[1] : '';
    } else if (type === 'DELETE') {
      const fromMatch = normalizedSql.match(/FROM\s+(\w+)/i);
      tableName = fromMatch ? fromMatch[1] : '';
    }

    return {
      type,
      sql: normalizedSql,
      tableName,
      params: params || [],
    };
  }

  /**
   * Execute SELECT query
   */
  private executeSelect<T>(query: any): T[] {
    const data = this.getTableData(query.tableName);
    let results = [...data];

    // Apply WHERE clause
    results = this.applyWhereClause(results, query.sql, query.params);

    // Apply ORDER BY
    results = this.applyOrderBy(results, query.sql);

    return results as T[];
  }

  /**
   * Execute INSERT query
   */
  private executeInsert(query: any): QueryResult {
    const data = this.getTableData(query.tableName);
    
    // Extract column names and values
    const columnsMatch = query.sql.match(/\(([^)]+)\)\s+VALUES/i);
    const columns = columnsMatch
      ? columnsMatch[1].split(',').map((c: string) => c.trim())
      : [];

    // Create new record
    const newRecord: any = {
      id: this.getNextId(query.tableName),
    };

    // Map parameters to columns
    columns.forEach((col: string, index: number) => {
      newRecord[col] = query.params[index] !== undefined ? query.params[index] : null;
    });

    // Add timestamps if not provided
    const now = this.formatDateTime(new Date());
    if (!newRecord.created_at && query.tableName !== 'nutrition_targets') {
      newRecord.created_at = now;
    }
    if (!newRecord.updated_at && (query.tableName === 'pantry_items' || query.tableName === 'recipes')) {
      newRecord.updated_at = now;
    }

    // Handle UPSERT for nutrition_targets
    if (query.sql.includes('ON CONFLICT')) {
      const existingIndex = data.findIndex((item: any) => item.target_date === newRecord.target_date);
      if (existingIndex >= 0) {
        // Update existing record
        data[existingIndex] = { ...data[existingIndex], ...newRecord, id: data[existingIndex].id };
        this.saveTableData(query.tableName, data);
        return { lastInsertRowId: data[existingIndex].id };
      }
    }

    data.push(newRecord);
    this.saveTableData(query.tableName, data);

    return { lastInsertRowId: newRecord.id };
  }

  /**
   * Execute UPDATE query
   */
  private executeUpdate(query: any): QueryResult {
    const data = this.getTableData(query.tableName);
    
    // Extract SET clause
    const setMatch = query.sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) return { lastInsertRowId: 0 };

    const setClause = setMatch[1];
    const setPairs = setClause.split(',').map((p: string) => p.trim());
    
    // Extract field names from SET clause
    const fields = setPairs.map((pair: string) => {
      const match = pair.match(/(\w+)\s*=/);
      return match ? match[1] : '';
    });

    // Apply WHERE to find records to update
    const whereClause = query.sql.match(/WHERE\s+(.+)$/i);
    let recordsToUpdate = data;
    
    if (whereClause) {
      const whereCondition = whereClause[1];
      recordsToUpdate = data.filter((record: any) => 
        this.evaluateWhereCondition(record, whereCondition, query.params)
      );
    }

    // Update records
    let paramIndex = 0;
    recordsToUpdate.forEach((record: any) => {
      fields.forEach((field: string) => {
        if (field === 'updated_at') {
          record[field] = this.formatDateTime(new Date());
        } else if (field) {
          record[field] = query.params[paramIndex];
          paramIndex++;
        }
      });
      // Reset paramIndex for WHERE params
      if (paramIndex >= fields.length) {
        paramIndex = fields.length;
      }
    });

    this.saveTableData(query.tableName, data);
    return { lastInsertRowId: 0 };
  }

  /**
   * Execute DELETE query
   */
  private executeDelete(query: any): QueryResult {
    let data = this.getTableData(query.tableName);
    
    // Apply WHERE clause to filter what to keep
    const whereMatch = query.sql.match(/WHERE\s+(.+)$/i);
    if (whereMatch) {
      const whereCondition = whereMatch[1];
      data = data.filter((record: any) => 
        !this.evaluateWhereCondition(record, whereCondition, query.params)
      );
    } else {
      // No WHERE clause = delete all
      data = [];
    }

    this.saveTableData(query.tableName, data);
    return { lastInsertRowId: 0 };
  }

  /**
   * Apply WHERE clause filtering
   */
  private applyWhereClause(data: any[], sql: string, params: any[]): any[] {
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER BY|$)/i);
    if (!whereMatch) return data;

    const whereClause = whereMatch[1].trim();
    
    return data.filter(record => 
      this.evaluateWhereCondition(record, whereClause, params)
    );
  }

  /**
   * Evaluate WHERE condition for a record
   */
  private evaluateWhereCondition(record: any, condition: string, params: any[]): boolean {
    let paramIndex = 0;
    
    // Replace ? placeholders with actual values
    let evaluableCondition = condition;
    evaluableCondition = evaluableCondition.replace(/\?/g, () => {
      const value = params[paramIndex++];
      return typeof value === 'string' ? `'${value}'` : String(value);
    });

    // Handle date/datetime functions
    evaluableCondition = this.replaceDateFunctions(evaluableCondition);

    // Simple condition evaluation
    // Support: field = value, field <= value, field >= value, field < value, field > value, field IS NULL, field IS NOT NULL
    
    // IS NOT NULL
    if (condition.includes('IS NOT NULL')) {
      const fieldMatch = condition.match(/(\w+)\s+IS NOT NULL/i);
      if (fieldMatch) {
        return record[fieldMatch[1]] !== null && record[fieldMatch[1]] !== undefined;
      }
    }

    // IS NULL
    if (condition.includes('IS NULL')) {
      const fieldMatch = condition.match(/(\w+)\s+IS NULL/i);
      if (fieldMatch) {
        return record[fieldMatch[1]] === null || record[fieldMatch[1]] === undefined;
      }
    }

    // Handle AND conditions
    if (condition.includes(' AND ')) {
      const conditions = condition.split(' AND ');
      return conditions.every(cond => 
        this.evaluateWhereCondition(record, cond.trim(), [])
      );
    }

    // Simple comparisons
    const comparisonMatch = condition.match(/(\w+)\s*(=|<=|>=|<|>)\s*(.+)/i);
    if (comparisonMatch) {
      const [, field, operator, valueStr] = comparisonMatch;
      const recordValue = record[field];
      
      // Extract the value (handle quotes, numbers, date functions)
      let compareValue: any = valueStr.trim();
      if (compareValue.startsWith("'") && compareValue.endsWith("'")) {
        compareValue = compareValue.slice(1, -1);
      } else if (!isNaN(Number(compareValue))) {
        compareValue = Number(compareValue);
      }

      // Handle date comparisons
      if (this.isDateString(recordValue) && this.isDateString(compareValue)) {
        return this.compareDates(recordValue, operator, compareValue);
      }

      // Standard comparison
      switch (operator) {
        case '=': return recordValue == compareValue;
        case '<=': return recordValue <= compareValue;
        case '>=': return recordValue >= compareValue;
        case '<': return recordValue < compareValue;
        case '>': return recordValue > compareValue;
        default: return false;
      }
    }

    // Default: condition evaluates to true if we can't parse it
    return true;
  }

  /**
   * Apply ORDER BY sorting
   */
  private applyOrderBy(data: any[], sql: string): any[] {
    const orderMatch = sql.match(/ORDER BY\s+(.+?)(?:$|LIMIT)/i);
    if (!orderMatch) return data;

    const orderClause = orderMatch[1].trim();
    const parts = orderClause.split(',').map(p => p.trim());
    
    return data.sort((a, b) => {
      for (const part of parts) {
        const match = part.match(/(\w+)\s*(ASC|DESC)?/i);
        if (!match) continue;
        
        const [, field, direction = 'ASC'] = match;
        const aVal = a[field];
        const bVal = b[field];
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        if (comparison !== 0) {
          return direction.toUpperCase() === 'DESC' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Replace date functions with actual values
   */
  private replaceDateFunctions(condition: string): string {
    const now = new Date();
    
    // Replace date('now')
    condition = condition.replace(/date\('now'\)/gi, () => {
      return `'${this.formatDate(now)}'`;
    });
    
    // Replace datetime('now')
    condition = condition.replace(/datetime\('now'\)/gi, () => {
      return `'${this.formatDateTime(now)}'`;
    });
    
    // Replace date('now', '+N days/hours')
    condition = condition.replace(/date\('now',\s*'\+(\d+)\s+(day|hour)s?'\)/gi, (match, num, unit) => {
      const future = new Date(now);
      if (unit === 'day') {
        future.setDate(future.getDate() + parseInt(num));
      } else if (unit === 'hour') {
        future.setHours(future.getHours() + parseInt(num));
      }
      return `'${this.formatDate(future)}'`;
    });
    
    // Replace datetime('now', '+N days/hours')
    condition = condition.replace(/datetime\('now',\s*'\+(\d+)\s+(day|hour)s?'\)/gi, (match, num, unit) => {
      const future = new Date(now);
      if (unit === 'day') {
        future.setDate(future.getDate() + parseInt(num));
      } else if (unit === 'hour') {
        future.setHours(future.getHours() + parseInt(num));
      }
      return `'${this.formatDateTime(future)}'`;
    });

    // Handle date() and datetime() functions wrapping column names
    condition = condition.replace(/date\((\w+)\)/gi, '$1');
    condition = condition.replace(/datetime\((\w+)\)/gi, '$1');
    
    return condition;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format datetime as YYYY-MM-DD HH:MM:SS
   */
  private formatDateTime(date: Date): string {
    const dateStr = this.formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Check if string is a date
   */
  private isDateString(value: any): boolean {
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}/.test(value);
  }

  /**
   * Compare dates
   */
  private compareDates(date1: string, operator: string, date2: string): boolean {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    
    switch (operator) {
      case '=': return d1 === d2;
      case '<=': return d1 <= d2;
      case '>=': return d1 >= d2;
      case '<': return d1 < d2;
      case '>': return d1 > d2;
      default: return false;
    }
  }

  /**
   * Get table data from localStorage
   */
  private getTableData(tableName: string): any[] {
    try {
      const key = `${STORAGE_PREFIX}${tableName}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading table ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Save table data to localStorage
   */
  private saveTableData(tableName: string, data: any[]): void {
    try {
      const key = `${STORAGE_PREFIX}${tableName}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get next ID for a table
   */
  private getNextId(tableName: string): number {
    const seqKey = `${STORAGE_PREFIX}${tableName}_seq`;
    const current = parseInt(localStorage.getItem(seqKey) || '0');
    const next = current + 1;
    localStorage.setItem(seqKey, next.toString());
    return next;
  }
}
