const ItinerariesService = {
  getAllItineraries: async () => {
    const headerInit = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/ld+json'
      }
    };
    try {
      let response = await fetch(
        'http://127.0.0.1:3000/itineraries',
        headerInit
      );
      let content = await response.json();
      return { response: content, ok: true };
    } catch (error) {
      return { error, ok: false };
    }
  },
  updateItineraries: async (pickItineraryId, updateData) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/itinerary/${pickItineraryId}`,
        {
          method: 'PUT',
          headers: new Headers({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updateData)
        }
      );
      const content = await response.json();
      return { response: content, ok: true };
    } catch (error) {
      return { error, ok: false };
    }
  },
  deleteItineraries: async itineraryId => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/itinerary/${itineraryId}`,
        {
          method: 'DELETE'
        }
      );
      const content = await response.json();
      return { response: content, ok: true };
    } catch (error) {
      return { error, ok: false };
    }
  },
  createItineraries: async data => {
    try {
      const response = await fetch('http://127.0.0.1:3000/itinerary/', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
      });
      const content = await response.json();
      return { response: content, ok: true };
    } catch (error) {
      return { error, ok: false };
    }
  }
};

export default ItinerariesService;
