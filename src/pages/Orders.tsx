import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import axios from 'axios';

const orderSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  produtos: z.array(
    z.object({
      produtoId: z.string().min(1, 'Produto é obrigatório'),
      quantidade: z.coerce.number().min(1, 'Quantidade deve ser maior que 0'),
    })
  ),
  observacao: z.string().optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

type Order = {
  id: string;
  clienteId: string;
  cliente: { id: string; nome: string };
  produtos: { produtoId: string; quantidade: number }[];
  observacao?: string;
  total: number;
};

type Product = {
  id: string;
  nome: string;
  preco: number;
};

type Customer = {
  id: string;
  nome: string;
};

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'produtos',
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get<Order[]>('https://gerador-de-pedidos-backend.onrender.com/pedidos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get<Customer[]>('https://gerador-de-pedidos-backend.onrender.com/clientes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get<Product[]>('https://gerador-de-pedidos-backend.onrender.com/produtos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const onSubmit = async (data: OrderForm) => {
    const token = localStorage.getItem('token');

    const payload = {
      clienteId: parseInt(data.clienteId),
      produtos: data.produtos.map((p) => ({
        produtoId: parseInt(p.produtoId),
        quantidade: p.quantidade,
      })),
      observacao: data.observacao,
    };

    try {
      if (editingOrder) {
        await axios.put(`https://gerador-de-pedidos-backend.onrender.com/pedidos/${editingOrder.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('https://gerador-de-pedidos-backend.onrender.com/pedidos', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchOrders();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    }
  };

  const openModal = (order: Order | null = null) => {
    if (order) {
      setEditingOrder(order);
      reset({
        clienteId: order.clienteId.toString(),
        produtos: order.produtos.map((p) => ({
          produtoId: p.produtoId.toString(),
          quantidade: p.quantidade,
        })),
        observacao: order.observacao || '',
      });
    } else {
      setEditingOrder(null);
      reset({ clienteId: '', produtos: [], observacao: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    reset({});
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;

    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:3000/pedidos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      alert('Falha ao excluir pedido.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Pedido
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded-md shadow">
            <h3 className="text-lg font-semibold">Pedido #{order.id}</h3>
            <p><strong>Cliente:</strong> {order.cliente.nome}</p>
            <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
            <p><strong>Observação:</strong> {order.observacao || 'Nenhuma'}</p>
            <div className="flex space-x-2 mt-2">
              <button onClick={() => openModal(order)} className="text-blue-500 hover:text-blue-700">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingOrder ? 'Editar Pedido' : 'Adicionar Pedido'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label>Cliente:</label>
          <select {...register('clienteId')} className="block w-full border rounded-md p-2">
            <option value="">Selecione um cliente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <label>Produtos: </label>
          {fields.map((item, index) => (
            <div key={item.id} className="flex space-x-2">
              <select {...register(`produtos.${index}.produtoId`)} className="block w-3/5 border rounded-md p-2">
                <option value="">Selecione um produto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco.toFixed(2)}</option>
                ))}
              </select>
              <input type="number" {...register(`produtos.${index}.quantidade`)} className="block w-1/5 border rounded-md p-2" placeholder="Qtd" />
              <button type="button" onClick={() => remove(index)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => append({ produtoId: '', quantidade: 1 })} className="text-blue-500">
            + Adicionar Produto
          </button>
          
          {/* <label>Observação</label> */}
          <input type="text" {...register('observacao')} className="block w-full border rounded-md p-2" placeholder="Observação (opcional)" />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            {editingOrder ? 'Atualizar Pedido' : 'Criar Pedido'}
          </button>
        </form>
      </Modal>
    </div>
  );
}