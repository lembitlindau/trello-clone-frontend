import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { 
  Box, 
  Typography, 
  Paper,
  Chip,
  Stack
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  Comment as CommentIcon,
  AttachFile as AttachmentIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import { Card as CardType } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { et } from 'date-fns/locale';

interface CardProps {
  card: CardType;
  index: number;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ card, index, onClick }) => {
  const hasDueDate = !!card.dueDate;
  const hasComments = card.comments && card.comments.length > 0;
  const hasAttachments = card.attachments && card.attachments.length > 0;
  const hasDescription = !!card.description && card.description.trim() !== '';
  const hasChecklist = card.checklist && card.checklist.length > 0;
  
  // Calculate checklist progress if there is a checklist
  let checklistProgress = 0;
  let totalChecklistItems = 0;
  let completedChecklistItems = 0;
  
  if (hasChecklist) {
    card.checklist.forEach(list => {
      totalChecklistItems += list.items.length;
      completedChecklistItems += list.items.filter(item => item.completed).length;
    });
    
    checklistProgress = totalChecklistItems > 0 
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
      : 0;
  }
  
  // Format due date if present
  let formattedDueDate = '';
  if (hasDueDate) {
    try {
      formattedDueDate = formatDistanceToNow(new Date(card.dueDate!), { 
        addSuffix: true,
        locale: et
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      formattedDueDate = 'Vigane kuupäev';
    }
  }

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          elevation={1}
          onClick={onClick}
          sx={{
            p: 1.5,
            mb: 1,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.03)',
            },
            position: 'relative',
          }}
        >
          {card.labels && card.labels.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
              {card.labels.map((label, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 8,
                    width: 40,
                    bgcolor: label,
                    borderRadius: 1,
                  }}
                />
              ))}
            </Stack>
          )}
          
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {card.title}
          </Typography>
          
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            {hasDueDate && (
              <Chip 
                icon={<ClockIcon fontSize="small" />} 
                label={formattedDueDate} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 24,
                  bgcolor: 'rgba(0, 0, 0, 0.05)'
                }}
              />
            )}
            
            {hasChecklist && (
              <Chip 
                label={`${completedChecklistItems}/${totalChecklistItems}`} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 24,
                  bgcolor: 'rgba(0, 0, 0, 0.05)'
                }}
              />
            )}
          </Box>
          
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasDescription && (
              <DescriptionIcon fontSize="small" color="action" />
            )}
            
            {hasComments && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{card.comments?.length}</Typography>
              </Box>
            )}
            
            {hasAttachments && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachmentIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{card.attachments?.length}</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Draggable>
  );
};

export default Card;
