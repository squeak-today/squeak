import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useTeacherAPI } from '../../hooks/useTeacherAPI';
import { FaPencilAlt, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { Spinner } from '../../styles/components/LoadingScreenStyles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const TeacherSettings: React.FC = () => {
  const { classrooms, fetchClassrooms } = useDashboard();
  const { updateClassroom, createClassroom, deleteClassroom } = useTeacherAPI();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleEditClick = (classroomId: string, currentName: string) => {
    setEditingId(classroomId);
    setEditValue(currentName);
  };

  const handleSaveClick = async (classroomId: string) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      const response = await updateClassroom({
        classroom_id: classroomId,
        name: editValue
      });
      
      if (!response.error) {
        await fetchClassrooms();
      }
    } catch (error) {
      console.error('Error updating classroom:', error);
    } finally {
      setEditingId(null);
      setIsSaving(false);
    }
  };

  const handleCreateClassroomClick = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      const classroomCount = classrooms ? classrooms.length + 1 : 1;
      await createClassroom({
        name: 'Classroom ' + classroomCount
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
    } finally {
      await fetchClassrooms();
      setIsCreating(false);
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleDeleteClick = async (classroomId: string) => {
    if (isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this classroom? This will remove all students from the classroom.')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await deleteClassroom({
        classroom_id: classroomId
      });
      
      if (!response.error) {
        await fetchClassrooms();
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <button onClick={handleCreateClassroomClick} 
      disabled={isCreating}
      className="bg-primary border border-border text-primary px-4 py-2 rounded-md disabled:opacity-50">
        + Create Classroom
      </button>
      <div className="mt-4 rounded-lg border border-border overflow-hidden">
        <Table className="font-secondary">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-[20vw] text-center font-secondary px-6 py-2">Name</TableHead>
              <TableHead className="w-[5vw] text-center font-secondary px-6 py-2">Students</TableHead>
              <TableHead className="w-[20vw] text-right font-secondary px-6 py-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms && classrooms.map((classroom) => (
              <TableRow 
                key={classroom.classroom_id} 
                className={`hover:bg-gray-100 border-b border-border`}
              >
                <TableCell className="break-words py-4 px-6">
                  {editingId === classroom.classroom_id ? (
                    <input
                      className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    classroom.name
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  {classroom.students_count || 0}
                </TableCell>
                <TableCell className="text-right py-4 px-6">
                  {editingId === classroom.classroom_id ? (
                    <>
                      {isSaving ? (
                        <div className="flex justify-end">
                          <Spinner size={16}/>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSaveClick(classroom.classroom_id)}
                            aria-label="Save"
                            disabled={isSaving}
                            className="bg-transparent border-none cursor-pointer p-2 text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={handleCancelClick}
                            aria-label="Cancel"
                            disabled={isSaving}
                            className="bg-transparent border-none cursor-pointer p-2 text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            <FaTimes size={16} />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(classroom.classroom_id, classroom.name)}
                        aria-label="Edit"
                        className="bg-transparent border-none cursor-pointer p-2 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <FaPencilAlt size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(classroom.classroom_id)}
                        aria-label="Delete"
                        disabled={isDeleting}
                        className="bg-transparent border-none cursor-pointer p-2 text-danger hover:text-[--color-danger-bg] transition-colors disabled:opacity-50"
                      >
                        <FaTrash size={16} />
                      </button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeacherSettings; 