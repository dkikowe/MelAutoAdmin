// PatientCard.js
import React from 'react';
import { Card, CardContent, Typography, Checkbox, FormControlLabel } from '@mui/material';

const PatientCard = ({ patient, role }) => {
    const procedures = Object.keys(patient.assigned);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{patient.fullname}</Typography>
                <Typography>ИИН: {patient.iin}</Typography>
                <Typography>Компания Заказчик: {patient.company_enroller}</Typography>

                {role === 'therapist' && (
                    <>
                        <Typography variant="h6" sx={{ marginTop: 2 }}>Процедуры:</Typography>
                        {procedures.map((procedure, index) => (
                            <Typography key={index}>
                                {procedure}: {patient.assigned[procedure] ? 'Пройдено' : 'Не пройдено'}
                            </Typography>
                        ))}
                    </>
                )}

                {role !== 'therapist' && (
                    <>
                        <Typography variant="h6" sx={{ marginTop: 2 }}>Процедуры:</Typography>
                        {procedures.map((procedure, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        checked={!!patient.assigned[procedure]}
                                        onChange={() => {/* Update logic for marking procedure as done */}}
                                        name={procedure}
                                        color="primary"
                                    />
                                }
                                label={procedure}
                            />
                        ))}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PatientCard;
