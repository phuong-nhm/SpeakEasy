'use client';

import { useState, useEffect, useCallback } from 'react';
import { LevelDto, CreateUpdateLevelDto } from '@/types/admin';
import { levelService } from '@/mock/mockLevel';

export function useAdminLevels() {

const [levels, setLevels] = useState<LevelDto[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
const [editingLevel, setEditingLevel] = useState<LevelDto | null>(null);
const [name, setName] = useState<string>('');
const [description, setDescription] = useState<string>('');
const [error, setError] = useState<string>('');





  useEffect(() => {
    const fetchLevels=async()=>{
        try{
            setIsLoading(true);
            const data=await levelService.getList();
            setLevels(data);
        }catch(err){
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    };
    fetchLevels();
  }, []);


  const openCreateModal = useCallback(() => {
    setEditingLevel(null);
    setName('');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  },[]);


  const openEditModal = useCallback ((level: LevelDto) => {
    setEditingLevel(level);
    setName(level.name);
    setDescription(level.description);
    setError('');
    setIsModalOpen(true);
  },[]);


  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLevel(null);
  },[]);


  const handleSubmit =useCallback( async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên Level không được để trống!');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try{
      if(editingLevel){
        const upload=await levelService.update(editingLevel.id, { name, description });
        setLevels((prevLevels) =>
          prevLevels.map((level) =>
            level.id === editingLevel.id ? upload : level
          )
        );
      }
      else{
        const create=await levelService.create({ name, description });
        setLevels((prevLevels) => [create,...prevLevels]);
      }
      closeModal();
    }catch (err) {
    if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Có lỗi xảy ra!');
          }
  } finally {
    setIsSubmitting(false);
  }
  },[name, description, editingLevel, closeModal]);


const handleDelete = useCallback(async (id: string) => {
  if (!confirm('Bạn có chắc chắn muốn xóa Level này?')) return;

  try {
    await levelService.delete(id);
    setLevels((prevLevels) => prevLevels.filter((level) => level.id !== id));
  } catch (err) {
    alert('Xóa thất bại!');
  }
}, []);

  return {levels,
    isLoading,
    isSubmitting,
    isModalOpen,
    editingLevel,
    name,
    setName,
    description,
    setDescription,
    error,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}