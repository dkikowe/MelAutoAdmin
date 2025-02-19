import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Collapse, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import specialistsProcedures from '../../config/specialists-procedures';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import ProgressBar from './ProgressBar';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

const PatientModal = ({ open, onClose, patient, role, onRoleSpecificAction }) => {
    const [expanded, setExpanded] = useState(true);
    const [assignedProcedures, setAssignedProcedures] = useState({});
    const [comment, setComment] = useState('');
    const { auth } = useAuth();
    console.log(auth);
    
    const [newProcedure, setNewProcedure] = useState('');

    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (patient) {
            setAssignedProcedures(patient.assigned);
            console.log(auth?.fullname);
            patient.comments?.map(comment => {
                console.log(comment);
                if( comment.doctor_name === auth?.fullname) {
                    setComment(comment.comment_content);
                }
            });
        }
    }, [patient]);


    const handleAddProcedure = () => {
        const newP = newProcedure.trim();
        if (newP && !Object.keys(assignedProcedures).filter(procedure => procedure === newP).length) {
            setAssignedProcedures({...assignedProcedures, [newP]: null});
            setNewProcedure('');

        }
    };

    // const handleDeleteProcedure = (index) => {
    //     const filteredProcedures = additionalProcedures.filter((_, i) => i !== index);
    //     setAdditionalProcedures(filteredProcedures);
    // };




    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleCheckboxChange = (procedure) => {
        setAssignedProcedures(prevState => ({
            ...prevState,
            [procedure]: prevState[procedure] ? null : new Date().toISOString().split('T')[0]
        }));
    };

    const filteredProcedures = role in specialistsProcedures ? Object.keys(assignedProcedures).filter(procedure => specialistsProcedures[role].includes(procedure)) : Object.keys(assignedProcedures);

    const mutation = useMutation({
        mutationFn: async (updatedProcedures) => {
          const api_route = `/api/contract/${patient.contract_id}/patients/${patient._id}`;
          
          await axiosPrivate.patch(`${api_route}/comment`, { comment_content: comment });
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
        // console.log(assignedProcedures);
        mutation.mutate(assignedProcedures);
      };

      const handleRoleSpecificAction = () => {
        const currentDate = new Date().toISOString().split('T')[0];
        if (role === 'registrator') {
            const updatedProcedures = {
                ...assignedProcedures,
                "Регистратор":  currentDate
            };
            mutation.mutate(updatedProcedures);
        } else {
            const updatedProcedures = {
                ...assignedProcedures
            };
            
            filteredProcedures.forEach(procedure => {
                updatedProcedures[procedure] = currentDate;
            });

            console.log(updatedProcedures);

            mutation.mutate(updatedProcedures);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Информация о пациенте</DialogTitle>
            <DialogContent>
                <Box sx={{ borderLeft: '4px solid', borderColor: 'primary.main', paddingLeft: 2, marginBottom: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{patient.fullname}</Typography>
                    <Typography>ИИН: {patient.iin}</Typography>
                    <Typography>Компания Заказчик: {patient.company_enroller}</Typography>
                    <Typography>Дата контракта: {new Date(patient.date_of_contract).toLocaleDateString()}</Typography>
                </Box>

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
                {/* <Button onClick={handleConfirm} color="success" variant="contained" >
                    Подтвердить
                </Button> */}
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
                { !!specialistsProcedures[role] && (
                    <Button onClick={handleRoleSpecificAction} color="success" variant="contained">
                        Отметить пациента
                    </Button>
                )
                }
            </DialogActions>
        </Dialog>
    );
};

export default PatientModal;