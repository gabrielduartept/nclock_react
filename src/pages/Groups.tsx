import { useEffect, useState } from "react";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import '../css/PagesStyles.css';
import { ColumnSelectorModal } from "../modals/ColumnSelectorModal";
import DataTable, { TableColumn } from 'react-data-table-component';
import { Group } from "../helpers/Types";
import Button from "react-bootstrap/esm/Button";
import { DeleteModal } from "../modals/DeleteModal";
import { CustomOutlineButton } from "../components/CustomOutlineButton";
import { fetchWithAuth } from "../components/FetchWithAuth";
import { groupFields } from "../helpers/Fields";
import { ExportButton } from "../components/ExportButton";
import { toast } from "react-toastify";
import { ExpandedComponentGeneric } from "../components/ExpandedComponentGeneric";
import { CreateModalDeptGrp } from "../modals/CreateModalDeptGrp";
import { UpdateModalDeptGrp } from "../modals/UpdateModalDeptGrp";

export const Groups = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [filterText, setFilterText] = useState('');
    const [openColumnSelector, setOpenColumnSelector] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(['name']);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedGroupForDelete, setSelectedGroupForDelete] = useState<string | null>(null);

    const fetchGroups = async () => {
        try {
            const response = await fetchWithAuth('https://localhost:7129/api/Groups', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                toast.error('Erro ao buscar os dados dos grupos');
            }

            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Erro ao buscar os dados dos grupos:', error);
        }
    };

    const handleAddGroup = async (group: Group) => {
        try {
            const response = await fetchWithAuth('https://localhost:7129/api/Groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(group)
            });

            if (!response.ok) {
                toast.error('Erro ao adicionar novo grupo');
            }

            const data = await response.json();
            setGroups([...groups, data]);
            toast.success('Grupo adicionado com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar novo grupo:', error);
        }

        handleCloseAddModal();
        refreshGroups();
    };

    const handleUpdateGroup = async (group: Group) => {
        try {
            const response = await fetchWithAuth(`https://localhost:7129/api/Groups/${group.groupID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(group)
            });
    
            if (!response.ok) {
                toast.error(`Erro ao atualizar grupo`);
                return;
            }
    
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const updatedGroup = await response.json();
                setGroups(groups => groups.map(g => g.groupID === updatedGroup.groupID ? updatedGroup : g));
                toast.success('Grupo atualizado com sucesso!');
            } else {
                await response.text();
                toast.success('Grupo atualizado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao atualizar grupo:', error);
            toast.error('Falha ao conectar ao servidor');
        } finally {
            handleCloseUpdateModal();
            refreshGroups();
        }
    };    

    const handleDeleteGroup = async (groupID: string) => {
        try {
            const response = await fetchWithAuth(`https://localhost:7129/api/Groups/${groupID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                toast.error('Erro ao apagar grupo');
            }

            toast.success('Grupo apagado com sucesso!');
        } catch (error) {
            console.error('Erro ao apagar grupo:', error);
        }
        refreshGroups();
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const refreshGroups = () => {
        fetchGroups();
    };

    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleEditGroup = (group: Group) => {
        setSelectedGroup(group);
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedGroup(null);
    };

    const handleOpenDeleteModal = (groupID: string) => {
        setSelectedGroupForDelete(groupID);
        setShowDeleteModal(true);
    };

    const filteredItems = groups.filter(item =>
        Object.keys(item).some(key =>
            String(item[key]).toLowerCase().includes(filterText.toLowerCase())
        )
    );

    const toggleColumn = (columnName: string) => {
        if (selectedColumns.includes(columnName)) {
            setSelectedColumns(selectedColumns.filter(col => col !== columnName));
        } else {
            setSelectedColumns([...selectedColumns, columnName]);
        }
    };

    const resetColumns = () => {
        setSelectedColumns(['name']);
    };

    const onSelectAllColumns = (allColumnKeys: string[]) => {
        setSelectedColumns(allColumnKeys);
    };

    const paginationOptions = {
        rowsPerPageText: 'Linhas por página',
        rangeSeparatorText: 'de',
    };

    const columnNamesMap = groupFields.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = field.label;
        return acc;
    }, {});

    const tableColumns = selectedColumns
        .map(columnKey => ({
            name: columnNamesMap[columnKey] || columnKey,
            selector: (row: Record<string, any>) => row[columnKey],
            sortable: true,
        }));

    const actionColumn: TableColumn<Group> = {
        name: 'Ações',
        cell: (row: Group) => (
            <div style={{ display: 'flex' }}>
                <CustomOutlineButton icon='bi bi-pencil-fill' onClick={() => handleEditGroup(row)}/>
                <Button className='delete-button' variant="outline-danger" onClick={() => handleOpenDeleteModal(row.groupID)} >
                    <i className="bi bi-trash-fill"></i>
                </Button>{' '}
            </div>
        ),
        selector: (row: Group) => row.groupID,
        ignoreRowClick: true,
    };

    return (
        <div>
            <NavBar />
            <div className='filter-refresh-add-edit-upper-class'>
                <div className="datatable-header">
                    <div className="search-box">
                        <input
                            className='search-input'
                            type="text"
                            placeholder="Pesquisa"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                    </div>
                    <div className="buttons-container-others">
                        <CustomOutlineButton icon="bi-arrow-clockwise" onClick={refreshGroups} />
                        <CustomOutlineButton icon="bi-plus" onClick={handleOpenAddModal} iconSize='1.1em' />
                        <CustomOutlineButton icon="bi-eye" onClick={() => setOpenColumnSelector(true)} />
                        <ExportButton allData={groups} selectedData={filteredItems} fields={groupFields} />
                    </div>
                </div>
                <CreateModalDeptGrp
                    title="Adicionar Grupo"
                    open={showAddModal}
                    onClose={handleCloseAddModal}
                    onSave={handleAddGroup}
                    fields={groupFields}
                    initialValues={{}}
                    entityType='group'
                />
                {selectedGroup && (
                    <UpdateModalDeptGrp
                        open={showUpdateModal}
                        onClose={handleCloseUpdateModal}
                        onUpdate={() => handleUpdateGroup(selectedGroup)}
                        entity={selectedGroup}
                        entityType='group'
                        title="Atualizar Grupo"
                    />
                )}
                <DeleteModal
                    open={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onDelete={handleDeleteGroup}
                    entityId={selectedGroupForDelete}
                />
            </div>
            <div>
                <div className='table-css'>
                    <DataTable
                        columns={[...tableColumns, actionColumn]}
                        data={filteredItems}
                        onRowDoubleClicked={handleEditGroup}
                        pagination
                        paginationComponentOptions={paginationOptions}
                        expandableRows
                        expandableRowsComponent={(props) => <ExpandedComponentGeneric data={props.data} fields={groupFields} />}
                        noDataComponent="Não há dados disponíveis para exibir."
                    />
                </div>
            </div>
            <Footer />
            {openColumnSelector && (
                <ColumnSelectorModal
                    columns={groupFields}
                    selectedColumns={selectedColumns}
                    onClose={() => setOpenColumnSelector(false)}
                    onColumnToggle={toggleColumn}
                    onResetColumns={resetColumns}
                    onSelectAllColumns={onSelectAllColumns}
                />
            )}
        </div >
    );
}