import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Order, Customer, Product } from '../types';

const orderSchema = z.object({
  number: z.string().min(1, 'Order number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  productIds: z.array(z.string()).min(1, 'At least one product is required'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
});

type OrderForm = z.infer<typeof orderSchema>;

// Temporary data for demonstration
const customers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St',
  },
];

const products: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 99.99,
    quantity: 10,
  },
];

const initialOrders: Order[] = [
  {
    id: '1',
    number: 'ORD-001',
    date: new Date().toISOString(),
    customer: customers[0],
    products: [products[0]],
    status: 'pending',
    total: 99.99,
  },
];

export function Orders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: editingOrder
      ? {
          number: editingOrder.number,
          customerId: editingOrder.customer.id,
          productIds: editingOrder.products.map((p) => p.id),
          status: editingOrder.status,
        }
      : undefined,
  });

  const onSubmit = (data: OrderForm) => {
    const customer = customers.find((c) => c.id === data.customerId)!;
    const selectedProducts = products.filter((p) =>
      data.productIds.includes(p.id)
    );
    const total = selectedProducts.reduce((sum, p) => sum + p.price, 0);

    const orderData = {
      number: data.number,
      date: new Date().toISOString(),
      customer,
      products: selectedProducts,
      status: data.status,
      total,
    };

    if (editingOrder) {
      setOrders(
        orders.map((o) =>
          o.id === editingOrder.id ? { ...o, ...orderData } : o
        )
      );
    } else {
      setOrders([...orders, { id: Date.now().toString(), ...orderData }]);
    }
    closeModal();
  };

  const openModal = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      reset({
        number: order.number,
        customerId: order.customer.id,
        productIds: order.products.map((p) => p.id),
        status: order.status,
      });
    } else {
      setEditingOrder(null);
      reset({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    reset({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter((o) => o.id !== id));
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{order.number}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(order)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Customer:</span>{' '}
                {order.customer.name}
              </p>
              <div>
                <span className="text-sm font-medium">Products:</span>
                <ul className="text-sm text-gray-600 ml-4">
                  {order.products.map((product) => (
                    <li key={product.id}>{product.name}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="font-semibold">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOrder ? 'Edit Order' : 'Add Order'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Order Number
            </label>
            <input
              type="text"
              {...register('number')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <select
              {...register('customerId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Products
            </label>
            <select
              multiple
              {...register('productIds')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
            {errors.productIds && (
              <p className="text-red-500 text-sm mt-1">
                {errors.productIds.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingOrder ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}