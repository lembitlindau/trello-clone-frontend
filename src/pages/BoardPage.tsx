import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import BoardView from '../components/board/BoardView';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  
  if (!boardId) {
    return null;
  }
  
  return (
    <Box sx={{ height: '100vh' }}>
      <BoardView />
    </Box>
  );
};

export default BoardPage;
