import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import { Search, Visibility, Download } from '@mui/icons-material';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const OPERATORS = ['Orange', 'MTN', 'Nexttel', 'Camtel', 'Autre'];
const PROBLEM_TYPES = [
  'Appel impossible',
  'SMS non reçu ou envoyé',
  'Internet lent ou indisponible',
  'Coupure réseau',
];
const REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord', 'Sud', 'Est', 'Adamaoua', 'Extrême-Nord', 'Nord-Ouest', 'Sud-Ouest'
];
const STATUS = ['pending', 'in_progress', 'resolved', 'rejected'];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('reported_at');
  const [filters, setFilters] = useState({
    operator: '',
    problem_type: '',
    region: '',
    status: '',
    search: '',
    startDate: null,
    endDate: null,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/reports');
      setReports(res.data.data);
    } catch (err) {
      // Gérer l'erreur
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...reports];
    if (filters.operator) data = data.filter(r => r.operator === filters.operator);
    if (filters.problem_type) data = data.filter(r => r.problem_type === filters.problem_type);
    if (filters.region) data = data.filter(r => r.region === filters.region);
    if (filters.status) data = data.filter(r => r.status === filters.status);
    if (filters.startDate)
      data = data.filter(r => dayjs(r.reported_at).isAfter(dayjs(filters.startDate).startOf('day')));
    if (filters.endDate)
      data = data.filter(r => dayjs(r.reported_at).isBefore(dayjs(filters.endDate).endOf('day')));
    if (filters.search)
      data = data.filter(r =>
        r.operator?.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.problem_type?.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.region?.toLowerCase().includes(filters.search.toLowerCase())
      );
    setFiltered(data);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setFiltered([...filtered].sort((a, b) => {
      if (a[property] < b[property]) return isAsc ? -1 : 1;
      if (a[property] > b[property]) return isAsc ? 1 : -1;
      return 0;
    }));
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };
  const handleCloseDetail = () => setDetailOpen(false);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Date', 'Région', 'Opérateur', 'Problème', 'Statut', 'Force du signal', 'Technologie', 'Description', 'Latitude', 'Longitude'];
    const rows = filtered.map(r => [
      r.reported_at ? new Date(r.reported_at).toLocaleString('fr-FR') : '',
      r.region || '',
      r.operator || '',
      r.problem_type || '',
      r.status || '',
      r.signal_strength || '',
      r.network_type || '',
      r.description || '',
      r.latitude || '',
      r.longitude || ''
    ]);
    let csvContent = headers.join(';') + '\n' + rows.map(e => e.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'signalements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(r => ({
      Date: r.reported_at ? new Date(r.reported_at).toLocaleString('fr-FR') : '',
      Région: r.region || '',
      Opérateur: r.operator || '',
      Problème: r.problem_type || '',
      Statut: r.status || '',
      'Force du signal': r.signal_strength || '',
      Technologie: r.network_type || '',
      Description: r.description || '',
      Latitude: r.latitude || '',
      Longitude: r.longitude || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Signalements');
    XLSX.writeFile(wb, 'signalements.xlsx');
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Signalements
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ mr: 1 }}
            onClick={exportCSV}
          >
            Exporter CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportExcel}
          >
            Exporter Excel
          </Button>
        </Box>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Opérateur"
              value={filters.operator}
              onChange={e => handleFilterChange('operator', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Tous</MenuItem>
              {OPERATORS.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Type de problème"
              value={filters.problem_type}
              onChange={e => handleFilterChange('problem_type', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Tous</MenuItem>
              {PROBLEM_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Région"
              value={filters.region}
              onChange={e => handleFilterChange('region', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Toutes</MenuItem>
              {REGIONS.map(region => <MenuItem key={region} value={region}>{region}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Statut"
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Tous</MenuItem>
              {STATUS.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <DatePicker
              label="Date début"
              value={filters.startDate}
              onChange={date => handleFilterChange('startDate', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <DatePicker
              label="Date fin"
              value={filters.endDate}
              onChange={date => handleFilterChange('endDate', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Recherche rapide"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'reported_at'}
                    direction={orderBy === 'reported_at' ? order : 'asc'}
                    onClick={() => handleSort('reported_at')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Région</TableCell>
                <TableCell>Opérateur</TableCell>
                <TableCell>Problème</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      {report.reported_at
                        ? new Date(report.reported_at).toLocaleString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })
                        : ''}
                    </TableCell>
                    <TableCell>{report.region || '-'}</TableCell>
                    <TableCell>{report.operator}</TableCell>
                    <TableCell>{report.problem_type}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDetail(report)} size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      {/* Modale de détail */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Détail du signalement</DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box>
              <Typography variant="subtitle2">Date : {selectedReport.reported_at ? new Date(selectedReport.reported_at).toLocaleString('fr-FR') : ''}</Typography>
              <Typography>Région : {selectedReport.region || '-'}</Typography>
              <Typography>Opérateur : {selectedReport.operator}</Typography>
              <Typography>Type de problème : {selectedReport.problem_type}</Typography>
              <Typography>Statut : {selectedReport.status}</Typography>
              <Typography>Force du signal : {selectedReport.signal_strength || '-'}</Typography>
              <Typography>Technologie : {selectedReport.network_type || '-'}</Typography>
              <Typography>Description : {selectedReport.description || '-'}</Typography>
              <Typography>Latitude : {selectedReport.latitude || '-'}</Typography>
              <Typography>Longitude : {selectedReport.longitude || '-'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 