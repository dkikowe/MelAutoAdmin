import React, { useState } from 'react';
import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, IconButton } from '@mui/material';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const defaultProcedures = [
    'Регистратор',
    'Терапевт',
    'Офтальмолог (окулист)',
    'Отоларинголог (ЛОР)',
    'Хирург',
    'Невролог',
    'Гинеколог (для женщин)',
];

const correctDateForTimezone = (dateString) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset).toISOString().slice(0, 10);
};


const UploadPatients = ({ companies, onUploadSuccess, onBackButton }) => {
    const axiosPrivate = useAxiosPrivate();
    const [newCompany, setNewCompany] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');

    

    const [patients, setPatients] = useState([{ iin: '', fullname: '', dob: '', gender: '', position: '', assigned: {} }]);
    const [dateOfPayment, setDateOfPayment] = useState('');
    const [additionalProcedures, setAdditionalProcedures] = useState([]);
    const [newProcedure, setNewProcedure] = useState('');
    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState(null);


    const handleAddRow = () => {
        setPatients([...patients, { iin: '', fullname: '', dob: '', gender: '', position: '', assigned: {} }]);
    };

    const handleDeleteRow = (index) => {
        const newPatients = [...patients];
        newPatients.splice(index, 1);
        setPatients(newPatients);
    };

    const handleChange = (index, field, value) => {
        const newPatients = [...patients];
        newPatients[index][field] = value;
        setPatients(newPatients);
    };

    
    const handleAddProcedure = () => {
        if (newProcedure.trim() && !additionalProcedures.includes(newProcedure.trim())) {
            setAdditionalProcedures([...additionalProcedures, newProcedure.trim()]);
            setNewProcedure('');
        }
    };

    const handleDeleteProcedure = (index) => {
        const filteredProcedures = additionalProcedures.filter((_, i) => i !== index);
        setAdditionalProcedures(filteredProcedures);
    };


    const handlePaste = (event, rowIndex, fieldKey) => {
        event.preventDefault();
        const clipboardData = event.clipboardData.getData('text/plain');
        const rows = clipboardData.split(/\r\n|\n/); // Split lines
        const newPatients = [...patients];
    
        rows.forEach((row, i) => {
            const values = row.split('\t'); // Assuming tab-separated values from Excel
            let patientIndex = rowIndex + i;
            if (patientIndex >= newPatients.length) {
                // Add new empty patient entries if needed
                newPatients.push({ iin: '', fullname: '', dob: '', gender: '', position: '', assigned: {} });
            }
    
            let patient = newPatients[patientIndex];
            const fields = ['iin', 'fullname', 'dob', 'gender', 'position']; // Fields in order of appearance in the table
            let fieldIndex = fields.indexOf(fieldKey);
    
            values.forEach((value, valueIndex) => {
                let key = fields[fieldIndex + valueIndex];
                if (!key) return; // Skip if there's no corresponding field
    
                // Handle specific field cases
                if (key === 'dob') {
                    patient[key] = correctDateForTimezone(value);
                } else if (key === 'gender') {
                    patient[key] = value === 'M' ? 'Мужской' : value === 'F' ? 'Женский' : value;
                } else {
                    patient[key] = value;
                }
            });
        });
    
        setPatients(newPatients);
    };
    
    
    
        

    const validateFields = () => {
        let isValid = true;
        const newErrors = {};

        // Validate each patient
        patients.forEach((patient, index) => {
            if (!patient.iin || patient.iin.length !== 12 || !/^\d{12}$/.test(patient.iin)) {
                newErrors[`iin${index}`] = 'ИИН должен состоять из 12 цифр';
                isValid = false;
            }
            if (!patient.fullname || !/^[а-яА-Яa-zA-Z\s]+$/.test(patient.fullname)) {
                newErrors[`fullname${index}`] = 'ФИО должно содержать только буквы и пробелы';
                isValid = false;
            }
            if (!patient.position || !/^[а-яА-Яa-zA-Z\s]+$/.test(patient.position)) {
                newErrors[`position${index}`] = 'Должность должна содержать только буквы и пробелы';
                isValid = false;
            }
            if (!patient.gender) {
                newErrors[`gender${index}`] = 'Необходимо указать пол пациента';
                isValid = false;
            }
            
            if (!patient.dob) {
                newErrors[`dob${index}`] = 'Необходимо указать дату рождения';
                isValid = false;
            }
        });

        // Validate company enroller and date of contract
        if (!selectedCompany && !newCompany) {
            newErrors.company_enroller = 'Необходимо выбрать компанию';
            isValid = false;
        }
        if (!dateOfPayment) {
            newErrors.dateOfPayment = 'Необходимо указать дату контракта';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleUpload = async () => {
        // if (!validateFields()) {
        //     toast.error('Пожалуйста, исправьте ошибки перед отправкой');
        //     return;
        // }

        const procedures = [...defaultProcedures, ...additionalProcedures];
        const patientsWithProcedures = patients.map(patient => ({
            ...patient,
            assigned: procedures.reduce((acc, procedure) => {
                if (!(patient.gender === 'Мужской' && procedure === 'Гинеколог (для женщин)')) {
                    acc[procedure] = null;
                }
                return acc;
            }, {})
        }));

        const data = {
            company_enroller: selectedCompany || newCompany,
            patients: patientsWithProcedures,
            date_of_contract: dateOfPayment
        };

        try {
            // console.log(data);
            const response = await axiosPrivate.post('/api/contract', data);
            toast.success('Пациенты успешно загружены');
            onUploadSuccess();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                toast.error('Контракт для этой компании и даты уже существует.');
            } else {
                toast.error('Ошибка при загрузке пациентов');
            }
        }
    };


    return (
        <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
            <Typography variant="h6">Загрузка пациентов и процедур</Typography>
            <FormControl fullWidth sx={{ marginTop: 2 }}>
                <Autocomplete
                    value={selectedCompany}
                    onChange={(event, newValue) => {
                        setSelectedCompany(newValue);
                    }}
                    inputValue={newCompany}
                    onInputChange={(event, newInputValue) => {
                        setNewCompany(newInputValue || ''); // Set to empty string if undefined or null
                    }}
                    freeSolo
                    options={companies}
                    renderInput={(params) => (
                        <TextField {...params} label="Выберите Компанию Заказчика" variant="outlined" />
                    )}
                />
            </FormControl>
            <TextField
                fullWidth
                variant="outlined"
                label="Дата заключения договора"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateOfPayment}
                onChange={(e) => setDateOfPayment(e.target.value)}
                error={!!errors.dateOfPayment}
                helperText={errors.dateOfPayment}
                sx={{ marginTop: 2 }}
            />
            
            <Typography variant="h6" sx={{ marginTop: 4 }}>Список пациентов:</Typography>
            <TableContainer component={Paper} sx={{ marginTop: 1}} >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ИИН</TableCell>
                            <TableCell>ФИО</TableCell>
                            <TableCell>Дата рождения</TableCell>
                            <TableCell>Пол</TableCell>
                            <TableCell>Должность</TableCell>
                            <TableCell>Управление</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.map((patient, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        onFocus={() => setFocusedField({type: 'iin', index})}
                                        onPaste={(e) => handlePaste(e, index, 'iin')}
                                        value={patient.iin}
                                        error={!!errors[`iin${index}`]}
                                        helperText={errors[`iin${index}`]}
                                        onChange={(e) => handleChange(index, 'iin', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        onFocus={() => setFocusedField({type: 'fullname', index})}
                                        onPaste={(e) => handlePaste(e, index, 'fullname')}
                                        value={patient.fullname}
                                        error={!!errors[`fullname${index}`]}
                                        helperText={errors[`fullname${index}`]}
                                        onChange={(e) => handleChange(index, 'fullname', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        fullWidth
                                        onPaste={(e) => handlePaste(e, index, 'dob')}
                                        onFocus={() => setFocusedField({type: 'dob', index})}
                                        InputLabelProps={{ shrink: true }}
                                        value={patient.dob}
                                        error={!!errors[`dob${index}`]}
                                        helperText={errors[`dob${index}`]}
                                        onChange={(e) => handleChange(index, 'dob', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        fullWidth
                                        value={patient.gender}
                                        onPaste={(e) => handlePaste(e, index, 'gender')}
                                        onFocus={() => setFocusedField({type: 'gender', index})}
                                        onChange={(e) => handleChange(index, 'gender', e.target.value)}
                                        
                                        error={!!errors[`gender${index}`]}
                                        helperText={errors[`gender${index}`]}
                                    >
                                        <MenuItem value="Мужской">Мужской</MenuItem>
                                        <MenuItem value="Женский">Женский</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        onPaste={(e) => handlePaste(e, index, 'position')}
                                        onFocus={() => setFocusedField({type: 'position', index})}
                                        value={patient.position}
                                        error={!!errors[`position${index}`]}
                                        helperText={errors[`position${index}`]}
                                        onChange={(e) => handleChange(index, 'position', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleDeleteRow(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleAddRow}>
                    <AddCircleOutlineIcon />
                </IconButton>
            </Box>

            <Typography variant="h6" sx={{ marginTop: 2 }}>Процедуры по умолчанию:</Typography>
            {defaultProcedures.map((procedure, index) => (
                <Typography key={index} variant="body1">- {procedure}</Typography>
            ))}
            <Typography variant="h6" sx={{ marginTop: 2 }}>Дополнительные Процедуры:</Typography>
            {additionalProcedures.map((procedure, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>- {procedure}</Typography>
                    <IconButton onClick={() => handleDeleteProcedure(index)}><DeleteIcon /></IconButton>
                </Box>
            ))}
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
            <Box fullWidth sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <Button color='inherit' variant="contained" onClick={onBackButton}>Назад</Button>
                <Button color='success' variant="contained" onClick={handleUpload}>Загрузить</Button>
            </Box>
        </Paper>
    );
};

export default UploadPatients;
