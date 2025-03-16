import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import axios from 'axios';

// Atualizando os campos conforme a API
const productSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, 'O nome é obrigatório'),
  preco: z.coerce.number().min(0, 'O preço deve ser positivo'),
  tag: z.string().min(1, 'A tag é obrigatória'),
});

type ProductForm = z.infer<typeof productSchema>;

export function Products() {
  const [products, setProducts] = useState<ProductForm[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductForm | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:3000/produtos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      alert('Falha ao carregar produtos.');
    }
  };

  const onSubmit = async (data: ProductForm) => {
    const token = localStorage.getItem('token');

    try {
      if (editingProduct && editingProduct.id) {
        await axios.put(
          `http://localhost:3000/produtos/${editingProduct.id}`,
          {
            nome: data.nome,
            preco: data.preco,
            tag: data.tag,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        const response = await axios.post('http://localhost:3000/produtos', data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProducts([...products, response.data]);
      }

      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Falha ao salvar produto.');
    }
  };

  const openModal = (product?: ProductForm) => {
    if (product) {
      setEditingProduct(product);
      reset(product);
    } else {
      setEditingProduct(null);
      reset({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:3000/produtos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Falha ao excluir produto.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <p className="text-gray-500">Nenhum produto disponível.</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{product.nome}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(product)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => product.id && handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">Categoria: {product.tag}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">
                  R$ {typeof product.preco === 'number' ? product.preco.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              {...register('nome')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tag</label>
            <input
              type="text"
              {...register('tag')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
            {errors.tag && <p className="text-red-500 text-sm mt-1">{errors.tag.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preço</label>
            <input
              type="number"
              step="0.01"
              {...register('preco', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
            {errors.preco && <p className="text-red-500 text-sm mt-1">{errors.preco.message}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              {editingProduct ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
