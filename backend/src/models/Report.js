const knex = require('../../knexfile');

class Report {
  static async create(reportData) {
    return await knex('reports').insert(reportData).returning('*');
  }

  static async findAll(filters = {}) {
    let query = knex('reports').select('*');

    if (filters.operator) {
      query = query.where('operator', filters.operator);
    }

    if (filters.problem_type) {
      query = query.where('problem_type', filters.problem_type);
    }

    if (filters.region) {
      query = query.where('region', filters.region);
    }

    if (filters.start_date && filters.end_date) {
      query = query.whereBetween('reported_at', [filters.start_date, filters.end_date]);
    }

    return await query.orderBy('reported_at', 'desc');
  }

  static async getStats() {
    const stats = {
      byOperator: await knex('reports')
        .select('operator')
        .count('* as count')
        .groupBy('operator'),
      
      byProblemType: await knex('reports')
        .select('problem_type')
        .count('* as count')
        .groupBy('problem_type'),
      
      byRegion: await knex('reports')
        .select('region')
        .count('* as count')
        .groupBy('region'),
      
      byHour: await knex('reports')
        .select(knex.raw('EXTRACT(HOUR FROM reported_at) as hour'))
        .count('* as count')
        .groupBy('hour')
        .orderBy('hour')
    };

    return stats;
  }

  static async getRecentReports(limit = 10) {
    return await knex('reports')
      .select('*')
      .orderBy('reported_at', 'desc')
      .limit(limit);
  }
}

module.exports = Report; 