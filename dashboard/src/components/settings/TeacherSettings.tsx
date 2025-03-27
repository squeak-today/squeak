import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useTeacherAPI } from '../../hooks/useTeacherAPI';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { Spinner } from '../../styles/components/LoadingScreenStyles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const EditInput = styled.input`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.md};
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  width: 100%;
  max-width: 300px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.text.primary};
  }
`;

const TeacherSettings: React.FC = () => {
  const { classrooms, fetchClassrooms } = useDashboard();
  const { updateClassroom } = useTeacherAPI();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  const handleCancelClick = () => {
    setEditingId(null);
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60%]">Name</TableHead>
          <TableHead className="w-[30%]">Students Count</TableHead>
          <TableHead className="w-[10%]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classrooms.map((classroom) => (
          <TableRow key={classroom.classroom_id}>
            <TableCell>
              {editingId === classroom.classroom_id ? (
                <EditInput
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
              ) : (
                classroom.name
              )}
            </TableCell>
            <TableCell>
              {classroom.students_count || 0}
            </TableCell>
            <TableCell className="text-right">
              {editingId === classroom.classroom_id ? (
                <>
                  {isSaving ? (
                    <Spinner size={16} />
                  ) : (
                    <>
                      <EditButton
                        onClick={() => handleSaveClick(classroom.classroom_id)}
                        aria-label="Save"
                        disabled={isSaving}
                      >
                        {FaCheck({ size: 16 })}
                      </EditButton>
                      <EditButton
                        onClick={handleCancelClick}
                        aria-label="Cancel"
                        disabled={isSaving}
                      >
                        {FaTimes({ size: 16 })}
                      </EditButton>
                    </>
                  )}
                </>
              ) : (
                <EditButton
                  onClick={() => handleEditClick(classroom.classroom_id, classroom.name)}
                  aria-label="Edit"
                >
                  {FaPencilAlt({ size: 16 })}
                </EditButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TeacherSettings; 