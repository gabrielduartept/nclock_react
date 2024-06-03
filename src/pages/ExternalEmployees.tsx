import { useState, useEffect } from 'react';
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import '../css/PagesStyles.css';
import Button from 'react-bootstrap/Button';
import DataTable, { TableColumn } from 'react-data-table-component';
import { ColumnSelectorModal } from '../modals/ColumnSelectorModal';
import { Department, Employee, Group } from '../helpers/Types';
import { CreateModalEmployees } from '../modals/CreateModalEmployees';
import { UpdateModalEmployees } from '../modals/UpdateModalEmployees';
import { DeleteModal } from '../modals/DeleteModal';
import { CustomOutlineButton } from '../components/CustomOutlineButton';
import { fetchWithAuth } from '../components/FetchWithAuth';
import { employeeFields } from '../helpers/Fields';
import { ExportButton } from '../components/ExportButton';
import { toast } from 'react-toastify';
import Split from 'react-split';
import { TreeViewData } from '../components/TreeView';
import { ExpandedComponentEmpZoneExtEnt } from '../components/ExpandedComponentEmpZoneExtEnt';
import { customStyles } from '../components/CustomStylesDataTable';

// Define a interface para o estado de dados
interface DataState {
    departments: Department[];
    groups: Group[];
    employees: Employee[];
}

