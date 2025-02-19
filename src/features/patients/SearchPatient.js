import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { toast } from 'react-toastify';
import PatientModalTabs from './PatientModalTabs';

const fetchPatients = async ({ queryKey }) => {
    const [_, axiosPrivate, query] = queryKey;
    const response = await axiosPrivate.get(`/api/contract/search-patient`, {
        params: { query }
    });
    return response.data; // Return the array of patients
};

const useFetchPatients = (axiosPrivate, query) => {
    return useQuery({
        queryKey: ["patients", axiosPrivate, query],
        queryFn: fetchPatients,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: false, // Disable automatic fetching
    });
};

const SearchPatient = ({ role, onPatientFound }) => {
    const axiosPrivate = useAxiosPrivate();
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [patientModalOpen, setPatientModalOpen] = useState(false);

    const { data: patients, isLoading, isError, refetch } = useFetchPatients(axiosPrivate, query);

    const handleSearch = () => {
        if (query.trim()) {
            setShowResults(true);
            refetch().then(({ data }) => {
                if (data && data.length > 0) {
                    onPatientFound(data[0]);
                    setPatientModalOpen(true);
                } else {
                    onPatientFound(null);
                    toast.error('Пациент не найден');
                }
            }).catch(error => {
                toast.error('Ошибка при загрузке данных');
            });
        } else {
            toast.error('Введите ФИО или ИИН пациента');
        }
    };

    const handlePatientModalClose = () => {
        setPatientModalOpen(false);
    };

    const handleRoleSpecificAction = () => {
        // Define the action based on the role
        if (role === 'registrator') {
            // Implement registrator specific action
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                padding: 2
            }}
        >
            <Box sx={{ marginBottom: 4 }}>
                <img src="/logo.png" alt="Company Logo" style={{ maxWidth: '250px' }} />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '600px',
                    marginBottom: 4,
                    padding: 1,
                    backgroundColor: 'white',
                    borderRadius: '50px',
                    boxShadow: '0px 1px 6px rgba(32, 33, 36, 0.28)',
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Введите ФИО или ИИН пациента"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    sx={{ '& fieldset': { border: 'none' }, borderRadius: '50px' }}
                />
                <Button
                    onClick={handleSearch}
                    sx={{
                        borderRadius: '50px',
                        minWidth: '48px',
                        height: '48px',
                        marginLeft: 1,
                    }}
                >
                    <SearchIcon />
                </Button>
            </Box>
            <Box id="results" sx={{ width: '100%', maxWidth: '600px', marginTop: '20px' }}>
                {isLoading && <Typography>Загрузка...</Typography>}
                {patients && patients.length > 0 && (
                    <PatientModalTabs
                        open={patientModalOpen}
                        onClose={handlePatientModalClose}
                        patients={patients}
                        role={role}
                        onRoleSpecificAction={handleRoleSpecificAction}
                    />
                )}
                {isError && <Typography>Ошибка при загрузке данных</Typography>}
            </Box>
        </Box>
    );
};

export default SearchPatient;
