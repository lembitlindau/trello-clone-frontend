import React, { createContext, useContext, useEffect, useState } from 'react';
import { boardService, listService, cardService } from '../services/api';
import { Board, BoardsState, Card, List } from '../types';
import { useAuth } from './AuthContext';

interface BoardContextType extends BoardsState {
  lists: List[];
  cards: Record<string, Card[]>;
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (boardId: string) => Promise<void>;
  createBoard: (name: string, background?: string) => Promise<Board>;
  updateBoard: (boardId: string, data: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  toggleFavorite: (boardId: string, favorite: boolean) => Promise<void>;
  toggleArchive: (boardId: string, archived: boolean) => Promise<void>;
  createList: (boardId: string, title: string) => Promise<List>;
  updateList: (listId: string, title: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  createCard: (listId: string, title: string, description?: string) => Promise<Card>;
  updateCard: (cardId: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, sourceListId: string, destinationListId: string) => Promise<void>;
}

const defaultState: BoardsState = {
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,
};

const BoardContext = createContext<BoardContextType>({
  ...defaultState,
  lists: [],
  cards: {},
  fetchBoards: async () => {},
  fetchBoardDetails: async () => {},
  createBoard: async () => ({ id: '', name: '', userId: '', createdAt: '', isArchived: false, background: '', isTemplate: false, isFavorite: false, members: [] }),
  updateBoard: async () => {},
  deleteBoard: async () => {},
  toggleFavorite: async () => {},
  toggleArchive: async () => {},
  createList: async () => ({ id: '', boardId: '', userId: '', title: '', createdAt: '', updatedAt: '' }),
  updateList: async () => {},
  deleteList: async () => {},
  createCard: async () => ({ id: '', listId: '', userId: '', title: '', createdAt: '', updatedAt: '' }),
  updateCard: async () => {},
  deleteCard: async () => {},
  moveCard: async () => {},
});

export const useBoard = () => useContext(BoardContext);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<BoardsState>(defaultState);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Record<string, Card[]>>({});

  // Fetch all boards when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBoards();
    } else {
      setState(defaultState);
      setLists([]);
      setCards({});
    }
  }, [isAuthenticated]);

  const fetchBoards = async () => {
    if (!isAuthenticated) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const boards = await boardService.getBoards();
      setState(prev => ({ ...prev, boards, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to fetch boards',
      }));
    }
  };

  const fetchBoardDetails = async (boardId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch board details
      const board = await boardService.getBoard(boardId);
      setState(prev => ({ ...prev, currentBoard: board }));
      
      // Fetch lists for this board
      const boardLists = await listService.getLists(boardId);
      setLists(boardLists);
      
      // Fetch cards for each list
      const cardsMap: Record<string, Card[]> = {};
      
      await Promise.all(
        boardLists.map(async (list) => {
          const listCards = await cardService.getCards(list.id);
          cardsMap[list.id] = listCards;
        })
      );
      
      setCards(cardsMap);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to fetch board details',
      }));
    }
  };

  const createBoard = async (name: string, background?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newBoard = await boardService.createBoard(name, background);
      setState(prev => ({
        ...prev,
        boards: [...prev.boards, newBoard],
        isLoading: false,
      }));
      return newBoard;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to create board',
      }));
      throw err;
    }
  };

  const updateBoard = async (boardId: string, data: Partial<Board>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedBoard = await boardService.updateBoard(boardId, data);
      
      setState(prev => ({
        ...prev,
        boards: prev.boards.map(board => (board.id === boardId ? updatedBoard : board)),
        currentBoard: prev.currentBoard?.id === boardId ? updatedBoard : prev.currentBoard,
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to update board',
      }));
    }
  };

  const deleteBoard = async (boardId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await boardService.deleteBoard(boardId);
      
      setState(prev => ({
        ...prev,
        boards: prev.boards.filter(board => board.id !== boardId),
        currentBoard: prev.currentBoard?.id === boardId ? null : prev.currentBoard,
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.response?.data?.error || 'Failed to delete board',
      }));
    }
  };

  const toggleFavorite = async (boardId: string, favorite: boolean) => {
    try {
      await boardService.toggleFavorite(boardId, favorite);
      
      setState(prev => ({
        ...prev,
        boards: prev.boards.map(board => 
          board.id === boardId ? { ...board, isFavorite: favorite } : board
        ),
        currentBoard: prev.currentBoard?.id === boardId 
          ? { ...prev.currentBoard, isFavorite: favorite } 
          : prev.currentBoard,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to update favorite status',
      }));
    }
  };

  const toggleArchive = async (boardId: string, archived: boolean) => {
    try {
      await boardService.toggleArchive(boardId, archived);
      
      setState(prev => ({
        ...prev,
        boards: prev.boards.map(board => 
          board.id === boardId ? { ...board, isArchived: archived } : board
        ),
        currentBoard: prev.currentBoard?.id === boardId 
          ? { ...prev.currentBoard, isArchived: archived } 
          : prev.currentBoard,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to update archive status',
      }));
    }
  };

  const createList = async (boardId: string, title: string) => {
    try {
      const newList = await listService.createList(boardId, title);
      setLists(prev => [...prev, newList]);
      setCards(prev => ({ ...prev, [newList.id]: [] }));
      return newList;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to create list',
      }));
      throw err;
    }
  };

  const updateList = async (listId: string, title: string) => {
    try {
      const updatedList = await listService.updateList(listId, title);
      setLists(prev => prev.map(list => list.id === listId ? updatedList : list));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to update list',
      }));
    }
  };

  const deleteList = async (listId: string) => {
    try {
      await listService.deleteList(listId);
      setLists(prev => prev.filter(list => list.id !== listId));
      
      setCards(prev => {
        const newCards = { ...prev };
        delete newCards[listId];
        return newCards;
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to delete list',
      }));
    }
  };

  const createCard = async (listId: string, title: string, description?: string) => {
    try {
      const newCard = await cardService.createCard(listId, title, description);
      
      setCards(prev => ({
        ...prev,
        [listId]: [...(prev[listId] || []), newCard],
      }));
      
      return newCard;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to create card',
      }));
      throw err;
    }
  };

  const updateCard = async (cardId: string, data: Partial<Card>) => {
    try {
      const updatedCard = await cardService.updateCard(cardId, data);
      
      setCards(prev => {
        const newCards = { ...prev };
        
        // Find which list contains this card
        for (const listId in newCards) {
          const listCards = newCards[listId];
          const cardIndex = listCards.findIndex(card => card.id === cardId);
          
          if (cardIndex !== -1) {
            newCards[listId] = [
              ...listCards.slice(0, cardIndex),
              updatedCard,
              ...listCards.slice(cardIndex + 1),
            ];
            break;
          }
        }
        
        return newCards;
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to update card',
      }));
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      await cardService.deleteCard(cardId);
      
      setCards(prev => {
        const newCards = { ...prev };
        
        // Find which list contains this card
        for (const listId in newCards) {
          const listCards = newCards[listId];
          const cardIndex = listCards.findIndex(card => card.id === cardId);
          
          if (cardIndex !== -1) {
            newCards[listId] = [
              ...listCards.slice(0, cardIndex),
              ...listCards.slice(cardIndex + 1),
            ];
            break;
          }
        }
        
        return newCards;
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to delete card',
      }));
    }
  };

  const moveCard = async (cardId: string, sourceListId: string, destinationListId: string) => {
    try {
      if (sourceListId === destinationListId) return;
      
      // First update UI optimistically
      setCards(prev => {
        const newCards = { ...prev };
        const sourceCards = [...(prev[sourceListId] || [])];
        const destCards = [...(prev[destinationListId] || [])];
        
        // Find card in source list
        const cardIndex = sourceCards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return prev;
        
        const [movedCard] = sourceCards.splice(cardIndex, 1);
        destCards.push({ ...movedCard, listId: destinationListId });
        
        newCards[sourceListId] = sourceCards;
        newCards[destinationListId] = destCards;
        
        return newCards;
      });
      
      // Then update on server
      await cardService.moveCard(cardId, destinationListId);
    } catch (err: any) {
      // If error, fetch fresh data to ensure UI is consistent
      if (state.currentBoard) {
        fetchBoardDetails(state.currentBoard.id);
      }
      
      setState(prev => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to move card',
      }));
    }
  };

  const value = {
    ...state,
    lists,
    cards,
    fetchBoards,
    fetchBoardDetails,
    createBoard,
    updateBoard,
    deleteBoard,
    toggleFavorite,
    toggleArchive,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export default BoardContext;
