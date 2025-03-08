import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  MoreVert as MoreVertIcon,
  Star,
  StarBorder,
  Archive,
  ContentCopy,
  Delete,
  ArrowBack
} from '@mui/icons-material';
import { useBoard } from '../../contexts/BoardContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { List as ListType, Card as CardType } from '../../types';
import List from '../list/List';
import CardDetail from '../card/CardDetail';

const listValidationSchema = Yup.object({
  title: Yup.string()
    .required('Nimekirja pealkiri on kohustuslik')
    .min(1, 'Pealkiri peab olema vähemalt 1 tähemärk pikk')
    .max(100, 'Pealkiri võib olla kuni 100 tähemärki pikk'),
});

const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentBoard, 
    isLoading, 
    error, 
    lists, 
    cards, 
    fetchBoardDetails, 
    createList,
    updateBoard,
    toggleFavorite,
    toggleArchive,
    moveCard,
    deleteBoard
  } = useBoard();

  const [addingList, setAddingList] = useState(false);
  const [boardMenuAnchor, setBoardMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  useEffect(() => {
    if (boardId) {
      fetchBoardDetails(boardId);
    }
  }, [boardId, fetchBoardDetails]);

  const listFormik = useFormik({
    initialValues: {
      title: '',
    },
    validationSchema: listValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (boardId) {
        try {
          await createList(boardId, values.title);
          resetForm();
          setAddingList(false);
        } catch (err) {
          console.error('Error creating list:', err);
        }
      }
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Move card between lists
    if (source.droppableId !== destination.droppableId) {
      moveCard(draggableId, source.droppableId, destination.droppableId);
    }
  };

  const handleOpenBoardMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setBoardMenuAnchor(event.currentTarget);
  };

  const handleCloseBoardMenu = () => {
    setBoardMenuAnchor(null);
  };

  const handleEditBoardTitle = (e: React.FocusEvent<HTMLInputElement>) => {
    if (currentBoard && e.target.value !== currentBoard.name && e.target.value.trim() !== '') {
      updateBoard(currentBoard.id, { name: e.target.value });
    }
  };

  const handleToggleFavorite = () => {
    if (currentBoard) {
      toggleFavorite(currentBoard.id, !currentBoard.isFavorite);
      handleCloseBoardMenu();
    }
  };

  const handleToggleArchive = () => {
    if (currentBoard) {
      toggleArchive(currentBoard.id, !currentBoard.isArchived);
      handleCloseBoardMenu();
    }
  };

  const handleDeleteBoard = () => {
    if (currentBoard) {
      deleteBoard(currentBoard.id);
      navigate('/');
    }
    setDeleteDialogOpen(false);
    handleCloseBoardMenu();
  };

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
  };

  const handleCloseCardDetail = () => {
    setSelectedCard(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Tagasi peavaatesse
        </Button>
      </Box>
    );
  }

  if (!currentBoard) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Tahvlit ei leitud</Typography>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Tagasi peavaatesse
        </Button>
      </Box>
    );
  }

  // Check if board is archived
  if (currentBoard.isArchived) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">
          See tahvel on arhiveeritud
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => toggleArchive(currentBoard.id, false)} 
          sx={{ mt: 2, mr: 1 }}
        >
          Taasta tahvel
        </Button>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Tagasi peavaatesse
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: currentBoard.background || '#0079bf', 
    }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate('/')}
            sx={{ mr: 2, color: 'white' }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box 
            component="div" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'white',
            }}
          >
            <TextField
              variant="standard"
              defaultValue={currentBoard.name}
              onBlur={handleEditBoardTitle}
              InputProps={{
                disableUnderline: true,
                style: { 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  color: 'white',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                }
              }}
              sx={{ mr: 2 }}
            />
            
            <Tooltip title={currentBoard.isFavorite ? "Eemalda lemmikutest" : "Lisa lemmikutesse"}>
              <IconButton onClick={handleToggleFavorite} sx={{ color: 'white' }}>
                {currentBoard.isFavorite ? <Star /> : <StarBorder />}
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="body2" sx={{ color: 'white', mr: 2 }}>
            {user?.username || 'Kasutaja'}
          </Typography>
          
          <IconButton 
            color="inherit"
            onClick={handleOpenBoardMenu}
            sx={{ color: 'white' }}
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={boardMenuAnchor}
            open={Boolean(boardMenuAnchor)}
            onClose={handleCloseBoardMenu}
          >
            <MenuItem onClick={handleToggleFavorite}>
              {currentBoard.isFavorite ? <Star sx={{ mr: 1 }} /> : <StarBorder sx={{ mr: 1 }} />}
              {currentBoard.isFavorite ? 'Eemalda lemmikutest' : 'Lisa lemmikutesse'}
            </MenuItem>
            <MenuItem onClick={handleToggleArchive}>
              <Archive sx={{ mr: 1 }} />
              Arhiveeri tahvel
            </MenuItem>
            <MenuItem disabled>
              <ContentCopy sx={{ mr: 1 }} />
              Kopeeri tahvel
            </MenuItem>
            <MenuItem onClick={() => { setDeleteDialogOpen(true); handleCloseBoardMenu(); }}>
              <Delete sx={{ mr: 1 }} />
              Kustuta tahvel
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box 
          sx={{
            display: 'flex',
            overflowX: 'auto',
            p: 2,
            flexGrow: 1,
            alignItems: 'flex-start',
          }}
        >
          {lists.map((list: ListType, index: number) => (
            <Draggable key={list.id} draggableId={list.id} index={index}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  sx={{ 
                    minWidth: 280,
                    mr: 2,
                    height: '100%',
                  }}
                >
                  <List 
                    list={list} 
                    cards={cards[list.id] || []} 
                    onCardClick={handleCardClick}
                    dragHandleProps={provided.dragHandleProps}
                  />
                </Box>
              )}
            </Draggable>
          ))}
          
          {addingList ? (
            <Box
              sx={{
                minWidth: 280,
                maxWidth: 280,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 1,
                p: 1,
                mb: 2,
              }}
            >
              <form onSubmit={listFormik.handleSubmit}>
                <TextField
                  autoFocus
                  fullWidth
                  id="title"
                  name="title"
                  placeholder="Sisesta nimekirja pealkiri..."
                  value={listFormik.values.title}
                  onChange={listFormik.handleChange}
                  onBlur={listFormik.handleBlur}
                  error={listFormik.touched.title && Boolean(listFormik.errors.title)}
                  helperText={listFormik.touched.title && listFormik.errors.title}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={listFormik.isSubmitting}
                  >
                    Lisa nimekiri
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setAddingList(false);
                      listFormik.resetForm();
                    }}
                  >
                    Tühista
                  </Button>
                </Box>
              </form>
            </Box>
          ) : (
            <Box 
              sx={{ 
                minWidth: 280, 
                maxWidth: 280,
                bgcolor: 'rgba(255, 255, 255, 0.3)', 
                borderRadius: 1,
                p: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'fit-content',
              }}
              onClick={() => setAddingList(true)}
            >
              <AddIcon sx={{ mr: 1, color: 'white' }} />
              <Typography sx={{ color: 'white' }}>Lisa uus nimekiri</Typography>
            </Box>
          )}
        </Box>
      </DragDropContext>
      
      {/* Delete Board Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Kustuta tahvel?</DialogTitle>
        <DialogContent>
          <Typography>
            Kas oled kindel, et soovid tahvli "{currentBoard.name}" kustutada? Seda tegevust ei saa tagasi võtta.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Tühista</Button>
          <Button onClick={handleDeleteBoard} color="error">
            Kustuta
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetail 
          card={selectedCard} 
          onClose={handleCloseCardDetail} 
          listName={lists.find(list => list.id === selectedCard.listId)?.title || ''}
        />
      )}
    </Box>
  );
};

export default BoardView;
