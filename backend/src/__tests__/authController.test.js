const request = require('supertest');
const app = require('../index');
const knex = require('../../knexfile');
const bcrypt = require('bcryptjs');

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Nettoyage de la base de données
    await knex('users').del();
  });

  afterAll(async () => {
    // Fermeture de la connexion
    await knex.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'operator',
        operator: 'Orange'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data.operator).toBe(userData.operator);
    });

    it('devrait refuser l\'inscription avec un email existant', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'operator',
        operator: 'MTN'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur existant', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('devrait refuser la connexion avec des identifiants invalides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 