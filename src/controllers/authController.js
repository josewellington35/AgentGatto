const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../db/database');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // Validação
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      // Verifica se usuário já existe
      const existingUser = await Database.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Cria usuário
      const user = await Database.createUser(name, email, hashedPassword, phone);

      // Gera token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validação
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Busca usuário
      const user = await Database.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Verifica senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Gera token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await Database.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { name, phone } = req.body;
      
      const user = await Database.updateUser(req.user.id, { name, phone });
      
      res.json({
        message: 'Perfil atualizado com sucesso',
        user
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }
}

module.exports = AuthController;
