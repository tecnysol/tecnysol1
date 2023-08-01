import React from 'react';
import MainContainer from '../../components/MainContainer';
import { Button, FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from 'date-fns/locale/pt-BR';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Container } from '@material-ui/core';
import api from '../../services/api';

const getFirstDayThisMonth = () => {
    const date = new Date();
    date.setDate(1);
    return date;
}

const Reports = () => {
    const [initialDate, setInitialDate] = React.useState(getFirstDayThisMonth());
    const [finalDate, setFinalDate] = React.useState(new Date());
    const [selectedCompany, setSelectedCompany] = React.useState(null);
    const [noteType, setNoteType] = React.useState('todas');
    const [selectedAtendente, setSelectedAtendente] = React.useState('');
    const [listCompanies, setListCompanies] = React.useState([]);
    const [listaAtendentes, setListaAtendentes] = React.useState([]);
    const [MenuProps, setMenuProps] = React.useState([]);
    const [npsNotesCompanies, setNpsNotesCompanies] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const handleChange = (event) => {
        setNoteType(event.target.value);
    };
    const handleCallBack = (event) => {
        getNpsNotesCompanies();
    };

    const filter = createFilterOptions();

    const getUsuarios = async () => {
        const response = await api.get('/users/list');
        setListaAtendentes(response.data);
    }

    const getContatos = async () => {
        const response = await api.get('/contacts');
        setListCompanies(response.data);
    }

    const getNpsNotesCompanies = async () => {
        setLoading(true);
        const selectedContact = selectedCompany ? selectedCompany.id : null;
        const response = await api.get('/reports/nps_for_all_user', {
            params: {
                startDate: initialDate,
                endDate: finalDate,
                selectedContact: selectedContact,
                noteType: noteType,
                selectedAtendente: selectedAtendente
            }
        });
        setNpsNotesCompanies(response.data);
        setLoading(false);
    }

    React.useEffect(() => {
        getUsuarios();
        getContatos();
    }, []);

    React.useEffect(() => {
        getNpsNotesCompanies();
    }, [noteType, selectedAtendente]);

    return (
        <Container component={Paper} maxWidth="xl" sx={{ mt: 2, py: 2 }}>
            <h2 style={{ marginTop: 20, marginBottom: 10, color: '#444' }}>Avaliação por tickets</h2>
            <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ my: 2, }} >


                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                    <DatePicker
                        value={initialDate}
                        onChange={(newValue) => { setInitialDate(newValue) }}
                        label="Data inicial"
                        renderInput={(params) => <TextField fullWidth {...params} sx={{ width: '35ch' }} />}

                    />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
                    <DatePicker
                        value={finalDate}
                        onChange={(newValue) => { setFinalDate(newValue) }}
                        label="Data final"
                        renderInput={(params) => <TextField fullWidth {...params} sx={{ width: '35ch' }} />}
                    />
                </LocalizationProvider>

                <Autocomplete
                    value={selectedCompany}
                    autoHighlight
                    options={listCompanies.contacts}
                    fullWidth
                    clearOnBlur
                    handleHomeEndKeys
                    freeSolo
                    onChange={(event, newValue) => {
                        setSelectedCompany(newValue);
                    }}
                    //normalizado
                    filterOptions={(options, params) => {
                        const filtered = filter(options, params);
                        return filtered;
                    }}
                    getOptionLabel={(option) => {
                        if (typeof option === 'string') {
                            return option;
                        }
                        if (option.inputValue) {
                            return option.qualquerNome;
                        }

                        if (option.codreg) {
                            return option.id + ' - ' + option.name;
                        } else {

                            return option.name;
                        }

                    }}

                    renderInput={(params) => <TextField {...params} label="Buscar contato" />}
                />


                <FormControl sx={{ width: '35ch' }}  >
                    <InputLabel >Tipos de notas</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        value={noteType}
                        label="Tipo de notas"
                        onChange={handleChange}
                    >
                        <MenuItem value={'todas'}>Todas</MenuItem>
                        <MenuItem value={'detratores'}>Baixas</MenuItem>
                        <MenuItem value={'neutros'}>Médias</MenuItem>
                        <MenuItem value={'promotores'}>Altas</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ width: '35ch' }} >
                    <InputLabel >Atendente</InputLabel>
                    <Select
                        value={selectedAtendente}
                        label="Atendente"
                        onChange={e => setSelectedAtendente(e.target.value)}
                        MenuProps={MenuProps}
                        fullWidth
                    >
                        {listaAtendentes.map(atendente => (
                            <MenuItem key={atendente.id + atendente.name} value={atendente.id}>{atendente.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>


                <Button className="buttonHover" onClick={handleCallBack} sx={{ width: '35ch', }} variant='contained'  >Filtrar</Button>

            </Stack>
            <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                <Table sx={{ minWidth: 650 }} size="small" >
                    <TableHead sx={{ background: '#eee', height: 80, }}>
                        <TableRow sx={{}}>

                            <TableCell sx={{ textAlign: 'center' }} >Ticket id</TableCell>
                            <TableCell sx={{ textAlign: 'center' }} >Contato</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>Nota do atendimento&nbsp; </TableCell>
                            <TableCell sx={{ textAlign: 'center', width: 300, }}>Atendente</TableCell>
                            <TableCell sx={{ textAlign: 'center', width: 300, }}>Data</TableCell>


                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {npsNotesCompanies?.map((row) => {
                            return (
                                <TableRow key={row?.id} >
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <a target="_blank" href={`/tickets/${row.uuid}`}>
                                            <strong style={{ textDecoration: 'underline' }}>{row?.id}</strong>
                                        </a>
                                    </TableCell>

                                    <TableCell sx={{ textAlign: 'center' }}>
                                        {row?.contactname}
                                    </TableCell>

                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <strong>{row?.note}</strong>
                                    </TableCell>

                                    <TableCell sx={{ textAlign: 'center', height: 25 }}>
                                        <strong>{row?.user}</strong>
                                    </TableCell>

                                    <TableCell sx={{ textAlign: 'center', height: 25 }}>
                                        <strong>{new Date(row?.createdAt).toLocaleDateString()}</strong>
                                    </TableCell> 

                                </TableRow>
                            )
                        })}

                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default Reports;