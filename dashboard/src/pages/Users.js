import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Checkbox,
  TableSortLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'operator', label: 'Opérateur' },
  { value: 'institution', label: 'Institution' },
];

const OPERATORS = ['Orange', 'MTN', 'Nexttel', 'Camtel'];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('email');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    institution: '',
    operator: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        role: user.role,
        institution: user.institution || '',
        operator: user.operator || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        role: '',
        institution: '',
        operator: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      role: '',
      institution: '',
      operator: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation du formulaire
    if (!formData.email || !formData.email.includes('@')) {
      setError('Email invalide');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!formData.role) {
      setError('Le rôle est requis');
      return;
    }

    if (formData.role === 'institution' && !formData.institution) {
      setError('L\'institution est requise pour ce rôle');
      return;
    }

    if (formData.role === 'operator' && !formData.operator) {
      setError('L\'opérateur est requis pour ce rôle');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (editingUser) {
        await axios.put(
          `http://localhost:3000/api/users/${editingUser.id}`,
          formData,
          { headers }
        );
      } else {
        await axios.post('http://localhost:3000/api/users', formData, { headers });
      }

      await fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response) {
        setError(error.response.data.error || 'Erreur lors de l\'enregistrement de l\'utilisateur');
      } else if (error.request) {
        setError('Impossible de contacter le serveur. Veuillez vérifier votre connexion.');
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement de l\'utilisateur');
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchUsers();
      } catch (error) {
        setError('Erreur lors de la suppression de l\'utilisateur');
        console.error('Erreur:', error);
      }
    }
  };

  // Filtrage et tri des utilisateurs
  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.institution && user.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.operator && user.operator.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        const aValue = a[sortField]?.toLowerCase() || '';
        const bValue = b[sortField]?.toLowerCase() || '';
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }, [users, searchTerm, sortField, sortDirection]);

  // Gestion du tri
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Gestion de la sélection multiple
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedUsers(filteredAndSortedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Suppression multiple
  const handleBulkDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateurs ?`)) {
      try {
        await Promise.all(
          selectedUsers.map(userId =>
            axios.delete(`http://localhost:3000/api/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            })
          )
        );
        await fetchUsers();
        setSelectedUsers([]);
      } catch (error) {
        setError('Erreur lors de la suppression des utilisateurs');
        console.error('Erreur:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des utilisateurs</Typography>
        <Box>
          {selectedUsers.length > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={handleBulkDelete}
              sx={{ mr: 2 }}
            >
              Supprimer ({selectedUsers.length})
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Nouvel utilisateur
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        label="Rechercher"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.length === filteredAndSortedUsers.length}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredAndSortedUsers.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortDirection : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'role'}
                  direction={sortField === 'role' ? sortDirection : 'asc'}
                  onClick={() => handleSort('role')}
                >
                  Rôle
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'institution'}
                  direction={sortField === 'institution' ? sortDirection : 'asc'}
                  onClick={() => handleSort('institution')}
                >
                  Institution
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'operator'}
                  direction={sortField === 'operator' ? sortDirection : 'asc'}
                  onClick={() => handleSort('operator')}
                >
                  Opérateur
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.institution || '-'}</TableCell>
                <TableCell>{user.operator || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              required={!editingUser}
              helperText={editingUser ? 'Laisser vide pour ne pas modifier' : ''}
            />
            <TextField
              fullWidth
              select
              label="Rôle"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              margin="normal"
              required
            >
              {ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
            {formData.role === 'institution' && (
              <TextField
                fullWidth
                label="Institution"
                value={formData.institution}
                onChange={(e) =>
                  setFormData({ ...formData, institution: e.target.value })
                }
                margin="normal"
                required
              />
            )}
            {formData.role === 'operator' && (
              <TextField
                fullWidth
                select
                label="Opérateur"
                value={formData.operator}
                onChange={(e) =>
                  setFormData({ ...formData, operator: e.target.value })
                }
                margin="normal"
                required
              >
                {OPERATORS.map((operator) => (
                  <MenuItem key={operator} value={operator}>
                    {operator}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Users; 