import { useContext, useEffect, useState } from 'react';
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import { PersonsDataTable } from "../../components/PersonsDataTable";
import { TreeViewData } from "../../components/TreeView";
import { CustomOutlineButton } from '../../components/CustomOutlineButton';
import Split from 'react-split';
import '../../css/PagesStyles.css';
import { CreateModalEmployees } from '../../modals/CreateModalEmployees';
import { employeeFields } from '../../helpers/Fields';
import { Employee } from '../../helpers/Types';
import { ColumnSelectorModal } from '../../modals/ColumnSelectorModal';
import { ExportButton } from '../../components/ExportButton';
import { PersonsContext, PersonsContextType, PersonsProvider } from '../../context/PersonsContext';

// Define a página de pessoas
export const Persons = () => {
    const {
        employees,
        data,
        setData,
        setEmployees,
        fetchAllData,
        fetchAllEmployees,
        handleAddEmployee,
    } = useContext(PersonsContext) as PersonsContextType;
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(['enrollNumber', 'name', 'shortName']);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [resetSelection, setResetSelection] = useState(false);
    const [showAllEmployees, setShowAllEmployees] = useState(true);
    const [filteredData, setFilteredData] = useState<Employee[]>([]);
    const [filterText, setFilterText] = useState('');
    const defaultColumns = ['enrollNumber', 'name', 'shortName'];
    const [initialData, setInitialData] = useState<Employee | null>(null);

    // Busca os departamentos, grupos e funcionários
    useEffect(() => {
        fetchAllData()
    }, [fetchAllData]);

    // Define a função de busca dos funcionários
    const fetchEmployees = () => {
        fetchAllEmployees({
            postFetch: filteredData => {
                setEmployees(filteredData);
            }
        });
    };

    // Função para adicionar um funcionário
    const addEmployee = async (employee: Employee) => {
        await handleAddEmployee(employee);
        setShowAddModal(false);
        refreshEmployees();
    }

    // Atualiza a lista de funcionários ao carregar a página
    useEffect(() => {
        fetchAllData();
        fetchEmployees();
    }, []);

    // Função para selecionar funcionários
    const handleSelectEmployees = (employeeIds: string[]) => {
        setSelectedEmployeeIds(employeeIds);
        setShowAllEmployees(employeeIds.length === 0);
    };

    // Função para atualizar a lista de funcionários
    const refreshEmployees = () => {
        fetchEmployees();
        setSelectedEmployeeIds([]);
    }

    // Define a função de duplicar funcionários
    const handleDuplicate = (data: Employee) => {
        setInitialData(data);
        setShowAddModal(true);
    }

    // Atualiza a seleção ao resetar
    useEffect(() => {
        if (resetSelection) {
            setResetSelection(false);
        }
    }, [resetSelection]);

    // Função para alternar a visibilidade das colunas
    const handleColumnToggle = (columnKey: string) => {
        if (selectedColumns.includes(columnKey)) {
            setSelectedColumns(selectedColumns.filter(key => key !== columnKey));
        } else {
            setSelectedColumns([...selectedColumns, columnKey]);
        }
    };

    // Função para resetar as colunas
    const handleResetColumns = () => {
        setSelectedColumns(defaultColumns);
    };

    // Função para selecionar todas as colunas
    const handleSelectAllColumns = () => {
        const allColumnKeys = employeeFields.map(field => field.key);
        setSelectedColumns(allColumnKeys);
    };

    // Função para filtrar funcionários
    const handleFilteredEmployees = (employees: Employee[]) => {
        setFilteredData(employees);
    };

    return (
        <PersonsProvider>
            <div className="main-container">
                <NavBar />
                <div className="content-container">
                    <Split className='split' sizes={[20, 80]} minSize={100} expandToMin={true} gutterSize={15} gutterAlign="center" snapOffset={0} dragInterval={1}>
                        <div className="treeview-container">
                            <TreeViewData onSelectEmployees={handleSelectEmployees} />
                        </div>
                        <div className="datatable-container">
                            <div className="datatable-title-text">
                                <span>Pessoas</span>
                            </div>
                            <div className="datatable-header">
                                <div>
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
                                    <CustomOutlineButton icon="bi-eye" onClick={() => setShowColumnSelector(true)} iconSize='1.1em' />
                                    <ExportButton allData={employees} selectedData={filteredData} fields={employeeFields.map(field => ({ key: field.key, label: field.label }))} />
                                </div>
                            </div>
                            <PersonsDataTable
                                selectedEmployeeIds={selectedEmployeeIds}
                                selectedColumns={selectedColumns}
                                showAllEmployees={showAllEmployees}
                                filterText={filterText}
                                filteredEmployees={handleFilteredEmployees}
                                resetSelection={resetSelection}
                                data={data}
                                onRefreshData={setData}
                                filteredData={filteredData}
                                onDuplicate={handleDuplicate}
                            />
                        </div>
                    </Split>
                </div>
                <Footer />
                {showAddModal && (
                    <CreateModalEmployees
                        title="Adicionar Pessoa"
                        open={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSave={addEmployee}
                        fields={employeeFields}
                        initialValues={initialData || {}}
                    />
                )}
                {showColumnSelector && (
                    <ColumnSelectorModal
                        columns={employeeFields}
                        selectedColumns={selectedColumns}
                        onClose={() => setShowColumnSelector(false)}
                        onColumnToggle={handleColumnToggle}
                        onResetColumns={handleResetColumns}
                        onSelectAllColumns={handleSelectAllColumns}
                    />
                )}
            </div>
        </PersonsProvider>
    );
};