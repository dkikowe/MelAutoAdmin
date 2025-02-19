import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PatientDetails = ({ patient }) => {
    return (
        <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
            <Typography variant="h6">Patient Details</Typography>
            <Typography>IIN: {patient.iin}</Typography>
            <Typography>Full Name: {patient.fullname}</Typography>
            <Typography>Company: {patient.company_enroller}</Typography>
            <Typography>Procedures: {patient.procedures.join(', ')}</Typography>
        </Paper>
    );
};

export default PatientDetails;
