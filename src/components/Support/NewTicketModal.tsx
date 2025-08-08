import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../Shared/Modal';
import { createTicket } from '../../services/api';
import { toast } from 'react-toastify';

const ticketSchema = z.object({
  subject: z.string().min(5, "O assunto deve ter pelo menos 5 caracteres."),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose, onTicketCreated }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: TicketFormData) => {
    try {
      await createTicket(data);
      toast.success('Ticket aberto com sucesso!');
      onTicketCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.errors?.join(', ') || 'Não foi possível abrir o ticket.');
    }
  };

  const FieldError: React.FC<{ message?: string }> = ({ message }) => message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abrir Novo Ticket de Suporte">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Assunto</label>
          <input
            {...register("subject")}
            id="subject"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            placeholder="Ex: Problema com depósito"
          />
          <FieldError message={errors.subject?.message} />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem</label>
          <textarea
            {...register("message")}
            id="message"
            rows={5}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            placeholder="Descreva seu problema ou dúvida em detalhes..."
          />
          <FieldError message={errors.message?.message} />
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
            {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTicketModal;