import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import axios from 'axios';

// Esquema de validação com campos de endereço
const customerSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, 'O nome é obrigatório'),
  telefone: z.string().min(1, 'O telefone é obrigatório'),
  empresa: z.string().optional(),
  endereco: z.object({
    rua: z.string().min(1, 'A rua é obrigatória'),
    numero: z.string().min(1, 'O número é obrigatório'),
    cidade: z.string().min(1, 'A cidade é obrigatória'),
    estado: z.string().min(1, 'O estado é obrigatório'),
    cep: z.string().min(1, 'O CEP é obrigatório'),
  }),
});

type CustomerForm = z.infer<typeof customerSchema>;

export function Customers() {
  const [customers, setCustomers] = useState<CustomerForm[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerForm | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Buscar clientes da API
  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:3000/clientes', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Garante que cada cliente tenha um endereço válido
      const clientesFormatados = response.data.map((cliente: CustomerForm) => ({
        ...cliente,
        endereco: cliente.endereco || { // Se `endereco` for undefined, cria um objeto vazio
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      }));
  
      setCustomers(clientesFormatados);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      alert('Falha ao carregar clientes.');
    }
  };
  

  const onSubmit = async (data: CustomerForm) => {
    const token = localStorage.getItem('token');

    try {
      if (editingCustomer && editingCustomer.id) {
        // Atualizar cliente existente
        await axios.put(`http://localhost:3000/clientes/${editingCustomer.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Criar um novo cliente
        const response = await axios.post('http://localhost:3000/clientes', data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCustomers([...customers, response.data]);
      }

      fetchCustomers();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Falha ao salvar cliente.');
    }
  };

  const openModal = (customer?: CustomerForm) => {
    if (customer) {
      setEditingCustomer(customer);
      reset({
        nome: customer.nome,
        telefone: customer.telefone,
        empresa: customer.empresa || '',
        endereco: customer.endereco || {
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      });
    } else {
      setEditingCustomer(null);
      reset({
        nome: '',
        telefone: '',
        empresa: '',
        endereco: {
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    reset({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:3000/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Falha ao excluir cliente.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.length === 0 ? (
          <p className="text-gray-500">Nenhum cliente disponível.</p>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{customer.nome}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(customer)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => customer.id && handleDelete(customer.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">{customer.telefone}</p>
                <p className="text-gray-600">{customer.empresa || 'Empresa não informada'}</p>
                <p className="text-gray-600">
                  {customer.endereco && customer.endereco.rua
                    ? `${customer.endereco.rua}, ${customer.endereco.numero}, ${customer.endereco.cidade} - ${customer.endereco.estado}, ${customer.endereco.cep}`
                    : 'Endereço não disponível'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCustomer ? 'Editar Cliente' : 'Adicionar Cliente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="text" {...register('nome')} placeholder="Nome" />
          <input type="text" {...register('telefone')} placeholder="Telefone" />
          <input type="text" {...register('empresa')} placeholder="Empresa" />

          <h4 className="font-semibold">Endereço</h4>
          <input type="text" {...register('endereco.rua')} placeholder="Rua" />
          <input type="text" {...register('endereco.numero')} placeholder="Número" />
          <input type="text" {...register('endereco.cidade')} placeholder="Cidade" />
          <input type="text" {...register('endereco.estado')} placeholder="Estado" />
          <input type="text" {...register('endereco.cep')} placeholder="CEP" />

          <button type="submit">{editingCustomer ? 'Atualizar' : 'Criar'}</button>
        </form>
      </Modal>
    </div>
  );
}
