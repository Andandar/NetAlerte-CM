exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.string('role').notNullable().defaultTo('operator');
      table.string('institution').nullable();
      table.string('operator').nullable();
      table.timestamps(true, true);
    })
    .createTable('reports', function(table) {
      table.increments('id').primary();
      table.string('operator').notNullable();
      table.string('problem_type').notNullable();
      table.float('signal_strength').nullable();
      table.string('network_type').nullable();
      table.float('latitude').nullable();
      table.float('longitude').nullable();
      table.string('region').nullable();
      table.string('city').nullable();
      table.timestamp('reported_at').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    })
    .createTable('notifications', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users');
      table.string('type').notNullable();
      table.json('data').notNullable();
      table.boolean('read').defaultTo(false);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('notifications')
    .dropTable('reports')
    .dropTable('users');
}; 