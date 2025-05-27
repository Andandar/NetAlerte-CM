import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import LinearProgress from '@mui/material/LinearProgress';

const Dashboard = () => {
  const [stats, setStats] = useState({
    byOperator: [],
    byProblemType: [],
    byRegion: [],
    byHour: [],
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, reportsResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/reports/stats'),
          axios.get('http://localhost:3000/api/reports/recent'),
        ]);

        setStats(statsResponse.data.data);
        setRecentReports(reportsResponse.data.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchEvolutionData();
  }, []);

  const fetchEvolutionData = async () => {
    try {
      // Appel à une route qui retourne le nombre de signalements par mois
      const response = await axios.get('http://localhost:3000/api/reports/evolution');
      setEvolutionData(response.data.data);
    } catch (err) {
      setError("Erreur lors du chargement des données d'évolution");
    }
  };

  // Simulations pour les cards (à remplacer par des vraies stats si dispo)
  const totalReports = stats.byOperator.reduce((acc, op) => acc + Number(op.count), 0);
  const newReports = 573; // À remplacer par une vraie stat si dispo
  const mobileSubscribers = 8356; // À remplacer par une vraie stat si dispo
  const networkIssues = stats.byProblemType.reduce((acc, p) => acc + (p.problem_type === 'Coupure réseau' ? Number(p.count) : 0), 0);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Box
            sx={{
              bgcolor: color,
              color: '#fff',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              fontSize: 24,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={600} color="#222">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} color="#222">
          {value.toLocaleString('fr-FR')}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Dashboard
      </Typography>
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Signalements totaux"
            value={totalReports}
            icon={<InsertChartIcon fontSize="inherit" />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nouveaux signalements"
            value={newReports}
            icon={<NewReleasesIcon fontSize="inherit" />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Abonnés mobiles"
            value={mobileSubscribers}
            icon={<PeopleAltIcon fontSize="inherit" />}
            color="#f59e42"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Problèmes réseau"
            value={networkIssues}
            icon={<WifiOffIcon fontSize="inherit" />}
            color="#ef4444"
          />
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Évolution des signalements
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
                    <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                    <Tooltip formatter={(value) => [value, 'Signalements']} />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Card supplémentaire ou autre contenu */}
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Signalements par opérateur
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byOperator}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="operator" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Signalements par type de problème
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byProblemType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="problem_type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f50057" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400, display: 'flex', gap: 3 }}>
            <Box flex={1} minWidth={0}>
              <Typography variant="h6" gutterBottom>
                Carte des signalements
              </Typography>
              <MapContainer
                center={[4.0511, 9.7679]} // Coordonnées du Cameroun
                zoom={6}
                style={{ height: '340px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {recentReports.map((report) => (
                  report.latitude && report.longitude && (
                    <Marker
                      key={report.id}
                      position={[report.latitude, report.longitude]}
                    >
                      <Popup>
                        <Typography variant="subtitle2">
                          Opérateur: {report.operator}
                        </Typography>
                        <Typography variant="body2">
                          Problème: {report.problem_type}
                        </Typography>
                        <Typography variant="body2">
                          Date: {new Date(report.reported_at).toLocaleString()}
                        </Typography>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </Box>
            <Box width={260} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Signalements par région
              </Typography>
              {stats.byRegion && stats.byRegion.length > 0 ? (
                stats.byRegion
                  .sort((a, b) => b.count - a.count)
                  .map((region) => (
                    <Box key={region.region} mb={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography fontSize={15}>{region.region}</Typography>
                        <Typography fontWeight={600}>{region.count}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (region.count /
                            Math.max(...stats.byRegion.map((r) => r.count), 1)) *
                          100
                        }
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          background: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#2563eb',
                          },
                        }}
                      />
                    </Box>
                  ))
              ) : (
                <Typography color="text.secondary">Aucune donnée régionale</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Signalements récents
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date/Heure</TableCell>
                    <TableCell>Région</TableCell>
                    <TableCell>Opérateur</TableCell>
                    <TableCell>Problème</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentReports.slice(0, 10).map((report) => (
                    <TableRow key={report.id}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 