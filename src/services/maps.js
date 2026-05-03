export const calculateDistance = (origin, destination) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("1.2 miles (approx 20 mins walk)");
    }, 500);
  });
};

export const getPollingStations = (location) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: "City Hall Station", address: "123 Main St", distance: "0.5 miles" },
        { id: 2, name: "Community Center", address: "456 Oak Ave", distance: "1.2 miles" }
      ]);
    }, 800);
  });
};
