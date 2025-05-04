// Analytics tracking functions

/**
 * Track when a user changes a filter
 * @param filterType The type of filter being changed (e.g., 'token', 'chain', 'platform')
 * @param value The value of the filter being changed
 */
export const trackFilterChange = (filterType: string, value: string) => {
  // For now, just log the filter change
  console.log(`Filter changed: ${filterType} = ${value}`);
  
  // In a real application, you would send this data to your analytics service
  // Example: Google Analytics, Mixpanel, etc.
  // analytics.track('Filter Changed', { filterType, value });
};

/**
 * Track when a user changes the sort order
 * @param column The column being sorted
 * @param direction The sort direction ('asc' or 'desc')
 */
export const trackSortChange = (column: string, direction: string) => {
  // For now, just log the sort change
  console.log(`Sort changed: ${column} ${direction}`);
  
  // In a real application, you would send this data to your analytics service
  // Example: Google Analytics, Mixpanel, etc.
  // analytics.track('Sort Changed', { column, direction });
};

/**
 * Track when a user adds a pool to their watchlist
 * @param poolId The ID of the pool being added
 * @param poolName The name of the pool being added
 */
export const trackWatchlistAdd = (poolId: string, poolName: string) => {
  // For now, just log the watchlist addition
  console.log(`Added to watchlist: ${poolName} (${poolId})`);
  
  // In a real application, you would send this data to your analytics service
  // Example: Google Analytics, Mixpanel, etc.
  // analytics.track('Watchlist Added', { poolId, poolName });
};

/**
 * Track when a user removes a pool from their watchlist
 * @param poolId The ID of the pool being removed
 * @param poolName The name of the pool being removed
 */
export const trackWatchlistRemove = (poolId: string, poolName: string) => {
  // For now, just log the watchlist removal
  console.log(`Removed from watchlist: ${poolName} (${poolId})`);
  
  // In a real application, you would send this data to your analytics service
  // Example: Google Analytics, Mixpanel, etc.
  // analytics.track('Watchlist Removed', { poolId, poolName });
}; 