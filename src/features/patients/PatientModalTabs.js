import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Collapse, IconButton, Checkbox, FormControlLabel, Tabs, Tab } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import specialistsProcedures from '../../config/specialists-procedures';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import ProgressBar from './ProgressBar';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

const correctDateForTimezone = (dateString) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset).toISOString().slice(0, 10);
};


const PatientModalTabs = ({ open, onClose, patients, role, onRoleSpecificAction }) => {
    const [expanded, setExpanded] = useState(true);
    const [assignedProcedures, setAssignedProcedures] = useState({});
    const [patientInfoChanged, setPatientInfoChanged] = useState(false);
    const [comment, setComment] = useState('');
    const [patientInfo, setPatientInfo] = useState({});
    const { auth } = useAuth();
    const [newProcedure, setNewProcedure] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);

    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    const handleTabChange = (event, newValue) => {
        setComment('');
        setPatientInfoChanged(false);
        setPatientInfo({});
        setSelectedTab(newValue);
    };

    useEffect(() => {
        const patient = patients[selectedTab];
        setPatientInfo({
            fullname: patient.fullname,
            dob: patient.dob,
            iin: patient.iin,
            gender: patient.gender,
            position: patient.position
        });
        if (patients && patients.length > 0) {
            setAssignedProcedures(patient.assigned);
            patient.comments?.map(comment => {
                if( comment.doctor_name === auth?.fullname) {
                    setComment(comment.comment_content);
                }
            });
        }
    }, [patients, selectedTab]);

    const handleAddProcedure = () => {
        const newP = newProcedure.trim();
        if (newP && !Object.keys(assignedProcedures).filter(procedure => procedure === newP).length) {
            setAssignedProcedures({...assignedProcedures, [newP]: null});
            setNewProcedure('');
        }
    };

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleCheckboxChange = (procedure) => {
        setAssignedProcedures(prevState => ({
            ...prevState,
            [procedure]: prevState[procedure] ? null : new Date().toISOString().split('T')[0]
        }));
    };
    
    const handlePatientInfoChange = (e) => {
        setPatientInfoChanged(true);
        const { name, value } = e.target;
        setPatientInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const filteredProcedures = role in specialistsProcedures ? Object.keys(assignedProcedures).filter(procedure => specialistsProcedures[role].includes(procedure)) : Object.keys(assignedProcedures);

    const mutation = useMutation({
        mutationFn: async (updatedProcedures) => {
          const api_route = `/api/contract/${patients[selectedTab].contract_id}/patients/${patients[selectedTab]._id}`;
          console.log(comment);
          console.log(patientInfoChanged);
          
          if ( comment )
            await axiosPrivate.patch(`${api_route}/comment`, { comment_content: comment });
          if ( patientInfoChanged)
            await axiosPrivate.patch(`${api_route}/info`, { patient_info: patientInfo });

          const response = await axiosPrivate.patch(`${api_route}/procedures`, { assigned: updatedProcedures });

          return response.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries(['patients']);
          toast.success('Пациент успешно обновлен');
          onClose();
        },
        onError: () => {
          toast.error('Ошибка при обновлении пациента');
        }
      });

    const handleConfirm = () => {
        mutation.mutate(assignedProcedures);
    };

    const handleRoleSpecificAction = () => {
        const currentDate = new Date().toISOString().split('T')[0];
        if (role === 'registrator') {
            const updatedProcedures = {
                ...assignedProcedures,
                "Регистратор": currentDate
            };
            mutation.mutate(updatedProcedures);
        } else {
            const updatedProcedures = {
                ...assignedProcedures
            };
            
            filteredProcedures.forEach(procedure => {
                updatedProcedures[procedure] = currentDate;
            });

            mutation.mutate(updatedProcedures);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Информация о пациенте</DialogTitle>
            <Tabs value={selectedTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
                {patients.map((patient, index) => (
                    <Tab key={index} label={patient.fullname} />
                ))}
            </Tabs>
            <DialogContent>
                {patients.length > 0 && (
                    <Box sx={{ borderLeft: '4px solid', borderColor: 'primary.main', paddingLeft: 2, marginBottom: 2 }}>
                        
                        <Typography>Компания Заказчик: {patients[selectedTab].company_enroller}</Typography>
                        <Typography sx={{ marginBottom: 2 }}>Дата контракта: {new Date(patients[selectedTab].date_of_contract).toLocaleDateString()}</Typography>
                        
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="ФИО"
                            name="fullname"
                            value={patientInfo.fullname}
                            onChange={handlePatientInfoChange}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="ИИН"
                            name="iin"
                            value={patientInfo.iin}
                            onChange={handlePatientInfoChange}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Пол"
                            name="gender"
                            value={patientInfo.gender}
                            onChange={handlePatientInfoChange}
                            sx={{ marginBottom: 2 }}
                        />
                        {/* <TextField
                            fullWidth
                            variant="outlined"
                            label="Дата рождения"
                            name="dob"
                            type="date"
                            value={correctDateForTimezone(patientInfo.dob)}
                            onChange={handlePatientInfoChange}
                            sx={{ marginBottom: 2 }}
                        /> */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Должность"
                            name="position"
                            value={patientInfo.position}
                            onChange={handlePatientInfoChange}
                            sx={{ marginBottom: 2 }}
                        />

                    </Box>
                )}

                {role !== 'registrator' && (
                    <>
                        <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>Прогресс:</Typography>
                        <ProgressBar assigned={assignedProcedures}/>
                    </>
                )}

                <Box>
                    <Typography variant="h6" sx={{ marginBottom: 1 }}>
                        Процедуры:
                        <IconButton onClick={handleExpandClick} size="small">
                            <ExpandMoreIcon />
                        </IconButton>
                    </Typography>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        {filteredProcedures.map((procedure, index) => (
                            <Box key={index} display="flex" alignItems="center">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={assignedProcedures[procedure] !== null}
                                            onChange={() => handleCheckboxChange(procedure)}
                                            disabled={role === "registrator"}
                                        />
                                    }
                                    label={`${procedure}: ${assignedProcedures[procedure] ? 'Пройдено' : 'Не пройдено'}`}
                                />
                            </Box>
                        ))}
                        
                        {(role === 'therapist' || role === "admin") && (
                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Добавить процедуру"
                                    value={newProcedure}
                                    onChange={(e) => setNewProcedure(e.target.value)}
                                    sx={{ marginRight: 2 }}
                                />
                                <Button variant="contained" onClick={handleAddProcedure}>Добавить</Button>
                            </Box>
                        )}
                    </Collapse>
                </Box>
            </DialogContent>
            <Box sx={{ padding: 2 }}>
                <TextField
                    fullWidth
                    label="Комментарий"
                    variant="outlined"
                    multiline
                    rows={3}
                    value={comment || ''}
                    onChange={(e) => setComment(e.target.value)}
                />
            </Box>

            <DialogActions>
                <Button onClick={onClose}>Назад</Button>
                {role === 'registrator' && (
                    <Button onClick={handleRoleSpecificAction} color="success" variant="contained">
                        Отметить пациента
                    </Button>
                )}
                {(role === 'therapist' || role === "admin") && (
                    <Button onClick={handleConfirm} color="success" variant="contained">
                        Сохранить изменения
                    </Button>
                )}
                {!!specialistsProcedures[role] && (
                    <Button onClick={handleRoleSpecificAction} color="success" variant="contained">
                        Отметить пациента
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default PatientModalTabs;
