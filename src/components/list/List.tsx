import React, { useState } from 'react';
import { Droppable, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useBoard } from '../../contexts/BoardContext';
import { List as ListType, Card as CardType } from '../../types';
import Card from '../card/Card';

interface ListProps {
  list: ListType;
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Nimekirja pealkiri on kohustuslik')
    .min(1, 'Pealkiri peab olema vähemalt 1 tähemärk pikk')
    .max(100, 'Pealkiri võib olla kuni 100 tähemärki pikk'),
});

const cardValidationSchema = Yup.object({
  title: Yup.string()
    .required('Kaardi pealkiri on kohustuslik')
    .min(1, 'Pealkiri peab olema vähemalt 1 tähemärk pikk')
    .max(100, 'Pealkiri võib olla kuni 100 tähemärki pikk'),
});

const List: React.FC<ListProps> = ({ list, cards, onCardClick, dragHandleProps }) => {
  const { updateList, deleteList, createCard } = useBoard();
  
  const [isEditing, setIsEditing] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const listFormik = useFormik({
    initialValues: {
      title: list.title,
    },
    validationSchema,
    onSubmit: async (values) => {
      await updateList(list.id, values.title);
      setIsEditing(false);
    },
  });

  const cardFormik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema: cardValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      await createCard(list.id, values.title, values.description);
      resetForm();
      setAddingCard(false);
    },
  });

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    handleCloseMenu();
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = async () => {
    await deleteList(list.id);
    setDeleteDialog(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 1,
        maxHeight: '100%',
      }}
    >
      <Box 
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
        {...dragHandleProps}
      >
        {isEditing ? (
          <form 
            onSubmit={listFormik.handleSubmit} 
            style={{ width: '100%', display: 'flex', alignItems: 'center' }}
          >
            <TextField
              autoFocus
              fullWidth
              id="title"
              name="title"
              value={listFormik.values.title}
              onChange={listFormik.handleChange}
              onBlur={listFormik.handleBlur}
              error={listFormik.touched.title && Boolean(listFormik.errors.title)}
              helperText={listFormik.touched.title && listFormik.errors.title}
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Box sx={{ display: 'flex', ml: 1 }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="small"
                disabled={listFormik.isSubmitting}
              >
                Salvesta
              </Button>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => {
                  setIsEditing(false);
                  listFormik.resetForm();
                }}
                sx={{ ml: 1 }}
              >
                Tühista
              </Button>
            </Box>
          </form>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', pl: 1 }}>
              {list.title}
            </Typography>
            <IconButton size="small" onClick={handleOpenMenu}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Muuda pealkirja
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Kustuta nimekiri
          </MenuItem>
        </Menu>
      </Box>

      <Droppable droppableId={list.id} type="CARD">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              minHeight: '10px',
              maxHeight: 'calc(100vh - 160px)',
              p: 1,
            }}
          >
            {cards.map((card, index) => (
              <Card 
                key={card.id} 
                card={card} 
                index={index} 
                onClick={() => onCardClick(card)}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>

      {addingCard ? (
        <Box sx={{ p: 1 }}>
          <form onSubmit={cardFormik.handleSubmit}>
            <TextField
              autoFocus
              fullWidth
              id="title"
              name="title"
              placeholder="Sisesta kaardi pealkiri..."
              value={cardFormik.values.title}
              onChange={cardFormik.handleChange}
              onBlur={cardFormik.handleBlur}
              error={cardFormik.touched.title && Boolean(cardFormik.errors.title)}
              helperText={cardFormik.touched.title && cardFormik.errors.title}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
              multiline
              maxRows={3}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              placeholder="Sisesta kirjeldus (valikuline)..."
              value={cardFormik.values.description}
              onChange={cardFormik.handleChange}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={cardFormik.isSubmitting}
              >
                Lisa kaart
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setAddingCard(false);
                  cardFormik.resetForm();
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
            p: 1, 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
            borderRadius: 1,
            m: 0.5,
          }}
          onClick={() => setAddingCard(true)}
        >
          <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography>Lisa kaart</Typography>
        </Box>
      )}

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Kustuta nimekiri?</DialogTitle>
        <DialogContent>
          <Typography>
            Kas oled kindel, et soovid nimekirja "{list.title}" kustutada? 
            Kõik selles nimekirjas olevad kaardid kustutakse samuti.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Tühista</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Kustuta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default List;
