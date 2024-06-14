import { useState } from "react";
import { CustomOutlineButton } from "../../components/CustomOutlineButton";
import { Footer } from "../../components/Footer";
import { NavBar } from "../../components/NavBar";
import DataTable from "react-data-table-component";
import { customStyles } from "../../components/CustomStylesDataTable";
import "../../css/Terminals.css";
import { Button, Form, Tab, Tabs } from "react-bootstrap";

export const Terminals = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [mainTabKey, setMainTabKey] = useState('tasks');
    const [userTrackTabKey, setUserTrackTabKey] = useState('users-software');
    const [userTabKey, setUserTabKey] = useState('users');

    const refreshTerminals = () => {
        console.log('refresh terminals');
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

    return (
        <div className="main-container">
            <NavBar />
            <div className='filter-refresh-add-edit-upper-class'>
                <div className="datatable-title-text">
                    <span>Terminais</span>
                </div>
                <div className="datatable-header">
                    <div className="buttons-container-others">
                        <CustomOutlineButton icon="bi-arrow-clockwise" onClick={refreshTerminals} />
                        <CustomOutlineButton icon="bi-plus" onClick={() => setShowAddModal(true)} iconSize='1.1em' />
                    </div>
                </div>
            </div>
            <div className="content-section" style={{ display: 'flex' }}>
                <div style={{ width: '33.33%' }}>
                    <p>DATATABLE DOS TERMINAIS</p>
                </div>
                <div style={{ width: '66.66%' }}>
                    <Tabs
                        id="controlled-tab-terminals"
                        activeKey={mainTabKey}
                        onSelect={handleMainSelect}
                        className="nav-modal"
                        style={{ marginBottom: 10 }}
                    >
                        <Tab eventKey="tasks" title="Actividade">
                            <p>DATATABLE DE TAREFAS</p>
                            {/* <DataTable
                                columns={[...tableColumns, actionColumn]}
                                data={filteredDataTable}
                                onRowDoubleClicked={handleEditDepartment}
                                pagination
                                paginationComponentOptions={paginationOptions}
                                noDataComponent="Não há dados disponíveis para exibir."
                                customStyles={customStyles}
                            /> */}
                        </Tab>
                        <Tab eventKey="user-track" title="Manutenção de utilizadores">
                            <Tabs
                                id="controlled-tab-terminals-user-track"
                                activeKey={userTrackTabKey}
                                onSelect={handleUserTrackSelect}
                                className="nav-modal"
                                style={{ marginBottom: 10 }}
                            >
                                <Tab eventKey="users-software" title="Utilizadores no software" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p>DATATABLE DE UTILIZADORES NO SOFTWARE</p>
                                    {/* <DataTable
                                     columns={[...tableColumns, actionColumn]}
                                    data={filteredDataTable}
                                    onRowDoubleClicked={handleEditDepartment}
                                    pagination
                                    paginationComponentOptions={paginationOptions}
                                    noDataComponent="Não há dados disponíveis para exibir."
                                    customStyles={customStyles}
                                    /> */}
                                    <div className="col-3">
                                        <Button variant="outline-primary" size="sm" className="button-terminals-users-track">
                                            <i className="bi bi-person-fill-up" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                            Enviar utilizadores seleccionados
                                        </Button>
                                        <Button variant="outline-primary" size="sm" className="button-terminals-users-track">
                                            <i className="bi bi-person-x-fill" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                            Remover utilizadores seleccionados
                                        </Button>
                                        <Button variant="outline-primary" size="sm" className="button-terminals-users-track">
                                            <i className="bi bi-person-fill-down" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                            Recolher utilizadores seleccionados
                                        </Button>
                                    </div>
                                </Tab>
                                <Tab eventKey="users-terminal" title="Utilizadores no terminal">
                                    <p>DATATABLE DE UTILIZADORES NO TERMINAL</p>
                                    {/* <DataTable
                                    columns={[...tableColumns, actionColumn]}
                                    data={filteredDataTable}
                                    onRowDoubleClicked={handleEditDepartment}
                                    pagination
                                    paginationComponentOptions={paginationOptions}
                                    noDataComponent="Não há dados disponíveis para exibir."
                                    customStyles={customStyles}
                                    /> */}
                                </Tab>
                                <Tab eventKey="facial-taken" title="Biometria recolhida">
                                    <p>DATATABLE DE BIOMETRIA RECOLHIDA</p>
                                    {/* <DataTable
                                    columns={[...tableColumns, actionColumn]}
                                    data={filteredDataTable}
                                    onRowDoubleClicked={handleEditDepartment}
                                    pagination
                                    paginationComponentOptions={paginationOptions}
                                    noDataComponent="Não há dados disponíveis para exibir."
                                    customStyles={customStyles}
                                    /> */}
                                </Tab>
                                <Tab eventKey="cards-taken" title="Cartões recolhidos">
                                    <p>DATATABLE DE CARTÕES RECOLHIDOS</p>
                                    {/* <DataTable
                                    columns={[...tableColumns, actionColumn]}
                                    data={filteredDataTable}
                                    onRowDoubleClicked={handleEditDepartment}
                                    pagination
                                    paginationComponentOptions={paginationOptions}
                                    noDataComponent="Não há dados disponíveis para exibir."
                                    customStyles={customStyles}
                                    /> */}
                                </Tab>
                            </Tabs>
                        </Tab>
                        <Tab eventKey="state" title="Estado">
                            <p>DATATABLE DE ESTADO</p>
                            {/* <DataTable
                                columns={[...tableColumns, actionColumn]}
                                data={filteredDataTable}
                                onRowDoubleClicked={handleEditDepartment}
                                pagination
                                paginationComponentOptions={paginationOptions}
                                noDataComponent="Não há dados disponíveis para exibir."
                                customStyles={customStyles}
                            /> */}
                        </Tab>
                    </Tabs>
                    <p>DATATABLE DE ACTIVIDADE</p>
                    {/* <DataTable
                        columns={[...tableColumns, actionColumn]}
                        data={filteredDataTable}
                        onRowDoubleClicked={handleEditDepartment}
                        pagination
                        paginationComponentOptions={paginationOptions}
                        noDataComponent="Não há dados disponíveis para exibir."
                        customStyles={customStyles}
                    /> */}
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
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-arrow-down-circle" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Recolher utilizadores
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-arrow-up-circle" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Enviar todos os utilizadores
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-arrow-repeat" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Sincronizar utilizadores
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-arrow-left-right" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Recolher movimentos
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-trash" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Apagar utilizadores
                            </Button>
                            <div className="col-3">
                                <Form.Check type="checkbox" label="Utilizadores" className="mb-2" />
                                <Form.Check type="checkbox" label="Biometria digital" className="mb-2" />
                                <Form.Check type="checkbox" label="Biometria facial" className="mb-2" />
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="onOff" title="Ligação">
                        <div style={{ display: "flex", marginTop: 10, marginBottom: 10, padding: 10 }}>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-power" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Ligar
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-bootstrap-reboot" style={{ marginRight: 5, fontSize: '1rem' }}></i>
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
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-door-open" style={{ marginRight: 5, fontSize: '1rem' }}></i>
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
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-calendar-check" style={{ marginRight: 5, fontSize: '1rem' }}></i>
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
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-bell" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Sincronizar toques da sirene
                            </Button>
                        </div>
                    </Tab>
                    <Tab eventKey="files" title="Ficheiros">
                        <div style={{ display: "flex", marginTop: 10, marginBottom: 10, padding: 10 }}>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-arrow-bar-down" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Importar movimentos
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-person-fill-down" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Importar utilizadores
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
                                <i className="bi bi-fingerprint" style={{ marginRight: 5, fontSize: '1rem' }}></i>
                                Importar biometria digital
                            </Button>
                            <Button variant="outline-primary" size="sm" className="button-terminals-users">
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
        </div>
    );
};