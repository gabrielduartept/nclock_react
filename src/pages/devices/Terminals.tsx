import { useContext, useEffect, useMemo, useState } from "react";
import { CustomOutlineButton } from "../../components/CustomOutlineButton";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import DataTable, { TableColumn } from "react-data-table-component";
import { customStyles } from "../../components/CustomStylesDataTable";
import "../../css/Terminals.css";
import { Button, Form, Tab, Tabs } from "react-bootstrap";
import { SelectFilter } from "../../components/SelectFilter";
import { Devices, EmployeeDevices } from "../../helpers/Types";
import { deviceFields, employeeDeviceFields } from "../../helpers/Fields";
import { ColumnSelectorModal } from "../../modals/ColumnSelectorModal";
import { DeleteModal } from "../../modals/DeleteModal";
import { toast } from "react-toastify";
import { CreateModalDevices } from "../../modals/CreateModalDevices";
import { UpdateModalDevices } from "../../modals/UpdateModalDevices";
import { Spinner } from 'react-bootstrap';
import fprintScan from "../../assets/img/terminais/fprintScan.png";
import faceScan from "../../assets/img/terminais/faceScan.png";
import palmScan from "../../assets/img/terminais/palmScan.png";
import card from "../../assets/img/terminais/card.png";
import { DeviceContextType, TerminalsContext, TerminalsProvider } from "../../context/TerminalsContext";
import React from "react";

// Define a interface para os filtros
interface Filters {
    [key: string]: string;
}

// Define a interface para as transações
interface Transaction {
    UserID: string;
    IsInvalid: string;
    State: string;
    VerifyStyle: string;
    Time: string;
}

// Define a interface para as tarefas
interface Tasks {
    Status: string;
    Date: Date;
    Type: string;
    Device: string;
}

