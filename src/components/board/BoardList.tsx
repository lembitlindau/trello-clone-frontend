import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActionArea, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
  Grid,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Star, StarBorder, Archive } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useBoard } from '../../contexts/BoardContext';
import { Board } from '../../types';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Tahvli nimi on kohustuslik')
    .min(1, 'Tahvli nimi peab olema vähemalt 1 tähemärk pikk')
    .max(100, 'Tahvli nimi võib olla kuni 100 tähemärki pikk'),
  background: Yup.string(),
});

const BoardList: React.FC = () => {
  const navigate = useNavigate();
  const { boards, isLoading, error, createBoard, toggleFavorite, toggleArchive } = useBoard();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      background: '#0079bf', // Default Trello blue
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const newBoard = await createBoard(values.name, values.background);
        resetForm();
        handleClose();
        navigate(`/board/${newBoard.id}`);
      } catch (err) {
        console.error('Failed to create board:', err);
      }
    },
  });

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    toggleFavorite(board.id, !board.isFavorite);
  };

  const handleToggleArchive = (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    toggleArchive(board.id, !board.isArchived);
  };

  // Filter and sort boards
  const activeBoards = boards.filter(board => !board.isArchived);
  const archivedBoards = boards.filter(board => board.isArchived);
  const favoriteBoards = activeBoards.filter(board => board.isFavorite);
  const regularBoards = activeBoards.filter(board => !board.isFavorite);

  const renderBoardCard = (board: Board) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={board.id}>
      <Card 
        sx={{ 
          height: '120px', 
          background: board.background || '#0079bf',
          color: 'white',
          position: 'relative'
        }}
      >
        <CardActionArea 
          onClick={() => handleBoardClick(board.id)}
          sx={{ height: '100%' }}
        >
          <CardContent>
            <Typography variant="h6" component="div" sx={{ mb: 1, wordBreak: 'break-word' }}>
              {board.name}
            </Typography>
            
            <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
              <Tooltip title={board.isFavorite ? "Eemalda lemmikutest" : "Lisa lemmikutesse"}>
                <IconButton onClick={(e) => handleToggleFavorite(e, board)} size="small" sx={{ color: 'white' }}>
                  {board.isFavorite ? <Star /> : <StarBorder />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={board.isArchived ? "Taasta arhiivist" : "Liiguta arhiivi"}>
                <IconButton onClick={(e) => handleToggleArchive(e, board)} size="small" sx={{ color: 'white', ml: 1 }}>
                  <Archive />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {favoriteBoards.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
            ⭐ Lemmiktahvlid
          </Typography>
          <Grid container spacing={2}>
            {favoriteBoards.map(renderBoardCard)}
          </Grid>
        </>
      )}

      <Typography variant="h5" sx={{ mb: 2, mt: 3 }}>
        📋 Minu tahvlid
      </Typography>
      <Grid container spacing={2}>
        {regularBoards.map(renderBoardCard)}
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card 
            sx={{ 
              height: '120px', 
              bgcolor: 'rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px dashed rgba(0, 0, 0, 0.3)'
            }}
            onClick={handleOpen}
          >
            <Box sx={{ textAlign: 'center' }}>
              <AddIcon fontSize="large" color="action" />
              <Typography color="textSecondary">Lisa uus tahvel</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {archivedBoards.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2, mt: 3 }}>
            🗄️ Arhiveeritud tahvlid
          </Typography>
          <Grid container spacing={2}>
            {archivedBoards.map(renderBoardCard)}
          </Grid>
        </>
      )}

      {/* Create Board Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Loo uus tahvel</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Tahvli nimi"
              type="text"
              fullWidth
              variant="outlined"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Taustavärv
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['#0079bf', '#d29034', '#519839', '#b04632', '#89609e', '#cd5a91', '#4bbf6b', '#00aecc'].map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: color,
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: formik.values.background === color ? '2px solid #000' : 'none',
                  }}
                  onClick={() => formik.setFieldValue('background', color)}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Tühista</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Loomisel...' : 'Loo tahvel'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default BoardList;
