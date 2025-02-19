import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box, IconButton, Menu, MenuItem, Checkbox, TableSortLabel, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import PatientModal from './PatientModal';
import ProgressBar from './ProgressBar';
// Helper functions remain the same (descendingComparator, getComparator, stableSort)

const PatientTable = ({ role, patients, onRead, onDelete }) => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('fullname');
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [patientModalOpen, setPatientModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        iin: true,
        fullname: true,
        progress: true,
        actions: true
    });

    const handleAdminRole = (patient) => {
    };
    const handlePatientModalClose = () => {
        setPatientModalOpen(false);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSettingsClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRead = (patient) => {
        setSelectedPatient(patient);
        setPatientModalOpen(true);
    };

    const filteredRows = patients.filter((patient) => {
        return (
            patient.iin.includes(searchQuery.toLowerCase()) ||
            patient.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.company_enroller.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Grouping patients by company
    const groups = filteredRows.reduce((groups, patient) => {
        if (!groups[patient.company_enroller]) {
            groups[patient.company_enroller] = [];
        }
        groups[patient.company_enroller].push(patient);
        return groups;
    }, {});

    const groupedPatients = Object.keys(groups).map(company => ({
        company,
        patients: groups[company]
    }));
    

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, marginTop: 2, justifyContent: 'space-between' }}>
                <TextField
                    label="Поиск"
                    variant="outlined"
                    size="small"
                    fullWidth
                    margin="normal"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <IconButton onClick={handleSettingsClick}>
                    <SettingsIcon />
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {Object.keys(visibleColumns).map((column) => (
                    <MenuItem key={column} onClick={() => handleMenuItemClick(column)}>
                        <Checkbox checked={visibleColumns[column]} />
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                    </MenuItem>
                ))}
            </Menu>
            {groupedPatients.map(group => (
                <Accordion key={group.company}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{group.company}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {visibleColumns.iin && <TableCell>ИИН Пациента</TableCell>}
                                        {visibleColumns.fullname && <TableCell>ФИО Пациента</TableCell>}
                                        {visibleColumns.progress && <TableCell>Прогресс</TableCell>}
                                        {visibleColumns.actions && <TableCell>Действия</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {group.patients.map(patient => (
                                        <TableRow key={patient.iin}>
                                            {visibleColumns.iin && <TableCell>{patient.iin}</TableCell>}
                                            {visibleColumns.fullname && <TableCell>{patient.fullname}</TableCell>}
                                            {visibleColumns.progress && (
                                                <TableCell>
                                                    <ProgressBar assigned={patient.assigned} />
                                                </TableCell>
                                            )}
                                            {visibleColumns.actions && (
                                                <TableCell>
                                                    <Button onClick={() => handleRead(patient)}>Read</Button>
                                                    {/* <Button onClick={() => onDelete(patient)} color="error">Delete</Button> */}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}

            {selectedPatient && (
                <PatientModal
                    open={patientModalOpen}
                    onClose={handlePatientModalClose}
                    patient={selectedPatient}
                    role={role}
                    onRoleSpecificAction={() => {}} // Implement the specific action for admin role
                />
            )}
        </Box>
    );
};

export default PatientTable;
