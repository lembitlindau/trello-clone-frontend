import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Divider,
  Chip,
  Grid,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Stack
} from '@mui/material';
import { 
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon, 
  Comment as CommentIcon,
  AccessTime as ClockIcon,
  CheckBox as ChecklistIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useBoard } from '../../contexts/BoardContext';
import { Card as CardType, Comment as CommentType, Checklist as ChecklistType } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { et } from 'date-fns/locale';

interface CardDetailProps {
  card: CardType;
  onClose: () => void;
  listName: string;
}

const CardDetail: React.FC<CardDetailProps> = ({ card, onClose, listName }) => {
  const { updateCard, deleteCard } = useBoard();
  
  const [titleEdit, setTitleEdit] = useState(false);
  const [descriptionEdit, setDescriptionEdit] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  
  const titleFormik = useFormik({
    initialValues: {
      title: card.title,
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Pealkiri on kohustuslik')
        .min(1, 'Pealkiri peab olema vähemalt 1 tähemärk pikk')
        .max(100, 'Pealkiri võib olla kuni 100 tähemärki pikk'),
    }),
    onSubmit: async (values) => {
      await updateCard(card.id, { title: values.title });
      setTitleEdit(false);
    },
  });
  
  const descriptionFormik = useFormik({
    initialValues: {
      description: card.description || '',
    },
    onSubmit: async (values) => {
      await updateCard(card.id, { description: values.description });
      setDescriptionEdit(false);
    },
  });
  
  const commentFormik = useFormik({
    initialValues: {
      text: '',
    },
    validationSchema: Yup.object({
      text: Yup.string()
        .required('Kommentaar ei saa olla tühi')
        .max(500, 'Kommentaar võib olla kuni 500 tähemärki pikk'),
    }),
    onSubmit: async (_, { resetForm }) => {
      // In a real application, we would add the comment and update the card
      // Here we'll just close the comment form as if it was successful
      resetForm();
      setAddingComment(false);
    },
  });
  
  const handleDelete = async () => {
    if (window.confirm(`Kas oled kindel, et soovid kaardi "${card.title}" kustutada?`)) {
      await deleteCard(card.id);
      onClose();
    }
  };
  
  // Format due date if present
  let formattedDueDate = '';
  if (card.dueDate) {
    try {
      formattedDueDate = formatDistanceToNow(new Date(card.dueDate), { 
        addSuffix: true,
        locale: et
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      formattedDueDate = 'Vigane kuupäev';
    }
  }
  
  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: {
            xs: '100%',
            sm: 'auto',
            md: 'auto'
          },
          maxHeight: {
            xs: '100%',
            sm: '90vh',
            md: '80vh'
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {/* Card Title */}
            <Box sx={{ mb: 3 }}>
              {titleEdit ? (
                <form onSubmit={titleFormik.handleSubmit}>
                  <TextField
                    autoFocus
                    fullWidth
                    id="title"
                    name="title"
                    label="Pealkiri"
                    value={titleFormik.values.title}
                    onChange={titleFormik.handleChange}
                    onBlur={titleFormik.handleBlur}
                    error={titleFormik.touched.title && Boolean(titleFormik.errors.title)}
                    helperText={titleFormik.touched.title && titleFormik.errors.title}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="small"
                      disabled={titleFormik.isSubmitting}
                    >
                      Salvesta
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => {
                        setTitleEdit(false);
                        titleFormik.resetForm();
                      }}
                    >
                      Tühista
                    </Button>
                  </Box>
                </form>
              ) : (
                <Typography 
                  variant="h5" 
                  onClick={() => setTitleEdit(true)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, p: 1 }}
                >
                  {card.title}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Nimekirjas <b>{listName}</b>
              </Typography>
            </Box>
            
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Tooltip title="Sildid">
                    <Chip label="Sildid" size="small" sx={{ mr: 1 }} />
                  </Tooltip>
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {card.labels.map((label, index) => (
                    <Chip
                      key={index}
                      label={label}
                      sx={{ bgcolor: label, color: 'white' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            
            {/* Due Date */}
            {card.dueDate && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Tooltip title="Tähtaeg">
                    <ClockIcon fontSize="small" sx={{ mr: 1 }} />
                  </Tooltip>
                  Tähtaeg
                </Typography>
                <Chip 
                  label={formattedDueDate} 
                  variant="outlined" 
                />
              </Box>
            )}
            
            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tooltip title="Kirjeldus">
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
                Kirjeldus
              </Typography>
              
              {descriptionEdit ? (
                <form onSubmit={descriptionFormik.handleSubmit}>
                  <TextField
                    autoFocus
                    fullWidth
                    id="description"
                    name="description"
                    placeholder="Lisa üksikasjalik kirjeldus..."
                    value={descriptionFormik.values.description}
                    onChange={descriptionFormik.handleChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="small"
                      disabled={descriptionFormik.isSubmitting}
                    >
                      Salvesta
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => {
                        setDescriptionEdit(false);
                        descriptionFormik.resetForm();
                      }}
                    >
                      Tühista
                    </Button>
                  </Box>
                </form>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer', 
                    minHeight: '80px',
                    bgcolor: card.description ? 'white' : 'rgba(0, 0, 0, 0.04)',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.06)' } 
                  }}
                  onClick={() => setDescriptionEdit(true)}
                >
                  {card.description ? (
                    <Typography>{card.description}</Typography>
                  ) : (
                    <Typography color="textSecondary">
                      Lisa üksikasjalik kirjeldus...
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
            
            {/* Checklist */}
            {card.checklist && card.checklist.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {card.checklist.map((list: ChecklistType) => (
                  <Box key={list.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Tooltip title="Kontrollnimekiri">
                        <ChecklistIcon fontSize="small" sx={{ mr: 1 }} />
                      </Tooltip>
                      {list.title}
                    </Typography>
                    
                    <List dense disablePadding>
                      {list.items.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
                          <Checkbox
                            edge="start"
                            checked={item.completed}
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText primary={item.text} />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Button 
                      startIcon={<AddIcon />} 
                      size="small" 
                      sx={{ mt: 1 }}
                    >
                      Lisa uus element
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Comments */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tooltip title="Kommentaarid">
                  <CommentIcon fontSize="small" sx={{ mr: 1 }} />
                </Tooltip>
                Kommentaarid
              </Typography>
              
              {card.comments && card.comments.length > 0 ? (
                <List disablePadding>
                  {card.comments.map((comment: CommentType) => (
                    <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography component="span" variant="body2">
                            <b>Kasutaja</b>
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {comment.text}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                              {formatDistanceToNow(new Date(comment.createdAt), { 
                                addSuffix: true,
                                locale: et
                              })}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" variant="body2">
                  Kommentaarid puuduvad
                </Typography>
              )}
              
              {addingComment ? (
                <form onSubmit={commentFormik.handleSubmit}>
                  <TextField
                    autoFocus
                    fullWidth
                    id="text"
                    name="text"
                    placeholder="Kirjuta kommentaar..."
                    value={commentFormik.values.text}
                    onChange={commentFormik.handleChange}
                    onBlur={commentFormik.handleBlur}
                    error={commentFormik.touched.text && Boolean(commentFormik.errors.text)}
                    helperText={commentFormik.touched.text && commentFormik.errors.text}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={{ mt: 2, mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="small"
                      disabled={commentFormik.isSubmitting}
                    >
                      Lisa kommentaar
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => {
                        setAddingComment(false);
                        commentFormik.resetForm();
                      }}
                    >
                      Tühista
                    </Button>
                  </Box>
                </form>
              ) : (
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={() => setAddingComment(true)}
                  sx={{ mt: 1 }}
                >
                  Lisa kommentaar
                </Button>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tegevused
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<ClockIcon />}
                disabled={!!card.dueDate} 
                sx={{ justifyContent: 'flex-start' }}
              >
                Lisa tähtaeg
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<ChecklistIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Lisa kontrollnimekiri
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AttachFileIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Lisa manus
              </Button>
              
              <Divider sx={{ my: 1 }} />
              
              <Button 
                variant="outlined" 
                fullWidth 
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{ justifyContent: 'flex-start' }}
              >
                Kustuta kaart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetail;