// Define a página de Funcionários Externos
export const ExternalEmployees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [filterText, setFilterText] = useState('');
    const [openColumnSelector, setOpenColumnSelector] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(['enrollNumber', 'name', 'shortName']);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployeeToDelete, setSelectedEmployeeToDelete] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<Employee[]>([]);
    const [clearSelectionToggle, setClearSelectionToggle] = useState(false);
    const [data, setData] = useState<DataState>({
        departments: [],
        groups: [],
        employees: []
    });

    // Busca os departamentos, grupos e funcionários
    useEffect(() => {
        async function fetchData() {
            try {
                const deptResponse = await fetchWithAuth('Departaments/Employees');
                const groupResponse = await fetchWithAuth('Groups/Employees');
                const employeesResponse = await fetchWithAuth('Employees/GetAllEmployees');

                if (!deptResponse.ok || !groupResponse.ok || !employeesResponse.ok) {
                    toast.error('Falha ao buscar dados');
                    return;
                }

                const [departments, groups, allEmployees] = await Promise.all([
                    deptResponse.json(),
                    groupResponse.json(),
                    employeesResponse.json(),
                ]);

                const filteredEmployees = allEmployees.filter((emp: Employee) => emp.type === 'Funcionário Externo');

                setData({
                    departments,
                    groups,
                    employees: filteredEmployees
                });
                setEmployees(filteredEmployees);
                setFilteredEmployees(filteredEmployees);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                toast.error('Falha ao buscar dados');
            }
        }
        fetchData();
    }, []);

    // Função para buscar os dados dos funcionários
    const fetchEmployees = async () => {
        try {
            const response = await fetchWithAuth('Employees/GetAllEmployees');
            if (!response.ok) {
                toast.error('Erro ao buscar os dados dos funcionários');
                return;
            }
            const data = await response.json();
            const filteredData = data.filter((emp: Employee) => emp.type === 'Funcionário Externo');
            setEmployees(filteredData);
            setFilteredEmployees(filteredData);
            setData(prevData => ({
                ...prevData,
                employees: filteredData
            }));
        } catch (error) {
            console.error('Erro ao buscar os dados dos funcionários:', error);
        }
    };

    // Função para adicionar um novo funcionário
    const handleAddEmployee = async (employee: Employee) => {
        try {
            const response = await fetchWithAuth('Employees/CreateEmployee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employee)
            });

            if (!response.ok) {
                toast.error('Erro ao adicionar novo funcionário');
            }
            const employeesData = await response.json();
            setEmployees([...employees, employeesData]);
            setData(prevData => ({
                ...prevData,
                employees: [...prevData.employees, employeesData]
            }));
            toast.success('Funcionário adicionado com sucesso');
        } catch (error) {
            console.error('Erro ao adicionar novo funcionário:', error);
        }
        setShowAddModal(false);
        refreshEmployees();
    };

    // Função para atualizar um funcionário
    const handleUpdateEmployee = async (employee: Employee) => {
        try {
            const response = await fetchWithAuth(`Employees/UpdateEmployee/${employee.employeeID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employee)
            });

            if (!response.ok) {
                toast.error(`Erro ao atualizar funcionário`);
                return;
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const updatedEmployee = await response.json();
                const updatedEmployees = employees.map(emp => emp.employeeID === updatedEmployee.employeeID ? updatedEmployee : emp);
                setData(prevData => ({
                    ...prevData,
                    employees: updatedEmployees
                }));
            } else {
                await response.text();
                toast.success(response.statusText || 'Atualização realizada com sucesso');
            }

        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            toast.error('Falha ao conectar ao servidor');
        } finally {
            setShowUpdateModal(false);
            refreshEmployees();
        }
    };

    // Função para apagar um funcionário
    const handleDeleteEmployee = async (employeeID: string) => {

        try {
            const response = await fetchWithAuth(`Employees/DeleteEmployee/${employeeID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                toast.error('Erro ao apagar funcionário');
            }
            const deletedEmployee = data.employees.filter(emp => emp.employeeID !== employeeID)
            setData(prevData => ({
                ...prevData,
                employees: deletedEmployee
            }));
            toast.success('Funcionário apagado com sucesso');
        } catch (error) {
            console.error('Erro ao apagar funcionário:', error);
        }
        refreshEmployees();
    };

    // Função para buscar os dados dos funcionários
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Função para atualizar os dados dos funcionários
    const refreshEmployees = () => {
        fetchEmployees();
    };

    // Função para filtrar os funcionários
    const handleSelectFromTreeView = (selectedIds: string[]) => {
        if (selectedIds.length === 0) {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(employee => selectedIds.includes(employee.employeeID));
            setFilteredEmployees(filtered);
        }
    };

    // Função para filtrar os funcionários
    useEffect(() => {
        setFilteredEmployees(employees);
    }, [employees]);

    // Função para abrir o modal de deletar funcionário
    const handleOpenDeleteModal = (employeeID: string) => {
        setSelectedEmployeeToDelete(employeeID);
        setShowDeleteModal(true);
    };

    // Função para filtrar os funcionários
    const filteredItems = filteredEmployees.filter(item =>
        Object.keys(item).some(key =>
            String(item[key]).toLowerCase().includes(filterText.toLowerCase())
        )
    );

    // Função para selecionar as colunas
    const toggleColumn = (columnName: string) => {
        if (selectedColumns.includes(columnName)) {
            setSelectedColumns(selectedColumns.filter(col => col !== columnName));
        } else {
            setSelectedColumns([...selectedColumns, columnName]);
        }
    };

    // Função para resetar as colunas
    const resetColumns = () => {
        setSelectedColumns(['enrollNumber', 'name', 'shortName']);
    };

    // Função para selecionar todas as colunas
    const onSelectAllColumns = (allColumnKeys: string[]) => {
        setSelectedColumns(allColumnKeys);
    };

    // Função para selecionar a linha
    const handleRowSelected = (state: {
        allSelected: boolean;
        selectedCount: number;
        selectedRows: Employee[];
    }) => {
        setSelectedRows(state.selectedRows);
    };

    // Função para limpar a seleção
    const handleClearSelection = () => {
        setClearSelectionToggle(!clearSelectionToggle);
        setSelectedRows([]);
    };

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

    // Define as colunas
    const columns: TableColumn<Employee>[] = employeeFields
        .filter(field => selectedColumns.includes(field.key))
        .map(field => {
            const formatField = (row: Employee) => {
                switch (field.key) {
                    case 'birthday':
                        return row.birthday ? formatDateAndTime(row[field.key]) : '';
                    case 'status':
                        return row.status ? 'Activo' : 'Inactivo';
                    case 'statusEmail':
                        return row.statusEmail ? 'Activo' : 'Inactivo';
                    case 'rgpdAut':
                        return row.rgpdAut ? 'Autorizado' : 'Não Autorizado';
                    case 'departmentId':
                        return row.departmentName || '';
                    case 'professionId':
                        return row.professionName || '';
                    case 'categoryId':
                        return row.categoryName || '';
                    case 'groupId':
                        return row.groupName || '';
                    case 'zoneId':
                        return row.zoneName || '';
                    case 'externalEntityId':
                        return row.externalEntityName || '';
                    default:
                        return row[field.key] || '';
                }
            };

            return {
                name: field.label,
                selector: row => formatField(row),
                sortable: true,
            };
        });

    // Função para editar um funcionário
    const handleEditEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowUpdateModal(true);
    };

    // Fecha o modal de edição de funcionário
    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedEmployee(null);
    };

    // Define as opções de paginação em EN para PT
    const paginationOptions = {
        rowsPerPageText: 'Linhas por página',
        rangeSeparatorText: 'de',
    };

    // Define o componente de linha expandida
    const expandableRowComponent = (row: Employee) => (
        <ExpandedComponentEmpZoneExtEnt data={row} fields={employeeFields} />
    );

    // Define a coluna de ações
    const actionColumn: TableColumn<Employee> = {
        name: 'Ações',
        cell: (row: Employee) => (
            <div style={{ display: 'flex' }}>
                <CustomOutlineButton icon='bi bi-pencil-fill' onClick={() => handleEditEmployee(row)} />
                <Button className='delete-button' variant="outline-danger" onClick={() => handleOpenDeleteModal(row.employeeID)} >
                    <i className="bi bi-trash-fill"></i>
                </Button>{' '}
            </div>
        ),
        selector: (row: Employee) => row.employeeID,
        ignoreRowClick: true,
    };

    return (
        <div className="main-container">
            <NavBar />
            <div className="content-container">
                <Split className='split' sizes={[20, 80]} minSize={250} expandToMin={true} gutterSize={15} gutterAlign="center" snapOffset={0} dragInterval={1}>
                    <div className="treeview-container">
                        <TreeViewData onSelectEmployees={handleSelectFromTreeView} data={data} />
                    </div>
                    <div className="datatable-container">
                        <div className="datatable-title-text">
                            <span>Funcionários Externos</span>
                        </div>
                        <div className="datatable-header">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Pesquisa"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                    className='search-input'
                                />
                            </div>
                            <div className="buttons-container">
                                <CustomOutlineButton icon="bi-arrow-clockwise" onClick={refreshEmployees} iconSize='1.1em' />
                                <CustomOutlineButton icon="bi-plus" onClick={() => setShowAddModal(true)} iconSize='1.1em' />
                                <CustomOutlineButton icon="bi-eye" onClick={() => setOpenColumnSelector(true)} iconSize='1.1em' />
                                <CustomOutlineButton icon="bi-x" onClick={handleClearSelection} iconSize='1.1em' />
                                <ExportButton allData={employees} selectedData={selectedRows} fields={employeeFields} />
                            </div>
                        </div>
                        <DataTable
                            columns={[...columns, actionColumn]}
                            data={filteredItems}
                            onRowDoubleClicked={handleEditEmployee}
                            pagination
                            paginationComponentOptions={paginationOptions}
                            expandableRows
                            expandableRowsComponent={({ data }) => expandableRowComponent(data)}
                            selectableRows
                            onSelectedRowsChange={handleRowSelected}
                            clearSelectedRows={clearSelectionToggle}
                            selectableRowsHighlight
                            noDataComponent="Não há dados disponíveis para exibir."
                            customStyles={customStyles}
                        />
                    </div>
                </Split>
            </div>
            <Footer />
            <CreateModalEmployees
                title="Adicionar Funcionário Externo"
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddEmployee}
                fields={employeeFields}
                initialValues={{}}
            />
            {selectedEmployee && (
                <UpdateModalEmployees
                    open={showUpdateModal}
                    onClose={handleCloseUpdateModal}
                    onUpdate={handleUpdateEmployee}
                    entity={selectedEmployee}
                    fields={employeeFields}
                    title="Atualizar Funcionário Externo"
                />
            )}
            <DeleteModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={handleDeleteEmployee}
                entityId={selectedEmployeeToDelete}
            />
            {openColumnSelector && (
                <ColumnSelectorModal
                    columns={employeeFields}
                    selectedColumns={selectedColumns}
                    onClose={() => setOpenColumnSelector(false)}
                    onColumnToggle={toggleColumn}
                    onResetColumns={resetColumns}
                    onSelectAllColumns={onSelectAllColumns}
                />
            )}
        </div>
    );
}