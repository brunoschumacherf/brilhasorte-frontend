import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { createTicket } from '../../services/api'; 
import Modal from '../Shared/Modal'; 

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
      setTimeout(() => reset(), 300);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abrir Novo Ticket de Suporte">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-xs font-medium text-gray-400 mb-1">Assunto</label>
          <input
            {...register("subject")}
            id="subject"
            className={`w-full bg-zinc-800 border ${errors.subject ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none`}
            placeholder="Ex: Problema com depósito"
          />
          {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject.message}</p>}
        </div>
        <div>
          <label htmlFor="message" className="block text-xs font-medium text-gray-400 mb-1">Mensagem</label>
          <textarea
            {...register("message")}
            id="message"
            rows={5}
            className={`w-full bg-zinc-800 border ${errors.message ? 'border-red-500' : 'border-zinc-700'} rounded-lg py-2 px-3 text-white transition-colors focus:border-yellow-500 focus:ring-yellow-500 focus:outline-none`}
            placeholder="Descreva o seu problema ou dúvida em detalhes..."
          />
          {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <motion.button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Cancelar
          </motion.button>
          <motion.button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isSubmitting ? 'A enviar...' : 'Enviar Ticket'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTicketModal;
