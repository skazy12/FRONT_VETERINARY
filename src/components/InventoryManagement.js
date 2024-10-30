import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertTriangle, X } from 'lucide-react';
import Table from '../components/common/Table/Table';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
  // Estado para los items del inventario y configuración de la tabla
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Estado para modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Estado para formulario
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    minThreshold: 0,
  });
  
  // Estado para paginación y ordenamiento
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  const [sortConfig, setSortConfig] = useState({
    sortBy: 'name',
    sortDirection: 'ASC'
  });

  // Constantes para estados de productos
  const STATUS_OPTIONS = {
    ALL: 'Todos',
    IN_STOCK: 'En Stock',
    LOW_STOCK: 'Stock Bajo',
    OUT_OF_STOCK: 'Sin Stock'
  };

  // Función para cargar items del inventario (memoizada)
  const loadInventoryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Preparar parámetros de la petición
      const params = {
        page: pagination.pageNumber,
        size: pagination.pageSize,
        sortBy: sortConfig.sortBy,
        sortDirection: sortConfig.sortDirection
      };

      // Añadir filtros si existen
      if (searchTerm) {
        params.filterBy = 'name';
        params.filterValue = searchTerm;
      }

      if (selectedStatus !== 'ALL') {
        params.filterBy = 'status';
        params.filterValue = selectedStatus;
      }

      const response = await axiosInstance.get('/inventory', { params });

      if (response.data.success) {
        setInventory(response.data.data.content);
        setPagination(prev => ({
          ...prev,
          totalElements: response.data.data.totalElements,
          totalPages: response.data.data.totalPages
        }));
      } else {
        toast.error('Error cargando inventario');
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, sortConfig, searchTerm, selectedStatus]);

  // Efecto para cargar datos del inventario
  useEffect(() => {
    loadInventoryItems();
  }, [loadInventoryItems]);

  // Funciones de manejo para operaciones CRUD
  const handleAddProduct = () => {
    setFormData({
      name: '',
      quantity: 0,
      minThreshold: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      minThreshold: item.minThreshold,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/inventory', formData);
      if (response.data.success) {
        toast.success('Producto agregado exitosamente');
        setIsAddModalOpen(false);
        loadInventoryItems();
      }
    } catch (error) {
      toast.error('Error al agregar el producto');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/inventory/${selectedItem.id}`, formData);
      if (response.data.success) {
        toast.success('Producto actualizado exitosamente');
        setIsEditModalOpen(false);
        loadInventoryItems();
      }
    } catch (error) {
      toast.error('Error al actualizar el producto');
    }
  };

  // Modal genérico para formularios
  const FormModal = ({ isOpen, onClose, title, onSubmit }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del producto</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantidad mínima</label>
              <input
                type="number"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: parseInt(e.target.value) })}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente para detalles del producto
  const ViewModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detalles del Producto</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
                <p>{item.id}</p>
              <h3 className="font-medium text-gray-700">Nombre del producto</h3>
              <p>{item.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Cantidad actual</h3>
              <p>{item.quantity}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Cantidad mínima</h3>
              <p>{item.minThreshold}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Fecha de actualización</h3>
              <p>{new Date(item.lastUpdated).toLocaleDateString()}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Definición de columnas para la tabla
  const columns = [
    {
      key: 'name',
      label: 'Producto',
      sortable: true
    },
    {
      key: 'quantity',
      label: 'Cantidad',
      sortable: true
    },
    {
      key: 'status',
      label: 'Estado',
      render: (row) => {
        const getStatusColor = (quantity, minThreshold) => {
          if (quantity <= 0) return 'text-red-600 bg-red-100';
          if (quantity <= minThreshold) return 'text-yellow-600 bg-yellow-100';
          return 'text-green-600 bg-green-100';
        };

        const getStatusText = (quantity, minThreshold) => {
          if (quantity <= 0) return 'Sin Stock';
          if (quantity <= minThreshold) return 'Stock Bajo';
          return 'En Stock';
        };

        return (
          <span className={`px-2 py-1 rounded-full ${getStatusColor(row.quantity, row.minThreshold)}`}>
            {getStatusText(row.quantity, row.minThreshold)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            Detalles
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Editar
          </button>
        </div>
      )
    }
  ];

  // Sección de alertas de stock bajo
  const LowStockAlerts = () => {
    const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold && item.quantity > 0);
    
    if (lowStockItems.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="flex items-center text-yellow-800 font-medium mb-2">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Alertas de stock bajo
        </h3>
        <ul className="space-y-2">
          {lowStockItems.map(item => (
            <li key={item.id} className="text-yellow-700">
              {item.name} - Quedan {item.quantity} unidades (Mínimo: {item.minThreshold})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
        <button 
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
          onClick={handleAddProduct}
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar producto
        </button>
      </div>

      {/* Alertas de stock bajo */}
      <LowStockAlerts />

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md flex-1"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tabla de inventario */}
      <Table
        columns={columns}
        data={inventory}
        pagination={pagination}
        onPageChange={(newPage) => setPagination(prev => ({ ...prev, pageNumber: newPage }))}
        onSort={(key) => setSortConfig(prev => ({
          sortBy: key,
          sortDirection: prev.sortBy === key && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC'
        }))}
        isLoading={isLoading}
      />

      {/* Modales */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Producto"
        onSubmit={handleSubmitAdd}
      />
      
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Producto"
        onSubmit={handleSubmitEdit}
      />
      
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default InventoryManagement;