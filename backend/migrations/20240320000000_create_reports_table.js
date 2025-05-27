exports.up = function(knex) {
  return knex.schema.createTable('reports', function(table) {
    table.increments('id').primary();
    table.string('operator').notNullable();
    table.string('problem_type').notNullable();
    table.float('signal_strength');
    table.string('network_type');
    table.float('latitude');
    table.float('longitude');
    table.text('description');
    table.integer('user_id').references('id').inTable('users');
    table.enum('status', ['pending', 'in_progress', 'resolved', 'rejected']).defaultTo('pending');
    table.text('resolution_notes');
    table.timestamp('resolved_at');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reports');
}; 