// Define o componente de terminais
export const Terminals = () => {
    const {
        devices,
        employeeDevices,
        employeesBio,
        employeesCard,
        deviceStatus,
        deviceStatusCount,
        fetchAllDevices,
        fetchAllEmployeesOnDevice,
        fetchAllEmployeeDevices,
        sendAllEmployeesToDevice,
        saveAllEmployeesOnDeviceToDB,
        saveAllAttendancesEmployeesOnDevice,
        syncTimeManuallyToDevice,
        deleteAllUsersOnDevice,
        openDeviceDoor,
        restartDevice,
        handleAddDevice,
        handleUpdateDevice,
        handleDeleteDevice,
    } = useContext(TerminalsContext) as DeviceContextType;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [initialData, setInitialData] = useState<Devices | null>(null);
    const [mainTabKey, setMainTabKey] = useState('tasks');
    const [userTrackTabKey, setUserTrackTabKey] = useState('users-software');
    const [userTabKey, setUserTabKey] = useState('users');
    const [filters, setFilters] = useState<Filters>({});
    const [selectedColumns, setSelectedColumns] = useState<string[]>(['deviceNumber', 'deviceName', 'ipAddress']);
    const [selectedUserColums, setSelectedUserColumns] = useState<string[]>(['enrollNumber', 'employeeName', 'cardNumber', 'statusFprint', 'statusFace']);
    const [selectedDeviceToDelete, setSelectedDeviceToDelete] = useState<string>('');
    const [selectedUserToDelete, setSelectedUserToDelete] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [resetSelection, setResetSelection] = useState(false);
    const [selectedDeviceRows, setSelectedDeviceRows] = useState<Devices[]>([]);
    const [selectedUserRows, setSelectedUserRows] = useState<EmployeeDevices[]>([]);
    const [selectedTerminal, setSelectedTerminal] = useState<Devices | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingAllUser, setLoadingAllUser] = useState(false);
    const [loadingSyncAllUser, setLoadingSyncAllUser] = useState(false);
    const [loadingMovements, setLoadingMovements] = useState(false);
    const [loadingSyncTime, setLoadingSyncTime] = useState(false);
    const [loadingOpenDoor, setLoadingOpenDoor] = useState(false);
    const [loadingDeleteAllUsers, setLoadingDeleteAllUsers] = useState(false);
    const [loadingRestartDevice, setLoadingRestartDevice] = useState(false);
    const [loadingDeleteSelectedUsers, setLoadingDeleteSelectedUsers] = useState(false);
    const [loadingSendSelectedUsers, setLoadingSendSelectedUsers] = useState(false);
    const [loadingFetchSelectedUsers, setLoadingFetchSelectedUsers] = useState(false);
    const [showAllUsers, setShowAllUsers] = useState(true);
    const [showFingerprintUsers, setShowFingerprintUsers] = useState(false);
    const [showFacialRecognitionUsers, setShowFacialRecognitionUsers] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [task, setTask] = useState<Tasks[]>([]);
    const fileInputAttendanceRef = React.createRef<HTMLInputElement>();
    const fileInputUserRef = React.createRef<HTMLInputElement>();

    // Função para adicionar um dispositivo
    const addDevice = async (device: Devices) => {
        await handleAddDevice(device);
        setShowAddModal(false);
        refreshAll();
    }

    // Função para atualizar um dispositivo
    const updateDevice = async (device: Devices) => {
        await handleUpdateDevice(device);
        setShowUpdateModal(false);
        refreshAll();
    }

    // Função para excluir um dispositivo
    const deleteDevice = async () => {
        if (selectedDeviceToDelete) {
            await handleDeleteDevice(selectedDeviceToDelete);
            setShowDeleteModal(false);
            refreshAll();
        }
    }

    // Função para buscar os logs de transações
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:9999/websocket");

        ws.onopen = () => {
            console.log("Connected to WebSocket");
        };

        ws.onmessage = (event) => {
            const transaction = JSON.parse(event.data);
            setTransactions(prev => [...prev, transaction]);
            console.log("Received data: ", transaction);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error: ", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.close();
        };
    }, []);

    // Atualiza os dados de renderização
    useEffect(() => {
        fetchAllDevices();
        fetchAllEmployeeDevices();
    }, []);

    // Atualiza a seleção ao resetar
    useEffect(() => {
        if (resetSelection) {
            setResetSelection(false);
        }
    }, [resetSelection]);

    // Função para atualizar todos os dispositivos
    const refreshAll = () => {
        fetchAllDevices();
        fetchAllEmployeeDevices();
    }

    // Função para resetar as colunas
    const handleResetColumns = () => {
        setSelectedColumns(['deviceNumber', 'deviceName', 'ipAddress']);
    };

    const handleMainSelect = (k: string | null) => {
        if (k) {
            setMainTabKey(k);
        }
    };

    const handleUserTrackSelect = (k: string | null) => {
        if (k) {
            setUserTrackTabKey(k);
        }
    };

    const handleUserSelect = (k: string | null) => {
        if (k) {
            setUserTabKey(k);
        }
    };

    // Função para alternar a visibilidade das colunas
    const handleColumnToggle = (columnKey: string) => {
        if (selectedColumns.includes(columnKey)) {
            setSelectedColumns(selectedColumns.filter(key => key !== columnKey));
        } else {
            setSelectedColumns([...selectedColumns, columnKey]);
        }
    };

    // Função para selecionar todas as colunas
    const handleSelectAllColumns = () => {
        const allColumnKeys = deviceFields.map(field => field.key);
        setSelectedColumns(allColumnKeys);
    };

    // Define a função de seleção de linhas de dispositivos
    const handleDeviceRowSelected = (state: {
        allSelected: boolean;
        selectedCount: number;
        selectedRows: Devices[];
    }) => {
        setSelectedDeviceRows(state.selectedRows);
        setSelectedTerminal(state.selectedRows[0] || null);
    };

    // Define a função de seleção de linhas de utilizadores
    const handleUserRowSelected = (state: {
        allSelected: boolean;
        selectedCount: number;
        selectedRows: EmployeeDevices[];
    }) => {
        setSelectedUserRows(state.selectedRows);
    };

    // Filtra os utilizadores no terminal
    const filteredUsersInTerminal = useMemo(() => {
        if (!selectedTerminal) {
            return [];
        }
        return employeeDevices.filter(employee => employee.deviceNumber === selectedTerminal.deviceNumber);
    }, [employeeDevices, selectedTerminal]);

    // Função para formatar a data e a hora
    function formatDateAndTime(input: string | Date): string {
        const date = typeof input === 'string' ? new Date(input) : input;
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        };
        return new Intl.DateTimeFormat('pt-PT', options).format(date);
    }

    const excludedColumns = ['readerCount', 'auxInCount', 'auxOutCount', 'maxUserCount', 'maxAttLogCount', 'maxFingerCount', 'maxUserFingerCount', 'faceAlg', 'fpAlg'];

    // Define as colunas de dispositivos
    const deviceColumns: TableColumn<Devices>[] = deviceFields
        .filter(field => selectedColumns.includes(field.key))
        .filter(field => !excludedColumns.includes(field.key))
        .map(field => {
            const formatField = (row: Devices) => {
                switch (field.key) {
                    case 'code':
                        return row.code === 0 ? "" : row.code;
                    case 'machineNumber':
                        return row.code === 0 ? "" : row.machineNumber;
                    case 'cardNumber':
                        return row.cardNumber === 0 ? "" : row.cardNumber;
                    case 'productTime':
                        return formatDateAndTime(row[field.key]);
                    case 'status':
                        return row.status ? 'Activo' : 'Inactivo';
                    default:
                        return row[field.key];
                }
            };
            return {
                name: (
                    <>
                        {field.label}
                        <SelectFilter column={field.key} setFilters={setFilters} data={devices} />
                    </>
                ),
                selector: row => formatField(row),
                sortable: true,
            };
        });

    // Filtra os dados da tabela de dispositivos
    const filteredDeviceDataTable = devices.filter(device =>
        Object.keys(filters).every(key =>
            filters[key] === "" || String(device[key]) === String(filters[key])
        )
    );

    // Define as colunas de estado de dispositivos
    const stateColumns: TableColumn<Devices>[] = deviceFields
        .filter(field => excludedColumns.includes(field.key) || field.key === 'deviceName')
        .map(field => {
            return {
                name: (
                    <>
                        {field.label}
                        <SelectFilter column={field.key} setFilters={setFilters} data={devices} />
                    </>
                ),
                selector: row => row[field.key],
                sortable: true,
            };
        });

    // Filtra os dados da tabela de estado de dispositivos
    const filteredStateDataTable = devices.filter(device =>
        Object.keys(filters).every(key =>
            filters[key] === "" || String(device[key]) === String(filters[key])
        )
    );

    // Formata as 3 colunas abaixo em uma única coluna
    const formatCombinedStatus = (row: EmployeeDevices) => {
        return (
            <>
                {row.cardNumber !== "0" && <img src={card} alt="Card" style={{ width: 20, marginRight: 5 }} />}
                {row.statusFprint && <img src={fprintScan} alt="Fingerprint" style={{ width: 20, marginRight: 5 }} />}
                {row.statusFace && <img src={faceScan} alt="Face" style={{ width: 20, marginRight: 5 }} />}
                {row.statusPalm && <img src={palmScan} alt="Palm" style={{ width: 20, marginRight: 5 }} />}
            </>
        );
    };

    // Define as colunas excluídas de utilizadores    
    const excludedUserColumns = ['statusFprint', 'statusFace', 'statusPalm'];

    // Define as colunas de utilizadores
    const userColumns: TableColumn<EmployeeDevices>[] = employeeDeviceFields
        .filter(field => selectedUserColums.includes(field.key))
        .filter(field => !excludedUserColumns.includes(field.key))
        .map(field => {
            const formatField = (row: EmployeeDevices) => {
                switch (field.key) {
                    case 'cardNumber':
                        return row.cardNumber === "0" ? "" : row.cardNumber;
                    default:
                        return row[field.key] || '';
                }
            };

            return {
                name: (
                    <>
                        {field.label}
                        <SelectFilter column={field.key} setFilters={setFilters} data={employeeDevices} />
                    </>
                ),
                selector: (row: EmployeeDevices) => formatField(row),
                sortable: true,
            };
        })
        .concat([
            {
                name: (
                    <>
                        Modo de Verificação
                    </>
                ),
                selector: row => formatCombinedStatus(row),
                sortable: true,
            }
        ]);

    // Filtra os dados da tabela de utilizadores
    const filteredUserDataTable = useMemo(() => {
        let filteredData: EmployeeDevices[] = [];

        if (showAllUsers) {
            return employeeDevices;
        }

        if (showFingerprintUsers) {
            filteredData = [...filteredData, ...employeeDevices.filter(user => user.statusFprint)];
        }
        if (showFacialRecognitionUsers) {
            filteredData = [...filteredData, ...employeeDevices.filter(user => user.statusFace)];
        }
        return filteredData;
    }, [employeeDevices, showAllUsers, showFingerprintUsers, showFacialRecognitionUsers]);

    // Define os dados da tabela de biometria
    const filteredBioDataTable = employeesBio.filter(employee =>
        Object.keys(filters).every(key =>
            filters[key] === "" || String(employee[key]) === String(filters[key])
        )
    );

    // Filtra os dados da tabela de cartões
    const filteredCardDataTable = employeesCard.filter(employee =>
        Object.keys(filters).every(key =>
            filters[key] === "" || String(employee[key]) === String(filters[key])
        )
    );

    // Define as opções de paginação de EN para PT
    const paginationOptions = {
        rowsPerPageText: 'Linhas por página',
        rangeSeparatorText: 'de',
    };

    // Define a função de abertura do modal de edição dos dispositivos
    const handleEditDevices = (row: Devices) => {
        setSelectedTerminal(row);
        setShowUpdateModal(true);
    };

    // Define a função de fechamento do modal de atualização
    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedTerminal(null);
    }

    // Define a função de abertura do modal de exclusão dos dispositivos
    const handleOpenDeleteModal = async (id: string, type: 'device' | 'user') => {
        if (type === 'device') {
            setSelectedDeviceToDelete(id);
            setShowDeleteModal(true);
        } else {
            if (selectedTerminal) {
                setLoadingDeleteSelectedUsers(true);
                setSelectedUserToDelete(id);
                await deleteAllUsersOnDevice(selectedTerminal?.zktecoDeviceID, id);
                setLoadingDeleteSelectedUsers(false);
                fetchAllEmployeeDevices();
            } else {
                toast.error('Selecione um terminal primeiro!');
            }
        }
    };

    // Função que manipula a duplicação
    const handleDuplicate = (devices: Devices) => {
        setInitialData(devices);
        handleCloseUpdateModal();
        setShowAddModal(true);
    };

    // Função que manipula o filtro de utilizadores
    const handleAllUsersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setShowAllUsers(isChecked);
        if (isChecked) {
            setShowFingerprintUsers(false);
            setShowFacialRecognitionUsers(false);
        }
    };

    // Função que manipula o filtro de utilizadores de biometria digital
    const handleFingerprintUsersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setShowFingerprintUsers(isChecked);
        if (isChecked) {
            setShowAllUsers(false);
        } else {
            checkAllFiltersOff(false, showFacialRecognitionUsers);
        }
    };

    // Função que manipula o filtro de utilizadores de biometria facial
    const handleFacialRecognitionUsersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setShowFacialRecognitionUsers(isChecked);
        if (isChecked) {
            setShowAllUsers(false);
        } else {
            checkAllFiltersOff(showFingerprintUsers, false);
        }
    };

    // Função que verifica se todos os filtros estão desligados
    const checkAllFiltersOff = (fingerprint: boolean, facial: boolean) => {
        if (!fingerprint && !facial) {
            setShowAllUsers(true);
        }
    };

    // Define as colunas de ação de dispositivos
    const devicesActionColumn: TableColumn<Devices> = {
        name: 'Ações',
        cell: (row: Devices) => (
            <div style={{ display: 'flex' }}>
                <CustomOutlineButton icon='bi bi-pencil-fill' onClick={() => handleEditDevices(row)} />
                <Button className='delete-button' variant="outline-danger" onClick={() => handleOpenDeleteModal(row.zktecoDevicesID, 'device')}>
                    <i className="bi bi-trash-fill"></i>
                </Button>
            </div>
        ),
        selector: (row: Devices) => row.employeeID,
        ignoreRowClick: true,
    };

    // Define a cor do status
    const getStatusColor = (statuses: string[]): string => {
        const isActive = statuses.some(status => status === 'Activo');
        return isActive ? 'green' : 'red';
    };

    // Define a cor de fundo do status
    const backgroundColor = getStatusColor(deviceStatus);

    // Define a função de adição de tarefas
    const addTask = (type: string, status: string, device: string) => {
        const newTask = {
            Status: status,
            Date: new Date(),
            Type: type,
            Device: selectedTerminal?.deviceName || 'Nenhum dispositivo selecionado'
        };
        setTask(prevTasks => [...prevTasks, newTask]);
    };

    // Função para controlar a mudança de arquivo
    const handleAttendanceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string' || typeof result === 'number') {
                    const parsedData = parseAttendanceData(result);
                    //sendToApi(parsedData);
                } else {
                    console.error('Erro: o conteúdo do arquivo não é uma string ou number');
                }
            };
            reader.readAsText(file);
        }
    };

    // Função para formatar os dados para a API
    const parseAttendanceData = (text: string) => {
        const lines = text.split('\n');
        const data = lines.map(line => {
            const [enrollNumber, attendanceTime, deviceId, inOutMode, verifyMode, workCode] = line.trim().split(/\s+/);
            return { enrollNumber, attendanceTime, deviceId, inOutMode, verifyMode, workCode };
        });
        return data;
    };

    const handleUserFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string' || typeof result === 'number') {
                    const parsedData = parseUserData(result);
                    //sendToApi(parsedData);
                } else {
                    console.error('Erro: o conteúdo do arquivo não é uma string ou number');
                }
            };
            reader.readAsText(file);
        }
    };

    // Função para formatar os dados para a API
    const parseUserData = (text: string) => {
        const lines = text.split('\n');
        const data = lines.map(line => {
            //const [enrollNumber, attendanceTime, deviceId, inOutMode, verifyMode, workCode] = line.trim().split(/\s+/);
            //return { enrollNumber, attendanceTime, deviceId, inOutMode, verifyMode, workCode };
        });
        return data;
    };

    // Funções para acionar o popup de seleção de arquivo
    const triggerFileAttendanceSelectPopup = () => fileInputAttendanceRef.current?.click();
    const triggerFileUserSelectPopup = () => fileInputUserRef.current?.click();

    // Define as colunas das transações
    const transactionColumns: TableColumn<Transaction>[] = [
        {
            name: "ID do Usuário",
            selector: row => row.UserID,
            sortable: true,
        },
        {
            name: "Estado",
            selector: (row: Transaction) => row.State,
            sortable: true,
            format: (row: Transaction) => row.IsInvalid ? "Inválido" : "Válido"
        },
        {
            name: "Hora",
            selector: row => row.Time,
            sortable: true,
        },
        {
            name: "Método de Verificação",
            selector: (row: Transaction) => row.VerifyStyle,
            sortable: true,
            format: (row: Transaction) => `${row.VerifyStyle}`
        }
    ];

    // Define as colunas das tarefas
    const taskColumns: TableColumn<Tasks>[] = [
        {
            name: "Status",
            selector: (row: Tasks) => row.Status,
            sortable: true,
        },
        {
            name: "Dispositivo",
            selector: (row: Tasks) => row.Device,
            sortable: true,
        },
        {
            name: "Data",
            selector: (row: Tasks) => formatDateAndTime(row.Date),
            sortable: true,
        },
        {
            name: "Tipo",
            selector: (row: Tasks) => row.Type,
            sortable: true,
        }
    ];

    return (
        <TerminalsProvider>
            <div className="main-container">
                <NavBar />
                <div className='filter-refresh-add-edit-upper-class'>
                    <div className="datatable-title-text">
                        <span>Terminais</span>
                    </div>
                    <div className="datatable-header">
                        <div className="buttons-container-others" style={{ flexGrow: 1 }}>
                            <CustomOutlineButton icon="bi-arrow-clockwise" onClick={refreshAll} />
                            <CustomOutlineButton icon="bi-plus" onClick={() => setShowAddModal(true)} iconSize='1.1em' />
                            <CustomOutlineButton icon="bi-eye" onClick={() => setShowColumnSelector(true)} iconSize='1.1em' />
                            <span style={{
                                color: 'white',
                                backgroundColor: backgroundColor,
                                borderRadius: '4px',
                                padding: '2px 10px',
                                display: 'inline-block',
                                marginLeft: 'auto',
                                marginRight: '30px'
                            }}>
                                Status: {deviceStatusCount && `${deviceStatusCount['Activo'] || 0} Online, ${deviceStatusCount['Inactivo'] || 0} Offline`}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="content-section deviceTabsMobile" style={{ display: 'flex', flex: 1 }}>
                    <div style={{ flex: 1.5, overflow: "auto" }} className="deviceMobile">
                        <DataTable
                            columns={[...deviceColumns, devicesActionColumn]}
                            data={filteredDeviceDataTable}
                            onRowDoubleClicked={handleEditDevices}
                            pagination
                            paginationPerPage={5}
                            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                            paginationComponentOptions={paginationOptions}
                            selectableRows
                            onSelectedRowsChange={handleDeviceRowSelected}
                            selectableRowsHighlight
                            noDataComponent="Não há dados disponíveis para exibir."
                            customStyles={customStyles}
                        />
                    </div>
                    <div style={{ flex: 2, overflow: "auto" }}>
                        <Tabs
                            id="controlled-tab-terminals"
                            activeKey={mainTabKey}
                            onSelect={handleMainSelect}
                            className="nav-modal"
                            style={{ marginBottom: 10 }}
                        >
                            <Tab eventKey="tasks" title="Actividade">
                                <div>
                                    <p className="activityTabContent">Actividades</p>
                                    <DataTable
                                        columns={taskColumns}
                                        data={task}
                                        pagination
                                        paginationPerPage={5}
                                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                        paginationComponentOptions={paginationOptions}
                                        noDataComponent="Não há tarefas disponíveis para exibir."
                                        customStyles={customStyles}
                                    />
                                </div>
                                <div>
                                    <p className="activityTabContent">Movimentos</p>
                                    <DataTable
                                        columns={transactionColumns}
                                        data={transactions}
                                        pagination
                                        paginationPerPage={5}
                                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                        paginationComponentOptions={paginationOptions}
                                        noDataComponent="Não há actividades disponíveis para exibir."
                                        customStyles={customStyles}
                                    />
                                </div>
                            </Tab>
                            <Tab eventKey="user-track" title="Manutenção de utilizadores">
                                <Tabs
                                    id="controlled-tab-terminals-user-track"
                                    activeKey={userTrackTabKey}
                                    onSelect={handleUserTrackSelect}
                                    className="nav-modal"
                                    style={{ marginBottom: 10 }}
                                >
                                    <Tab eventKey="users-software" title="Utilizadores no software">
                                        <div style={{ display: "flex" }}>
                                            <div style={{ overflowX: "auto", flex: 5 }}>
                                                <DataTable
                                                    columns={userColumns}
                                                    data={filteredUserDataTable}
                                                    pagination
                                                    paginationPerPage={5}
                                                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                                    paginationComponentOptions={paginationOptions}
                                                    selectableRows
                                                    onSelectedRowsChange={handleUserRowSelected}
                                                    selectableRowsHighlight
                                                    noDataComponent="Não há dados disponíveis para exibir."
                                                    customStyles={customStyles}
                                                />
                                            </div>
                                            <div style={{ flex: 1, flexDirection: "column" }}>
                                                <Button variant="outline-primary" size="sm" className="button-terminals-users-track" onClick={async () => {
                                                    if (!selectedTerminal || selectedUserRows.length === 0) {
                                                        toast('Selecione um terminal e pelo menos um utilizador!');
                                                    } else {
                                                        setLoadingSendSelectedUsers(true);
                                                        const userId = selectedUserRows[0].employeeID;
                                                        await sendAllEmployeesToDevice(selectedTerminal.zktecoDeviceID, userId);
                                                        setLoadingSendSelectedUsers(false);
                                                        fetchAllEmployeeDevices();
                                                    }
                                                }}>
                                                    {loadingSendSelectedUsers ? (
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                    ) : (
                                                        <i className="bi bi-person-fill-up" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                                    )}
                                                    Enviar utilizadores seleccionados
                                                </Button>
                                                <Button variant="outline-primary" size="sm" className="button-terminals-users-track" onClick={() => {
                                                    if (selectedUserRows.length > 0) {
                                                        const userId = selectedUserRows[0].employeeID;
                                                        handleOpenDeleteModal(userId, 'user');
                                                    } else {
                                                        toast.error('Selecione um utilizador primeiro!');
                                                    }
                                                }}>
                                                    {loadingDeleteSelectedUsers ? (
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                    ) : (
                                                        <i className="bi bi-person-x-fill" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                                    )}
                                                    Remover utilizadores seleccionados
                                                </Button>
                                                <Button variant="outline-primary" size="sm" className="button-terminals-users-track" onClick={async () => {
                                                    if (!selectedTerminal || selectedUserRows.length === 0) {
                                                        toast('Selecione um terminal e pelo menos um utilizador!');
                                                    } else {
                                                        setLoadingFetchSelectedUsers(true);
                                                        const userId = selectedUserRows[0].employeeID;
                                                        await saveAllEmployeesOnDeviceToDB(selectedTerminal.zktecoDeviceID, userId);
                                                        setLoadingFetchSelectedUsers(false);
                                                        fetchAllEmployeeDevices();
                                                    }
                                                }}>
                                                    {loadingFetchSelectedUsers ? (
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                    ) : (
                                                        <i className="bi bi-person-fill-down" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                                    )}
                                                    Recolher utilizadores seleccionados
                                                </Button>
                                            </div>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="users-terminal" title="Utilizadores no terminal">
                                        <DataTable
                                            columns={userColumns}
                                            data={filteredUsersInTerminal}
                                            pagination
                                            paginationPerPage={5}
                                            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                            paginationComponentOptions={paginationOptions}
                                            selectableRows
                                            onSelectedRowsChange={handleUserRowSelected}
                                            selectableRowsHighlight
                                            noDataComponent={selectedTerminal ? "Não há dados disponíveis para exibir." : "Selecione um terminal para exibir os utilizadores."}
                                            customStyles={customStyles}
                                        />
                                    </Tab>
                                    <Tab eventKey="facial-taken" title="Biometria recolhida">
                                        <DataTable
                                            columns={userColumns}
                                            data={filteredBioDataTable}
                                            pagination
                                            paginationPerPage={5}
                                            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                            paginationComponentOptions={paginationOptions}
                                            selectableRows
                                            onSelectedRowsChange={handleUserRowSelected}
                                            selectableRowsHighlight
                                            noDataComponent="Não há dados disponíveis para exibir."
                                            customStyles={customStyles}
                                        />
                                    </Tab>
                                    <Tab eventKey="cards-taken" title="Cartões recolhidos">
                                        <DataTable
                                            columns={userColumns}
                                            data={filteredCardDataTable}
                                            pagination
                                            paginationPerPage={5}
                                            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                            paginationComponentOptions={paginationOptions}
                                            selectableRows
                                            onSelectedRowsChange={handleUserRowSelected}
                                            selectableRowsHighlight
                                            noDataComponent="Não há dados disponíveis para exibir."
                                            customStyles={customStyles}
                                        />
                                    </Tab>
                                </Tabs>
                            </Tab>
                            <Tab eventKey="state" title="Estado">
                                <DataTable
                                    columns={stateColumns}
                                    data={filteredStateDataTable}
                                    pagination
                                    paginationPerPage={5}
                                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                    paginationComponentOptions={paginationOptions}
                                    selectableRows
                                    onSelectedRowsChange={handleDeviceRowSelected}
                                    selectableRowsHighlight
                                    noDataComponent="Não há dados disponíveis para exibir."
                                    customStyles={customStyles}
                                />
                            </Tab>
                        </Tabs>
                    </div>
                </div>
                <div>
                    <Tabs
                        id="controlled-tab-terminals-buttons"
                        activeKey={userTabKey}
                        onSelect={handleUserSelect}
                        className="nav-modal"
                        style={{ marginBottom: 10, marginTop: 10 }}
                    >
                        <Tab eventKey="users" title="Utilizadores">
                            <div style={{ display: "flex", marginTop: 10, marginBottom: 10, padding: 10 }}>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="button-terminals-users"
                                    onClick={async () => {
                                        if (selectedTerminal) {
                                            setLoadingUser(true);
                                            await fetchAllEmployeesOnDevice(selectedTerminal.zktecoDeviceID);
                                            setLoadingUser(false);
                                        } else {
                                            toast.error('Selecione um terminal primeiro!');
                                        }
                                    }}>
                                    {loadingUser ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-arrow-down-circle" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Recolher utilizadores
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={async () => {
                                    if (selectedTerminal) {
                                        setLoadingAllUser(true);
                                        await sendAllEmployeesToDevice(selectedTerminal.zktecoDeviceID, null);
                                        setLoadingAllUser(false);
                                    } else {
                                        toast.error('Selecione um terminal primeiro!');
                                    }
                                }}>
                                    {loadingAllUser ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-arrow-up-circle" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Enviar todos os utilizadores
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={async () => {
                                    if (selectedTerminal) {
                                        setLoadingSyncAllUser(true);
                                        await sendAllEmployeesToDevice(selectedTerminal.zktecoDeviceID, null);
                                        setLoadingSyncAllUser(false);
                                    } else {
                                        toast.error('Selecione um terminal primeiro!');
                                    }
                                }}>
                                    {loadingSyncAllUser ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-arrow-repeat" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Sincronizar utilizadores
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={async () => {
                                    if (selectedTerminal) {
                                        setLoadingMovements(true);
                                        await saveAllAttendancesEmployeesOnDevice(selectedTerminal.zktecoDeviceID);
                                        setLoadingMovements(false);
                                    } else {
                                        toast.error('Selecione um terminal primeiro!');
                                    }
                                }}>
                                    {loadingMovements ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-arrow-left-right" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Recolher movimentos
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={async () => {
                                    if (selectedTerminal) {
                                        setLoadingDeleteAllUsers(true);
                                        await deleteAllUsersOnDevice(selectedTerminal.zktecoDeviceID, null);
                                        setLoadingDeleteAllUsers(false);
                                    } else {
                                        toast.error('Selecione um terminal primeiro!');
                                    }
                                }}>
                                    {loadingDeleteAllUsers ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-trash" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Apagar utilizadores
                                </Button>
                                <div className="col-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Utilizadores"
                                        checked={showAllUsers}
                                        onChange={handleAllUsersChange}
                                        className="mb-2"
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Biometria digital"
                                        checked={showFingerprintUsers}
                                        onChange={handleFingerprintUsersChange}
                                        className="mb-2"
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Biometria facial"
                                        checked={showFacialRecognitionUsers}
                                        onChange={handleFacialRecognitionUsersChange}
                                        className="mb-2"
                                    />
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="onOff" title="Ligação">
                            <div style={{ display: "flex", marginTop: 10, marginBottom: 10, padding: 10 }}>
                                {/* <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-power" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Ligar
                                </Button> */}
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={async () => {
                                    if (selectedTerminal) {
                                        setLoadingRestartDevice(true);
                                        await restartDevice(selectedTerminal.zktecoDeviceID);
                                        setLoadingRestartDevice(false);
                                    } else {
                                        toast.error('Selecione um terminal primeiro!');
                                    }
                                }}>
                                    {loadingRestartDevice ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-bootstrap-reboot" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Reiniciar
                                </Button>
                            </div>
                        </Tab>
                        <Tab eventKey="access" title="Acessos">
                            <div style={{ display: "flex", marginTop: 10, marginBottom: 10, padding: 10 }}>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-clock-history" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Enviar horários
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={async () => {
                                    if (selectedTerminal) {
                                        setLoadingOpenDoor(true);
                                        await openDeviceDoor(selectedTerminal);
                                        setLoadingOpenDoor(false);
                                    } else {
                                        toast.error('Selecione um terminal primeiro!');
                                    }
                                }}>
                                    {loadingOpenDoor ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-door-open" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Abrir porta
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-pc" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Actualizar multiverificação
                                </Button>
                            </div>
                        </Tab>
                        <Tab eventKey="configuration" title="Configurações">
                            <div style={{ display: "flex", marginTop: 10, marginBottom: 10, padding: 10 }}>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={async () => {
                                    if (selectedTerminal) {
                                        setLoadingSyncTime(true);
                                        await syncTimeManuallyToDevice(selectedTerminal);
                                        setLoadingSyncTime(false);
                                    } else {
                                        toast.error('Selecione um terminal primeiro!');
                                    }
                                }}>
                                    {loadingSyncTime ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-calendar-check" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    )}
                                    Acertar a hora
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-gear-wide" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Enviar configurações
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-send-arrow-up" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Enviar códigos de tarefas
                                </Button>
                                {/* <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-bell" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Sincronizar toques da sirene
                                </Button> */}
                            </div>
                        </Tab>
                        <Tab eventKey="files" title="Ficheiros">
                            <div style={{ display: "flex", marginTop: 10, marginBottom: 10, padding: 10 }}>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={triggerFileAttendanceSelectPopup}>
                                    <i className="bi bi-arrow-bar-down" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Importar movimentos
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={triggerFileUserSelectPopup}>
                                    <i className="bi bi-person-fill-down" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Importar utilizadores
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-fingerprint" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Importar biometria digital
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users" onClick={triggerFileAttendanceSelectPopup}>
                                    <i className="bi bi-file-arrow-down" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Importar movimentos do log
                                </Button>
                                <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                    <i className="bi bi-files-alt" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                    Importar movimentos do log (auto)
                                </Button>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
                <Footer />
                {showColumnSelector && (
                    <ColumnSelectorModal
                        columns={deviceFields}
                        selectedColumns={selectedColumns}
                        onClose={() => setShowColumnSelector(false)}
                        onColumnToggle={handleColumnToggle}
                        onResetColumns={handleResetColumns}
                        onSelectAllColumns={handleSelectAllColumns}
                    />
                )}
                <CreateModalDevices
                    title="Adicionar Terminal"
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={addDevice}
                    fields={deviceFields}
                    initialValues={initialData || {}}
                />
                {selectedTerminal && (
                    <UpdateModalDevices
                        open={showUpdateModal}
                        onClose={handleCloseUpdateModal}
                        onDuplicate={handleDuplicate}
                        onUpdate={updateDevice}
                        entity={selectedTerminal}
                        fields={deviceFields}
                        title="Atualizar Terminal"
                    />
                )}
                {showDeleteModal && (
                    <DeleteModal
                        open={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onDelete={deleteDevice}
                        entityId={selectedDeviceToDelete}
                    />
                )}
                <input
                    type="file"
                    accept=".dat,.txt"
                    ref={fileInputAttendanceRef}
                    style={{ display: 'none' }}
                    onChange={handleAttendanceFileChange}
                />
                <input
                    type="file"
                    accept=".dat,.txt"
                    ref={fileInputUserRef}
                    style={{ display: 'none' }}
                    onChange={handleUserFileChange}
                />
            </div>
        </TerminalsProvider>
    );
};