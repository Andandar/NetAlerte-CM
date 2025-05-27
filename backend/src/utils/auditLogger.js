const knex = require('../../knexfile');
module.exports = async function auditLog({ user_id, action, target_type, target_id, details }) {
  await knex('audit_logs').insert({
    user_id, action, target_type, target_id, details: JSON.stringify(details)
  });
}; 