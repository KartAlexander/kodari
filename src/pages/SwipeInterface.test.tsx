import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { SwipeInterface } from './SwipeInterface'; // Adjust import path
import { AuthProvider, User } from '../contexts/AuthContext'; // For providing auth context
import { SwipeItem } from '../components/swipe/SwipeCard'; // For type

// --- Mock axios ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
// --- End Mock axios ---

// --- Mock Child Components (Lightly) ---
// We want to test SwipeInterface.tsx's logic.
// SwipeCard will display item data, SwipeControls will trigger actions.
const mockSwipeCard = jest.fn(({ item, onSwipeLeft, onSwipeRight }: any) => {
  if (!item) return <div data-testid="swipe-card-empty">No more items</div>;
  return (
    <div data-testid="swipe-card">
      <h3 data-testid={`item-title-${item.id}`}>{item.data.title || item.data.name}</h3>
      {/* Simulate swipe via props for testing, actual swipe gesture is complex */}
      <button data-testid={`swipe-left-trigger-${item.id}`} onClick={() => onSwipeLeft(item.id)}>Swipe Left</button>
      <button data-testid={`swipe-right-trigger-${item.id}`} onClick={() => onSwipeRight(item.id)}>Swipe Right</button>
    </div>
  );
});
jest.mock('../components/swipe/SwipeCard', () => ({
  SwipeCard: mockSwipeCard,
}));

const mockSwipeControls = jest.fn(({ onDislike, onLike, onSuperLike }: any) => (
  <div data-testid="swipe-controls">
    <button data-testid="dislike-button" onClick={onDislike}>Dislike</button>
    <button data-testid="like-button" onClick={onLike}>Like</button>
    {onSuperLike && <button data-testid="superlike-button" onClick={onSuperLike}>Super Like</button>}
  </div>
));
jest.mock('../components/swipe/SwipeControls', () => ({
  SwipeControls: mockSwipeControls,
}));
// --- End Mock Child Components ---


// --- Mock useAuth from AuthContext ---
const mockUser: User = { id: 'currentUser123', name: 'Test User', email: 'user@test.com' };
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: mockUser, loading: false })),
}));
// --- End Mock useAuth ---

const renderSwipeInterface = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <SwipeInterface />
      </AuthProvider>
    </MemoryRouter>
  );
};

const mockSwipeItems: SwipeItem[] = [
  { id: 'p1', type: 'project', data: { id: 'p1', title: 'Project Alpha', description: 'Desc Alpha' } },
  { id: 'u1', type: 'user', data: { id: 'u1', name: 'User Beta', bio: 'Bio Beta' } },
  { id: 'p2', type: 'project', data: { id: 'p2', title: 'Project Gamma', description: 'Desc Gamma' } },
];

describe('SwipeInterface Page', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockSwipeCard.mockClear();
    mockSwipeControls.mockClear();
  });

  describe('Initial Load', () => {
    it('should fetch and display the first item, and render controls', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [...mockSwipeItems] }); // Return a copy
      renderSwipeInterface();

      expect(screen.getByText(/loading/i)).toBeInTheDocument(); // Initial loading state

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/swipe/items`); // Or your actual endpoint
      });
      
      await waitFor(() => {
        expect(mockSwipeCard).toHaveBeenCalled();
        expect(screen.getByTestId(`item-title-${mockSwipeItems[0].id}`)).toHaveTextContent(mockSwipeItems[0].data.title);
        expect(screen.getByTestId('swipe-controls')).toBeInTheDocument();
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display "No more items" if fetching returns an empty list', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      renderSwipeInterface();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      await waitFor(() => {
        // SwipeCard mock renders "No more items" when item is null
        expect(screen.getByTestId('swipe-card-empty')).toHaveTextContent(/no more items/i);
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display an error message if fetching items fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch items'));
      renderSwipeInterface();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/error loading items/i)).toBeInTheDocument(); // Assuming error message display
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Swipe Actions', () => {
    beforeEach(() => {
      // Ensure a fresh set of items for each swipe action test
      mockedAxios.get.mockResolvedValueOnce({ data: [...mockSwipeItems] });
    });

    it('should handle "like" (swipe right) action correctly', async () => {
      renderSwipeInterface();
      await waitFor(() => expect(screen.getByTestId(`item-title-${mockSwipeItems[0].id}`)).toBeInTheDocument());

      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } }); // Mock swipe API success

      // Simulate like via SwipeControls
      // fireEvent.click(screen.getByTestId('like-button'));
      // Or, if SwipeCard itself triggers it (more aligned with react-tinder-card pattern)
      // Here, our mock SwipeCard has a button to simulate this for testing purposes
      fireEvent.click(screen.getByTestId(`swipe-right-trigger-${mockSwipeItems[0].id}`));


      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          `${process.env.REACT_APP_API_URL}/swipe/action`,
          { itemId: mockSwipeItems[0].id, itemType: mockSwipeItems[0].type, action: 'like' }
        );
      });

      // Verify next card is shown
      await waitFor(() => {
        expect(screen.getByTestId(`item-title-${mockSwipeItems[1].id}`)).toHaveTextContent(mockSwipeItems[1].data.name);
        expect(screen.queryByTestId(`item-title-${mockSwipeItems[0].id}`)).not.toBeInTheDocument();
      });
    });

    it('should handle "dislike" (swipe left) action correctly', async () => {
        renderSwipeInterface();
        await waitFor(() => expect(screen.getByTestId(`item-title-${mockSwipeItems[0].id}`)).toBeInTheDocument());
  
        mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
  
        fireEvent.click(screen.getByTestId(`swipe-left-trigger-${mockSwipeItems[0].id}`));
  
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/swipe/action`,
            { itemId: mockSwipeItems[0].id, itemType: mockSwipeItems[0].type, action: 'dislike' }
          );
        });
  
        await waitFor(() => {
          expect(screen.getByTestId(`item-title-${mockSwipeItems[1].id}`)).toHaveTextContent(mockSwipeItems[1].data.name);
        });
      });

    it('should show "No more items" after swiping through all items', async () => {
      // Provide only one item initially for this test
      mockedAxios.get.mockReset().mockResolvedValueOnce({ data: [mockSwipeItems[0]] });
      renderSwipeInterface();
      await waitFor(() => expect(screen.getByTestId(`item-title-${mockSwipeItems[0].id}`)).toBeInTheDocument());

      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
      fireEvent.click(screen.getByTestId(`swipe-right-trigger-${mockSwipeItems[0].id}`)); // Swipe the only item

      await waitFor(() => {
        expect(screen.getByTestId('swipe-card-empty')).toHaveTextContent(/no more items/i);
      });
    });

    it('should display an error if swipe action API call fails', async () => {
        renderSwipeInterface();
        await waitFor(() => expect(screen.getByTestId(`item-title-${mockSwipeItems[0].id}`)).toBeInTheDocument());
  
        mockedAxios.post.mockRejectedValueOnce(new Error('Swipe action failed'));
  
        fireEvent.click(screen.getByTestId(`swipe-right-trigger-${mockSwipeItems[0].id}`));
  
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalledTimes(1);
          // Check for error message display (depends on SwipeInterface implementation)
          expect(screen.getByText(/swipe action failed/i)).toBeInTheDocument(); 
        });
  
        // Current card should ideally remain if swipe failed, or UI should indicate failure clearly
        expect(screen.getByTestId(`item-title-${mockSwipeItems[0].id}`)).toBeInTheDocument();
      });
  });
});
