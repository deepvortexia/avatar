export interface FavoriteImage {
  id: string;
  user_id: string;
  tool_type: string;
  result_url: string;
  prompt: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const fetchFavorites = async (token: string): Promise<FavoriteImage[]> => {
  try {
    const response = await fetch('/api/favorites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch favorites:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const saveFavorite = async (token: string, imageUrl: string, prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl, prompt }),
    });

    if (!response.ok) {
      console.error('Failed to save favorite:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('Error saving favorite:', error);
    return null;
  }
};

export const removeFavorite = async (token: string, id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/favorites?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to remove favorite:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};
