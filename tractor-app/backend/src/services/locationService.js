const { DEFAULT_SEARCH_RADIUS_KM, MAX_SEARCH_RADIUS_KM } = require('../utils/constants');

class LocationService {
  /**
   * Calculate distance between two points (Haversine formula)
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lng1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lng2 - Longitude of point 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Build MongoDB geospatial query
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {object} MongoDB $near query
   */
  buildNearQuery(latitude, longitude, radiusKm = DEFAULT_SEARCH_RADIUS_KM) {
    // Validate radius
    const radius = Math.min(radiusKm, MAX_SEARCH_RADIUS_KM);
    const radiusInMeters = radius * 1000;

    return {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      }
    };
  }

  /**
   * Validate coordinates
   * @param {number} latitude
   * @param {number} longitude
   * @returns {boolean}
   */
  isValidCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Format location object for MongoDB
   * @param {number} longitude
   * @param {number} latitude
   * @returns {object} GeoJSON Point
   */
  formatLocation(longitude, latitude) {
    return {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
  }
}

module.exports = new LocationService();
